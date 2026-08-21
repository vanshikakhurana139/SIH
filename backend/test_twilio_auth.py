import urllib.request, base64, json, urllib.parse

ACCOUNT_SID = "AC771d473d16c058dbb5a63a2fc9355e47"
AUTH_TOKEN = "50fa364158b6b1b14cf478cfcce6e2e6"
VERIFY_SERVICE_SID = "VA9999fae227b7078cf1401053ecdb889c"
b64_auth = base64.b64encode(f"{ACCOUNT_SID}:{AUTH_TOKEN}".encode()).decode()

# Step 1: Rename the Verify Service to "SENTINEL ALERT"
print("=== Step 1: Renaming Verify Service to 'SENTINEL ALERT' ===")
rename_data = urllib.parse.urlencode({
    "FriendlyName": "SENTINEL ALERT"
}).encode()
rename_url = f"https://verify.twilio.com/v2/Services/{VERIFY_SERVICE_SID}"
rename_req = urllib.request.Request(rename_url, data=rename_data, method="POST",
                                    headers={"Authorization": f"Basic {b64_auth}"})
try:
    rename_resp = urllib.request.urlopen(rename_req, timeout=10)
    rename_result = json.loads(rename_resp.read().decode("utf-8"))
    print(f"Service renamed to: {rename_result.get('friendly_name')}")
except urllib.error.HTTPError as e:
    body = json.loads(e.read().decode("utf-8"))
    print(f"Rename ERROR ({e.code}): {body.get('message')}")

# Step 2: Send SMS verification (will now use "SENTINEL ALERT" as the service name)
print("\n=== Step 2: Sending Verify SMS ===")
data = urllib.parse.urlencode({
    "To": "+919729280478",
    "Channel": "sms",
}).encode()
url = f"https://verify.twilio.com/v2/Services/{VERIFY_SERVICE_SID}/Verifications"
req = urllib.request.Request(url, data=data, headers={"Authorization": f"Basic {b64_auth}"})

try:
    resp = urllib.request.urlopen(req, timeout=10)
    result = json.loads(resp.read().decode("utf-8"))
    print(f"SUCCESS! Status: {result.get('status')}, To: {result.get('to')}")
    print("Check your phone - it should say SENTINEL ALERT now!")
except urllib.error.HTTPError as e:
    body = json.loads(e.read().decode("utf-8"))
    print(f"HTTP {e.code} ERROR: code={body.get('code')} msg={body.get('message')}")
except Exception as e:
    print(f"Error: {e}")
