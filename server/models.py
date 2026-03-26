from __future__ import annotations

from datetime import datetime
from typing import Any

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    firebase_uid = db.Column(db.String(128), nullable=False, unique=True, index=True)
    phone_number = db.Column(db.String(32), nullable=False, unique=True, index=True)
    name = db.Column(db.String(120), nullable=True)
    role = db.Column(db.String(16), nullable=False, default="customer")

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    carts = db.relationship("Cart", backref="user", lazy=True)
    orders = db.relationship("Order", backref="user", lazy=True)
    reviews = db.relationship("ProductReview", backref="user", lazy=True)


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    category = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    specs = db.Column(db.Text, nullable=True)
    price_value = db.Column(db.Numeric(12, 2), nullable=False)  # treated as USD amount
    image_url = db.Column(db.Text, nullable=True)
    images_json = db.Column(db.JSON, nullable=True)

    available = db.Column(db.Integer, nullable=False, default=0)
    reorder_at = db.Column(db.Integer, nullable=False, default=0)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class Cart(db.Model):
    __tablename__ = "carts"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False, index=True)
    status = db.Column(db.String(16), nullable=False, default="active")  # active/submitted

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class CartItem(db.Model):
    __tablename__ = "cart_items"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    cart_id = db.Column(db.BigInteger, db.ForeignKey("carts.id"), nullable=False, index=True)
    product_id = db.Column(db.BigInteger, db.ForeignKey("products.id"), nullable=False, index=True)
    quantity = db.Column(db.Integer, nullable=False)

    added_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = db.relationship("Product")

    __table_args__ = (
        db.UniqueConstraint("cart_id", "product_id", name="uq_cart_item_product"),
    )


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False, index=True)

    paypal_order_id = db.Column(db.String(64), nullable=True, unique=True, index=True)
    paypal_capture_id = db.Column(db.String(64), nullable=True)

    status = db.Column(db.String(16), nullable=False, default="pending")  # pending/captured/failed

    currency = db.Column(db.String(8), nullable=False, default="USD")
    subtotal = db.Column(db.Numeric(12, 2), nullable=False)
    tax = db.Column(db.Numeric(12, 2), nullable=False)
    total = db.Column(db.Numeric(12, 2), nullable=False)

    shipping_json = db.Column(db.JSON, nullable=True)
    customer_json = db.Column(db.JSON, nullable=True)

    address_text = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = db.relationship("OrderItem", backref="order", lazy=True)


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    order_id = db.Column(db.BigInteger, db.ForeignKey("orders.id"), nullable=False, index=True)

    product_id = db.Column(db.BigInteger, db.ForeignKey("products.id"), nullable=True)
    product_name_snapshot = db.Column(db.String(200), nullable=False)
    unit_price_snapshot = db.Column(db.Numeric(12, 2), nullable=False)  # USD
    quantity = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)


class ProductReview(db.Model):
    __tablename__ = "product_reviews"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False, index=True)
    product_id = db.Column(db.BigInteger, db.ForeignKey("products.id"), nullable=False, index=True)

    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("user_id", "product_id", name="uq_review_user_product"),
    )


class LoginEvent(db.Model):
    __tablename__ = "login_events"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False, index=True)
    at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)


class SiteContent(db.Model):
    __tablename__ = "site_content"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    content_key = db.Column(db.String(200), nullable=False, unique=True, index=True)
    content_json = db.Column(db.JSON, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


def to_amount(x: Any) -> float:
    if x is None:
        return 0.0
    return float(x)

