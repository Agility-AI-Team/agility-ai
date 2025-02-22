import openai
from pydantic import BaseModel
import json

from enum import Enum
from pydantic import BaseModel

import os
from dotenv import load_dotenv

load_dotenv()

client = openai.OpenAI(
  api_key=os.environ.get("OPENAI_API_KEY"),
)


class ComponentType(str, Enum):
    CHAT = 'chat'
    TOOL = 'tool'

class TranscriptComponent(BaseModel):
  text: str
  speaker: str
  type: ComponentType

class Transcript(BaseModel):
  transcript: list[TranscriptComponent]
  

class MeetingPoint(BaseModel):
  text: str

class MeetingSummary(BaseModel):
  meetingTimeline: list[MeetingPoint]
  

def summarize_meeting(transcript: Transcript) -> MeetingSummary:
  print("Summarizing Meeting")
  completion = client.beta.chat.completions.parse(
    model='gpt-4o',
    messages=[
      {"role": "system", "content": "Summarize the meeting transcript and turn it into a timeline with at most 5 key points."},
      {
        "role": "user",
        "content": json.dumps(transcript.model_dump()),
      }
    ],
    max_completion_tokens=50,
    response_format=MeetingSummary
  )
  
  return MeetingSummary(**completion)