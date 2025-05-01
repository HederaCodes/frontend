"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FadeIn, FadeInSlide } from "../components/animations/MotionWrapper";

// Interface for agent from API
interface Agent {
  id: string;
  name: string;
  description: string;
  status: string;
  model: string;
  tags: string[];
  properties: Record<string, any>;
  inboundTopicId: string;
  outboundTopicId: string;
  createdAt: string;
}

export default function AgentsPage() {
  // State for agents
  const [agents, setAgents] = useState<Agent[]>([]);
  const [usedAgents, setUsedAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch("http://localhost:8000/api/agents", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setAgents(data.agents || []);
        } else {
          console.error("Failed to fetch agents:", data.error);
          setError("Failed to load agents: " + data.error);
        }
      } catch (err: any) {
        console.error("Error fetching agents:", err);
        setError("Failed to load agents. Please try again later. " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAgents();
  }, []);
  
  // Load used agents from localStorage on initial render
  useEffect(() => {
    const storedUsedAgents = localStorage.getItem('usedAgents');
    if (storedUsedAgents) {
      try {
        setUsedAgents(JSON.parse(storedUsedAgents));
      } catch (err) {
        console.error("Error parsing stored used agents:", err);
        // If there's an error parsing, start with empty array
        setUsedAgents([]);
      }
    }
  }, []);
  
  // Save used agents to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('usedAgents', JSON.stringify(usedAgents));
  }, [usedAgents]);
  
  // Add agent to used agents list
  const addToUsedAgents = (agent: Agent) => {
    if (!usedAgents.some(a => a.id === agent.id)) {
      setUsedAgents(prev => [...prev, agent]);
    }
  };
  
  // Remove agent from used agents list
  const removeFromUsedAgents = (agentId: string) => {
    setUsedAgents(prev => prev.filter(agent => agent.id !== agentId));
  };
  
  // Check if an agent is in the used agents list
  const isAgentUsed = (agentId: string) => {
    return usedAgents.some(agent => agent.id === agentId);
  };
  
  // Filter agents based on search term and status
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = 
      searchTerm === "" || 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      selectedStatus === null || 
      agent.status === selectedStatus;
      
    return matchesSearch && matchesStatus;
  });
  
  // Get all unique statuses
  const statuses = Array.from(new Set(agents.map(agent => agent.status)));
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <FadeInSlide className="mb-12 text-center">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-500/30 text-purple-100 rounded-full mb-3">HEDERA AGENTS</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Hedera</span> Agents
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Browse and manage your registered Hedera agents. Create new agents or interact with existing ones.
            </p>
          </FadeInSlide>
          
          {/* Create Agent Button */}
          <FadeIn className="mb-8 flex justify-center">
            <Link href="/agents/create" className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create New Agent
            </Link>
          </FadeIn>
          
          {/* Currently Used Agents Section */}
          {usedAgents.length > 0 && (
            <FadeIn className="mb-12">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl overflow-hidden p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Currently Used Agents
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {usedAgents.map((agent) => (
                    <div 
                      key={agent.id} 
                      className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg shadow-md overflow-hidden hover:shadow-lg hover:bg-white/15 transition-all duration-200"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-md font-semibold text-white truncate">{agent.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            agent.status === 'active' ? 'bg-green-500/20 text-green-300' :
                            agent.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {agent.status}
                          </span>
                        </div>
                        
                        <p className="mt-1 text-white/70 text-xs line-clamp-2 mb-3">{agent.description}</p>
                        
                        <div className="mt-3 flex justify-between items-center pt-3 border-t border-white/10">
                          <Link 
                            href={`/agents/${agent.id}`}
                            className="text-purple-400 hover:text-purple-300 text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            Details
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                          
                          <button 
                            onClick={() => removeFromUsedAgents(agent.id)}
                            className="text-red-400 hover:text-red-300 text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
          
          {/* More Agents Section */}
          <FadeIn className="mb-4">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              More Agents
            </h2>
          </FadeIn>
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <span className="ml-3 text-white">Loading agents...</span>
            </div>
          )}
          
          {/* Error message */}
          {error && !isLoading && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-md text-white">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-300">Error</h3>
                  <p className="mt-1 text-sm text-white/90">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {!isLoading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                          placeholder="Search agents..."
                          className="w-full bg-white/5 border border-white/10 rounded-md pl-10 pr-4 py-2 text-white/90 placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <svg className="w-5 h-5 text-white/40 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Status filter */}
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Filter by Status</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedStatus(null)}
                          className={`px-3 py-1 text-xs rounded-md ${
                            selectedStatus === null 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          All
                        </button>
                        
                        {statuses.map(status => (
                          <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-3 py-1 text-xs rounded-md ${
                              selectedStatus === status 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="p-4 bg-white/5 mt-4 rounded-b-lg">
                      <div className="flex justify-between items-center text-sm text-white/60">
                        <span>Total Agents:</span>
                        <span className="font-medium text-white">{agents.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-white/60 mt-2">
                        <span>Filtered Results:</span>
                        <span className="font-medium text-white">{filteredAgents.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-white/60 mt-2">
                        <span>Currently Used:</span>
                        <span className="font-medium text-white">{usedAgents.length}</span>
                      </div>
                      {selectedStatus && (
                        <div className="flex justify-between items-center text-sm text-white/60 mt-2">
                          <span>Status: {selectedStatus}</span>
                          <span className="font-medium text-white">
                            {agents.filter(agent => agent.status === selectedStatus).length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </FadeIn>
              </div>
              
              {/* Main content - Agents list */}
              <div className="lg:col-span-3">
                <FadeIn>
                  {filteredAgents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredAgents.map((agent) => (
                        <div 
                          key={agent.id} 
                          className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:bg-white/15 transition-all duration-200"
                        >
                          <div className="p-5">
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-semibold text-white truncate">{agent.name}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                agent.status === 'active' ? 'bg-green-500/20 text-green-300' :
                                agent.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {agent.status}
                              </span>
                            </div>
                            
                            <p className="mt-2 text-white/70 text-sm line-clamp-2">{agent.description}</p>
                            
                            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                              <div className="bg-white/5 rounded p-2">
                                <span className="block text-white/50">Account ID</span>
                                <span className="block text-white font-mono truncate">{agent.id}</span>
                              </div>
                              <div className="bg-white/5 rounded p-2">
                                <span className="block text-white/50">Model</span>
                                <span className="block text-white">{agent.model}</span>
                              </div>
                            </div>
                            
                            {agent.tags && agent.tags.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-1.5">
                                {agent.tags.slice(0, 3).map((tag, i) => (
                                  <span 
                                    key={i} 
                                    className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {agent.tags.length > 3 && (
                                  <span className="px-2 py-0.5 bg-white/10 text-white/70 rounded text-xs">
                                    +{agent.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                              <span className="text-xs text-white/50">
                                Created: {formatDate(agent.createdAt)}
                              </span>
                              
                              <div className="flex gap-3">
                                <Link 
                                  href={`/agents/${agent.id}`}
                                  className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-colors"
                                >
                                  Details
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                  </svg>
                                </Link>
                                
                                {isAgentUsed(agent.id) ? (
                                  <button
                                    onClick={() => removeFromUsedAgents(agent.id)}
                                    className="px-3 py-1 bg-gray-500/20 text-gray-300 text-sm font-medium rounded flex items-center gap-1 hover:bg-gray-500/30 transition-colors"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Remove
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => addToUsedAgents(agent)}
                                    className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-medium rounded flex items-center gap-1 hover:bg-green-500/30 transition-colors"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Use Agent
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-lg">
                      <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                      </svg>
                      {agents.length === 0 ? (
                        <>
                          <h3 className="text-xl font-medium text-white mb-2">No Agents Available</h3>
                          <p className="text-white/60 max-w-md mx-auto">
                            You haven&apos;t created any agents yet. Get started by creating your first Hedera agent.
                          </p>
                          <Link 
                            href="/agents/create"
                            className="mt-6 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Create an Agent
                          </Link>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-medium text-white mb-2">No Matching Agents</h3>
                          <p className="text-white/60 max-w-md mx-auto">
                            No agents match your current filters. Adjust your search or filter criteria.
                          </p>
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setSelectedStatus(null);
                            }}
                            className="mt-6 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Clear Filters
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </FadeIn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}