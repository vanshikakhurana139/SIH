import urllib.request, base64, json

auth_str = "AC771d473d16c058dbb5a63a2fc9355e47:d99995143507d4ef9ecafa932e4d813d"
b64_auth = base64.b64encode(auth_str.encode()).decode()
url = "https://content.twilio.com/v1/Content"
req = urllib.request.Request(url, headers={"Authorization": f"Basic {b64_auth}"})
try:
    resp = urllib.request.urlopen(req, timeout=10)
    data = json.loads(resp.read().decode("utf-8"))
    for item in data.get("contents", []):
        print(f"SID: {item['sid']}  Name: {item.get('friendly_name','')}  Types: {list(item.get('types',{}).keys())}")
    if not data.get("contents"):
        print("NO TEMPLATES FOUND")
        print(json.dumps(data, indent=2))
except urllib.error.HTTPError as e:
    print("ERROR:", e.read().decode("utf-8"))
