from typing import Optional
import requests
from requests.auth import HTTPBasicAuth
import json
import os
from dotenv import load_dotenv
load_dotenv()

BASE_URL = "https://agility-ai.atlassian.net/rest/api/3"
API_KEY = os.getenv("JIRA_API_KEY")
DEFAULT_HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json"
}
auth = HTTPBasicAuth("chrisyooak@gmail.com", API_KEY)

def jira_get_issues(project_key: str, assignee_id: str):
    url = f"{BASE_URL}/search/jql"
    query = {
        'jql': f'project = {project_key} AND assignee = {assignee_id}',
        "fields": ["summary", "status", "assignee", "description"],
        # 'maxResults': 1000,
    }
    response = requests.request(
        "GET",
        url,
        headers=DEFAULT_HEADERS,
        auth=auth,
        params=query
    )
    
    parsed = json.loads(response.text)
    issues = []
    for issue in parsed["issues"]:
        issues.append({
            "id": issue["id"],
            "key": issue["key"],
            "summary": issue["fields"]["summary"],
            "status": issue["fields"]["status"]["name"],
            "assignee": {
                "accountId": issue["fields"]["assignee"]["accountId"],
                "displayName": issue["fields"]["assignee"]["displayName"],
            },
            "description": issue["fields"]["description"]
        })

    return issues

def jira_create_issue(
    project_key: str,
    summary: str,
    description: str,
    assignee_id: Optional[str] = None,
    due_date: Optional[str] = None
):
    url = f"{BASE_URL}/issue"
    query = {
        "fields": {
            "project": {
                "key": project_key,
            },
            "summary": summary,
            "description": {
                "content": [
                    {
                        "content": [
                            {
                                "text": description,
                                "type": "text",
                            }
                        ],
                        "type": "paragraph",
                    }
                ],
                "type": "doc",
                "version": 1,
            },
            "issuetype": {
                "name": "Task"
            }
        }
    }
    if due_date:
        query["fields"]["duedate"] = due_date
    if assignee_id:
        query["fields"]["assignee"] = {
            "accountId": assignee_id
        }
    response = requests.request(
        "POST",
        url,
        headers=DEFAULT_HEADERS,
        auth=auth,
        data=json.dumps(query)
    )
    parsed = json.loads(response.text)
    return {
        "id": parsed["id"],
        "key": parsed["key"],
    }

def jira_edit_issue():
    return ""

if __name__ == "__main__":
    # print(jira_get_issues("EX", "712020:a8a30946-e83b-4066-95ae-663a74bf7484"))
    print(jira_create_issue(project_key="EX", summary="Test Ticket", description="Test Description"))