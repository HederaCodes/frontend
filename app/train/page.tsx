"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FadeInSlide } from "../components/animations/MotionWrapper";
import FileUpload from "../components/FileUpload";
import Link from "next/link";

export default function TrainPage() {
  // State for tracking uploaded files, training progress, and completion
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: number }>>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainProgress, setTrainProgress] = useState(0);
  const [trainingComplete, setTrainingComplete] = useState(false);
  
  // Handle file uploads
  const handleFilesUploaded = (files: File[]) => {
    const fileDetails = files.map(file => ({
      name: file.name,
      size: file.size,
    }));
    
    setUploadedFiles(prev => [...prev, ...fileDetails]);
  };
  
  // Start the mock training process
  const startTraining = () => {
    if (uploadedFiles.length === 0) return;
    
    setIsTraining(true);
    setTrainProgress(0);
    
    // Mock progress updates
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
              Upload code samples to teach HederaCodes your unique coding style, patterns, and preferences.
            </p>
          </FadeInSlide>
          
          {/* Main Content */}
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
                        <li>Provide examples from real projects you&apos;ve worked on</li>
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
                    {/* Upload Zone */}
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
                            disabled={uploadedFiles.length === 0}
                          >
                            Clear
                          </button>
                          <button
                            onClick={startTraining}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                            disabled={uploadedFiles.length === 0}
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
                        Your AI assistant has been successfully trained on {uploadedFiles.length} file{uploadedFiles.length === 1 ? "&apos;&apos;" : "&apos;s&apos;"} and is ready to generate code in your style.
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
        </div>
      </div>
    </div>
  );
}