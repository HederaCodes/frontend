"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FadeInSlide } from "../components/animations/MotionWrapper";
import FileUpload from "../components/FileUpload";
import Link from "next/link";
import { useUser } from "../utils/UserContext";

export default function TrainPage() {
  // Use shared user context instead of local state and initialization
  const { userId, isLoading: isUserLoading, error: userError } = useUser();
  
  // State for tracking uploaded files, training progress, and completion
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: number }>>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainProgress, setTrainProgress] = useState(0);
  const [trainingComplete, setTrainingComplete] = useState(false);
  
  // State for GitHub repository URLs
  const [repoUrl, setRepoUrl] = useState("");
  const [repoUrls, setRepoUrls] = useState<string[]>([]);
  const [isAnalyzingRepo, setIsAnalyzingRepo] = useState(false);
  const [repoAnalysisResults, setRepoAnalysisResults] = useState<Record<string, { success: boolean, message: string }>>({});
  
  // State for error handling
  const [error, setError] = useState("");

  // Ref for the repo URL input
  const repoInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file uploads
  const handleFilesUploaded = (files: File[]) => {
    const fileDetails = files.map(file => ({
      name: file.name,
      size: file.size,
    }));
    
    setUploadedFiles(prev => [...prev, ...fileDetails]);
  };
  
  // Add a GitHub repository URL to the list
  const addRepoUrl = () => {
    if (!repoUrl.trim()) return;
    
    // Simple validation to check if it's a GitHub URL
    if (!repoUrl.includes('github.com')) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }
    
    // Add URL to list if it's not already there
    if (!repoUrls.includes(repoUrl)) {
      setRepoUrls(prev => [...prev, repoUrl]);
      setRepoUrl("");
      setError("");
      
      if (repoInputRef.current) {
        repoInputRef.current.focus();
      }
    } else {
      setError("This repository is already in your list.");
    }
  };
  
  // Remove a GitHub repository URL from the list
  const removeRepoUrl = (url: string) => {
    setRepoUrls(prev => prev.filter(item => item !== url));
    // Also remove from analysis results if it exists
    if (repoAnalysisResults[url]) {
      const updatedResults = { ...repoAnalysisResults };
      delete updatedResults[url];
      setRepoAnalysisResults(updatedResults);
    }
  };
  
  // Analyze GitHub repositories
  const analyzeRepositories = async () => {
    if (repoUrls.length === 0 || !userId) return;
    
    setIsAnalyzingRepo(true);
    setError("");
    
    // Create a copy of the current analysis results
    const analysisResults = { ...repoAnalysisResults };
    
    // Process each repository sequentially
    for (const url of repoUrls) {
      try {
        // Update UI to show which repo is being analyzed
        analysisResults[url] = { success: false, message: "Analyzing..." };
        setRepoAnalysisResults({ ...analysisResults });
        
        const response = await fetch('http://localhost:8000/api/assistant/analyze/github', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            repoUrl: url
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          analysisResults[url] = { 
            success: true, 
            message: "Successfully analyzed repository"
          };
        } else {
          analysisResults[url] = { 
            success: false, 
            message: data.error || data.message || "Failed to analyze repository" 
          };
        }
      } catch (err) {
        console.error(`Error analyzing repository ${url}:`, err);
        analysisResults[url] = { 
          success: false, 
          message: "Error connecting to the server" 
        };
      }
      
      // Update the UI after each repo is processed
      setRepoAnalysisResults({ ...analysisResults });
    }
    
    setIsAnalyzingRepo(false);
  };
  
  // Start the training process with files and GitHub data
  const startTraining = async () => {
    if ((uploadedFiles.length === 0 && repoUrls.length === 0) || !userId) return;
    
    setIsTraining(true);
    setTrainProgress(0);
    
    // Get analysis for any repos that haven't been analyzed yet
    const unanalyzedRepos = repoUrls.filter(url => !repoAnalysisResults[url] || !repoAnalysisResults[url].success);
    if (unanalyzedRepos.length > 0) {
      await analyzeRepositories();
    }
    
    // Mock progress updates - in a real app, this would be connected to actual training progress
    const interval = setInterval(() => {
      setTrainProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setTrainingComplete(true);
            setIsTraining(false);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };
  
  // Clear training and start over
  const resetTraining = () => {
    setUploadedFiles([]);
    setRepoUrls([]);
    setRepoAnalysisResults({});
    setTrainProgress(0);
    setTrainingComplete(false);
  };
  
  // Remove a file from the list
  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
  };
  
  // Format file size to human readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen pt-12">
      <div className="container-responsive mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <FadeInSlide className="mb-12 text-center">
            <span className="badge badge-blue mb-3">TRAIN YOUR AI</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">Train</span> Your{" "}
              <span className="text-blue-400">AI Assistant</span>
            </h1>
            <p className="text-lg text-white/70 max-w-xl mx-auto">
              Upload code samples or add GitHub repositories to teach HederaCodes your unique coding style, patterns, and preferences.
            </p>
          </FadeInSlide>
          
          {/* Loading state */}
          {isUserLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <span className="ml-3 text-white">Initializing AI assistant...</span>
            </div>
          )}
          
          {/* Error message display */}
          {(error || userError) && !isUserLoading && (
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
          
          {/* Main Content */}
          {!isUserLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left Column - Upload Instructions */}
              <FadeInSlide direction="right">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">How Training Works</h2>
                  <ul className="space-y-4">
                    {[
                      {
                        title: "Upload Code Files",
                        description: "Upload your code files in any language. The more examples, the better the AI will learn.",
                        icon: (
                          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        )
                      },
                      {
                        title: "Add GitHub Repositories",
                        description: "Connect your GitHub repositories to provide even more code samples for analysis.",
                        icon: (
                          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                        )
                      },
                      {
                        title: "AI Analysis",
                        description: "Our AI analyzes code structure, naming conventions, formatting preferences, and programming patterns.",
                        icon: (
                          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        )
                      },
                      {
                        title: "Style Adaptation",
                        description: "HederaCodes builds a personalized model that mimics your code style and problem-solving approach.",
                        icon: (
                          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )
                      },
                      {
                        title: "Generate & Iterate",
                        description: "Generate code that matches your style and refine your AI's understanding over time.",
                        icon: (
                          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )
                      }
                    ].map((step, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start gap-4 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-xl p-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="rounded-full bg-blue-500/10 p-2 flex-shrink-0 border border-blue-500/20">
                          {step.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-white text-lg">{step.title}</h3>
                          <p className="text-white/70 mt-1">{step.description}</p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                  
                  {/* Some helpful tips */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="text-sm font-medium text-blue-300">Tips for best results</h3>
                        <ul className="mt-2 space-y-1 text-sm text-white/70 list-disc pl-4">
                          <li>Upload multiple files to capture your style better</li>
                          <li>Include different types of code (functions, classes, etc.)</li>
                          <li>Add GitHub repositories with your contributions</li>
                          <li>Files should be less than 10MB each</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInSlide>
              
              {/* Right Column - Upload Area */}
              <FadeInSlide direction="left" delay={0.2}>
                <div className="p-6 backdrop-blur-md">
                  {!trainingComplete ? (
                    <>
                      {/* Tabs for File Upload and GitHub */}
                      <div className="border-b border-white/10 mb-6">
                        <div className="flex">
                          <div className="mr-4">
                            <button 
                              className="py-2 px-4 border-b-2 border-blue-500 text-blue-400 font-medium"
                            >
                              Train Your AI
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* GitHub Repositories Section */}
                      <div className="mb-8">
                        <h3 className="text-sm font-medium text-white/90 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          Add GitHub Repositories
                        </h3>

                        <div className="flex gap-2 mb-2">
                          <input
                            ref={repoInputRef}
                            type="text"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            placeholder="https://github.com/username/repository"
                            className="flex-grow bg-white/5 border border-white/10 rounded-md p-2 text-white/90 placeholder-white/40 text-sm focus:ring-blue-500 focus:border-blue-500"
                            onKeyDown={(e) => e.key === 'Enter' && addRepoUrl()}
                          />
                          <button
                            onClick={addRepoUrl}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>

                        {/* Repository List */}
                        {repoUrls.length > 0 && (
                          <div className="bg-black/30 rounded-lg overflow-hidden mb-4">
                            <div className="max-h-60 overflow-y-auto">
                              {repoUrls.map((url, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-1.5 bg-blue-500/10 rounded-md">
                                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                      </svg>
                                    </div>
                                    <div className="overflow-hidden">
                                      <span className="text-sm font-medium text-white truncate block max-w-[180px]">
                                        {url.replace('https://github.com/', '')}
                                      </span>
                                      {repoAnalysisResults[url] && (
                                        <span className={`text-xs ${repoAnalysisResults[url].success ? 'text-green-400' : 'text-yellow-400'}`}>
                                          {repoAnalysisResults[url].message}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => removeRepoUrl(url)}
                                    className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white/90 transition-colors"
                                    disabled={isAnalyzingRepo}
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Analyze Repositories Button */}
                        {repoUrls.length > 0 && (
                          <button
                            onClick={analyzeRepositories}
                            disabled={isAnalyzingRepo || !userId}
                            className={`w-full mb-6 py-2 px-4 rounded-md flex items-center justify-center gap-2 ${
                              isAnalyzingRepo || !userId
                                ? "bg-blue-500/30 text-white/50 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                          >
                            {isAnalyzingRepo ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Analyzing Repositories...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <span>Analyze Repositories</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Upload Zone */}
                      <h3 className="text-sm font-medium text-white/90 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Code Files
                      </h3>
                      
                      <FileUpload onFilesUploaded={handleFilesUploaded} />
                      
                      {/* File List */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Uploaded Files ({uploadedFiles.length})
                          </h3>
                          <div className="bg-black/30 rounded-lg overflow-hidden">
                            <div className="max-h-60 overflow-y-auto">
                              {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-blue-500/10 rounded-md">
                                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium text-white truncate max-w-[180px]">
                                        {file.name}
                                      </span>
                                      <span className="text-xs text-white/50">{formatFileSize(file.size)}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => removeFile(file.name)}
                                    className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white/90 transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Training controls */}
                      <div className="mt-6">
                        {isTraining ? (
                          <div className="space-y-4">
                            <div className="relative pt-1">
                              <div className="text-xs text-white/70 mb-1 flex justify-between">
                                <span>Training in progress...</span>
                                <span>{Math.round(trainProgress)}%</span>
                              </div>
                              <div className="overflow-hidden h-2 text-xs flex rounded-full bg-white/10">
                                <motion.div
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${trainProgress}%` }}
                                  transition={{ type: "spring", damping: 30, stiffness: 200 }}
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                />
                              </div>
                            </div>
                            <div className="text-sm text-white/70 text-center animate-pulse">
                              Analyzing code patterns and style...
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between gap-4">
                            <button
                              onClick={resetTraining}
                              className="btn-secondary flex-1"
                              disabled={uploadedFiles.length === 0 && repoUrls.length === 0}
                            >
                              Clear
                            </button>
                            <button
                              onClick={startTraining}
                              className="btn-primary flex-1 flex items-center justify-center gap-2"
                              disabled={(uploadedFiles.length === 0 && repoUrls.length === 0) || !userId}
                            >
                              <span>Start Training</span>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Training Complete UI */}
                      <div className="text-center py-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6">
                          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Training Complete!</h3>
                        <p className="text-white/70 mb-8">
                          Your AI assistant has been successfully trained on {uploadedFiles.length} file{uploadedFiles.length === 1 ? "" : "s"} 
                          {repoUrls.length > 0 ? ` and ${repoUrls.length} GitHub ${repoUrls.length === 1 ? "repository" : "repositories"}` : ""} 
                          and is ready to generate code in your style.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Link href="/live" className="btn-primary flex items-center justify-center gap-2">
                            <span>Try it now</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                          <button
                            onClick={resetTraining}
                            className="btn-secondary flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Train Again</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </FadeInSlide>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}