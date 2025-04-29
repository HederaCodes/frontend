"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FadeIn, FadeInSlide, Tilt3DCard } from "../components/animations/MotionWrapper";

// Interface for history items
interface CodeHistoryItem {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  timestamp: string;
  tags: string[];
}

export default function HistoryPage() {
  // Sample history data (would come from API/database in a real app)
  const [historyItems] = useState<CodeHistoryItem[]>([
    {
      id: "hist-001",
      title: "User Authentication API",
      description: "A secure authentication endpoint with JWT tokens",
      language: "javascript",
      code: `/**
 * Authentication controller for user login
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = user.getSignedJwtToken();
    
    // Set cookie options
    const options = {
      expires: new Date(
        Date.now() + Number(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };
    
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }
    
    res
      .status(200)
      .cookie('token', token, options)
      .json({
        success: true,
        token
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};`,
      timestamp: "2025-04-25T14:23:42Z",
      tags: ["API", "Authentication", "JWT"]
    },
    {
      id: "hist-002",
      title: "React Data Table Component",
      description: "A reusable data table with sorting and pagination",
      language: "typescript",
      // Using String constructor to avoid template literal parsing issues
      code: String.raw`import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    header: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
  }[];
  itemsPerPage?: number;
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  itemsPerPage = 10
}: DataTableProps<T>) => {
  // State for sorting and pagination
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate total pages
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  // Handle sort
  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Sort data if needed
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);
  
  // Get current items
  const currentItems = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={String(column.key)} 
                  className="text-left p-3 border-b border-gray-300 bg-gray-100"
                >
                  {column.sortable ? (
                    <button 
                      className="flex items-center gap-1 font-semibold" 
                      onClick={() => handleSort(column.key)}
                    >
                      {column.header}
                      {sortConfig?.key === column.key && (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={String(column.key)} className="p-3">
                    {column.render ? 
                      column.render(row[column.key], row) : 
                      row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {
              Math.min(currentPage * itemsPerPage, data.length)
            } of {data.length} items
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => goToPage(currentPage - 1)} 
              disabled={currentPage === 1}
              className="p-2 border rounded disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Logic to show pages around current page
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (currentPage > 3) {
                  pageNum = currentPage - 3 + i;
                }
                if (currentPage > totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                }
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={'w-10 h-10 flex items-center justify-center rounded ' + 
                    (pageNum === currentPage ? 'bg-blue-600 text-white' : 'border')}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              onClick={() => goToPage(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="p-2 border rounded disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}`,
      timestamp: "2025-04-26T09:17:23Z",
      tags: ["React", "Component", "Data Table"]
    },
    {
      id: "hist-003",
      title: "API Data Fetching Hook",
      description: "A custom React hook for fetching API data with caching",
      language: "typescript",
      // Using String constructor to avoid template literal parsing issues
      code: String.raw`import { useState, useEffect, useCallback } from 'react';

// Cache for storing API responses
const apiCache = new Map<string, {
  data: any;
  timestamp: number;
  error: Error | null;
}>();

interface UseFetchOptions {
  cacheTime?: number;  // Time in milliseconds to keep cache valid
  dependencies?: any[];
  initialData?: any;
}

/**
 * Custom hook for fetching API data with caching
 * @param url The API URL to fetch
 * @param options Configuration options
 */
export function useFetch<T = any>(
  url: string,
  options: UseFetchOptions = {}
) {
  const {
    cacheTime = 5 * 60 * 1000, // Default: 5 minutes
    dependencies = [],
    initialData = null
  } = options;
  
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check if cache is valid
  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < cacheTime;
  }, [cacheTime]);

  // Function to fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check cache first
      const cachedData = apiCache.get(url);
      
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        setData(cachedData.data);
        setIsLoading(false);
        return;
      }
      
      // Fetch new data
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }
      
      const result = await response.json();
      
      // Update cache
      apiCache.set(url, {
        data: result,
        timestamp: Date.now(),
        error: null
      });
      
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // Cache the error too
      apiCache.set(url, {
        data: null,
        timestamp: Date.now(),
        error
      });
    } finally {
      setIsLoading(false);
    }
  }, [url, isCacheValid]);

  // Effect to fetch data
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  // Function to manually refetch and bypass cache
  const refetch = useCallback(async () => {
    // Remove from cache first
    apiCache.delete(url);
    await fetchData();
  }, [url, fetchData]);

  return { data, isLoading, error, refetch };
}`,
      timestamp: "2025-04-26T17:42:11Z",
      tags: ["React", "Hooks", "API", "TypeScript"]
    }
  ]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Get all unique languages
  const languages = Array.from(new Set(historyItems.map((item: CodeHistoryItem) => item.language)));
  
  // Get all unique tags
  const allTags = Array.from(
    new Set(historyItems.flatMap((item: CodeHistoryItem) => item.tags))
  ).sort();
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  // Active item management
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  
  // Get active item
  const activeItem = historyItems.find((item: CodeHistoryItem) => item.id === activeItemId);
  
  // Filter history items based on search term, language and tags
  const filteredItems = historyItems.filter((item: CodeHistoryItem) => {
    const matchesSearch = 
      searchTerm === "" || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = 
      selectedLanguage === null || 
      item.language === selectedLanguage;
      
    const matchesTags = 
      selectedTags.length === 0 || 
      selectedTags.every(tag => item.tags.includes(tag));
      
    return matchesSearch && matchesLanguage && matchesTags;
  });
  
  // Copy code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };
  
  // Download code as file
  const downloadCode = (code: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([code], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${filename.toLowerCase().replace(/\s+/g, '-')}.${activeItem?.language === 'javascript' ? 'js' : activeItem?.language === 'typescript' ? 'ts' : 'txt'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <FadeInSlide className="mb-12 text-center">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-500/30 text-purple-100 rounded-full mb-3">CODE HISTORY</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">HederaCodes</span> History
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Browse and reuse code that HederaCodes has generated for you. All your code is safely stored and organized.
            </p>
          </FadeInSlide>
          
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
                        placeholder="Search history..."
                        className="w-full bg-white/5 border border-white/10 rounded-md pl-10 pr-4 py-2 text-white/90 placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <svg className="w-5 h-5 text-white/40 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Language filter */}
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                      <span>Filter by Language</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedLanguage(null)}
                        className={`px-3 py-1 text-xs rounded-md ${
                          selectedLanguage === null 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        All
                      </button>
                      
                      {languages.map(language => (
                        <button
                          key={language}
                          onClick={() => setSelectedLanguage(language)}
                          className={`px-3 py-1 text-xs rounded-md ${
                            selectedLanguage === language 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {language.charAt(0).toUpperCase() + language.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tags filter */}
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>Filter by Tags</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 text-xs rounded-md ${
                            selectedTags.includes(tag) 
                              ? 'bg-pink-500 text-white' 
                              : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="p-4 bg-white/5 mt-4 rounded-b-lg">
                    <div className="flex justify-between items-center text-sm text-white/60">
                      <span>Total Code Snippets:</span>
                      <span className="font-medium text-white">{historyItems.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-white/60 mt-2">
                      <span>Filtered Results:</span>
                      <span className="font-medium text-white">{filteredItems.length}</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-2">
              {activeItem ? (
                <FadeIn>
                  {/* Code detail view */}
                  <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-white/10 p-4 flex items-center justify-between bg-white/5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveItemId(null)}
                          className="text-white/70 hover:text-white flex items-center gap-1 mr-3"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div>
                          <h2 className="text-md font-medium text-white">{activeItem.title}</h2>
                          <p className="text-xs text-white/50">{new Date(activeItem.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-500/30 text-blue-100 rounded-md">
                          {activeItem.language}
                        </span>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div className="p-3 bg-white/5 border-b border-white/10">
                      <p className="text-sm text-white/70">{activeItem.description}</p>
                    </div>
                    
                    {/* Code content */}
                    <div className="p-4 font-mono text-sm overflow-auto bg-white/2" style={{ maxHeight: "600px" }}>
                      <pre className="language-javascript text-white/90 whitespace-pre-wrap">{activeItem.code}</pre>
                    </div>
                    
                    {/* Actions */}
                    <div className="border-t border-white/10 p-4 flex justify-between items-center bg-white/3">
                      <div className="flex flex-wrap gap-2">
                        {activeItem.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-pink-500/20 text-pink-200 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => copyToClipboard(activeItem.code)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/90 rounded-md transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
                          </svg>
                          <span>Copy</span>
                        </button>
                        <button 
                          onClick={() => downloadCode(activeItem.code, activeItem.title)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/90 rounded-md transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>Download</span>
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-md transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ) : (
                <>
                  {/* List of history items */}
                  {filteredItems.length > 0 ? (
                    <div className="space-y-6">
                      {filteredItems.map((item, index) => (
                        <FadeInSlide key={item.id} delay={index * 0.05}>
                          <Tilt3DCard scale={1.02}>
                            <motion.div
                              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl hover:border-purple-500/50 cursor-pointer transition-colors"
                              whileHover={{ scale: 1.01 }}
                              onClick={() => setActiveItemId(item.id)}
                            >
                              <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-1 text-xs font-medium bg-blue-500/30 text-blue-100 rounded-md">
                                        {item.language}
                                      </span>
                                      <span className="text-sm text-white/50">
                                        {new Date(item.timestamp).toLocaleDateString()} · {new Date(item.timestamp).toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mt-2">{item.title}</h3>
                                    <p className="text-white/70 mt-1">{item.description}</p>
                                    
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      {item.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-pink-500/20 text-pink-200 rounded-md">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                                
                                {/* Code preview */}
                                <div className="mt-4 bg-white/5 rounded-md p-3 font-mono text-xs text-white/70 overflow-hidden" style={{ maxHeight: "100px" }}>
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                  </div>
                                  <pre className="line-clamp-3">{item.code.split('\n').slice(0, 3).join('\n')}{item.code.split('\n').length > 3 ? ' ...' : ''}</pre>
                                </div>
                              </div>
                            </motion.div>
                          </Tilt3DCard>
                        </FadeInSlide>
                      ))}
                    </div>
                  ) : (
                    <FadeIn>
                      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-12 text-center">
                        <svg className="w-16 h-16 mx-auto text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-medium text-white mt-4">No matches found</h3>
                        <p className="text-white/70 mt-2">Try adjusting your search or filters to find what you&apos;re looking for.</p>
                        <button 
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedLanguage(null);
                            setSelectedTags([]);
                          }} 
                          className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </FadeIn>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* AI Code Analytics */}
          <FadeInSlide className="mt-16">
            <div className="backdrop-blur-md p-6 border-t-2 border-purple-500">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-purple-500/20 p-3 border border-purple-500/30">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Your Code Usage Analytics</h3>
                  <p className="text-white/70 mb-4">Insights about your code generation history and usage patterns:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-white">Most Used Language</h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                          56%
                        </span>
                      </div>
                      <p className="text-sm text-white/70">JavaScript is your most frequently generated language</p>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-white">Top Tags</h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-500/20 text-pink-400">
                          24
                        </span>
                      </div>
                      <p className="text-sm text-white/70">API, React, and Component are your most common tags</p>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-white">Productivity</h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                          +12%
                        </span>
                      </div>
                      <p className="text-sm text-white/70">Your code generation has increased 12% this month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInSlide>
        </div>
      </div>
    </div>
  );
}