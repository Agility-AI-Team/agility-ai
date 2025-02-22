import requests
import json
from dotenv import load_dotenv
import os
load_dotenv()

API_KEY = os.getenv("GITHUB_API_KEY")

def github_get_repo(owner: str, repo: str):
    url = f"https://api.github.com/repos/{owner}/{repo}"
    headers = {"Authorization": f"Bearer {API_KEY}"}
    response = requests.get(url, headers=headers)
    return response.json()

def github_get_pull_requests(owner: str, repo: str):
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls?state=open"
    headers = {"Authorization": f"Bearer {API_KEY}"}
    response = requests.get(url, headers=headers)
    parsed = response.json()
    pull_requests = []
    for pull_request in parsed:
        pull_requests.append({
            "id": pull_request["id"],
            "created_by": {
                "display_name": pull_request["user"]["login"],
                "id": pull_request["user"]["id"],
            },
            "title": pull_request["title"],
            "state": pull_request["state"],
            "created_at": pull_request["created_at"],
            "updated_at": pull_request["updated_at"],
        })
    return pull_requests

if __name__ == "__main__":
    # print(github_get_repo("Agility-AI-Team", "excalidraw"))
    print(github_get_pull_requests("Agility-AI-Team", "excalidraw"))