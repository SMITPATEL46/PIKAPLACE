from __future__ import annotations

import base64
import os
from typing import Any, Dict, Optional

import requests


def paypal_sandbox_base_url() -> str:
    return os.environ.get("PAYPAL_BASE_URL", "https://api-m.sandbox.paypal.com")


def get_paypal_access_token() -> str:
    client_id = os.environ["PAYPAL_CLIENT_ID"]
    client_secret = os.environ["PAYPAL_CLIENT_SECRET"]

    auth_str = f"{client_id}:{client_secret}"
    b64 = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

    url = f"{paypal_sandbox_base_url()}/v1/oauth2/token"
    resp = requests.post(
        url,
        headers={
            "Authorization": f"Basic {b64}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data={"grant_type": "client_credentials"},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    token = data.get("access_token")
    if not token:
        raise RuntimeError("PayPal token missing from response.")
    return token


def create_paypal_order(*, total_value_usd: str, return_url: str, cancel_url: str, custom_id: str) -> Dict[str, Any]:
    access_token = get_paypal_access_token()

    url = f"{paypal_sandbox_base_url()}/v2/checkout/orders"
    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {"currency_code": "USD", "value": total_value_usd},
                "description": "PIKAPLACE order",
                "custom_id": custom_id,
            }
        ],
        "application_context": {
            "brand_name": "PIKAPLACE",
            "user_action": "PAY_NOW",
            "return_url": return_url,
            "cancel_url": cancel_url,
        },
    }

    resp = requests.post(
        url,
        headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
        json=payload,
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def capture_paypal_order(paypal_order_id: str) -> Dict[str, Any]:
    access_token = get_paypal_access_token()

    url = f"{paypal_sandbox_base_url()}/v2/checkout/orders/{paypal_order_id}/capture"
    resp = requests.post(
        url,
        headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def find_approval_url(paypal_order_json: Dict[str, Any]) -> str:
    links = paypal_order_json.get("links") or []
    for link in links:
        if link.get("rel") == "approve":
            url = link.get("href")
            if url:
                return url
    raise RuntimeError("PayPal approval URL not found in response.")

