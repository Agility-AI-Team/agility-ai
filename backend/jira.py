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

def textToDoc(text: str):
    return {
        "content": [
            {
                "content": [
                    {
                        "text": text,
                        "type": "text",
                    }
                ],
                "type": "paragraph",
            }
        ],
        "type": "doc",
        "version": 1,
    }

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

def jira_get_issue(issue_id: str):
    url = f"{BASE_URL}/issue/{issue_id}"
    query = {
        "fields": ["summary", "status", "assignee", "description"],
    }
    response = requests.request(
        "GET",
        url,
        headers=DEFAULT_HEADERS,
        auth=auth,
        params=query
    )
    parsed = json.loads(response.text)
    result = {
        "id": parsed["id"],
        "key": parsed["key"],
        "summary": parsed["fields"]["summary"],
        "status": parsed["fields"]["status"]["name"],
        "description": parsed["fields"]["description"]
    }
    if parsed["fields"]["assignee"]:
        result["assignee"] = {
            "accountId": parsed["fields"]["assignee"]["accountId"],
            "displayName": parsed["fields"]["assignee"]["displayName"],
        }
    return result

def jira_create_issue(
    project_key: str,
    summary: str,
    description: str,
    assignee_id: Optional[str] = None,
    due_date: Optional[str] = None
):
    url = f"{BASE_URL}/issue"
    payload = {
        "fields": {
            "project": {
                "key": project_key,
            },
            "summary": summary,
            "description": textToDoc(description),
            "issuetype": {
                "name": "Task"
            }
        }
    }
    if due_date:
        payload["fields"]["duedate"] = due_date
    if assignee_id:
        payload["fields"]["assignee"] = {
            "accountId": assignee_id
        }
    response = requests.request(
        "POST",
        url,
        headers=DEFAULT_HEADERS,
        auth=auth,
        data=json.dumps(payload)
    )
    parsed = json.loads(response.text)
    return {
        "id": parsed["id"],
        "key": parsed["key"],
    }

def jira_edit_issue(
    issue_id: str,
    summary: Optional[str] = None,
    description: Optional[str] = None,
    assignee_id: Optional[str] = None,
    due_date: Optional[str] = None
):
    url = f"{BASE_URL}/issue/{issue_id}"
    payload = {
        "fields": {}
    }
    if summary:
        payload["fields"]["summary"] = summary
    if description:
        payload["fields"]["description"] = textToDoc(description)
    if assignee_id:
        payload["fields"]["assignee"] = {
            "accountId": assignee_id
        }
    if due_date:
        payload["fields"]["duedate"] = due_date

    response = requests.request(
        "PUT",
        url,
        headers=DEFAULT_HEADERS,
        auth=auth,
        data=json.dumps(payload)
    )
    if response.status_code == 204:
        return {"success": True}
    return {"success": False, "error": response.text}

def jira_get_issue_transitions(issue_id: str):
    url = f"{BASE_URL}/issue/{issue_id}/transitions"
    response = requests.request(
        "GET",
        url,
        headers=DEFAULT_HEADERS,
        auth=auth
    )
    parsed = json.loads(response.text)
    transitions = []
    for transition in parsed["transitions"]:
        transitions.append({
            "transition_id": transition["id"],
            "status_display_name": transition["name"],
        })
    return transitions

def jira_transition_issue(issue_id: str, transition_id: str):
    url = f"{BASE_URL}/issue/{issue_id}/transitions"
    payload = {
        "transition": {
            "id": transition_id
        }
    }
    response = requests.request(
        "POST",
        url,
        headers=DEFAULT_HEADERS,
        auth=auth,
        data=json.dumps(payload)
    )
    if response.status_code == 204:
        return {"success": True}
    return {"success": False, "error": response.text}

if __name__ == "__main__":
    # print(jira_get_issues("EX", "712020:a8a30946-e83b-4066-95ae-663a74bf7484"))
    # print(jira_create_issue(project_key="EX", summary="Test Ticket", description="Test Description"))
    # print(jira_edit_issue("10009", summary="New Summary", description="New Description"))
    # print(jira_get_issue("10009"))
    # print(jira_get_issue_transitions("10009"))
    # print(jira_transition_issue("10009", "21"))
    pass