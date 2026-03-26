from __future__ import annotations

from decimal import Decimal

from sqlalchemy import func

from .models import Product, db


DEFAULT_PRODUCTS = [
    {
        "category": "Luxury Classic",
        "name": "Aurelius Classic Gold",
        "specs": "Automatic · Sapphire Glass · 5 ATM",
        "price_value": "5999.00",
        "image_url": "https://images.unsplash.com/photo-1548171916-30c7c511c1e9?auto=format&fit=crop&w=1200&q=80",
        "available": 42,
        "reorder_at": 10,
    },
    {
        "category": "Everyday Casual",
        "name": "Noir Heritage Leather",
        "specs": "Quartz · Italian Leather · 3 ATM",
        "price_value": "4499.00",
        "image_url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80",
        "available": 28,
        "reorder_at": 8,
    },
    {
        "category": "Formal Dress",
        "name": "Ivory Dial Heritage",
        "specs": "Slim Case · Date Window · 3 ATM",
        "price_value": "3999.00",
        "image_url": "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80",
        "available": 15,
        "reorder_at": 5,
    },
    {
        "category": "Sport Chrono",
        "name": "Midnight Steel Chrono",
        "specs": "Chronograph · Tachymeter · 10 ATM",
        "price_value": "5499.00",
        "image_url": "https://images.unsplash.com/photo-1524592714635-79fdaec1c1c1?auto=format&fit=crop&w=1200&q=80",
        "available": 9,
        "reorder_at": 6,
    },
    {
        "category": "Luxury Classic",
        "name": "Regal Silver Date",
        "specs": "Automatic · Steel Bracelet · 5 ATM",
        "price_value": "5499.00",
        "image_url": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80",
        "available": 42,
        "reorder_at": 10,
    },
    {
        "category": "Everyday Casual",
        "name": "Navy Minimal Date",
        "specs": "Quartz · Canvas Strap · 3 ATM",
        "price_value": "3499.00",
        "image_url": "https://images.unsplash.com/photo-1524594154908-edd35596e0df?auto=format&fit=crop&w=1200&q=80",
        "available": 28,
        "reorder_at": 8,
    },
]


def seed_products_if_empty() -> int:
    count = db.session.query(func.count(Product.id)).scalar() or 0
    if count > 0:
        return int(count)

    for p in DEFAULT_PRODUCTS:
        db.session.add(
            Product(
                category=p["category"],
                name=p["name"],
                specs=p.get("specs"),
                price_value=Decimal(p["price_value"]),
                image_url=p.get("image_url"),
                images_json=p.get("images_json"),
                available=int(p.get("available") or 0),
                reorder_at=int(p.get("reorder_at") or 0),
            )
        )

    db.session.commit()
    return len(DEFAULT_PRODUCTS)

