import React, { useState, useEffect } from "react";
import {
  Inbox,
  AlertTriangle,
  Menu,
  X,
  Calendar,
  Loader2,
  MessageSquare,
  ThumbsUp,
  Meh,
  Search,
  Edit,
  Copy,
  Save,
  XCircle,
  Mail, // Import mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Email {
  _id: string;
  id: string;
  from: string;
  sender: string;
  subject: string;
  summary: string;
  content: string;
  category: string;
}

function Content() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEmailListOpen, setIsEmailListOpen] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [responseLoading, setResponseLoading] = useState(false);
  const [responseSaved, setResponseSaved] = useState(false);
  const [responseSaving, setResponseSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editableResponse, setEditableResponse] = useState<string | null>(null);


  const navigate = useNavigate();

  const fetchAndSummarize = async (emailContent: string) => {
    setSummaryLoading(true);
    setSummary(null);

    try {
      const response = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to summarize: ${response.status} - ${errorData.message || "Unknown Error"
          }`
        );
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error summarizing email:", error);
      setSummary("Failed to generate summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetch("http://localhost:5000/get-emails", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        return res.ok
          ? res.json()
          : Promise.reject("Failed to fetch stored emails");
      })
      .then((data) => {
        if (Array.isArray(data.emails)) {
          setEmails(data.emails.reverse()); //reverse to display latest first
        } else {
          console.error("Invalid data:", data);
        }
      })
      .catch((err) => console.error("Error fetching stored emails:", err));

    setSummary(null);
  }, [activeFilter]);

  const handleGenerateResponse = async () => {
    if (!selectedEmail) return;

    setResponseLoading(true);
    setResponse(null);
    setResponseSaved(false); // Reset save status
    setIsEditing(false); // Exit edit mode if active

    try {
      const response = await fetch("http://localhost:5000/generate-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailContent: selectedEmail.content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to generate response: ${response.status} - ${errorData.message || "Unknown Error"
          }`
        );
      }

      const data = await response.json();
      setResponse(data.response);
      setEditableResponse(data.response); // Initialize editableResponse
    } catch (error) {
      console.error("Error generating response:", error);
      setResponse("Failed to generate response.");
    } finally {
      setResponseLoading(false);
    }
  };

  const handleSaveResponse = async () => {
    if (!selectedEmail || !response) return;

    setResponseSaving(true);

    try {
      const saveResponse = await fetch("http://localhost:5000/save-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailId: selectedEmail.id, response }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(
          `Failed to save response: ${saveResponse.status} - ${errorData.message || "Unknown Error"
          }`
        );
      }

      setResponseSaved(true);
    } catch (error) {
      console.error("Error saving response:", error);
      setResponseSaved(false); // Keep as false on error
    } finally {
      setResponseSaving(false);
    }
  };

  const filteredEmails = emails.filter((email) => {
    if (activeFilter !== "all" && email.category !== activeFilter) {
      return false;
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        (email.subject?.toLowerCase() || "").includes(searchLower) ||
        (email.sender?.toLowerCase() || "").includes(searchLower) ||
        (email.content?.toLowerCase() || "").includes(searchLower)
      );
    }

    return true;
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditableResponse(response);
  };

  const handleSaveEdit = () => {
    setResponse(editableResponse);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleCopy = async () => {
    const textToCopy = editableResponse || response;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // --- Reply Function ---
const handleReply = () => {
    if (!selectedEmail) return;

    // Extract the email address (same as before)
    const fromMatch = selectedEmail.from.match(/<([^>]+)>/);
    const senderEmail = fromMatch ? fromMatch[1] : selectedEmail.from;

    const responseText = editableResponse || response || "";

    // Construct the Gmail compose URL with query parameters
    const gmailComposeURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      senderEmail
    )}&su=${encodeURIComponent(
      `Re: ${selectedEmail.subject}`
    )}&body=${encodeURIComponent(responseText)}`;

    // Open Gmail compose in a new tab/window
    window.open(gmailComposeURL, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header with Search */}
      <header className="bg-black/40 backdrop-blur-sm border-b border-purple-500/20 px-4 md:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            className="md:hidden text-purple-200 p-1"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <h1
            className="text-xl md:text-2xl font-bold text-purple-100 cursor-pointer"
            onClick={() => navigate("/")}
          >
            AutoMailX
          </h1>
        </div>
        {/* --- Search Bar --- */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20">
          <Search className="w-5 h-5 text-purple-200" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-purple-200 focus:outline-none placeholder-purple-400"
          />
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)] relative">
        {/* Sidebar */}
        <nav
          className={`fixed md:static inset-y-0 left-0 w-64 md:w-48 bg-black/40 backdrop-blur-sm border-r border-purple-500/20 p-4 transition-transform z-30 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0`}
        >
          <h2 className="text-purple-300 text-xs uppercase font-semibold mb-2 px-4">
            Filters
          </h2>
          {["all", "urgent", "positive", "neutral", "calendar"].map(
            (filter) => (
              <button
                key={filter}
                className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors ${activeFilter === filter
                    ? "bg-purple-500/30 text-purple-100"
                    : "text-purple-200 hover:bg-purple-500/20"
                  }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === "urgent" && (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                {filter === "positive" && (
                  <ThumbsUp className="w-5 h-5 text-green-400" />
                )}
                {filter === "neutral" && (
                  <Meh className="w-5 h-5 text-yellow-400" />
                )}
                {filter === "calendar" && <Calendar className="w-5 h-5" />}
                {filter === "all" && <Inbox className="w-5 h-5" />}
                <span>{filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
              </button>
            )
          )}
        </nav>

        {/* Email List */}
        <div
          className={`w-full md:w-80 border-r border-purple-500/20 bg-black/40 backdrop-blur-sm overflow-y-auto ${!isEmailListOpen && "hidden md:block"
            }`}
        >
          {filteredEmails.length > 0 ? (
            filteredEmails.map((email) => {
              const senderName = (email.from || "Unknown Sender")
                .replace(/<.*?>/, "")
                .trim();

              return (
                <div
                  key={email._id}
                  className={`p-4 border-b border-purple-500/20 cursor-pointer transition-colors ${selectedEmail?.id === email.id
                      ? "bg-purple-800/60 text-purple-100"
                      : "hover:bg-purple-700/40 hover:text-purple-100"
                    }`}
                  onClick={() => {
                    setSelectedEmail(email);
                    fetchAndSummarize(email.content);
                    setResponse(null); // Clear previous response
                    setResponseSaved(false); // Clear saved status
                    if (window.innerWidth < 768) setIsEmailListOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-purple-100">
                      {senderName}
                    </span>
                    <div className="flex items-center gap-2">
                      {email.category === "urgent" && (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      )}
                      {email.category === "positive" && (
                        <ThumbsUp className="w-4 h-4 text-green-400" />
                      )}
                      {email.category === "neutral" && (
                        <Meh className="w-4 h-4 text-yellow-400" />
                      )}
                      <div
                        className={`w-3 h-3 rounded-full ${email.category === "positive"
                            ? "bg-green-400"
                            : email.category === "neutral"
                              ? "bg-yellow-400"
                              : email.category === "urgent"
                                ? "bg-red-400"
                                : "bg-blue-500"
                          }`}
                      />
                    </div>
                  </div>
                  <p className="text-sm truncate text-purple-200">
                    {email.subject}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-purple-200 p-4">No emails available</p>
          )}
        </div>

        {/* Email Detail */}
        <div
          className={`flex-1 bg-black/40 backdrop-blur-sm p-4 md:p-6 overflow-y-auto ${isEmailListOpen && "hidden md:block"
            }`}
        >
          {selectedEmail ? (
            <>
              <button
                className="md:hidden flex items-center gap-2 text-purple-200 mb-4"
                onClick={() => setIsEmailListOpen(true)}
              >
                ← Back to list
              </button>
              <div className="bg-purple-900/40 backdrop-blur-sm rounded-lg p-4 mb-6 border border-purple-500/20">
                <h3 className="text-lg font-medium mb-2 text-purple-100">
                  Email Summary
                </h3>
                {summaryLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="animate-spin h-6 w-6 text-purple-300" />
                    <span className="ml-2 text-purple-300">
                      Generating summary...
                    </span>
                  </div>
                ) : (
                  <p className="text-purple-200">
                    {summary || "Click Generate Summary"}
                  </p>
                )}
              </div>

              <div className="bg-purple-900/40 backdrop-blur-sm rounded-lg p-4 mb-6 border border-purple-500/20">
                <h3 className="text-lg font-medium mb-2 text-purple-100">
                  Email Content
                </h3>
                <p className="text-purple-200">
                  {selectedEmail.content
                    .replace(/https?:\/\/\S+/g, "")
                    .replace(/<.*?>/g, "")
                    .trim()}
                </p>
              </div>

              <button
                onClick={handleGenerateResponse}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mb-4 flex items-center"
                disabled={responseLoading}
              >
                {responseLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" /> Generating...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-5 w-5" /> Generate Response
                  </>
                )}
              </button>

              {response && (
                <div className="bg-purple-900/40 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
                  <h3 className="text-lg font-medium mb-2 text-purple-100">
                    Generated Response
                  </h3>
                  {/* Conditional Rendering */}
                  {isEditing ? (
                    <>
                      <textarea
                        value={editableResponse || ""}
                        onChange={(e) => setEditableResponse(e.target.value)}
                        className="w-full p-2 bg-gray-800 text-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={4}
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
                        >
                          <Save className="mr-2 h-5 w-5" /> Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"

                        >
                          <XCircle className="mr-2 h-5 w-5" /> Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-purple-200 mb-4">{response}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleEdit}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                        >
                          <Edit className="mr-2 h-5 w-5" /> Edit
                        </button>
                        <button
                          onClick={handleCopy}
                          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center"
                        >
                          <Copy className="mr-2 h-5 w-5" /> Copy
                        </button>
                         {/* --- Reply Button --- */}
                        <button
                          onClick={handleReply}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center"
                        >
                          <Mail className="mr-2 h-5 w-5" /> Reply
                        </button>

                      </div>
                    </>
                  )}
                </div>
              )}
                 <button
                    onClick={handleSaveResponse}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center mt-4"
                    disabled={responseSaving}
                  >
                    {responseSaving ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" /> Saving...
                      </>
                    ) : (
                      "Save Response"
                    )}
                  </button>
                  {responseSaved && (
                    <p className="text-green-400 mt-2">
                      Response saved successfully!
                    </p>
                  )}
            </>
          ) : (
            <p className="text-purple-200">Select an email to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Content;