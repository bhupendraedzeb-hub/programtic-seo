import requests
url='http://127.0.0.1:8000/api/auth/register'
payload={'email':'tester@example.com','password':'Passw0rd!'}
resp=requests.post(url,json=payload)
print('STATUS',resp.status_code)
try:
    print(resp.json())
except Exception:
    print('TEXT',resp.text)
