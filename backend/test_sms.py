import urllib.request, base64, json, urllib.parse

ACCOUNT_SID = "AC771d473d16c058dbb5a63a2fc9355e47"
AUTH_TOKEN = "d99995143507d4ef9ecafa932e4d813d"
VERIFY_SERVICE_SID = "VA9999fae227b7078cf1401053ecdb889c"
b64_auth = base64.b64encode(f"{ACCOUNT_SID}:{AUTH_TOKEN}".encode()).decode()

# Send a Verify SMS - this WORKS on trial accounts
print("=== Sending Verify SMS Alert ===")
data = urllib.parse.urlencode({
    "To": "+919729280478",
    "Channel": "sms",
    "CustomFriendlyName": "SENTINEL ALERT"
}).encode()
url = f"https://verify.twilio.com/v2/Services/{VERIFY_SERVICE_SID}/Verifications"
req = urllib.request.Request(url, data=data, headers={"Authorization": f"Basic {b64_auth}"})
try:
    resp = urllib.request.urlopen(req, timeout=10)
    result = json.loads(resp.read().decode("utf-8"))
    print(f"Status: {result.get('status')}")
    print(f"To: {result.get('to')}")
    print(f"SID: {result.get('sid')}")
    print("SUCCESS! SMS sent to phone!")
except urllib.error.HTTPError as e:
    body = json.loads(e.read().decode("utf-8"))
    print(f"ERROR ({e.code}): code={body.get('code')} msg={body.get('message')}")

# Also try WhatsApp channel via Verify
print("\n=== Sending Verify WhatsApp Alert ===")
data2 = urllib.parse.urlencode({
    "To": "+919729280478",
    "Channel": "whatsapp",
}).encode()
req2 = urllib.request.Request(url, data=data2, headers={"Authorization": f"Basic {b64_auth}"})
try:
    resp2 = urllib.request.urlopen(req2, timeout=10)
    result2 = json.loads(resp2.read().decode("utf-8"))
    print(f"Status: {result2.get('status')}")
    print(f"To: {result2.get('to')}")
    print("SUCCESS! WhatsApp verification sent!")
except urllib.error.HTTPError as e:
    body2 = json.loads(e.read().decode("utf-8"))
    print(f"ERROR ({e.code}): code={body2.get('code')} msg={body2.get('message')}")
