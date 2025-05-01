"use client";

import { useState, useEffect } from "react";
import { FadeIn, FadeInSlide } from "../components/animations/MotionWrapper";
import { useUser } from "../utils/UserContext";
import { processOutput } from "../utils/markdown";

// Interface for message history from API
interface MessageHistoryItem {
  id: number;
  text: string;
  sender: string;
  tags?: string[]; // Adding tags field for filtering
}

export default function HistoryPage() {
  const { userId, isLoading: isUserLoading, error: userError } = useUser();
  
  // State for conversation history and thread selection
  const [conversationHistory, setConversationHistory] = useState<MessageHistoryItem[]>([]);
  const [processedMessages, setProcessedMessages] = useState<{[key: number]: string}>({});
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSender, setSelectedSender] = useState<string | null>(null);
  
  // Fetch conversation history when userId is available
  useEffect(() => {
    if (!userId && !userError) return; // Wait for user context to initialize
    
    const fetchHistory = async () => {
      try {
        setIsLoadingHistory(true);
        setError(null);
        
        // Use demo-user for demonstration purposes
        const threadId = userId;
        
        const response = await fetch(`http://localhost:8000/api/assistant/history/${threadId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Add timestamp to each message for filtering purposes
          const historyWithTimestamps = (data.history || []).map((msg: MessageHistoryItem) => ({
            ...msg,
            tags: msg.sender === 'user' ? ['Question'] : ['Answer'] // Mock tags
          }));
          setConversationHistory(historyWithTimestamps);
        } else {
          console.error("Failed to fetch history:", data.error);
          setError("Failed to load conversation history: " + data.error);
        }
      } catch (err) {
        console.error("Error fetching conversation history:", err);
        setError("Failed to load conversation history. Please try again later.");
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    fetchHistory();
  }, [userId, userError]);
  
  // Process conversation messages with markdown when conversationHistory changes
  useEffect(() => {
    const processMessages = async () => {
      if (!conversationHistory.length) return;
      
      const processed: {[key: number]: string} = {};
      
      for (const message of conversationHistory) {
        try {
          // Process both user and AI messages with markdown
          const html = await processOutput(message.text);
          processed[message.id] = html;
        } catch (err) {
          console.error("Error processing message with markdown:", err);
          processed[message.id] = message.text; // Fallback to plain text
        }
      }
      
      setProcessedMessages(processed);
    };
    
    processMessages();
  }, [conversationHistory]);
  
  // Get all unique senders
  const senders = Array.from(new Set(conversationHistory.map(item => item.sender)));
  
  // Date range options
  
  // Filter conversation history based on search term and sender
  const filteredHistory = conversationHistory.filter((message) => {
    const matchesSearch = 
      searchTerm === "" || 
      message.text.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSender = 
      selectedSender === null || 
      message.sender === selectedSender;
      
    
      
    return matchesSearch && matchesSender;
  });
  
  // Copy conversation to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };
  
  // Download conversation as file
  const downloadConversation = (text: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Format conversation for download/copy
  const formatConversation = (messages: MessageHistoryItem[]) => {
    if (!messages || messages.length === 0) {
      return "No conversation history available.";
    }
    
    return messages.map(msg => 
      `${msg.sender === 'user' ? '👤 You:' : '🤖 AI:'} ${msg.text}`
    ).join('\n\n');
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <FadeInSlide className="mb-12 text-center">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-500/30 text-purple-100 rounded-full mb-3">CONVERSATION HISTORY</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">HederaCodes</span> Conversations
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Browse your past conversations with HederaCodes. All your chats are safely stored and organized.
            </p>
          </FadeInSlide>
          
          {/* Loading indicator */}
          {(isUserLoading || isLoadingHistory) && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <span className="ml-3 text-white">Loading conversation history...</span>
            </div>
          )}
          
          {/* Error message */}
          {(error || userError) && !isUserLoading && !isLoadingHistory && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-md text-white">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-300">Error</h3>
                  <p className="mt-1 text-sm text-white/90">{error || userError}</p>
                </div>
              </div>
            </div>
          )}
          
          {!isUserLoading && !isLoadingHistory && !error && !userError && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar with filters */}
              <div className="lg:col-span-1">
                <FadeIn>
                  <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl sticky top-24">
                    {/* Search */}
                    <div className="p-4 border-b border-white/10">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search conversations..."
                          className="w-full bg-white/5 border border-white/10 rounded-md pl-10 pr-4 py-2 text-white/90 placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <svg className="w-5 h-5 text-white/40 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Conversation Thread Info */}
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span>Current Conversation</span>
                      </h3>
                      <div className="bg-white/5 border border-white/10 rounded-md p-3 mb-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm text-white/90 truncate">
                            Thread: {userId}
                          </span>
                          <span className="text-xs text-white/50 bg-white/10 px-1.5 py-0.5 rounded">
                            {conversationHistory.length} msg{conversationHistory.length === 1 ? '' : 's'}
                          </span>
                        </div>
                        {conversationHistory.length > 0 && (
                          <p className="text-xs text-white/60 mt-1 truncate">
                            {conversationHistory[conversationHistory.length - 1]?.text.substring(0, 40) || "No messages"}
                            {conversationHistory[conversationHistory.length - 1]?.text.length > 40 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Sender filter */}
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Filter by Sender</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedSender(null)}
                          className={`px-3 py-1 text-xs rounded-md ${
                            selectedSender === null 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          All
                        </button>
                        
                        {senders.map(sender => (
                          <button
                            key={sender}
                            onClick={() => setSelectedSender(sender)}
                            className={`px-3 py-1 text-xs rounded-md ${
                              selectedSender === sender 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {sender === 'user' ? 'You' : 'AI'}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    
                    {/* Stats */}
                    <div className="p-4 bg-white/5 mt-4 rounded-b-lg">
                      <div className="flex justify-between items-center text-sm text-white/60">
                        <span>Total Messages:</span>
                        <span className="font-medium text-white">{conversationHistory.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-white/60 mt-2">
                        <span>Filtered Results:</span>
                        <span className="font-medium text-white">{filteredHistory.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-white/60 mt-2">
                        <span>Your Messages:</span>
                        <span className="font-medium text-white">
                          {conversationHistory.filter(msg => msg.sender === 'user').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
              
              {/* Main content - Conversation view */}
              <div className="lg:col-span-2">
                <FadeIn>
                  <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-white/10 p-4 flex items-center justify-between bg-white/5">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        </div>
                        <div>
                          <h2 className="text-md font-medium text-white">Conversation History</h2>
                          <p className="text-xs text-white/50">Thread: {userId}</p>
                        </div>
                      </div>
                      
                      {/* Filter summary */}
                      {(searchTerm || selectedSender) && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/60">Filters:</span>
                          {searchTerm && (
                            <span className="px-2 py-0.5 text-xs bg-white/10 text-white/80 rounded-md flex items-center gap-1">
                              Search: {searchTerm}
                              <button onClick={() => setSearchTerm("")} className="hover:text-white">×</button>
                            </span>
                          )}
                          {selectedSender && (
                            <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-200 rounded-md flex items-center gap-1">
                              {selectedSender === 'user' ? 'You' : 'AI'}
                              <button onClick={() => setSelectedSender(null)} className="hover:text-white">×</button>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Conversation content */}
                    <div className="p-6 font-mono text-sm overflow-auto bg-white/2" style={{ maxHeight: "600px" }}>
                      {filteredHistory && filteredHistory.length > 0 ? (
                        filteredHistory.map((message, i) => (
                          <div key={i} className={`mb-4 ${message.sender === 'user' ? 'text-green-300' : 'text-blue-300'}`}>
                            <span className="font-bold">{message.sender === 'user' ? '👤 You:' : '🤖 AI:'}</span>
                            <div className="mt-1 pl-6 border-l-2 border-white/10">
                              {processedMessages[message.id] ? (
                                <div 
                                  className="prose prose-invert prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-code:text-cyan-300 prose-sm max-w-none"
                                  dangerouslySetInnerHTML={{ __html: processedMessages[message.id] }}
                                />
                              ) : (
                                <div className="text-white/90 whitespace-pre-wrap">{message.text}</div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-white/50 py-12">
                          <svg className="w-12 h-12 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {conversationHistory.length === 0 ? (
                            <p>No conversation history available.</p>
                          ) : (
                            <p>No messages match your filters.</p>
                          )}
                          {(searchTerm || selectedSender) && (
                            <button
                              onClick={() => {
                                setSearchTerm("");
                                setSelectedSender(null);
                              }}
                              className="mt-4 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm"
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    {filteredHistory && filteredHistory.length > 0 && (
                      <div className="border-t border-white/10 p-4 flex justify-end items-center bg-white/3">
                        <div className="flex gap-3">
                          <button 
                            onClick={() => copyToClipboard(formatConversation(filteredHistory))}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/90 rounded-md transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
                            </svg>
                            <span>Copy All</span>
                          </button>
                          <button 
                            onClick={() => downloadConversation(formatConversation(filteredHistory), `conversation-history-${userId}`)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/90 rounded-md transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </FadeIn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}