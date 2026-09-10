import os

from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests


# ---------------------------------------------------------
# Load backend .env
# ---------------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH, override=True)


# ---------------------------------------------------------
# Google ID Token Verification
# ---------------------------------------------------------

def verify_google_token(credential: str):

    if not credential:
        raise ValueError("Google credential is missing")

    google_client_id = os.getenv("GOOGLE_CLIENT_ID")

    if not google_client_id:
        raise ValueError(
            "GOOGLE_CLIENT_ID is not configured in backend .env"
        )

    try:
        # Verify Google's ID token
        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            google_client_id
        )

        # Verify issuer
        issuer = idinfo.get("iss")

        if issuer not in [
            "accounts.google.com",
            "https://accounts.google.com"
        ]:
            raise ValueError("Invalid Google token issuer")

        # Extract user information
        google_id = idinfo.get("sub")
        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")

        email_verified = idinfo.get("email_verified", False)

        if not google_id:
            raise ValueError("Google user ID missing")

        if not email:
            raise ValueError("Google email missing")

        if not email_verified:
            raise ValueError("Google email is not verified")

        return {
            "success": True,
            "google_id": google_id,
            "email": email,
            "name": name or email.split("@")[0],
            "picture": picture,
            "email_verified": email_verified
        }

    except ValueError:
        raise

    except Exception as e:
        raise ValueError(
            f"Google token verification failed: {str(e)}"
        )