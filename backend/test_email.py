import os
import smtplib
from dotenv import load_dotenv
from email.message import EmailMessage

load_dotenv()

sender = os.getenv("SMTP_EMAIL")
password = os.getenv("SMTP_APP_PASSWORD")

print("Sender:", sender)
print("Password configured:", bool(password))

recipient = input("Enter email where OTP should be received: ").strip()

msg = EmailMessage()
msg["Subject"] = "STATWISE AI OTP TEST"
msg["From"] = sender
msg["To"] = recipient

msg.set_content(
    """STATWISE AI

Your test OTP is:

123456

This is a test email from the STATWISE AI backend.
"""
)

try:
    print("Connecting to Gmail SMTP...")

    with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()

        print("Logging into Gmail...")
        server.login(sender, password)

        print("Sending email...")
        server.send_message(msg)

    print()
    print("================================")
    print("EMAIL SENT SUCCESSFULLY")
    print("================================")

except Exception as e:
    print()
    print("================================")
    print("EMAIL SENDING FAILED")
    print("ERROR:", repr(e))
    print("================================")