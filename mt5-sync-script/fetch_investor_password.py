import requests
import os

API_URL = os.environ.get("API_URL")
API_KEY = os.environ.get("API_KEY")
USER_ID = os.environ.get("USER_ID")

# Get decrypted investor password from backend (admin/internal use only)
def get_investor_password():
    url = f"{API_URL}/api/investor-password/{USER_ID}"
    headers = {"x-api-key": API_KEY}
    resp = requests.get(url, headers=headers)
    if resp.status_code == 200:
        return resp.json()["investorPassword"]
    else:
        raise Exception(f"Failed to get investor password: {resp.text}")

# Use this in your MT5 sync script to fetch the password securely
if __name__ == "__main__":
    print(get_investor_password())
