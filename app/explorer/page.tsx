"use client";

import { useState, useEffect } from "react";
import Editor, { loader } from "@monaco-editor/react";
import { FadeInSlide } from "../components/animations/MotionWrapper";
import { useUser } from "../utils/UserContext";

// Configure Monaco Editor before loading
loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs"
  }
});

// File types for icons and syntax highlighting
const fileIcons: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  jsx: "javascript", // Using javascript with React features
  tsx: "typescript", // Using typescript with React features
  py: "python",
  json: "json",
  html: "html",
  css: "css",
  md: "markdown",
  yml: "yaml",
  yaml: "yaml",
};

// Helper function to get the correct language mode for Monaco
const getLanguageForFile = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || "";
  
  // Special handling for .tsx and .jsx files
  if (extension === 'tsx') {
    return 'typescript';
  } else if (extension === 'jsx') {
    return 'javascript';
  }
  
  return fileIcons[extension] || "plaintext";
};

// Monaco Editor setup function
const handleEditorWillMount = (monaco: any) => {
  // Configure TypeScript compiler options for .tsx files
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    jsx: monaco.languages.typescript.JsxEmit.React,
    jsxFactory: 'React.createElement',
    reactNamespace: 'React',
    allowNonTsExtensions: true,
    allowJs: true,
    target: monaco.languages.typescript.ScriptTarget.Latest,
  });
  
  // Configure JavaScript for .jsx files
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    jsx: monaco.languages.typescript.JsxEmit.React,
    jsxFactory: 'React.createElement',
    reactNamespace: 'React',
    allowNonTsExtensions: true,
    allowJs: true,
    target: monaco.languages.typescript.ScriptTarget.Latest,
  });
};

// --- Code Agent Integration ---
interface CodeFile {
  path: string;
  language: string;
  preview?: string;
  content?: string;
}

interface CodeProject {
  name: string;
  files: CodeFile[];
}

interface CodeGenerationResponse {
  success: boolean;
  userId: string;
  project: CodeProject;
  response: string;
  error?: string;
}

// Interface for file system items
interface FileSystemItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemItem[];
  content?: string;
}

export default function ExplorerPage() {
  // Using shared user context
  const { userId, isLoading: isUserLoading, error: userError } = useUser();
  
  // State for file explorer and editor
  const [fileSystem, setFileSystem] = useState<FileSystemItem>({
    name: "code",
    type: "folder",
    children: []  // Initialize with empty children instead of sample files
  });
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['code']));
  const [selectedFile, setSelectedFile] = useState<FileSystemItem | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [language, setLanguage] = useState<string>("typescript");
  const [, setIsEditing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [error, setError] = useState<string>("");
  
  // Code generation states
  const [codeTask, setCodeTask] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationResponse, setGenerationResponse] = useState<string>("");
  const [, setGeneratedProject] = useState<CodeProject | null>(null);
  const [showGenerationUI, setShowGenerationUI] = useState<boolean>(true); // Show the generation UI by default
  const [generatedFiles, setGeneratedFiles] = useState<CodeFile[]>([]);
  
  // Fetch content of a generated file
  const fetchFileContent = async (filePath: string): Promise<string> => {
    try {
      const response = await fetch(`/api/code-files?path=${encodeURIComponent(filePath)}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching file: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.content;
      } else {
        throw new Error(data.error || 'Failed to fetch file content');
      }
    } catch (error) {
      console.error(`Error fetching file content for ${filePath}:`, error);
      return "// Error loading file content";
    }
  };
  
  // Generate code using supervisor
  const generateCode = async () => {
    if (!codeTask.trim()) {
      setError("Please enter a code generation task");
      return;
    }
    
    try {
      setIsGenerating(true);
      setError("");
      setGenerationResponse("");
      
      // Call the code-agent endpoint using Fetch API
      const response = await fetch('/api/assistant/code-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          query: codeTask
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json() as CodeGenerationResponse;
      
      if (data.success) {
        setGenerationResponse(data.response);
        setGeneratedProject(data.project);
        
        // Fetch full content for each file
        const filesWithContent: CodeFile[] = [];
        
        for (const file of data.project.files) {
          try {
            const content = await fetchFileContent(file.path);
            filesWithContent.push({
              ...file,
              content
            });
          } catch (error) {
            console.error(`Error fetching content for ${file.path}:`, error);
            filesWithContent.push(file);
          }
        }
        
        setGeneratedFiles(filesWithContent);
        
        // Update file system with generated files
        updateFileSystemWithGeneratedFiles(filesWithContent);
      } else {
        setError(data.error || "Failed to generate code");
      }
    } catch (error) {
      console.error("Error generating code:", error);
      setError("Error connecting to code generation service");
    } finally {
      setIsGenerating(false);
    }
  };
  
  
  // Update file system with generated files
  const updateFileSystemWithGeneratedFiles = (files: CodeFile[]) => {
    setFileSystem(prevFileSystem => {
      // Create a deep copy of the file system
      const newFileSystem = JSON.parse(JSON.stringify(prevFileSystem));
      
      // Process each generated file
      for (const file of files) {
        // Split the path into segments
        const pathSegments = file.path.split('/');
        const fileName = pathSegments.pop() || '';
        
        // Create or navigate to the necessary folders
        let currentNode = newFileSystem;
        let currentPath = '';
        
        for (const segment of pathSegments) {
          currentPath = currentPath ? `${currentPath}/${segment}` : segment;
          
          // Find or create the folder
          if (!currentNode.children) {
            currentNode.children = [];
          }
          
          let folderNode = currentNode.children.find(
            (child: FileSystemItem) => child.type === 'folder' && child.name === segment
          );
          
          if (!folderNode) {
            folderNode = {
              name: segment,
              type: 'folder',
              children: []
            };
            currentNode.children.push(folderNode);
            
            // Expand the newly created folder
            setExpandedFolders(prev => new Set([...prev, currentPath]));
          }
          
          currentNode = folderNode;
        }
        
        // Create or update the file
        if (!currentNode.children) {
          currentNode.children = [];
        }
        
        const existingFileIndex = currentNode.children.findIndex(
          (child: FileSystemItem) => child.type === 'file' && child.name === fileName
        );
        
        if (existingFileIndex >= 0) {
          // Update existing file
          currentNode.children[existingFileIndex].content = file.content || '';
        } else {
          // Create new file
          currentNode.children.push({
            name: fileName,
            type: 'file',
            content: file.content || ''
          });
        }
      }
      
      return newFileSystem;
    });
  };
  
  // Add fetchGeneratedFiles function
  const fetchGeneratedFiles = async () => {
    try {
      console.log("Fetching generated files...");
      setIsGenerating(true);
      
      const response = await fetch('/api/code-files/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching files: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log("Fetched files:", data.files);
        
        // If files exist, update the files list
        if (data.files && Array.isArray(data.files) && data.files.length > 0) {
          const filesWithDetails = data.files.map((filePath: string) => ({
            path: filePath,
            language: getLanguageForFile(filePath.split('/').pop() || ''),
          }));
          
          setGeneratedFiles(filesWithDetails);
          updateFileSystemWithGeneratedFiles(filesWithDetails);
          setShowGenerationUI(false); // Hide generation UI when files are loaded
        }
      } else {
        console.error("Error fetching files:", data.error);
      }
    } catch (error) {
      console.error("Error fetching generated files:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Load generated files on page load
  useEffect(() => {
    if (!isUserLoading && userId) {
      fetchGeneratedFiles();
    }
  }, [isUserLoading, userId]);
  
  // Handle file selection
  const handleFileSelect = async (file: FileSystemItem) => {
    if (file.type === 'file') {
      setSelectedFile(file);
      
      // Set language based on file extension
      setLanguage(getLanguageForFile(file.name));
      
      // Get file path (reconstruct from current state)
      if (file.content) {
        // If content is already loaded, use it
        setFileContent(file.content);
      } else {
        // Otherwise, find the file path by traversing the file system
        try {
          // Find full path to this file by searching the file system
          const findFilePath = (
            item: FileSystemItem, 
            currentPath: string = "",
            targetFile: FileSystemItem
          ): string | null => {
            const path = currentPath ? `${currentPath}/${item.name}` : item.name;
            
            if (item === targetFile) {
              return path;
            }
            
            if (item.type === 'folder' && item.children) {
              for (const child of item.children) {
                const result = findFilePath(child, path, targetFile);
                if (result) return result;
              }
            }
            
            return null;
          };
          
          const filePath = findFilePath(fileSystem, "", file);
          
          if (filePath) {
            console.log(`Fetching content for: ${filePath}`);
            // Fetch fresh content from the API
            const content = await fetchFileContent(filePath);
            setFileContent(content);
            
            // Update the file system with the content
            setFileSystem(prev => {
              const updateFileContentInSystem = (item: FileSystemItem, path: string = ""): FileSystemItem => {
                const currentPath = path ? `${path}/${item.name}` : item.name;
                
                if (item === file) {
                  return { ...item, content };
                }
                
                if (item.type === 'folder' && item.children) {
                  return {
                    ...item,
                    children: item.children.map(child => updateFileContentInSystem(child, currentPath))
                  };
                }
                
                return item;
              };
              
              return updateFileContentInSystem(prev);
            });
          } else {
            setFileContent("// Error: Could not determine file path");
          }
        } catch (error) {
          console.error("Error fetching file content:", error);
          setFileContent("// Error loading file content");
        }
      }
    }
  };
  
  // Handle folder expansion/collapse
  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(folderPath)) {
        newExpanded.delete(folderPath);
      } else {
        newExpanded.add(folderPath);
      }
      return newExpanded;
    });
  };
  
  // Render file tree recursively
  const renderFileTree = (item: FileSystemItem, path: string = "") => {
    const currentPath = path ? `${path}/${item.name}` : item.name;
    
    // Filter items based on search term if present
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      if (item.type === 'folder' && item.children) {
        const matchingChildren = item.children.filter(child => 
          child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (child.type === 'folder')
        );
        
        if (matchingChildren.length === 0) return null;
      } else if (item.type === 'file') {
        return null;
      }
    }
    
    return (
      <div key={currentPath} className="ml-2">
        <div 
          className={`flex items-center py-1 px-2 rounded-md text-sm ${
            selectedFile && selectedFile.name === item.name 
              ? 'bg-blue-500/20 text-blue-300' 
              : 'hover:bg-white/5 text-white/80'
          } cursor-pointer transition-colors`}
          onClick={() => item.type === 'folder' ? toggleFolder(currentPath) : handleFileSelect(item)}
        >
          {/* Folder/File Icon */}
          {item.type === 'folder' ? (
            <svg 
              className={`w-4 h-4 mr-1.5 ${expandedFolders.has(currentPath) ? 'text-blue-400' : 'text-yellow-400'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {expandedFolders.has(currentPath) ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              )}
            </svg>
          ) : (
            <svg 
              className="w-4 h-4 mr-1.5 text-white/60" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          
          {/* Name */}
          <span className="truncate">{item.name}</span>
        </div>
        
        {/* Children (if folder and expanded) */}
        {item.type === 'folder' && expandedFolders.has(currentPath) && item.children && (
          <div className="border-l border-white/10 pl-2 ml-2">
            {item.children.map(child => renderFileTree(child, currentPath))}
          </div>
        )}
      </div>
    );
  };
  
  // Handle editor changes
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFileContent(value);
      
      // Update file content in state (this is just for the demo - in a real app you'd persist to backend)
      if (selectedFile) {
        setFileSystem(prev => {
          const updateFileContent = (item: FileSystemItem, path: string = ""): FileSystemItem => {
            const currentPath = path ? `${path}/${item.name}` : item.name;
            
            if (selectedFile && item.name === selectedFile.name && item.type === 'file') {
              return { ...item, content: value };
            }
            
            if (item.type === 'folder' && item.children) {
              return {
                ...item,
                children: item.children.map(child => updateFileContent(child, currentPath))
              };
            }
            
            return item;
          };
          
          return updateFileContent(prev);
        });
      }
    }
  };
  
  // Save file (in a real app, this would send to backend)
  const saveFile = () => {
    setIsEditing(false);
    // In a real app, you would save to backend here
    console.log('Saving file:', selectedFile?.name, fileContent);
  };
  
  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <FadeInSlide className="mb-12 text-center">
            <span className="badge badge-blue mb-3">CODE EXPLORER</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">HederaCodes</span> <span className="text-blue-400">Explorer</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              See what your agents are up to.
            </p>
          </FadeInSlide>
          
          {/* Loading state */}
          {isUserLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <span className="ml-3 text-white">Initializing explorer...</span>
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
            <div>
              {/* Code Generation Interface */}
              <div className="mb-8 backdrop-blur-md border border-purple-500/30 rounded-lg overflow-hidden">
                <div className="bg-purple-900/30 border-b border-purple-500/30 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-medium text-white">Code Generation</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowGenerationUI(!showGenerationUI)}
                      className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                    >
                      {showGenerationUI ? "Hide" : "Show"} Panel
                    </button>
                  </div>
                </div>
                
                {showGenerationUI && (
                  <div className="p-4">
                    <div className="mb-4">
                      <label htmlFor="codeTask" className="block text-sm font-medium text-white/80 mb-2">
                        Describe what code you want to generate:
                      </label>
                      <textarea
                        id="codeTask"
                        rows={3}
                        value={codeTask}
                        onChange={(e) => setCodeTask(e.target.value)}
                        placeholder="e.g., Create a React component for a user profile with name, bio, and avatar"
                        className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-white/90 placeholder-white/40 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={generateCode}
                          disabled={isGenerating}
                          className={`px-4 py-2 rounded-md text-white ${
                            isGenerating 
                              ? 'bg-purple-700/50 cursor-not-allowed' 
                              : 'bg-purple-600 hover:bg-purple-700'
                          } transition-colors flex items-center gap-2`}
                        >
                          {isGenerating ? (
                            <>
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
                      
                      {generatedFiles.length > 0 && (
                        <div className="text-sm text-white/60">
                          <span>{generatedFiles.length} files generated</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Generation Results */}
                    {generationResponse && (
                      <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-md overflow-auto max-h-80">
                        <div className="prose prose-invert prose-sm max-w-none">
                          <div className="whitespace-pre-wrap">{generationResponse}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* File Explorer Panel */}
                <div className="lg:col-span-1 backdrop-blur-md">
                  {/* Header */}
                  <div className="border-b border-white/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <span className="text-sm text-white/80 font-medium">Explorer</span>
                    </div>
                  </div>
                  
                  {/* Search */}
                  <div className="p-3 border-b border-white/10">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-md py-1.5 px-3 text-sm text-white/90 placeholder-white/40 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* File Tree */}
                  <div className="p-2 h-[calc(100vh-320px)] overflow-y-auto">
                    {renderFileTree(fileSystem)}
                  </div>
                  
                </div>
                
                {/* Editor Panel */}
                <div className="lg:col-span-3 backdrop-blur-md">
                  {/* Header */}
                  <div className="border-b border-white/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <span className="text-sm text-white/80 font-medium">
                        {selectedFile ? selectedFile.name : 'Editor'}
                      </span>
                      {selectedFile && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/60">
                          {language}
                        </span>
                      )}
                    </div>
                    
                    {/* Actions when file is selected */}
                    {selectedFile && (
                      <div className="flex gap-2">
                        <button
                          onClick={saveFile}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          <span>Save</span>
                        </button>
                        
                        <button
                          onClick={() => console.log('Generate code with AI for this file')}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>AI Assist</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Editor Area */}
                  <div className="h-[calc(100vh-280px)]">
                    {selectedFile ? (
                      <Editor
                        height="100%"
                        language={language}
                        value={fileContent}
                        onChange={handleEditorChange}
                        theme="vs-dark"
                        beforeMount={handleEditorWillMount}
                        options={{
                          fontSize: 14,
                          minimap: { enabled: true },
                          scrollBeyondLastLine: false,
                          wordWrap: "on",
                          automaticLayout: true,
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center p-6">
                          <svg className="w-16 h-16 mx-auto mb-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h3 className="text-xl font-medium text-white/80 mb-2">No File Selected</h3>
                          <p className="text-white/50 max-w-md">
                            Select a file from the explorer to view and edit its contents
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Status Bar */}
                  <div className="border-t border-white/10 p-2 px-4 flex justify-between items-center text-xs text-white/50">
                    <div className="flex items-center gap-4">
                      <span>
                        {selectedFile ? `${language} • UTF-8` : 'Ready'}
                      </span>
                      {selectedFile && (
                        <span>
                          Ln: {1}, Col: {1}
                        </span>
                      )}
                    </div>
                    <div>
                      {selectedFile && (
                        <span>
                          {fileContent.split('\n').length} lines
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}