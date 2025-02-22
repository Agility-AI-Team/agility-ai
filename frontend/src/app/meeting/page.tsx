'use client'

import {  useSearchParams } from "next/navigation";
import { Conversation } from "../components/conversation";
import { useEffect, useState } from "react";

import DynamicVariables from '../models/dynamicVariables';
import { ChatSidebar } from "../components/chatSidebar";
import Message from "../models/message";
import { TranscriptItem, TranscriptItemType } from "../models/transcriptItem";

interface User {
  user: {
    id: string;
    full_name: string;
    gender: string;
    github_id: string;
    jira_id: string;
  }
}

export default function MeetingPage() {
  const search_params = useSearchParams();
  const meeting_id = search_params.get('meetingId'); 
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [inMeeting, setInMeeting] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);

  useEffect(() => {
    if (!meeting_id) {
      setLoading(false);
      return;
    }

    const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log(backend_url);

    fetch(`${backend_url}/meeting/${meeting_id}/user`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Meeting not found');
        }
        return res.json();
      })
      .then((data: User) => {
        console.log(data);
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });

  }, [meeting_id]);

  if (loading) return <div>Loading...</div>;
  
  // If meetingId is missing or fetching resulted in an error, display "meeting not found"
  if (!meeting_id || !user?.user || error) return <div>Meeting not found</div>;


  const dynamicVariables: DynamicVariables = {
    meeting_id: meeting_id,
    user_name: user.user.full_name,
  }

  const onMessage = (message: Message) => {
    console.log(message);

    const item: TranscriptItem = {
      type: TranscriptItemType.CHAT,
      text: message.message
    }
    setTranscript((prev) => [...prev, item]);
  }
  
  const clearTranscript = () => {
    setTranscript([]);
  }

  const onToolUse = (tool: string) => {
    const item: TranscriptItem = {
      type: TranscriptItemType.TOOL,
      text: `${tool}`
    }
    
    setTranscript((prev) => [...prev, item]);
  }


  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
      <ChatSidebar messages={transcript} />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative">
          <div className={`
              w-[600px] h-[600px] rounded-full border-2 absolute top-1/2 left-1/2 
              transform -translate-x-1/2 -translate-y-1/2
              ${inMeeting ? 'border-accent animate-pulseExpand' : 'border-secondary'}
            `}
          />
          
          {/* Content container */}
          <div className="relative z-10 text-center">
            <h1 className="text-white text-5xl font-bold mb-12">{user?.user.full_name}</h1>
            <Conversation dynamicVariables={dynamicVariables} onMessage={onMessage} clearTranscript={clearTranscript} setInMeeting={setInMeeting} onToolUsed={onToolUse}/>
            
          </div>
        </div>
      </div>
    </div>
  )
}