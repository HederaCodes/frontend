"use client";

import { useState, useRef, useEffect } from "react";
import { FadeInSlide } from "../components/animations/MotionWrapper";
import { processOutput } from "../utils/markdown";
import { useUser } from "../utils/UserContext";

export default function LivePage() {
  // Using shared user context instead of local state
  const { userId, isLoading: isUserLoading, error: userError } = useUser();
  
  // State for code input and output
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [renderedOutput, setRenderedOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [error, setError] = useState("");
  
  // Ref for the code input
  const codeInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus input when page loads
  useEffect(() => {
    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, []);

  // Process and render markdown whenever outputCode changes
  useEffect(() => {
    const renderMarkdownOutput = async () => {
      if (!outputCode) {
        setRenderedOutput("");
        return;
      }

      try {
        const html = await processOutput(outputCode);
        setRenderedOutput(html);
      } catch (err) {
        console.error("Error rendering markdown:", err);
        setRenderedOutput(outputCode); // Fallback to plain text if rendering fails
      }
    };

    renderMarkdownOutput();
  }, [outputCode]);
  
  // Generate code using the API
  const generateCode = async () => {
    if (!inputCode.trim() || !userId) return;
    
    setIsGenerating(true);
    setGenerationComplete(false);
    setError("");
    
    try {
      // Send request to analyze code
      const response = await fetch('http://localhost:8000/api/assistant/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          message: inputCode + `\n\n// User Preferred Language: ${codeLanguage}`,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Set the generated code with a typing effect
        setOutputCode("");
        const generatedCode = data.response || "// No response received";
        
        let i = 0;
        const typeInterval = setInterval(() => {
          setOutputCode(() => {
            const next = generatedCode.substring(0, i);
            i++;
            if (i > generatedCode.length) {
              clearInterval(typeInterval);
              setIsGenerating(false);
              setGenerationComplete(true);
            }
            return next;
          });
        }, 10);
      } else {
        setError(data.error || data.message || "Failed to generate code");
        setIsGenerating(false);
      }
    } catch (err) {
      console.error('Error generating code:', err);
      setError('Failed to generate code. Please check your connection and try again.');
      setIsGenerating(false);
    }
  };
  
  // Copy generated code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputCode);
    // Show toast notification or visual feedback here
  };
  
  // Example prompts for code generation
  const examplePrompts = [
    "Create a function to sort an array of objects",
    "Write a class for a shopping cart",
    "Generate a React component for a user profile",
    "Create an API endpoint for user authentication"
  ];
  
  // Set example prompt to input - changed from a hook to a regular function
  const handleExamplePrompt = (prompt: string) => {
    setInputCode(prompt);
    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <FadeInSlide className="mb-12 text-center">
            <span className="badge badge-blue mb-3">LIVE CODE GENERATION</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">HederaCodes</span> in{" "}
              <span className="text-blue-400">Action</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Experience the power of your personalized AI coding assistant. Describe what you need or provide some starter code, and see HederaCodes generate code in your style.
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
          {(error || userError) && (
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
          
          {!isUserLoading && (
            /* Code Editor Interface */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Panel */}
              <div className="backdrop-blur-md">
                {/* Header */}
                <div className="border-b border-white/10 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-sm text-white/80 font-medium">Input</span>
                  </div>
                  
                  {/* Language selector */}
                  <div className="relative">
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="bg-white/5 border border-white/10 text-white/80 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-1.5 appearance-none pr-7"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.8)' }}
                    >
                      <option value="javascript" style={{ backgroundColor: '#1e1e2d', color: 'rgba(255, 255, 255, 0.9)' }}>JavaScript</option>
                      <option value="python" style={{ backgroundColor: '#1e1e2d', color: 'rgba(255, 255, 255, 0.9)' }}>Python</option>
                      <option value="typescript" style={{ backgroundColor: '#1e1e2d', color: 'rgba(255, 255, 255, 0.9)' }}>TypeScript</option>
                      <option value="java" style={{ backgroundColor: '#1e1e2d', color: 'rgba(255, 255, 255, 0.9)' }}>Java</option>
                      <option value="csharp" style={{ backgroundColor: '#1e1e2d', color: 'rgba(255, 255, 255, 0.9)' }}>C#</option>
                      <option value="cpp" style={{ backgroundColor: '#1e1e2d', color: 'rgba(255, 255, 255, 0.9)' }}>C++</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/60">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Example prompts */}
                <div className="p-4 border-b border-white/10 bg-white/2">
                  <h3 className="text-sm text-white/60 mb-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Try an example</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleExamplePrompt(prompt)}
                        className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-white/70 transition-colors"
                      >
                        {prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Code input */}
                <div className="p-4">
                  <textarea
                    ref={codeInputRef}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Describe what you need or paste some starter code..."
                    className="w-full h-64 bg-white/5 border border-white/10 rounded-md p-4 text-white/90 placeholder-white/40 font-mono text-sm focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                  
                  {/* Action buttons */}
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => setInputCode("")}
                      className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-white/70 hover:text-white/90 transition-colors"
                    >
                      Clear
                    </button>
                    
                    <button
                      onClick={generateCode}
                      disabled={!inputCode.trim() || isGenerating || !userId}
                      className={`px-4 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors ${
                        !inputCode.trim() || isGenerating || !userId
                          ? "bg-blue-500/30 text-white/50 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Generate Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Output Panel */}
              <div className="backdrop-blur-md">
                {/* Header */}
                <div className="border-b border-white/10 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-sm text-white/80 font-medium">Generated Code</span>
                  </div>
                  
                  {/* Copy button */}
                  {outputCode && (
                    <button
                      onClick={copyToClipboard}
                      className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white/90 p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>Copy</span>
                    </button>
                  )}
                </div>
                
                {/* Status bar */}
                {isGenerating && (
                  <div className="p-3 bg-white/5 border-b border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-white/70">
                      HederaCodes is thinking...
                    </span>
                  </div>
                )}
                
                {/* Output code - Now using markdown with syntax highlighting */}
                <div className="p-4 overflow-auto" style={{ maxHeight: "400px" }}>
                  {outputCode ? (
                    <div 
                      className="prose prose-invert prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-code:text-cyan-300 max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderedOutput }}
                    />
                  ) : (
                    <div className="text-white/40 h-full flex flex-col items-center justify-center p-10 text-center">
                      <svg className="w-12 h-12 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>Your generated code will appear here</p>
                      {!isGenerating && inputCode.trim() && (
                        <button 
                          onClick={generateCode} 
                          disabled={!userId}
                          className="mt-4 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Generate Code</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Action buttons */}
                {generationComplete && (
                  <div className="border-t border-white/10 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-500/20 text-green-400">
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Generated Successfully
                      </span>
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          // This would be implemented for history feature
                          console.log('Save to history feature would go here');
                        }}
                        className="text-xs text-white/60 hover:text-white/80 flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span>Save to History</span>
                      </button>
                      
                      <button 
                        onClick={() => {
                          // Download functionality
                          const element = document.createElement("a");
                          const file = new Blob([outputCode], {type: 'text/plain'});
                          element.href = URL.createObjectURL(file);
                          element.download = `generated-code.${codeLanguage === "javascript" ? "js" : 
                                            codeLanguage === "python" ? "py" :
                                            codeLanguage === "typescript" ? "ts" :
                                            codeLanguage === "java" ? "java" :
                                            codeLanguage === "csharp" ? "cs" : "txt"}`;
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                        }}
                        className="text-xs text-white/60 hover:text-white/80 flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* AI Style Insights */}
          <FadeInSlide className="mt-16">
            <div className="backdrop-blur-md p-6 border-t-2 border-blue-500">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-blue-500/20 p-3 border border-blue-500/30">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Your AI Style Insights</h3>
                  <p className="text-white/70 mb-4">Based on your training data, HederaCodes has identified these patterns in your coding style:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {[
                      {
                        title: "Documentation",
                        description: "You tend to use JSDoc-style comments for functions",
                        score: 85
                      },
                      {
                        title: "Naming",
                        description: "You prefer camelCase for variables and functions",
                        score: 92
                      },
                      {
                        title: "Error Handling",
                        description: "You frequently use early returns and input validation",
                        score: 78
                      }
                    ].map((insight, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-white">{insight.title}</h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                            {insight.score}%
                          </span>
                        </div>
                        <p className="text-sm text-white/70">{insight.description}</p>
                      </div>
                    ))}
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