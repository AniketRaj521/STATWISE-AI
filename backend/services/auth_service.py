import os
import random
import smtplib
from datetime import datetime, timedelta
from email.message import EmailMessage

from dotenv import load_dotenv

load_dotenv()


# ---------------------------------------------------------
# TEMPORARY IN-MEMORY STORAGE
# ---------------------------------------------------------
# Good for hackathon/demo.
# For production, use a database such as PostgreSQL/Redis.

users = {}
otp_store = {}


# ---------------------------------------------------------
# ENVIRONMENT VARIABLES
# ---------------------------------------------------------

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

OTP_EXPIRY_MINUTES = 10


# ---------------------------------------------------------
# GENERATE OTP
# ---------------------------------------------------------

def generate_otp():
    return str(random.randint(100000, 999999))


# ---------------------------------------------------------
# SEND OTP EMAIL
# ---------------------------------------------------------

def send_otp_email(email, otp):
    """
    Sends OTP through Gmail SMTP.

    Required .env:
        SMTP_EMAIL=yourgmail@gmail.com
        SMTP_PASSWORD=your_16_digit_app_password
    """

    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("SMTP credentials are not configured.")
        print(f"DEMO OTP for {email}: {otp}")

        return {
            "success": True,
            "message": "OTP generated successfully.",
            "demo": True,
            "otp": otp
        }

    try:
        message = EmailMessage()

        message["Subject"] = "STATWISE AI - Email Verification OTP"
        message["From"] = SMTP_EMAIL
        message["To"] = email

        message.set_content(
            f"""
Hello,

Your STATWISE AI verification OTP is:

{otp}

This OTP is valid for {OTP_EXPIRY_MINUTES} minutes.

If you did not request this OTP, please ignore this email.

Regards,
STATWISE AI Team
"""
        )

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(message)

        return {
            "success": True,
            "message": "OTP sent successfully."
        }

    except Exception as e:
        print("Email sending error:", e)

        # Keep demo working even if SMTP fails
        print(f"DEMO OTP for {email}: {otp}")

        return {
            "success": True,
            "message": "OTP generated successfully. Check backend console.",
            "demo": True,
            "otp": otp
        }


# ---------------------------------------------------------
# REGISTER USER
# ---------------------------------------------------------

def register_user(data):

    full_name = str(data.get("full_name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not full_name:
        return {
            "success": False,
            "message": "Full name is required."
        }

    if not email:
        return {
            "success": False,
            "message": "Email is required."
        }

    if not password:
        return {
            "success": False,
            "message": "Password is required."
        }

    if len(password) < 6:
        return {
            "success": False,
            "message": "Password must contain at least 6 characters."
        }

    # Check existing verified user
    if email in users and users[email].get("verified"):
        return {
            "success": False,
            "message": "An account with this email already exists."
        }

    # Generate OTP
    otp = generate_otp()

    # Store pending user
    otp_store[email] = {
        "otp": otp,
        "expires_at": datetime.now() + timedelta(
            minutes=OTP_EXPIRY_MINUTES
        ),
        "full_name": full_name,
        "email": email,
        "password": password
    }

    # Send OTP
    email_result = send_otp_email(email, otp)

    response = {
        "success": True,
        "message": "Registration successful. OTP sent to your email.",
        "email": email
    }

    # In demo mode, return OTP to frontend
    # This makes testing easy when SMTP isn't configured.
    if email_result.get("demo"):
        response["demo_otp"] = otp

    return response


# ---------------------------------------------------------
# VERIFY OTP
# ---------------------------------------------------------

def verify_otp(email, otp):

    email = str(email).strip().lower()
    otp = str(otp).strip()

    if not email:
        return {
            "success": False,
            "message": "Email is required."
        }

    if not otp:
        return {
            "success": False,
            "message": "OTP is required."
        }

    stored_data = otp_store.get(email)

    if not stored_data:
        return {
            "success": False,
            "message": "No OTP request found. Please register again."
        }

    # Check expiry
    if datetime.now() > stored_data["expires_at"]:

        del otp_store[email]

        return {
            "success": False,
            "message": "OTP has expired. Please request a new OTP."
        }

    # Check OTP
    if otp != stored_data["otp"]:

        return {
            "success": False,
            "message": "Invalid OTP. Please check the OTP and try again."
        }

    # Create verified user
    users[email] = {
        "full_name": stored_data["full_name"],
        "email": stored_data["email"],
        "password": stored_data["password"],
        "verified": True,
        "created_at": datetime.now().isoformat()
    }

    # Remove used OTP
    del otp_store[email]

    return {
        "success": True,
        "message": "Email verified successfully.",
        "user": {
            "full_name": users[email]["full_name"],
            "email": users[email]["email"]
        }
    }


# ---------------------------------------------------------
# RESEND OTP
# ---------------------------------------------------------

def resend_otp(email):

    email = str(email).strip().lower()

    if not email:
        return {
            "success": False,
            "message": "Email is required."
        }

    # Check pending registration
    pending_user = otp_store.get(email)

    if not pending_user:

        # If already verified
        if email in users and users[email].get("verified"):
            return {
                "success": False,
                "message": "This email is already verified."
            }

        return {
            "success": False,
            "message": "No pending registration found for this email."
        }

    # Generate new OTP
    otp = generate_otp()

    pending_user["otp"] = otp
    pending_user["expires_at"] = datetime.now() + timedelta(
        minutes=OTP_EXPIRY_MINUTES
    )

    # Send new OTP
    email_result = send_otp_email(email, otp)

    response = {
        "success": True,
        "message": "A new OTP has been sent.",
        "email": email
    }

    if email_result.get("demo"):
        response["demo_otp"] = otp

    return response