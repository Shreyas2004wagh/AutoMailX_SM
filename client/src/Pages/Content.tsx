import React, { useState, useEffect } from "react";
import { LogOut, Inbox, AlertTriangle, Menu, X } from "lucide-react";

interface Email {
  id: string;
  sender: string;
  priority: string;
  sentiment: string;
  subject: string;
  summary: string;
  content: string;
}

function Content() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEmailListOpen, setIsEmailListOpen] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/get-emails", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.ok ? res.json() : Promise.reject("Failed to fetch stored emails"))
      .then((data) => Array.isArray(data.emails) ? setEmails(data.emails) : console.error("Invalid data:", data))
      .catch((err) => console.error("Error fetching stored emails:", err));
  }, []);
  

  const filteredEmails = activeFilter === "all" ? emails : emails.filter((email) => email.priority === activeFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-sm border-b border-purple-500/20 px-4 md:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button className="md:hidden text-purple-200 p-1" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
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
        {/* Sidebar */}
        <nav className={`fixed md:static inset-y-0 left-0 w-64 md:w-48 bg-black/40 backdrop-blur-sm border-r border-purple-500/20 p-4 transition-transform z-30 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
          <h2 className="text-purple-300 text-xs uppercase font-semibold mb-2 px-4">Filters</h2>
          <button className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors ${activeFilter === "all" ? "bg-purple-500/30 text-purple-100" : "text-purple-200 hover:bg-purple-500/20"}`} onClick={() => setActiveFilter("all")}>
            <Inbox className="w-5 h-5" />
            <span>All Emails</span>
          </button>
          <button className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors ${activeFilter === "escalation" ? "bg-purple-500/30 text-purple-100" : "text-purple-200 hover:bg-purple-500/20"}`} onClick={() => setActiveFilter("escalation")}>
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Escalations</span>
          </button>
        </nav>

        {/* Email List */}
        <div className={`w-full md:w-80 border-r border-purple-500/20 bg-black/40 backdrop-blur-sm overflow-y-auto ${!isEmailListOpen && "hidden md:block"}`}>
          {filteredEmails.length > 0 ? filteredEmails.map((email) => (
            <div key={email.id} className={`p-4 border-b border-purple-500/20 cursor-pointer transition-colors ${selectedEmail?.id === email.id ? "bg-purple-500/30" : "hover:bg-purple-500/20"}`} onClick={() => { setSelectedEmail(email); if (window.innerWidth < 768) setIsEmailListOpen(false); }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-100">{email.sender}</span>
                <div className="flex items-center gap-2">
                  {email.priority === "escalation" && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  <div className={`w-3 h-3 rounded-full ${email.sentiment === "positive" ? "bg-green-400" : email.sentiment === "neutral" ? "bg-yellow-400" : "bg-red-400"}`} />
                </div>
              </div>
              <p className="text-sm text-purple-200 truncate">{email.subject}</p>
            </div>
          )) : <p className="text-purple-200 p-4">No emails available</p>}
        </div>

        {/* Email Detail */}
        <div className={`flex-1 bg-black/40 backdrop-blur-sm p-4 md:p-6 overflow-y-auto ${isEmailListOpen && "hidden md:block"}`}>
          {selectedEmail ? (
            <>
              <button className="md:hidden flex items-center gap-2 text-purple-200 mb-4" onClick={() => setIsEmailListOpen(true)}>← Back to list</button>
              <div className="bg-purple-900/40 backdrop-blur-sm rounded-lg p-4 mb-6 border border-purple-500/20">
                <h3 className="text-lg font-medium mb-2 text-purple-100">AI Summary</h3>
                <p className="text-purple-200">{selectedEmail.summary}</p>
              </div>
              <div className="bg-purple-900/40 backdrop-blur-sm rounded-lg p-4 mb-6 border border-purple-500/20">
                <h3 className="text-lg font-medium mb-2 text-purple-100">Email Content</h3>
                <p className="text-purple-200">{selectedEmail.content}</p>
              </div>
            </>
          ) : <p className="text-purple-200">Select an email to view details</p>}
        </div>
      </div>
    </div>
  );
}

export default Content;
