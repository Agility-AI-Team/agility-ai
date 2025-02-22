'use client';

import { useConversation } from '@11labs/react';
import { useCallback } from 'react';
import DynamicVariables from '../models/dynamicVariables';
import AppButton from './button';
import { Loader2, Video, MonitorX } from 'lucide-react';
import Message from '../models/message';

interface ConversationProps {
  dynamicVariables: DynamicVariables;
  onMessage: (message: Message) => void;
  clearTranscript: () => void;
  setInMeeting: (inMeeting: boolean) => void;
  onToolUsed: (toolName: string) => void;
}
export function Conversation(
  { dynamicVariables, onMessage, clearTranscript, setInMeeting, onToolUsed}: ConversationProps
) {
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected');
      setInMeeting(true);
    },
    onDisconnect: () => {
      console.log('Disconnected');
      setInMeeting(false);
    },
    onMessage: onMessage,
    onError: (error: string) => console.error('Error:', error),
    onUnhandledClientToolCall: (toolName: string) => console.log('Unhandled client tool call:', toolName),
  });

  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

  
  const clientTools = {
    getJiraTicketsForUser: async ({ meetingId }: { meetingId: string }) => {
      console.log("getJiraTicketsForUser called");
      onToolUsed("getJiraTickets")
      try {
        const response = await fetch(
          `${backend_url}/meeting/${meetingId}/api/jira/getTickets`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch Jira tickets");
        }
        const data = await response.json();
        return JSON.stringify(data);
      } catch (error) {
        console.error("Error in getJiraTicketsForUser:", error);
        return JSON.stringify({ tickets: [], error: "Error getting jira tickets" });
      }
    },

    getGitHubPRsForUser: async ({ meetingId }: { meetingId: string }) => {
      console.log("getGitHubPRsForUser called");
      onToolUsed("getGitHubPRs")
      
      try {
        const response = await fetch(
          `${backend_url}/meeting/${meetingId}/api/github/getPullRequests`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch GitHub pull requests");
        }
        const data = await response.json();
        return JSON.stringify(data);
      } catch (error) {
        console.error("Error in getGitHubPRsForUser:", error);
        return JSON.stringify({ pull_requests: [], error: "Error getting github pull requests" });
      }
    },
  };

  
  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: '0D9cKHmJBDMlFw8Po3Ii', // Replace with your agent ID
        clientTools: clientTools,
        dynamicVariables: dynamicVariables,
      });

    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {conversation.status === 'connecting' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-background text-text rounded">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Connecting</span>
          </div>
        )}

        {conversation.status === 'connected' && (
          <AppButton
            onClick={() => {
              stopConversation();
              clearTranscript();
            }}
            color="var(--secondary)"
            icon={MonitorX}
          >
            End Call
          </AppButton>
        )}

        {conversation.status !== 'connecting' && conversation.status !== 'connected' && (
          <AppButton
            onClick={startConversation}
            color="var(--accent)"
            icon={Video}
          >
            Join Meeting
          </AppButton>
        )}
      </div>
    </div>
  );
}
