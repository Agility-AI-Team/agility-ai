from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


with open("users.json") as f:
    db = json.load(f)

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
    if db["meetings"].get(meeting_id) is None:
        return {"error": "Meeting not found"}
  
    user_id = db["meetings"][meeting_id]["user_id"]
    return { "user": db["users"][user_id] }

# Jira
@app.get("/meeting/{meeting_id}/api/jira/getTickets")
async def get_tickets_for_user(meeting_id: str):
    return {"tickets": [
      {"id": "1", "title": "Win the ElevenLabs Hackathon", "status": "In Progress"},
    ]}

@app.post("/meeting/{meeting_id}/api/jira/createTicket")
async def create_ticket(meeting_id: str):
    return {"success": True}

@app.put("/meeting/{meeting_id}/api/jira/editTicket")
async def edit_ticket(meeting_id: str):
    return {"success": True}

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
  
@app.post("/ping")
async def ping():
    return {"success": True}
