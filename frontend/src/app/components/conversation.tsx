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
      clearTranscript();
    },
    onMessage: onMessage,
    onError: (error: string) => console.error('Error:', error),
    onUnhandledClientToolCall: (toolName: string) => console.log('Unhandled client tool call:', toolName),
  });

  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  const clientTools = {
    escalateToManager: async ({meetingId, message}: { meetingId: string, message: string }) => {
      onToolUsed("Escalating to human manager...")
      try {
        const response = await fetch(
          `${backend_url}/meeting/${meetingId}/escalate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message
            })
          }
        );
        if (!response.ok) {
          throw new Error("Failed to escalate to manager");
        }
        const data = await response.json();
        return JSON.stringify(data);
      } catch (error) {
        console.error("Error in getJiraIssuesForUser:", error);
        return JSON.stringify({ error: "Error escalaing to manager" });
      }
    },
    getProjectDetails: async () => {
      console.log("getProjectDetails called");
      onToolUsed("Getting project details...")
      return JSON.stringify({ message: "The project is Excalidraw. Excalidraw is an open-source virtual whiteboard for creating hand-drawn-style diagrams. It allows users to sketch and collaborate on flowcharts, wireframes, mind maps, and other visual representations in a freeform, intuitive manner. The tool features real-time collaboration, a customizable library of shapes and elements, and support for importing/exporting drawings. It is designed for simplicity and ease of use while maintaining flexibility for more complex diagrams. Excalidraw is commonly used by developers, designers, and educators for brainstorming and visual communication." });
    },
    getJiraIssues: async ({ meetingId }: { meetingId: string }) => {
      onToolUsed("Getting Jira issues for user...")
      try {
        const response = await fetch(
          `${backend_url}/meeting/${meetingId}/api/jira/getIssues`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch Jira issues");
        }
        const data = await response.json();
        return JSON.stringify(data);
      } catch (error) {
        console.error("Error in getJiraIssues:", error)
        return JSON.stringify({ issues: [], error: "Error getting Jira issues" });
      }
    },

    getJiraIssue: async ({ meetingId, issueId }: { meetingId: string, issueId: string }) => {
      onToolUsed("Getting details for Jira issue...")
      try {
        const response = await fetch(
          `${backend_url}/meeting/${meetingId}/api/jira/getIssue?issue_id=${issueId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch details for Jira issue");
        }
        const data = await response.json();
        return JSON.stringify(data);
      } catch (error) {
        console.error("Error in getJiraIssue:", error);
        return JSON.stringify({ issue: [], error: "Error getting details for Jira issue" });
      }
    },

    createJiraIssue: async ({ meetingId, title, description, assignee_id, due_date }: { meetingId: string, title: string, description: string, assignee_id?: string, due_date?: string }) => {
      console.log("getJiraIssuesForUser called");
      onToolUsed("getJiraIssues")
      try {
        const response = await fetch(
          `${backend_url}/meeting/${meetingId}/api/jira/createIssue`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title,
              description,
              assignee_id,
              due_date
            })
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch Jira tickets");
        }
        const data = await response.json();
        return JSON.stringify(data);
      } catch (error) {
        console.error("Error in getJiraIssuesForUser:", error);
        return JSON.stringify({ tickets: [], error: "Error getting jira tickets" });
      }
    },

    editJiraIssue: async ({ meetingId, issue_id, title, description, assignee_id, due_date }: { meetingId: string, issue_id: string, title?: string, description?: string, assignee_id?: string, due_date?: string }) => {
      onToolUsed("Editing Jira issue...")
      try {
        const response = await fetch(
          `${backend_url}/meeting/${meetingId}/api/jira/editIssue`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              issue_id,
              title,
              description,
              assignee_id,
              due_date
            })
          }
        );
        if (!response.ok) {
          throw new Error("Failed to edit Jira issue");
        }
        const data = await response.json();
        return JSON.stringify(data);
      } catch (error) {
        console.error("Error in getJiraIssuesForUser:", error);
        return JSON.stringify({ tickets: [], error: "Error getting jira tickets" });
      }
    },

    getJiraIssueTransitions: async ({ meetingId, issueId }: { meetingId: string, issueId: string }) => {
      onToolUsed("Getting available statuses from Jira...")
      try {
        const response = await fetch(
          `${backend_url}/meeting/${meetingId}/api/jira/getIssueTransitions?issue_id=${issueId}`
        );
        if (!response.ok) {
          throw new Error("Failed to get available statuses from Jira");
        }
        const data = await response.json();
        return JSON.stringify(data);
      } catch (error) {
        console.error("Error in getJiraIssue:", error);
        return JSON.stringify({ transitions: [], error: "Error getting available statuses from Jira" });
      }
    },

    changeJiraIssueStatus: async ({ meetingId, issueId, transitionId }: { meetingId: string, issueId: string, transitionId: string }) => {
      onToolUsed("Changing status of Jira issue...")
      console.log(JSON.stringify({
        issue_id: issueId,
        transition_id: transitionId
      }))
      try {
        const response = await fetch(
          `${backend_url}/meeting/${meetingId}/api/jira/transitionIssue`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              issue_id: issueId,
              transition_id: transitionId
            })
          }
        );
        if (!response.ok) {
          throw new Error("Failed to change status of Jira issue");
        }
        const data = await response.json();
        return JSON.stringify(data);
      } catch (error) {
        console.error("Error in changeJiraIssueStatus:", error);
        return JSON.stringify({ error: "Failed to change status of Jira issue" });
      }
    },

    getGitHubPullRequests: async ({ meetingId }: { meetingId: string }) => {
      onToolUsed("Getting Pull Requests from GitHub...");
      try {
        const response = await fetch(
          `${backend_url}/meeting/${meetingId}/api/github/getPullRequests`
        );
        if (!response.ok) {
          throw new Error("Failed to get PRs from GitHub");
        }
        const data = await response.json();
        return JSON.stringify(data);
      } catch (error) {
        console.error("Error in getGitHubPullRequests:", error);
        return JSON.stringify({ pull_requests: [], error: "Error getting PRs from GitHub" });
      }
    },
  };

  
  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
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
