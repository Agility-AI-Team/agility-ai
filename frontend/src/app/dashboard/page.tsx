'use client'
import React, { useEffect, useState } from 'react';
import { User, AlertCircle } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  jiraTickets: {
    done: string[];
    inProgress: string[];
    notStarted: string[];
  };
  blockers: string[];
  meetingSummary: string[];
  mood: {
    status: string;
    notes: string[];
  };
}

const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

const styles = {
  container: "min-h-screen bg-background p-8",
  header: {
    wrapper: "flex justify-between mb-8",
    title: "text-4xl font-bold",
    primary: "text-primary",
    text: "text-text"
  },
  grid: "grid grid-cols-1 md:grid-cols-3 gap-4",
  team: {
    container: "bg-secondary/20 rounded-lg p-6 backdrop-blur-sm border border-secondary/20",
    title: "text-2xl font-bold mb-4 text-text",
    list: "space-y-3",
    member: {
      base: "flex items-center space-x-3 rounded-lg p-3 border cursor-pointer transition-colors",
      selected: "bg-secondary/30 border-primary/50",
      unselected: "bg-secondary/15 border-secondary/30 hover:bg-secondary/20",
      icon: {
        wrapper: "bg-primary/20 p-2 rounded-lg",
        icon: "w-5 h-5 text-primary"
      },
      name: "text-text"
    }
  },
  jiraTracker: {
    wrapper: "space-y-4",
    container: "bg-secondary/25 rounded-lg p-6 backdrop-blur-sm border border-secondary/30",
    title: "text-2xl font-bold mb-4 text-text",
    content: "space-y-4",
    section: {
      wrapper: "space-y-2",
      title: "text-primary font-semibold",
      ticket: "bg-accent/20 rounded-lg px-4 py-3 text-text border border-accent/30"
    }
  },
  blockers: {
    container: "bg-accent/15 rounded-lg p-6 backdrop-blur-sm border border-accent/25",
    title: "text-2xl font-bold mb-4 text-text",
    list: "space-y-3",
    item: {
      wrapper: "flex items-start space-x-3 bg-accent/10 p-4 rounded-lg border border-accent/30",
      icon: "w-5 h-5 text-accent flex-shrink-0 mt-0.5",
      text: "text-text"
    }
  },
  rightColumn: {
    wrapper: "space-y-4",
    meetings: {
      container: "bg-secondary/35 rounded-lg p-6 backdrop-blur-sm border border-secondary/40",
      title: "text-2xl font-bold mb-4 text-text",
      list: "space-y-2",
      item: "bg-secondary/20 p-3 rounded-lg border border-secondary/30",
      text: "text-text"
    },
    mood: {
      container: "bg-secondary/30 rounded-lg p-6 backdrop-blur-sm border border-secondary/35",
      title: "text-2xl font-bold mb-4 text-text",
      content: "space-y-4",
      status: {
        wrapper: "bg-secondary/20 p-4 rounded-lg border border-secondary/30",
        title: "text-xl font-semibold text-primary mb-2",
        notes: "space-y-2",
        note: "text-text"
      }
    }
  }
};

const teamData: TeamMember[] = [
  {
    id: '1',
    name: 'Chris Yoo',
    jiraTickets: {
      done: ['EX-11 Optimize Performance for Large Whiteboards'],
      inProgress: ['EX-5 Fix Frame Issues', 'EX-7 Integrate GitHub SSO'],
      notStarted: ['EX-10 Add Support for Custom Fonts']
    },
    blockers: [
      'Waiting for API documentation from external team',
      'Need clarification on design requirements'
    ],
    meetingSummary: [
      'Led morning standup',
      'Discussed authentication implementation with security team',
      'Reviewed PR feedback from team',
      'Planning sprint goals for next week'
    ],
    mood: {
      status: 'Focused',
      notes: [
        'Making good progress on current tasks',
        'Excited about upcoming features',
        'Looking forward to resolving pending blockers'
      ]
    }
  },
  {
    id: '2',
    name: 'Ryan Hay',
    jiraTickets: {
      done: ['PROJ-127: Update user preferences', 'PROJ-128: Fix memory leak'],
      inProgress: ['PROJ-129: Implement dark mode'],
      notStarted: ['PROJ-130: Add export functionality']
    },
    blockers: [
      'Performance issues in staging environment',
      'Dependency conflicts with new package'
    ],
    meetingSummary: [
      'Participated in code review session',
      'Met with UX team about dark mode implementation',
      'Debugging session with DevOps',
      'Sprint retrospective meeting'
    ],
    mood: {
      status: 'Energetic',
      notes: [
        'Found solution to persistent bug',
        'Good momentum on current sprint',
        'Productive collaboration with design team'
      ]
    }
  },
  {
    id: '3',
    name: 'Shreya Mukherjee',
    jiraTickets: {
      done: ['PROJ-131: Implement search functionality', 'PROJ-132: Add unit tests'],
      inProgress: ['PROJ-133: Refactor database queries'],
      notStarted: ['PROJ-134: Set up monitoring']
    },
    blockers: [
      'Database performance issues in production',
      'Waiting for security audit results'
    ],
    meetingSummary: [
      'Database optimization meeting',
      'Security review session',
      'Team knowledge sharing presentation',
      'Sprint planning'
    ],
    mood: {
      status: 'Determined',
      notes: [
        'Making breakthrough on complex query optimization',
        'Enjoying mentoring junior developers',
        'Ready to tackle challenging tasks'
      ]
    }
  },
  {
    id: '4',
    name: 'James Brimestone',
    jiraTickets: {
      done: ['PROJ-135: Set up CI/CD pipeline', 'PROJ-136: Configure monitoring'],
      inProgress: ['PROJ-137: Implement caching layer'],
      notStarted: ['PROJ-138: Scale worker processes']
    },
    blockers: [
      'AWS service limits need increase',
      'Pending approval for new cloud resources'
    ],
    meetingSummary: [
      'Infrastructure planning session',
      'DevOps team sync',
      'Cloud cost optimization review',
      'Deployment strategy meeting'
    ],
    mood: {
      status: 'Optimistic',
      notes: [
        'Infrastructure improvements showing results',
        'Good progress on automation tasks',
        'Team collaboration at its best'
      ]
    }
  },
  {
    id: '5',
    name: 'Penny Jones-Smith',
    jiraTickets: {
      done: ['PROJ-139: Design system updates', 'PROJ-140: Accessibility improvements'],
      inProgress: ['PROJ-141: Implement new UI components'],
      notStarted: ['PROJ-142: Mobile responsive design']
    },
    blockers: [
      'Waiting for final design approval',
      'Need user testing participants'
    ],
    meetingSummary: [
      'Design review with stakeholders',
      'Accessibility testing session',
      'UX workshop facilitation',
      'Component library planning'
    ],
    mood: {
      status: 'Creative',
      notes: [
        'Inspired by user feedback',
        'Excited about new design system',
        'Productive collaboration with development team'
      ]
    }
  }
];

function App() {
  const [selectedMember, setSelectedMember] = useState<TeamMember>(teamData[0]);
  const [escalationNotes, setEscalationNotes] = useState<string[]>([]);
  const [meetingSummary, setMeetingSummary] = useState<string[]>([]);

  useEffect(() => {
    const fetchEscalationNotes = async () => {
      try {
        const response = await fetch(`${backend_url}/meeting/78b6b5c5-4d2e-41ad-aef5-5b039994c7db/getEscalationNotes`, {
          headers: {
            'Accept': 'application/json',
          }
        });
        const data = await response.json();
        setEscalationNotes(data?.escalation_notes || []);
      } catch (error) {
        console.error('Failed to fetch escalation notes:', error);
      }
    };

    fetchEscalationNotes();
  }, [selectedMember]);

  useEffect(() => {
    const fetchMeetingSummary = async () => {
      try {
        const response = await fetch(`${backend_url}/meeting/78b6b5c5-4d2e-41ad-aef5-5b039994c7db/summary`, {
          headers: {
            'Accept': 'application/json',
          }
        });
        const data = await response.json();
        setMeetingSummary(data?.meeting_summary || []);
      }
      catch (error) {
        console.error('Failed to fetch meeting summary:', error);
      }
    };

    fetchMeetingSummary();
  }, [selectedMember]);

  return (
    <div className={styles.container}>
      <header className={styles.header.wrapper}>
        <h1 className={styles.header.title}>
          <span className={styles.header.primary}>Insights</span>
          <span className={styles.header.text}>Dashboard</span>
        </h1>
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <div className="text-text">Human Manager</div>
            <div className={styles.team.member.icon.wrapper}>
              <User className={styles.team.member.icon.icon} />
            </div>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        {/* Team Section */}
        <div className={styles.team.container}>
          <h2 className={styles.team.title}>Team</h2>
          <div className={styles.team.list}>
            {teamData.map((member) => (
              <div 
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={`${styles.team.member.base} ${
                  selectedMember.id === member.id
                    ? styles.team.member.selected
                    : styles.team.member.unselected
                }`}
              >
                <div className={styles.team.member.icon.wrapper}>
                  <User className={styles.team.member.icon.icon} />
                </div>
                <span className={styles.team.member.name}>{member.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Jira Tracker */}
        <div className={styles.jiraTracker.wrapper}>
          <div className={styles.jiraTracker.container}>
            <h2 className={styles.jiraTracker.title}>Jira Tracker</h2>
            <div className={styles.jiraTracker.content}>
              <div className={styles.jiraTracker.section.wrapper}>
                <h3 className={styles.jiraTracker.section.title}>Done:</h3>
                {selectedMember.jiraTickets.done.map((ticket, index) => (
                  <div key={index} className={styles.jiraTracker.section.ticket}>
                    {ticket}
                  </div>
                ))}
              </div>
              <div className={styles.jiraTracker.section.wrapper}>
                <h3 className={styles.jiraTracker.section.title}>In Progress</h3>
                {selectedMember.jiraTickets.inProgress.map((ticket, index) => (
                  <div key={index} className={styles.jiraTracker.section.ticket}>
                    {ticket}
                  </div>
                ))}
              </div>
              <div className={styles.jiraTracker.section.wrapper}>
                <h3 className={styles.jiraTracker.section.title}>Not Started</h3>
                {selectedMember.jiraTickets.notStarted.map((ticket, index) => (
                  <div key={index} className={styles.jiraTracker.section.ticket}>
                    {ticket}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Blockers Section */}
            <div className={styles.blockers.container}>
            <h2 className={styles.blockers.title}>Escalation</h2>
            <div className={styles.blockers.list}>
              {escalationNotes.length === 0 ? (
              // Loading skeleton
              <>
                <div className="h-16 bg-accent/20 animate-pulse rounded-lg"></div>
                <div className="h-16 bg-accent/20 animate-pulse rounded-lg"></div>
                <div className="h-16 bg-accent/20 animate-pulse rounded-lg"></div>
              </>
              ) : (
              // Actual content
              escalationNotes.map((blocker, index) => (
                <div key={index} className={styles.blockers.item.wrapper}>
                <AlertCircle className={styles.blockers.item.icon} />
                <span className={styles.blockers.item.text}>{blocker}</span>
                </div>
              ))
              )}
            </div>
            </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn.wrapper}>
            {/* Meeting Summary */}
            <div className={styles.rightColumn.meetings.container}>
            <h2 className={styles.rightColumn.meetings.title}>Meeting Summary</h2>
            <div className={styles.rightColumn.meetings.list}>
              {meetingSummary.length === 0 ? (
              // Loading skeleton
                <>
                <div className="h-12 bg-accent/20 animate-pulse rounded-lg"></div>
                <div className="h-12 bg-primary/20 animate-pulse rounded-lg"></div>
                <div className="h-12 bg-secondary/20 animate-pulse rounded-lg"></div>
                </>
              ) : (
              // Actual content
              meetingSummary.map((summary, index) => (
                <div key={index} className={styles.rightColumn.meetings.item}>
                <p className={styles.rightColumn.meetings.text}>{summary}</p>
                </div>
              ))
              )}
            </div>
            </div>

          {/* How they're feeling */}
          <div className={styles.rightColumn.mood.container}>
            <h2 className={styles.rightColumn.mood.title}>How we are feeling</h2>
            <div className={styles.rightColumn.mood.content}>
              <div className={styles.rightColumn.mood.status.wrapper}>
                <h3 className={styles.rightColumn.mood.status.title}>
                  {selectedMember.mood.status}
                </h3>
                <div className={styles.rightColumn.mood.status.notes}>
                  {selectedMember.mood.notes.map((note, index) => (
                    <p key={index} className={styles.rightColumn.mood.status.note}>{note}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;