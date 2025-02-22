'use client'

import { useRouter, useSearchParams } from "next/navigation";
import { Conversation } from "../components/conversation";
import { useEffect, useState } from "react";


interface Meeting {
  id: string;
  title: string;
}

export default function MeetingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingId = searchParams.get('meetingId'); 
  

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!meetingId) {
      setLoading(false);
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log(backendUrl);

    // setMeeting({
    //   id: '1',
    //   title: 'Meeting 1'
    // });
    // setLoading(false);

    fetch(`${backendUrl}/{meetingId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Meeting not found');
        }
        return res.json();
      })
      .then((data: Meeting) => {
        setMeeting(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [meetingId]);

  if (loading) return <div>Loading...</div>;
  
  // If meetingId is missing or fetching resulted in an error, display "meeting not found"
  if (!meetingId || error) return <div>Meeting not found</div>;

  
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          ElevenLabs Conversational AI, {meeting?.title}
        </h1>
        <Conversation />
      </div>
    </main>
  )
}