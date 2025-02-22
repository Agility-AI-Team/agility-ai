from typing import Optional
from jira import jira_create_issue, jira_edit_issue, jira_get_issue, jira_get_issue_transitions, jira_get_issues, jira_transition_issue
from pydantic import BaseModel
from fastapi import FastAPI
from uuid import uuid4
import json

app = FastAPI()
with open("db.json") as f:
    db = json.load(f)
    jira_project_key = db["project"]["jira"]["project_key"]

@app.post("/user/{user_id}/generate_meeting")
async def generate_meeting_for_user(user_id: str):
    if user_id not in db["users"]:
        return {"error": "User not found"}

    meeting_id = str(uuid4())
    db["meetings"][meeting_id] = {
        "id": meeting_id,
        "user_id": user_id,
    }

    return { "meeting_link": meeting_id }

@app.get("/meeting/{meeting_id}/user")
async def get_user_info(meeting_id: str):
    user_id = db["meetings"][meeting_id]["user_id"]
    return { "user": db["users"][user_id] }

# Jira
@app.get("/meeting/{meeting_id}/api/jira/getIssues")
async def get_issues_for_user(meeting_id: str):
    if meeting_id not in db["meetings"]:
        return {"error": "Meeting not found"}

    user_id = db["meetings"][meeting_id]["user_id"]
    jira_user_id = db["users"][user_id]["jira_id"]
    issues = jira_get_issues(project_key=jira_project_key, assignee_id=jira_user_id)
    return { "issues": issues }

@app.get("/meeting/{meeting_id}/api/jira/getIssue")
async def get_issue(meeting_id: str, issue_id: str):
    issue = jira_get_issue(issue_id=issue_id)
    return { "issue": issue }
class CreateIssueRequest(BaseModel):
    title: str
    description: str
    assignee_id: Optional[str] = None
    due_date: Optional[str] = None # YYYY-MM-DD

@app.post("/meeting/{meeting_id}/api/jira/createIssue")
async def create_issue(meeting_id: str, request: CreateIssueRequest):
    result = jira_create_issue(
        project_key=jira_project_key,
        summary=request.title,
        description=request.description,
        assignee_id=request.assignee_id,
        due_date=request.due_date,
    )
    return result

class EditIssueRequest(BaseModel):
    issue_id: str
    summary: Optional[str] = None
    description: Optional[str] = None
    assignee_id: Optional[str] = None
    due_date: Optional[str] = None # YYYY-MM-DD

@app.put("/meeting/{meeting_id}/api/jira/editIssue")
async def edit_issue(meeting_id: str, request: EditIssueRequest):
    result = jira_edit_issue(
        issue_id=request.issue_id,
        status=request.status,
        summary=request.summary,
        description=request.description,
        assignee_id=request.assignee_id,
        due_date=request.due_date,
    )
    return result

@app.get("/meeting/{meeting_id}/api/jira/getIssueTransitions")
async def get_issue_transitions(meeting_id: str, issue_id: str):
    transitions = jira_get_issue_transitions(issue_id=issue_id)
    return {"transitions": transitions}

@app.post("/meeting/{meeting_id}/api/jira/transitionIssue")
async def change_issue_status(meeting_id: str, issue_id: str, transition_id: str):
    result = jira_transition_issue(issue_id=issue_id, transition_id=transition_id)
    return result

# GitHub
@app.get("/meeting/{meeting_id}/api/github/getIssues")
async def get_issues_for_user(meeting_id: str):
    return {"issues": []}

@app.get("/meeting/{meeting_id}/api/github/getPullRequests")
async def get_pull_requests_for_user(meeting_id: str):
    return {"pull_requests": []}


# Admin
@app.post("/save_db")
async def save_db():
    with open("users.json", "w") as f:
        json.dump(db, f, indent=2)
    return {"success": True}
