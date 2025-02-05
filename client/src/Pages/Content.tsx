import React, { useState } from 'react';
import { LogOut, Inbox, Send, AlertTriangle, Clock, CheckCircle, Menu, X } from 'lucide-react';

// Mock data remains the same
const mockEmails = [
  {
    id: 1,
    sender: "John Doe",
    subject: "Meeting Follow-up",
    sentiment: "positive",
    priority: "neutral",
    content: "Hi team, Great meeting yesterday! I've attached the summary of our discussion and next steps. Looking forward to our progress.",
    summary: "Positive feedback about yesterday's meeting with action items attached.",
    suggestedReply: "Thank you for the comprehensive follow-up. I'll review the action items and get started on my tasks right away."
  },
  {
    id: 2,
    sender: "Jane Smith",
    subject: "Project Update",
    sentiment: "neutral",
    priority: "follow-up",
    content: "Here's the latest status update on Project X. We're currently on track with most deliverables, though we might need to adjust the timeline for Phase 2.",
    summary: "Project X status update - mostly on track, potential delays in Phase 2.",
    suggestedReply: "Thanks for the update. Let's schedule a quick call to discuss the Phase 2 timeline adjustments."
  },
  {
    id: 3,
    sender: "Mike Johnson",
    subject: "Urgent: System Outage",
    sentiment: "negative",
    priority: "escalation",
    content: "Critical system outage detected in production environment. Immediate attention required.",
    summary: "Production system outage requiring immediate escalation.",
    suggestedReply: "I'm looking into this urgently. Will provide an update within the next 30 minutes."
  }
];

function Content() {
  const [selectedEmail, setSelectedEmail] = useState(mockEmails[0]);
  const [activeSection, setActiveSection] = useState('inbox');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEmailListOpen, setIsEmailListOpen] = useState(true);

  const filteredEmails = activeFilter === 'all' 
    ? mockEmails 
    : mockEmails.filter(email => email.priority === activeFilter);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
    // On mobile, when an email is selected, close the email list
    if (window.innerWidth < 768) {
      setIsEmailListOpen(false);
    }
  };

  const handleBackToList = () => {
    setIsEmailListOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-sm border-b border-purple-500/20 px-4 md:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button 
            className="md:hidden text-purple-200 p-1"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-purple-100">AutoMailX</h1>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-purple-200 hover:bg-purple-500/20 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </header>

      <div className="flex h-[calc(100vh-4rem)] relative">
        {/* Sidebar - Mobile Overlay */}
        <div 
          className={`fixed inset-0 bg-black/50 md:hidden transition-opacity z-20 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={toggleSidebar}
        />

        {/* Sidebar */}
        <nav className={`
          fixed md:static inset-y-0 left-0 w-64 md:w-48 
          bg-black/40 backdrop-blur-sm border-r border-purple-500/20 
          p-4 transition-transform z-30
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}>
          {/* Main Sections */}
          <div className="mb-6">
            <h2 className="text-purple-300 text-xs uppercase font-semibold mb-2 px-4">Main</h2>
            <button
              className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'inbox'
                  ? 'bg-purple-500/30 text-purple-100'
                  : 'text-purple-200 hover:bg-purple-500/20'
              }`}
              onClick={() => {
                setActiveSection('inbox');
                setActiveFilter('all');
                setIsSidebarOpen(false);
              }}
            >
              <Inbox className="w-5 h-5" />
              <span>Inbox</span>
            </button>
            <button
              className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg mt-2 transition-colors ${
                activeSection === 'sent'
                  ? 'bg-purple-500/30 text-purple-100'
                  : 'text-purple-200 hover:bg-purple-500/20'
              }`}
              onClick={() => {
                setActiveSection('sent');
                setActiveFilter('all');
                setIsSidebarOpen(false);
              }}
            >
              <Send className="w-5 h-5" />
              <span>Sent Emails</span>
            </button>
          </div>

          {/* Priority Filters */}
          <div>
            <h2 className="text-purple-300 text-xs uppercase font-semibold mb-2 px-4">Priority</h2>
            <button
              className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'escalation'
                  ? 'bg-purple-500/30 text-purple-100'
                  : 'text-purple-200 hover:bg-purple-500/20'
              }`}
              onClick={() => {
                setActiveFilter('escalation');
                setIsSidebarOpen(false);
              }}
            >
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Escalation</span>
            </button>
            <button
              className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg mt-2 transition-colors ${
                activeFilter === 'follow-up'
                  ? 'bg-purple-500/30 text-purple-100'
                  : 'text-purple-200 hover:bg-purple-500/20'
              }`}
              onClick={() => {
                setActiveFilter('follow-up');
                setIsSidebarOpen(false);
              }}
            >
              <Clock className="w-5 h-5 text-yellow-400" />
              <span>Follow-up</span>
            </button>
            <button
              className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg mt-2 transition-colors ${
                activeFilter === 'neutral'
                  ? 'bg-purple-500/30 text-purple-100'
                  : 'text-purple-200 hover:bg-purple-500/20'
              }`}
              onClick={() => {
                setActiveFilter('neutral');
                setIsSidebarOpen(false);
              }}
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Neutral</span>
            </button>
          </div>
        </nav>

        {/* Email List */}
        <div className={`
          w-full md:w-80 border-r border-purple-500/20 bg-black/40 backdrop-blur-sm 
          overflow-y-auto transition-transform
          ${!isEmailListOpen && 'hidden md:block'}
        `}>
          {filteredEmails.map((email) => (
            <div
              key={email.id}
              className={`p-4 border-b border-purple-500/20 cursor-pointer transition-colors ${
                selectedEmail.id === email.id 
                  ? 'bg-purple-500/30' 
                  : 'hover:bg-purple-500/20'
              }`}
              onClick={() => handleEmailSelect(email)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-100">{email.sender}</span>
                <div className="flex items-center gap-2">
                  {email.priority === 'escalation' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  {email.priority === 'follow-up' && <Clock className="w-4 h-4 text-yellow-400" />}
                  {email.priority === 'neutral' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  <div
                    className={`w-3 h-3 rounded-full ${
                      email.sentiment === 'positive'
                        ? 'bg-green-400'
                        : email.sentiment === 'neutral'
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                    }`}
                  />
                </div>
              </div>
              <p className="text-sm text-purple-200 truncate">{email.subject}</p>
            </div>
          ))}
        </div>

        {/* Email Detail */}
        <div className={`
          flex-1 bg-black/40 backdrop-blur-sm p-4 md:p-6 overflow-y-auto
          ${isEmailListOpen && 'hidden md:block'}
        `}>
          {selectedEmail && (
            <>
              <button
                className="md:hidden flex items-center gap-2 text-purple-200 mb-4"
                onClick={handleBackToList}
              >
                <span>← Back to list</span>
              </button>

              <div className="bg-purple-900/40 backdrop-blur-sm rounded-lg p-4 mb-6 border border-purple-500/20">
                <h3 className="text-lg font-medium mb-2 text-purple-100">AI Summary</h3>
                <p className="text-purple-200">{selectedEmail.summary}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 text-purple-100">Email Content</h3>
                <div className="bg-purple-900/40 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4">
                  <p className="text-purple-200">{selectedEmail.content}</p>
                </div>
              </div>

              <div className="bg-purple-900/40 backdrop-blur-sm rounded-lg p-4 mb-6 border border-purple-500/20">
                <h3 className="text-lg font-medium mb-2 text-purple-100">AI-Generated Reply</h3>
                <p className="text-purple-200">{selectedEmail.suggestedReply}</p>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 md:flex-none px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Send
                </button>
                <button className="flex-1 md:flex-none px-6 py-2 bg-purple-500/20 text-purple-200 rounded-lg hover:bg-purple-500/30 transition-colors border border-purple-500/20">
                  Edit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Content;
