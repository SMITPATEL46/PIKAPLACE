from __future__ import annotations

import os
from datetime import datetime, timedelta
from decimal import Decimal
from functools import wraps
from typing import Any, Callable, Dict, Optional, Tuple

from sqlalchemy import func
from flask import Flask, jsonify, request
from flask_cors import CORS

from .firebase_verifier import extract_phone_number, extract_uid, verify_id_token
from .models import Cart, CartItem, LoginEvent, Order, OrderItem, Product, ProductReview, SiteContent, User, db, to_amount
from .paypal_client import capture_paypal_order, create_paypal_order, find_approval_url
from .seed import seed_products_if_empty


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # MySQL config (required)
    mysql_host = os.environ.get("MYSQL_HOST", "127.0.0.1")
    mysql_port = int(os.environ.get("MYSQL_PORT", "3306"))
    mysql_db = os.environ.get("MYSQL_DB", "pikaplace")
    mysql_user = os.environ.get("MYSQL_USER", "root")
    mysql_password = os.environ.get("MYSQL_PASSWORD", "")

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}:{mysql_port}/{mysql_db}?charset=utf8mb4"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    paypal_client_id = os.environ.get("PAYPAL_CLIENT_ID")
    paypal_client_secret = os.environ.get("PAYPAL_CLIENT_SECRET")
    if not paypal_client_id or not paypal_client_secret:
        # We don't hard-fail so local dev can still hit auth/products.
        app.logger.warning("PayPal credentials not set (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET).")

    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    app.config["FRONTEND_URL"] = frontend_url

    admin_phones_raw = os.environ.get("ADMIN_PHONE_NUMBERS", "")
    admin_phones = {p.strip() for p in admin_phones_raw.split(",") if p.strip()}
    # Normalize: remove spaces
    admin_phones = {p.replace(" ", "") for p in admin_phones}
    app.config["ADMIN_PHONES"] = admin_phones

    with app.app_context():
        db.create_all()
        seed_products_if_empty()

    def json_error(message: str, status_code: int = 400, **extra: Any):
        payload: Dict[str, Any] = {"error": message}
        payload.update(extra)
        return jsonify(payload), status_code

    def get_bearer_token() -> Optional[str]:
        auth_header = request.headers.get("Authorization") or ""
        if auth_header.startswith("Bearer "):
            return auth_header[len("Bearer ") :].strip()
        return None

    def require_auth(fn: Callable):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            id_token = get_bearer_token()
            if not id_token:
                data = request.get_json(silent=True) or {}
                id_token = data.get("idToken") or data.get("id_token")
            if not id_token or not isinstance(id_token, str):
                return json_error("Missing Authorization Bearer token (Firebase ID token).", 401)
            try:
                decoded = verify_id_token(id_token)
            except Exception as e:
                app.logger.exception("Firebase token verify failed")
                return json_error("Invalid Firebase token.", 401, detail=str(e))

            try:
                uid = extract_uid(decoded)
                phone = extract_phone_number(decoded)
            except Exception:
                uid = extract_uid(decoded)
                phone = None

            request.firebase = {"uid": uid, "phone": phone, "decoded": decoded}
            return fn(*args, **kwargs)

        return wrapper

    def get_or_create_user(*, uid: str, phone: str, name: Optional[str] = None) -> User:
        if not phone:
            # For phone auth this should not happen, but keep safe.
            raise RuntimeError("Firebase token missing phone_number.")

        role = "admin" if phone.replace(" ", "") in app.config["ADMIN_PHONES"] else "customer"

        user = User.query.filter(User.firebase_uid == uid).one_or_none()
        if user:
            user.phone_number = phone
            user.role = role
            if name:
                user.name = name
        else:
            user = User(firebase_uid=uid, phone_number=phone, name=name, role=role)
            db.session.add(user)

        db.session.commit()
        return user

    def require_admin(fn: Callable):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            id_token = get_bearer_token()
            # Reuse require_auth logic by calling verify again if needed; but since our
            # admin endpoints will also be decorated with require_auth, we can rely on request.firebase.
            if not hasattr(request, "firebase"):
                return json_error("Missing auth context.", 401)

            firebase = request.firebase
            uid = firebase.get("uid")
            user = User.query.filter(User.firebase_uid == uid).one_or_none() if uid else None
            if not user or user.role != "admin":
                return json_error("Admin access required.", 403)
            return fn(*args, **kwargs)

        return wrapper

    @app.get("/api/health")
    def health():
        return jsonify({"ok": True})

    @app.post("/api/auth/exchange")
    def exchange_token():
        data = request.get_json(silent=True) or {}
        id_token = data.get("idToken") or data.get("id_token")
        if not id_token:
            return json_error("Missing idToken.", 400)
        try:
            decoded = verify_id_token(id_token)
            uid = extract_uid(decoded)
            phone = extract_phone_number(decoded)
        except Exception as e:
            return json_error("Invalid Firebase token.", 401, detail=str(e))

        name = None
        # Firebase decoded token sometimes includes name; keep optional.
        if isinstance(decoded.get("name"), str):
            name = decoded.get("name")

        try:
            user = get_or_create_user(uid=uid, phone=phone, name=name)
        except Exception as e:
            return json_error("Could not provision user.", 400, detail=str(e))

        try:
            db.session.add(LoginEvent(user_id=user.id))
            db.session.commit()
        except Exception:
            db.session.rollback()

        return jsonify({"user": {"id": user.id, "phone_number": user.phone_number, "name": user.name, "role": user.role}})

    @app.get("/api/auth/me")
    @require_auth
    def auth_me():
        firebase = request.firebase
        uid = firebase["uid"]
        phone = firebase.get("phone")
        if not phone:
            return json_error("Firebase token has no phone_number.", 400)
        user = User.query.filter(User.firebase_uid == uid).one_or_none()
        if not user:
            user = get_or_create_user(uid=uid, phone=phone)
        return jsonify(
            {
                "user": {"id": user.id, "phone_number": user.phone_number, "name": user.name, "role": user.role},
            }
        )

    # ---------------- Products ----------------
    @app.get("/api/products")
    def list_products():
        category = request.args.get("category")  # optional
        price_min = request.args.get("priceMin")
        price_max = request.args.get("priceMax")
        sort = request.args.get("sort")  # none|low|high

        q = Product.query
        if category and category != "All":
            q = q.filter(Product.category == category)
        if price_min:
            try:
                q = q.filter(Product.price_value >= Decimal(price_min))
            except Exception:
                pass
        if price_max:
            try:
                q = q.filter(Product.price_value <= Decimal(price_max))
            except Exception:
                pass

        if sort == "low":
            q = q.order_by(Product.price_value.asc())
        elif sort == "high":
            q = q.order_by(Product.price_value.desc())
        else:
            q = q.order_by(Product.id.asc())

        products = q.all()
        return jsonify(
            {
                "items": [
                    {
                        "id": p.id,
                        "category": p.category,
                        "name": p.name,
                        "specs": p.specs,
                        "priceValue": float(p.price_value),
                        "image": p.image_url,
                        "images": p.images_json,
                        "available": p.available,
                        "reorderAt": p.reorder_at,
                    }
                    for p in products
                ]
            }
        )

    @app.get("/api/products/<int:product_id>")
    def get_product(product_id: int):
        p = Product.query.filter(Product.id == product_id).one_or_none()
        if not p:
            return json_error("Product not found", 404)
        return jsonify(
            {
                "product": {
                    "id": p.id,
                    "category": p.category,
                    "name": p.name,
                    "specs": p.specs,
                    "priceValue": float(p.price_value),
                    "image": p.image_url,
                    "images": p.images_json,
                    "available": p.available,
                    "reorderAt": p.reorder_at,
                }
            }
        )

    # ---------------- Reviews ----------------
    @app.get("/api/products/<int:product_id>/reviews")
    def list_reviews(product_id: int):
        reviews = ProductReview.query.filter(ProductReview.product_id == product_id).all()
        items = []
        for r in reviews:
            items.append(
                {
                    "id": r.id,
                    "productId": r.product_id,
                    "userEmail": r.user.phone_number,  # keep old shape; we don't store email
                    "userName": r.user.name or r.user.phone_number,
                    "rating": r.rating,
                    "comment": r.comment,
                    "createdAt": r.created_at.isoformat(),
                    "updatedAt": r.updated_at.isoformat(),
                }
            )
        return jsonify({"items": items})

    @app.post("/api/products/<int:product_id>/reviews")
    @require_auth
    def upsert_review(product_id: int):
        data = request.get_json(silent=True) or {}
        rating = data.get("rating")
        comment = data.get("comment")

        try:
            rating = int(rating)
        except Exception:
            rating = None

        if not rating or rating < 1 or rating > 5:
            return json_error("rating must be 1..5")
        if not isinstance(comment, str) or not comment.strip():
            return json_error("comment is required")

        firebase = request.firebase
        uid = firebase["uid"]
        phone = firebase.get("phone")

        user = User.query.filter(User.firebase_uid == uid).one_or_none()
        if not user:
            try:
                user = get_or_create_user(uid=uid, phone=phone)
            except Exception as e:
                return json_error("User provisioning failed", 400, detail=str(e))

        existing = ProductReview.query.filter(
            ProductReview.user_id == user.id, ProductReview.product_id == product_id
        ).one_or_none()

        if existing:
            existing.rating = rating
            existing.comment = comment.strip()
            db.session.commit()
            return jsonify(
                {
                    "review": {
                        "id": existing.id,
                        "productId": existing.product_id,
                        "userEmail": user.phone_number,
                        "userName": user.name or user.phone_number,
                        "rating": existing.rating,
                        "comment": existing.comment,
                        "createdAt": existing.created_at.isoformat(),
                        "updatedAt": existing.updated_at.isoformat(),
                    }
                }
            )

        pr = ProductReview(
            user_id=user.id,
            product_id=product_id,
            rating=rating,
            comment=comment.strip(),
        )
        db.session.add(pr)
        db.session.commit()
        return jsonify(
            {
                "review": {
                    "id": pr.id,
                    "productId": pr.product_id,
                    "userEmail": user.phone_number,
                    "userName": user.name or user.phone_number,
                    "rating": pr.rating,
                    "comment": pr.comment,
                    "createdAt": pr.created_at.isoformat(),
                    "updatedAt": pr.updated_at.isoformat(),
                }
            }
        )

    # ---------------- Cart ----------------
    def get_active_cart_for_user(user_id: int) -> Cart:
        cart = Cart.query.filter(Cart.user_id == user_id, Cart.status == "active").one_or_none()
        if not cart:
            cart = Cart(user_id=user_id, status="active")
            db.session.add(cart)
            db.session.commit()
        return cart

    def cart_item_to_payload(ci: CartItem) -> Dict[str, Any]:
        p = ci.product
        return {
            "id": ci.id,
            "addedAt": ci.added_at.isoformat(),
            "quantity": ci.quantity,
            "product": {
                "id": p.id,
                "category": p.category,
                "name": p.name,
                "specs": p.specs,
                "priceValue": float(p.price_value),
                "image": p.image_url,
                "images": p.images_json,
                "available": p.available,
                "reorderAt": p.reorder_at,
            },
        }

    @app.get("/api/cart")
    @require_auth
    def get_cart():
        firebase = request.firebase
        uid = firebase["uid"]
        user = User.query.filter(User.firebase_uid == uid).one_or_none()
        if not user:
            user = get_or_create_user(uid=uid, phone=firebase.get("phone"))

        cart = get_active_cart_for_user(user.id)
        items = CartItem.query.filter(CartItem.cart_id == cart.id).all()
        return jsonify({"items": [cart_item_to_payload(i) for i in items]})

    @app.get("/api/cart/count")
    @require_auth
    def cart_count():
        firebase = request.firebase
        uid = firebase["uid"]
        user = User.query.filter(User.firebase_uid == uid).one_or_none()
        if not user:
            user = get_or_create_user(uid=uid, phone=firebase.get("phone"))
        cart = get_active_cart_for_user(user.id)
        total = sum(i.quantity for i in CartItem.query.filter(CartItem.cart_id == cart.id).all())
        return jsonify({"count": int(total)})

    @app.post("/api/cart/items")
    @require_auth
    def add_cart_item():
        data = request.get_json(silent=True) or {}
        product_id = data.get("productId")
        quantity = data.get("quantity", 1)
        try:
            product_id = int(product_id)
            quantity = int(quantity)
        except Exception:
            return json_error("productId and quantity must be integers", 400)

        if quantity < 1:
            return json_error("quantity must be >= 1", 400)

        p = Product.query.filter(Product.id == product_id).one_or_none()
        if not p:
            return json_error("Product not found", 404)
        if p.available <= 0:
            return json_error("Product out of stock", 400)

        firebase = request.firebase
        uid = firebase["uid"]
        user = User.query.filter(User.firebase_uid == uid).one_or_none()
        if not user:
            user = get_or_create_user(uid=uid, phone=firebase.get("phone"))
        cart = get_active_cart_for_user(user.id)

        existing = CartItem.query.filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id).one_or_none()
        if existing:
            existing.quantity = existing.quantity + quantity
            db.session.commit()
            return jsonify({"item": cart_item_to_payload(existing)})

        ci = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
        db.session.add(ci)
        db.session.commit()
        return jsonify({"item": cart_item_to_payload(ci)})

    @app.patch("/api/cart/items/<int:product_id>")
    @require_auth
    def update_cart_item(product_id: int):
        data = request.get_json(silent=True) or {}
        quantity = data.get("quantity")
        try:
            quantity = int(quantity)
        except Exception:
            return json_error("quantity must be an integer", 400)
        if quantity < 1:
            return json_error("quantity must be >= 1", 400)

        firebase = request.firebase
        uid = firebase["uid"]
        user = User.query.filter(User.firebase_uid == uid).one_or_none()
        if not user:
            user = get_or_create_user(uid=uid, phone=firebase.get("phone"))
        cart = get_active_cart_for_user(user.id)

        ci = CartItem.query.filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id).one_or_none()
        if not ci:
            return json_error("Cart item not found", 404)

        p = Product.query.filter(Product.id == product_id).one_or_none()
        if not p:
            return json_error("Product not found", 404)
        if p.available <= 0:
            return json_error("Product out of stock", 400)

        ci.quantity = quantity
        db.session.commit()
        return jsonify({"item": cart_item_to_payload(ci)})

    @app.delete("/api/cart/items/<int:product_id>")
    @require_auth
    def delete_cart_item(product_id: int):
        firebase = request.firebase
        uid = firebase["uid"]
        user = User.query.filter(User.firebase_uid == uid).one_or_none()
        if not user:
            user = get_or_create_user(uid=uid, phone=firebase.get("phone"))
        cart = get_active_cart_for_user(user.id)

        ci = CartItem.query.filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id).one_or_none()
        if not ci:
            return json_error("Cart item not found", 404)
        db.session.delete(ci)
        db.session.commit()
        return jsonify({"ok": True})

    # ---------------- Orders (PayPal) ----------------
    def order_to_payload(o: Order) -> Dict[str, Any]:
        def product_payload(product_id: Optional[int], fallback_name: str) -> Dict[str, Any]:
            p = Product.query.filter(Product.id == product_id).one_or_none() if product_id else None
            return {
                "id": product_id,
                "name": (p.name if p else None) or fallback_name,
                "category": p.category if p else None,
                "specs": p.specs if p else None,
                "priceValue": float((p.price_value if p else 0) or 0),
                "image": p.image_url if p else None,
                "images": p.images_json if p else None,
                "available": p.available if p else None,
                "reorderAt": p.reorder_at if p else None,
            }

        return {
            "id": o.id,
            "createdAt": o.created_at.isoformat(),
            "subtotal": float(o.subtotal),
            "tax": float(o.tax),
            "total": float(o.total),
            "addressText": o.address_text,
            "customer": o.customer_json,
            "items": [
                {
                    "product": product_payload(it.product_id, it.product_name_snapshot),
                    "quantity": it.quantity,
                    "amount": float(it.amount),
                }
                for it in o.items
            ],
        }

    def compute_totals(unit_price_usd: Decimal, quantity: int) -> Tuple[Decimal, Decimal, Decimal]:
        subtotal = unit_price_usd * quantity
        tax = (subtotal * Decimal("0.10")).quantize(Decimal("0.01"))
        total = subtotal + tax
        return subtotal, tax, total

    @app.get("/api/orders")
    @require_auth
    def list_orders():
        firebase = request.firebase
        uid = firebase["uid"]
        user = User.query.filter(User.firebase_uid == uid).one_or_none()
        if not user:
            user = get_or_create_user(uid=uid, phone=firebase.get("phone"))

        orders = Order.query.filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()
        return jsonify({"items": [order_to_payload(o) for o in orders]})

    @app.post("/api/orders/paypal/create")
    @require_auth
    def create_paypal_order_endpoint():
        data = request.get_json(silent=True) or {}
        product_id = data.get("productId")
        quantity = data.get("quantity", 1)

        shipping = data.get("shipping") or {}
        customer = data.get("customer") or {}

        try:
            product_id = int(product_id)
            quantity = int(quantity)
        except Exception:
            return json_error("productId and quantity must be integers", 400)
        if quantity < 1:
            return json_error("quantity must be >= 1", 400)

        p = Product.query.filter(Product.id == product_id).one_or_none()
        if not p:
            return json_error("Product not found", 404)
        if p.available <= 0:
            return json_error("Product out of stock", 400)
        if quantity > p.available:
            return json_error("Not enough stock", 400, available=p.available)

        # Address validation is intentionally light (frontend already does it).
        address_line = (shipping.get("addressLine") or "").strip()
        state = (shipping.get("state") or "").strip()
        city = (shipping.get("city") or "").strip()
        pin = (shipping.get("pin") or "").strip()

        if len(address_line) < 8:
            return json_error("addressLine too short", 400)
        if not state or not city or not pin:
            return json_error("shipping state/city/pin required", 400)

        full_name = (customer.get("fullName") or "").strip()
        mobile = (customer.get("mobile") or "").strip()
        email = (customer.get("email") or "").strip()
        if not full_name or len(full_name) < 2:
            return json_error("fullName required", 400)
        if not mobile:
            return json_error("mobile required", 400)
        if not email:
            return json_error("email required", 400)

        unit_price_usd = Decimal(str(p.price_value))
        subtotal, tax, total = compute_totals(unit_price_usd, quantity)

        address_text = ", ".join([address_line, city, state, f"PIN {pin}"])

        firebase = request.firebase
        uid = firebase["uid"]
        user = User.query.filter(User.firebase_uid == uid).one_or_none()
        if not user:
            user = get_or_create_user(uid=uid, phone=firebase.get("phone"))

        order = Order(
            user_id=user.id,
            status="pending",
            paypal_order_id=None,
            paypal_capture_id=None,
            currency="USD",
            subtotal=subtotal,
            tax=tax,
            total=total,
            shipping_json=shipping,
            customer_json=customer,
            address_text=address_text,
        )
        db.session.add(order)
        db.session.flush()  # get order id

        oi = OrderItem(
            order_id=order.id,
            product_id=p.id,
            product_name_snapshot=p.name,
            unit_price_snapshot=p.price_value,
            quantity=quantity,
            amount=subtotal,
        )
        db.session.add(oi)
        db.session.commit()

        return_url = f"{app.config['FRONTEND_URL']}/checkout?payment=success"
        cancel_url = f"{app.config['FRONTEND_URL']}/checkout?payment=cancel"
        custom_id = str(order.id)

        paypal_order_json = create_paypal_order(
            total_value_usd=str(total.quantize(Decimal("0.01"))),
            return_url=return_url,
            cancel_url=cancel_url,
            custom_id=custom_id,
        )
        paypal_order_id = paypal_order_json.get("id")
        if not paypal_order_id:
            return json_error("PayPal order id missing", 502)

        order.paypal_order_id = paypal_order_id
        db.session.commit()

        approval_url = find_approval_url(paypal_order_json)
        return jsonify({"approvalUrl": approval_url, "paypalOrderId": paypal_order_id, "orderId": order.id})

    @app.post("/api/orders/paypal/capture")
    @require_auth
    def capture_paypal_order_endpoint():
        data = request.get_json(silent=True) or {}
        paypal_order_id = data.get("paypalOrderId") or data.get("paypal_order_id")
        if not paypal_order_id or not isinstance(paypal_order_id, str):
            return json_error("paypalOrderId is required", 400)

        firebase = request.firebase
        uid = firebase["uid"]
        user = User.query.filter(User.firebase_uid == uid).one_or_none()
        if not user:
            user = get_or_create_user(uid=uid, phone=firebase.get("phone"))

        order = Order.query.filter(Order.paypal_order_id == paypal_order_id, Order.user_id == user.id).one_or_none()
        if not order:
            return json_error("Order not found for this PayPal order.", 404)
        if order.status != "pending":
            return jsonify({"order": order_to_payload(order), "status": order.status})

        try:
            capture_json = capture_paypal_order(paypal_order_id)
        except Exception as e:
            order.status = "failed"
            db.session.commit()
            return json_error("PayPal capture failed", 502, detail=str(e))

        capture_id = ""
        try:
            capture_id = capture_json.get("purchase_units", [{}])[0].get("payments", {}).get("captures", [{}])[0].get("id") or ""
        except Exception:
            capture_id = ""

        # Decrement stock atomically-ish: validate then decrement inside the same session.
        items = OrderItem.query.filter(OrderItem.order_id == order.id).all()
        for it in items:
            p = Product.query.filter(Product.id == it.product_id).one_or_none()
            if not p or p.available < it.quantity:
                order.status = "failed"
                db.session.commit()
                return json_error("Stock changed before capture.", 400)
        for it in items:
            p = Product.query.filter(Product.id == it.product_id).one_or_none()
            p.available -= it.quantity
        order.status = "captured"
        order.paypal_capture_id = capture_id
        db.session.commit()

        return jsonify({"order": order_to_payload(order), "status": order.status})

    # ---------------- Admin: Products ----------------
    def parse_int(value: Any, *, default: int = 0) -> int:
        try:
            return int(value)
        except Exception:
            return default

    @app.get("/api/admin/products")
    @require_auth
    @require_admin
    def admin_list_products():
        products = Product.query.order_by(Product.id.asc()).all()
        return jsonify(
            {
                "items": [
                    {
                        "id": p.id,
                        "category": p.category,
                        "name": p.name,
                        "specs": p.specs,
                        "priceValue": float(p.price_value),
                        "image": p.image_url,
                        "images": p.images_json,
                        "available": p.available,
                        "reorderAt": p.reorder_at,
                    }
                    for p in products
                ]
            }
        )

    @app.post("/api/admin/products")
    @require_auth
    @require_admin
    def admin_create_product():
        data = request.get_json(silent=True) or {}

        category = str(data.get("category") or "").strip()
        name = str(data.get("name") or "").strip()
        specs = data.get("specs") or None
        price_value_raw = data.get("priceValue", data.get("price_value"))
        image = str(data.get("image") or "").strip()
        images = data.get("images")

        if not category or not name:
            return json_error("category and name are required", 400)

        try:
            price_value = Decimal(str(price_value_raw))
        except Exception:
            return json_error("priceValue must be a number", 400)

        if images is None:
            images = []
        if not isinstance(images, list):
            images = []
        clean_images = []
        for x in images:
            if x is None:
                continue
            s = str(x).strip()
            if s:
                clean_images.append(s)
        if not image and clean_images:
            image = clean_images[0]
        if not clean_images and image:
            clean_images = [image]

        available = parse_int(data.get("available"), default=0)
        reorder_at = parse_int(data.get("reorderAt"), default=0)

        p = Product(
            category=category,
            name=name,
            specs=specs if isinstance(specs, str) else None,
            price_value=price_value,
            image_url=image or None,
            images_json=clean_images if clean_images else None,
            available=max(0, available),
            reorder_at=max(0, reorder_at),
        )
        db.session.add(p)
        db.session.commit()
        return jsonify({"product": {"id": p.id}})

    @app.put("/api/admin/products/<int:product_id>")
    @require_auth
    @require_admin
    def admin_update_product(product_id: int):
        data = request.get_json(silent=True) or {}
        p = Product.query.filter(Product.id == product_id).one_or_none()
        if not p:
            return json_error("Product not found", 404)

        category = str(data.get("category") or p.category).strip()
        name = str(data.get("name") or p.name).strip()
        specs = data.get("specs") or p.specs
        price_value_raw = data.get("priceValue", data.get("price_value", p.price_value))
        image = str(data.get("image") or p.image_url or "").strip()
        images = data.get("images")

        try:
            price_value = Decimal(str(price_value_raw))
        except Exception:
            price_value = Decimal(p.price_value)

        if images is None:
            images = []
        if not isinstance(images, list):
            images = []
        clean_images = []
        for x in images:
            if x is None:
                continue
            s = str(x).strip()
            if s:
                clean_images.append(s)
        if not image and clean_images:
            image = clean_images[0]
        if not clean_images and image:
            clean_images = [image]

        p.category = category
        p.name = name
        p.specs = specs if isinstance(specs, str) else None
        p.price_value = price_value
        p.image_url = image or None
        p.images_json = clean_images if clean_images else None
        p.available = max(0, parse_int(data.get("available"), default=p.available))
        p.reorder_at = max(0, parse_int(data.get("reorderAt"), default=p.reorder_at))

        db.session.commit()
        return jsonify({"ok": True, "productId": p.id})

    @app.delete("/api/admin/products/<int:product_id>")
    @require_auth
    @require_admin
    def admin_delete_product(product_id: int):
        p = Product.query.filter(Product.id == product_id).one_or_none()
        if not p:
            return json_error("Product not found", 404)

        db.session.delete(p)
        db.session.commit()
        return jsonify({"ok": True})

    # ---------------- Admin: Users / Reports ----------------
    @app.get("/api/admin/users")
    @require_auth
    @require_admin
    def admin_users():
        users = User.query.order_by(User.id.asc()).all()
        now = datetime.utcnow()
        month_start = datetime(now.year, now.month, 1)
        year_start = datetime(now.year, 1, 1)
        active_cutoff = now - timedelta(days=30)

        total_users = len(users)
        active_user_set = set()
        month_user_set = set()
        year_user_set = set()

        # Collect latest login per user and also compute metrics.
        login_events = LoginEvent.query.order_by(LoginEvent.at.desc()).all()
        latest_login = {}
        for e in login_events:
            uid = e.user_id
            if uid not in latest_login:
                latest_login[uid] = e.at
            if e.at >= active_cutoff:
                active_user_set.add(uid)
            if e.at >= month_start:
                month_user_set.add(uid)
            if e.at >= year_start:
                year_user_set.add(uid)

        # Orders count
        orders_by_user = {}
        captured_orders = Order.query.filter(Order.status.in_(["pending", "captured", "failed"])).all()
        for o in captured_orders:
            orders_by_user[o.user_id] = orders_by_user.get(o.user_id, 0) + 1

        return jsonify(
            {
                "metrics": {
                    "totalUsers": total_users,
                    "activeUsers": len(active_user_set),
                    "monthlyLoggedInUsers": len(month_user_set),
                    "yearlyLoggedInUsers": len(year_user_set),
                },
                "users": [
                    {
                        "id": u.id,
                        "name": u.name or (u.phone_number.split("@")[0] if u.phone_number else None) or None,
                        "phoneNumber": u.phone_number,
                        "role": u.role,
                        "mobile": None,
                        "totalOrders": orders_by_user.get(u.id, 0),
                        "lastLogin": latest_login.get(u.id).isoformat() if latest_login.get(u.id) else None,
                    }
                    for u in users
                ],
            }
        )

    @app.delete("/api/admin/users/<int:user_id>")
    @require_auth
    @require_admin
    def admin_delete_user(user_id: int):
        firebase = request.firebase
        current_uid = firebase.get("uid")
        current_user = User.query.filter(User.firebase_uid == current_uid).one_or_none() if current_uid else None
        if current_user and current_user.id == user_id:
            return json_error("You cannot delete your own account.", 400)

        u = User.query.filter(User.id == user_id).one_or_none()
        if not u:
            return json_error("User not found", 404)

        # Delete related rows (no cascade configured).
        # Reviews
        ProductReview.query.filter(ProductReview.user_id == u.id).delete()
        # Order items then orders
        order_ids = [oid for (oid,) in db.session.query(Order.id).filter(Order.user_id == u.id).all()]
        if order_ids:
            OrderItem.query.filter(OrderItem.order_id.in_(order_ids)).delete(synchronize_session=False)
        Order.query.filter(Order.user_id == u.id).delete(synchronize_session=False)
        # Cart items then carts
        cart_ids = [cid for (cid,) in db.session.query(Cart.id).filter(Cart.user_id == u.id).all()]
        if cart_ids:
            CartItem.query.filter(CartItem.cart_id.in_(cart_ids)).delete(synchronize_session=False)
        Cart.query.filter(Cart.user_id == u.id).delete(synchronize_session=False)
        # Login events
        LoginEvent.query.filter(LoginEvent.user_id == u.id).delete()

        db.session.delete(u)
        db.session.commit()
        return jsonify({"ok": True})

    @app.get("/api/admin/reports/products")
    @require_auth
    @require_admin
    def admin_product_report():
        now = datetime.utcnow()
        start_today = datetime(now.year, now.month, now.day)
        start_month = datetime(now.year, now.month, 1)
        start_year = datetime(now.year, 1, 1)

        orders_today = Order.query.filter(Order.status == "captured", Order.created_at >= start_today).all()
        orders_month = Order.query.filter(Order.status == "captured", Order.created_at >= start_month).all()
        orders_year = Order.query.filter(Order.status == "captured", Order.created_at >= start_year).all()
        orders_all = Order.query.filter(Order.status == "captured").all()

        def sold_qty(orders):
            ids = [o.id for o in orders]
            if not ids:
                return 0
            rows = db.session.query(func.sum(OrderItem.quantity)).filter(OrderItem.order_id.in_(ids)).one()
            return int(rows[0] or 0)

        today_sold = sold_qty(orders_today)
        month_sold = sold_qty(orders_month)
        year_sold = sold_qty(orders_year)
        all_sold = sold_qty(orders_all)

        # Top products by qty across all time
        top_rows = (
            db.session.query(OrderItem.product_name_snapshot, func.sum(OrderItem.quantity).label("sold"))
            .filter(OrderItem.order_id.in_([o.id for o in orders_all]))
            .group_by(OrderItem.product_name_snapshot)
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(6)
            .all()
        )
        productSales = [{"name": name, "sold": int(sold)} for name, sold in top_rows]

        salesSummary = {
            "today": today_sold,
            "month": month_sold,
            "year": year_sold,
            "allTime": all_sold,
        }

        return jsonify({"salesSummary": salesSummary, "productSales": productSales})

    # ---------------- CMS (Home/About) ----------------
    @app.get("/api/cms")
    def cms_get_many():
        keys_raw = request.args.get("keys", "")
        keys = [k.strip() for k in keys_raw.split(",") if k.strip()]
        if not keys:
            return json_error("Missing keys query parameter (comma-separated).", 400)

        values: Dict[str, Any] = {}
        rows = SiteContent.query.filter(SiteContent.content_key.in_(keys)).all()
        for row in rows:
            values[row.content_key] = row.content_json

        # Keys not present are omitted; frontend can fall back to defaults.
        return jsonify({"values": values})

    @app.post("/api/admin/cms")
    @require_auth
    @require_admin
    def cms_upsert():
        data = request.get_json(silent=True) or {}
        key = data.get("key")
        value = data.get("value")
        if not isinstance(key, str) or not key.strip():
            return json_error("key is required", 400)
        if value is None:
            return json_error("value is required", 400)

        row = SiteContent.query.filter(SiteContent.content_key == key).one_or_none()
        if row:
            row.content_json = value
        else:
            row = SiteContent(content_key=key, content_json=value)
            db.session.add(row)

        db.session.commit()
        return jsonify({"ok": True})

    return app


app = create_app()


if __name__ == "__main__":
    # In production you'd use gunicorn/uwsgi.
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5000")), debug=True)

