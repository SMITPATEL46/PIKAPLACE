from __future__ import annotations

import os
from typing import Any, Dict, Optional

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials


_initialized = False


def init_firebase_admin() -> None:
    global _initialized
    if _initialized:
        return

    service_account_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
    if not service_account_path:
        raise RuntimeError("Missing FIREBASE_SERVICE_ACCOUNT_JSON env var (path to service account json).")

    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)
    _initialized = True


def verify_id_token(id_token: str) -> Dict[str, Any]:
    """
    Verifies a Firebase ID token and returns the decoded token dict.
    """
    if not _initialized:
        init_firebase_admin()

    decoded = firebase_auth.verify_id_token(id_token)
    return decoded


def extract_phone_number(decoded_token: Dict[str, Any]) -> Optional[str]:
    # Firebase phone auth user records usually store phone_number.
    phone = decoded_token.get("phone_number")
    if phone and isinstance(phone, str):
        return phone.strip()
    return None


def extract_uid(decoded_token: Dict[str, Any]) -> str:
    uid = decoded_token.get("uid")
    if not uid or not isinstance(uid, str):
        raise RuntimeError("Firebase token missing uid.")
    return uid

