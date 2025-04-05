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
  Mail,
  ChevronLeft, // Added for "back" button

} from "lucide-react";
import { useNavigate, Link } from "react-router-dom"; // Added Link
import { motion, AnimatePresence } from 'framer-motion'; // Import motion


interface Email {
  _id: string;
  id: string;
  from: string;
  sender: string; // Assuming sender might be parsed differently
  subject: string;
  summary: string; // Keep summary field if your API sends it initially
  content: string;
  category: string; // e.g., 'urgent', 'positive', 'neutral', 'calendar'
}

function Content() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile sidebar
  const [isEmailListVisible, setIsEmailListVisible] = useState(true); // Controls list visibility on small screens
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [responseLoading, setResponseLoading] = useState(false);
  const [responseError, setResponseError] = useState<string | null>(null);
  // Removed responseSaved/Saving as feedback can be simpler, e.g., temporary message
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [editableResponse, setEditableResponse] = useState<string>(""); // Initialize as empty string
  const [copySuccess, setCopySuccess] = useState(false);


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();

  // --- Fetch Emails ---
  useEffect(() => {
    // Reset state when filter changes (except selected email if you want persistence)
    setEmails([]);
    // setSelectedEmail(null); // Uncomment if you want to clear selection on filter change
    setSummary(null);
    setResponse(null);
    setIsEditingResponse(false);
    setSummaryError(null);
    setResponseError(null);

    
    fetch("http://localhost:5000/get-emails", { 
      method: "GET",
      credentials: "include", // Important for sessions/cookies
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) {
           // Attempt to read error message from backend
           return res.json().then(errData => {
               throw new Error(errData.message || `Failed to fetch emails: ${res.status}`);
           }).catch(() => {
               // If reading JSON fails, throw generic error
               throw new Error(`Failed to fetch emails: ${res.status}`);
           });
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.emails)) {
           // Add a client-side 'sender' parse if needed, or rely on backend
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           const processedEmails = data.emails.map((email: any) => ({
               ...email,
               sender: (email.from || "Unknown Sender").replace(/<.*?>/, "").trim() || "Unknown Sender",
           })).reverse(); // Show newest first
          setEmails(processedEmails);
           // Optionally select the first email automatically
           // if (processedEmails.length > 0 && !selectedEmail) {
           //     handleSelectEmail(processedEmails[0]);
           // }
        } else {
          console.error("Invalid email data format received:", data);
          // Optionally set an error state for the UI
        }
      })
      .catch((err) => {
          console.error("Error fetching stored emails:", err);
          // Set error state for UI display
          // setErrorState("Could not load emails. Please refresh or try again later.");
      });

  }, [activeFilter]); // Re-fetch when filter changes

  // --- Select Email and Fetch Summary ---
  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    setResponse(null); // Clear previous response
    setResponseError(null);
    setSummaryError(null);
    setIsEditingResponse(false);
    setCopySuccess(false);

    // Only show email list column again if it was hidden (mobile)
    if (window.innerWidth < 768) {
       setIsEmailListVisible(false); // Hide list, show detail on mobile
       setIsSidebarOpen(false); // Close sidebar if open on mobile
    }

    // --- Fetch Summary ---
    setSummaryLoading(true);
    setSummary(null);
    fetch("http://localhost:5000/summarize", { // Use your production URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add Authorization header if needed: 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ emailContent: email.content }),
    })
      .then(res => {
         if (!res.ok) {
            return res.json().then(errData => { throw new Error(errData.message || `Summary failed: ${res.status}`); });
         }
         return res.json();
      })
      .then(data => {
          setSummary(data.summary);
      })
      .catch(error => {
        console.error("Error summarizing email:", error);
        setSummaryError(error.message || "Failed to generate summary.");
      })
      .finally(() => {
        setSummaryLoading(false);
      });
  };


  // --- Generate AI Response ---
  const handleGenerateResponse = async () => {
    if (!selectedEmail) return;

    setResponseLoading(true);
    setResponse(null);
    setResponseError(null);
    setIsEditingResponse(false); // Exit edit mode if starting new generation

    try {
      const res = await fetch("http://localhost:5000/generate-response", { // Use production URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: selectedEmail.content }), 
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Response generation failed: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.response);
      setEditableResponse(data.response); 

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error generating response:", error);
      setResponseError(error.message || "Failed to generate response.");
    } finally {
      setResponseLoading(false);
    }
  };

 // --- Edit Response Handling ---
  const handleEditResponse = () => {
    if (response === null) return; 
    setEditableResponse(response); 
    setIsEditingResponse(true);
  };

  const handleSaveEditedResponse = () => {
    setResponse(editableResponse);
    setIsEditingResponse(false);
  };

  const handleCancelEdit = () => {
    setEditableResponse(response || ""); 
    setIsEditingResponse(false);
  };


 
   const handleCopyResponse = async () => {
    const textToCopy = isEditingResponse ? editableResponse : response;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); 
    } catch (err) {
      console.error("Failed to copy text:", err);
     
    }
  };

  
  const handleReply = () => {
    if (!selectedEmail) return;

    const fromMatch = selectedEmail.from.match(/<([^>]+)>/);
    const senderEmail = fromMatch ? fromMatch[1] : selectedEmail.from; 

    const finalResponseText = isEditingResponse ? editableResponse : response || ""; 

    const subject = encodeURIComponent(`Re: ${selectedEmail.subject}`);
    const body = encodeURIComponent(finalResponseText);
    const recipient = encodeURIComponent(senderEmail);

    

   
     const gmailComposeURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;
     window.open(gmailComposeURL, "_blank");
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
        (email.content?.toLowerCase() || "").includes(searchLower) ||
        (email.from?.toLowerCase() || "").includes(searchLower) 
      );
    }
    
    return true;
  });


 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 const debounce = <F extends (...args: unknown[]) => unknown>(func: F, waitFor: number) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<F>): void => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => func(...args), waitFor);
    };
 };

  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
  };




  const sidebarVariants = {
    open: { x: 0, transition: { type: 'tween', duration: 0.3 } },
    closed: { x: '-100%', transition: { type: 'tween', duration: 0.3 } }
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05, 
        duration: 0.3
      }
    }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const detailVariants = {
      initial: { opacity: 0, scale: 0.98, y: 10 },
      animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
      exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
  };


  return (
   
    <div className="h-screen flex flex-col font-sans bg-gradient-to-br from-cyan-50 via-white to-purple-50 text-gray-800 overflow-hidden">
  
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200/70 px-4 md:px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2 md:gap-4">
       
          <button
            className="md:hidden text-gray-600 p-1.5 hover:text-cyan-700 transition-colors"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          
           <Link to="/" className="flex items-center space-x-2 group">
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500 group-hover:opacity-80 transition-opacity" />
                <span className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 group-hover:opacity-80 transition-opacity hidden sm:inline">
                  AetherMail
                </span>
            </Link>
        </div>

      
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100/80 border border-gray-200/70 w-full max-w-xs md:max-w-sm focus-within:ring-2 focus-within:ring-cyan-400 focus-within:border-cyan-400 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search mail..."
            value={searchQuery}
             onChange={handleSearchChange} 
            className="bg-transparent text-sm text-gray-700 focus:outline-none placeholder-gray-400 w-full"
          />
        </div>

       
      </header>

      <div className="flex flex-1 overflow-hidden">
       
         <AnimatePresence>
         {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-40 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>

        
          <motion.nav
             className={`fixed md:static inset-y-0 left-0 w-64 bg-white/70 backdrop-blur-lg border-r border-gray-200/50 p-4 z-50 md:z-auto transition-transform transform md:translate-x-0 md:w-52 lg:w-56 flex-shrink-0 overflow-y-auto ${isSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}`}
              variants={sidebarVariants}
              initial="closed"
              animate={isSidebarOpen ? "open" : "closed"}
              
           >
            

             <h2 className="text-gray-500 text-xs uppercase font-semibold mb-3 px-2">
                 Filters
             </h2>
             {["all", "urgent", "positive", "neutral", "calendar"].map((filter) => (
                  <button
                    key={filter}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors text-sm mb-1 ${
                         activeFilter === filter
                        ? "bg-gradient-to-r from-cyan-100 via-purple-50 to-purple-100 text-cyan-900 font-medium shadow-sm" // Themed active state
                        : "text-gray-600 hover:bg-gray-100/70 hover:text-gray-900" 
                     }`}
                    onClick={() => {
                      setActiveFilter(filter);
                       if (window.innerWidth < 768) setIsSidebarOpen(false); 
                    }}
                 >
                     
                      {filter === "urgent" && <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      {filter === "positive" && <ThumbsUp className="w-4 h-4 text-green-500 flex-shrink-0" />}
                      {filter === "neutral" && <Meh className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                      {filter === "calendar" && <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                      {filter === "all" && <Inbox className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                      <span className="truncate">
                         {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </span>
                  </button>
                ))}
                
             </motion.nav>

 
          <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200/50 bg-white/50 backdrop-blur-sm overflow-y-auto flex-shrink-0 ${!isEmailListVisible ? "hidden md:block" : ""}`}>
               <AnimatePresence initial={false}>
                  {filteredEmails.length > 0 ? (
                    filteredEmails.map((email, index) => (
                        <motion.div
                          key={email._id || email.id} 
                          custom={index} 
                           variants={listItemVariants}
                           initial="hidden"
                           animate="visible"
                           exit="exit"
                           layout 
                          className={`p-4 border-b border-gray-200/60 cursor-pointer transition-colors duration-150 ${
                             selectedEmail?._id === email._id || selectedEmail?.id === email.id 
                            ? "bg-gradient-to-r from-cyan-50 via-purple-50 to-purple-100" 
                            : "hover:bg-gray-100/60" 
                           }`}
                          onClick={() => handleSelectEmail(email)}
                          role="button"
                         tabIndex={0} 
                        >
                        
                           <div className="flex items-start justify-between mb-1">
                              <span className="font-semibold text-gray-800 text-sm truncate pr-2">
                                 {email.sender} 
                              </span>
                               <div className="flex-shrink-0 text-xs text-gray-500">
                                  
                                </div>
                            </div>
                           <p className="text-sm text-gray-700 truncate mb-1.5">
                                {email.subject || "(No Subject)"}
                             </p>
                            
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                        email.category === 'positive' ? 'bg-green-400' :
                                        email.category === 'neutral' ? 'bg-yellow-400' :
                                        email.category === 'urgent' ? 'bg-red-400' :
                                        email.category === 'calendar' ? 'bg-blue-400' :
                                        'bg-gray-300'
                                      }`} title={`Category: ${email.category || 'None'}`}></div>
                                       
                                </div>
                        </motion.div>
                     ))
                 ) : (
                     <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-gray-500 text-center p-8 text-sm">
                       {searchQuery ? `No emails found for "${searchQuery}".` : (emails.length === 0 ? "Loading emails..." : `No emails in "${activeFilter}" filter.`)}
                    </motion.div>
                )}
              </AnimatePresence>
            </div>

   
           <AnimatePresence mode="wait">
            <motion.div
              key={selectedEmail?._id || selectedEmail?.id || 'empty'} 
               variants={detailVariants}
               initial="initial"
               animate="animate"
               exit="exit"
               className={`flex-1 bg-gradient-to-br from-cyan-50/30 via-white to-purple-50/30 p-4 md:p-6 lg:p-8 overflow-y-auto ${isEmailListVisible ? "hidden md:flex md:flex-col" : "flex flex-col"}`} // Use flex for content structure
              >
               
                <button
                   className="md:hidden flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-800 mb-4"
                   onClick={() => setIsEmailListVisible(true)}
               >
                   <ChevronLeft size={16} /> Back to list
               </button>

             
                 {selectedEmail ? (
                     <>
                     
                       <div className="mb-6 pb-4 border-b border-gray-200/70">
                          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-1.5">{selectedEmail.subject || "(No Subject)"}</h2>
                           <div className="flex items-center justify-between text-sm text-gray-600">
                             <span>From: <span className="font-medium text-gray-700">{selectedEmail.sender}</span> ({selectedEmail.from.match(/<([^>]+)>/)?.[1] || selectedEmail.from})</span>
                         
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200/70 p-5 mb-6">
                           <h3 className="text-base font-semibold mb-3 text-gray-700">AI Summary</h3>
                            {summaryLoading ? (
                             <div className="flex items-center justify-center p-4 text-gray-500">
                               <Loader2 className="animate-spin h-5 w-5 mr-2 text-cyan-600" /> Generating...
                              </div>
                         ) : summaryError ? (
                             <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{summaryError}</div>
                          ) : summary ? (
                             <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
                         ) : (
                               <p className="text-sm text-gray-500 italic">No summary generated yet.</p>
                         )}
                      </div>

                     
                      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200/70 p-5 mb-6">
                         <h3 className="text-base font-semibold mb-3 text-gray-700">Full Email Content</h3>
                         <div className="prose prose-sm max-w-none text-gray-800 overflow-x-auto"> {/* Use prose for basic html styling */}
                             <p> {/* Render plain text, strip unsafe elements if loading HTML */}
                                 {selectedEmail.content.replace(/https?:\/\/\S+/g, "[link removed]").replace(/<style.*?>.*?<\/style>/gs, "").replace(/<script.*?>.*?<\/script>/gs, "").replace(/<[^>]+>/g, " ").replace(/\s\s+/g, ' ').trim() || "(No Content)"}
                              </p>
                             
                            </div>
                        </div>

                         <div className="mt-auto pt-6 border-t border-gray-200/70"> 
                            <div className="flex flex-wrap gap-3 mb-6">
                              <button
                                onClick={handleGenerateResponse}
                                 className={`inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:opacity-90 transition-all text-sm ${responseLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                disabled={responseLoading}
                             >
                                 {responseLoading ? (
                                   <><Loader2 className="animate-spin h-4 w-4" /> Generating...</>
                                ) : (
                                     <><MessageSquare size={16} /> {response ? 'Regenerate Response' : 'Generate AI Response'}</>
                                 )}
                               </button>
                             </div>

                               {responseError && (
                                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200 mb-4">{responseError}</div>
                              )}
                             {(response || isEditingResponse) && ( 
                                  <div className="bg-gradient-to-br from-cyan-50 via-white to-purple-50/60 backdrop-blur-md rounded-xl shadow-sm border border-gray-200/70 p-5">
                                    <h3 className="text-base font-semibold mb-3 text-gray-700">AI Drafted Response</h3>
                                     {isEditingResponse ? (
                                       <>
                                          <textarea
                                            value={editableResponse}
                                             onChange={(e) => setEditableResponse(e.target.value)}
                                             className="w-full p-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-gray-800 min-h-[100px] mb-3 shadow-inner"
                                              rows={5}
                                            placeholder="Edit your response..."
                                            />
                                         <div className="flex flex-wrap gap-2">
                                             <button
                                                 onClick={handleSaveEditedResponse}
                                                 className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 font-medium py-1.5 px-4 rounded-md text-sm hover:bg-green-200 transition-colors"
                                            >
                                               <Save size={14} /> Save Changes
                                             </button>
                                            <button
                                              onClick={handleCancelEdit}
                                               className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 font-medium py-1.5 px-4 rounded-md text-sm hover:bg-red-200 transition-colors"
                                             >
                                               <XCircle size={14} /> Cancel
                                              </button>
                                          </div>
                                      </>
                                    ) : (
                                      <>
                                         <p className="text-sm text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap">{response}</p>
                                         <div className="flex flex-wrap gap-2 items-center">
                                           <button
                                               onClick={handleEditResponse}
                                                className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 font-medium py-1.5 px-4 rounded-md text-sm hover:bg-blue-200 transition-colors"
                                              >
                                                <Edit size={14} /> Edit
                                            </button>
                                             <button
                                               onClick={handleCopyResponse}
                                                className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 font-medium py-1.5 px-4 rounded-md text-sm hover:bg-gray-200 transition-colors relative"
                                              >
                                                 <Copy size={14} /> Copy
                                                  <AnimatePresence>
                                                   {copySuccess && (
                                                     <motion.span
                                                       initial={{ opacity: 0, y: 5 }}
                                                       animate={{ opacity: 1, y: 0 }}
                                                       exit={{ opacity: 0, y: 5 }}
                                                        className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-0.5 rounded-md whitespace-nowrap"
                                                     >
                                                       Copied!
                                                     </motion.span>
                                                     )}
                                                    </AnimatePresence>
                                                </button>
                                                <button
                                                   onClick={handleReply}
                                                   className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold px-4 py-1.5 rounded-md text-sm shadow-sm hover:opacity-90 transition-opacity"
                                                 >
                                                     <Mail size={14} /> Reply
                                                  </button>
                                              </div>
                                         </>
                                   )}
                                </div>
                            )}
                          
                       </div>
                 </>
                 ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                         <Inbox size={48} className="mb-4 opacity-50" />
                         <p className="text-lg font-medium">Select an email</p>
                         <p className="text-sm">Choose an email from the list to view its details and use AI features.</p>
                     </div>
               )}
            </motion.div>
            </AnimatePresence>
     </div>
    </div>
 );
}

export default Content;