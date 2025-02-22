from typing import Optional
from jira import jira_create_issue, jira_edit_issue, jira_get_issue, jira_get_issue_transitions, jira_get_issues, jira_transition_issue
from github import github_get_pull_requests
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
import json

from summary import Transcript, summarize_meeting

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("db.json") as f:
    db = json.load(f)
    jira_project_key = db["project"]["jira"]["project_key"]
    github_owner = db["project"]["github"]["owner"]
    github_repo = db["project"]["github"]["repo"]

@app.post("/user/{user_id}/generate_meeting")
async def generate_meeting_for_user(user_id: str):
    if user_id not in db["users"]:
        return {"error": "User not found"}

    meeting_id = str(uuid4())
    db["meetings"][meeting_id] = {
        "id": meeting_id,
        "user_id": user_id,
        "escalation_notes": [],
    }

    return { "meeting_link": meeting_id }

@app.get("/meeting/{meeting_id}/user")
async def get_user_info(meeting_id: str):
    if db["meetings"].get(meeting_id) is None:
        return {"error": "Meeting not found"}
  
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
async def create_issue(meeting_id: str, r: CreateIssueRequest):
    result = jira_create_issue(
        project_key=jira_project_key,
        summary=r.title,
        description=r.description,
        assignee_id=r.assignee_id,
        due_date=r.due_date,
    )
    return result

class EditIssueRequest(BaseModel):
    issue_id: str
    title: Optional[str] = None
    description: Optional[str] = None
    assignee_id: Optional[str] = None
    due_date: Optional[str] = None # YYYY-MM-DD

@app.put("/meeting/{meeting_id}/api/jira/editIssue")
async def edit_issue(meeting_id: str, r: EditIssueRequest):
    result = jira_edit_issue(
        issue_id=r.issue_id,
        summary=r.title,
        description=r.description,
        assignee_id=r.assignee_id,
        due_date=r.due_date,
    )
    return result

@app.get("/meeting/{meeting_id}/api/jira/getIssueTransitions")
async def get_issue_transitions(meeting_id: str, issue_id: str):
    transitions = jira_get_issue_transitions(issue_id=issue_id)
    return {"transitions": transitions}

class TransitionIssueRequest(BaseModel):
    issue_id: str
    transition_id: str

@app.post("/meeting/{meeting_id}/api/jira/transitionIssue")
async def change_issue_status(meeting_id: str, r: TransitionIssueRequest):
    result = jira_transition_issue(issue_id=r.issue_id, transition_id=r.transition_id)
    return result

# GitHub
@app.get("/meeting/{meeting_id}/api/github/getIssues")
async def get_issues_for_user(meeting_id: str):
    return {"issues": []}

@app.get("/meeting/{meeting_id}/api/github/getPullRequests")
async def get_pull_requests(meeting_id: str):
    pull_requests = github_get_pull_requests(owner=github_owner, repo=github_repo)
    return { "pull_requests": pull_requests }

# Other
class EscalateRequest(BaseModel):
    message: str

@app.post("/meeting/{meeting_id}/escalate")
async def escalate(meeting_id: str, r: EscalateRequest):
    db["meetings"]["78b6b5c5-4d2e-41ad-aef5-5b039994c7db"]["escalation_notes"].append(r.message)
    return {"success": True}

@app.get("/meeting/{meeting_id}/getEscalationNotes")
async def get_escalation_notes(meeting_id: str):
    if meeting_id not in db["meetings"]:
        return {"error": "Meeting not found"}
    return {"escalation_notes": db["meetings"][meeting_id]["escalation_notes"]}

@app.post("/meeting/{meeting_id}/generateSummary")
async def generate_meeting_summary(meeting_id: str, transcript: Transcript):
    try:
        result = summarize_meeting(transcript)
        
        db["meetings"]["78b6b5c5-4d2e-41ad-aef5-5b039994c7db"]["meeting_summary"] = [i.text for i in result.meetingTimeline]
        return {"meeting_summary": json.dumps(result.model_dump())}
    except Exception as e:
        return {"error": str(e)}
  
@app.get("/meeting/{meeting_id}/summary")
async def get_meeting_summary(meeting_id: str):
    try:
        return {"meeting_summary": db["meetings"][meeting_id]["meeting_summary"]}
    except Exception as e:
        return {"error": str(e)}

# Admin
@app.post("/save_db")
async def save_db():
    with open("db.json", "w") as f:
        json.dump(db, f, indent=2)
    return {"success": True}

@app.post("/ping")
async def ping():
    return {"success": True}
