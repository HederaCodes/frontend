"use client";

import { useState, useEffect, useRef } from "react";
import {
  FadeIn,
  FadeInSlide,
  FloatingElement,
  Tilt3DCard,
} from "../components/animations/MotionWrapper";
import { useUser } from "../utils/UserContext";
import dynamic from "next/dynamic";

// Dynamically import ForceGraph3D
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

// Importing types
import { NodeObject, LinkObject } from "react-force-graph-3d";
import SpriteText from "three-spritetext";
// import * as THREE from 'three'; // THREE is often implicitly available via react-force-graph-3d/three-spritetext, but uncomment if needed directly

// --- Interfaces ---
interface ApiNode {
  id: string;
  type: string;
  label: Record<string, any> | string; // API label can be object or potentially string
  properties: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiRelationship {
  id: string;
  type: string;
  source: string; // Keep original API fields
  target: string;
  sourceId?: string; // Optional alternative fields
  targetId?: string;
  properties?: Record<string, any>;
}

interface ApiGraphData {
  nodes: ApiNode[];
  relationships: ApiRelationship[];
  stats?: Record<string, any>;
  insights?: {
    centralConcepts?: {
      concept: string | Record<string, any>;
      connections: number;
    }[]; // Handle potential object
    [key: string]: any; // Other insights properties
  };
}

interface GraphNode extends NodeObject {
  // Extend ForceGraph's NodeObject
  id: string;
  type: string;
  processedLabel: string; // Store the processed string label
  originalLabel: Record<string, any> | string; // Keep original label for reference if needed
  properties: Record<string, any>;
  connectionCount?: number; // Keep this if used by search results
  size: number;
  color: string;
  group: number;
  // ForceGraph internal properties (x, y, z, vx, vy, vz, index) will be added automatically
}

interface GraphLink extends LinkObject {
  // Extend ForceGraph's LinkObject
  source: string | GraphNode; // Can be ID string or node object
  target: string | GraphNode; // Can be ID string or node object
  type: string;
  id: string;
  properties?: Record<string, any>;
  value: number;
  color: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// --- Helper Function to Extract String Label ---
const getNodeLabelString = (node: ApiNode | GraphNode): string => {
  const labelSource = "originalLabel" in node ? node.originalLabel : node.label; // Use original if available (GraphNode), else API label (ApiNode)

  if (typeof labelSource === "string") {
    return labelSource;
  }
  if (typeof labelSource === "object" && labelSource !== null) {
    if (typeof labelSource.name === "string") return labelSource.name;
    if (typeof labelSource.text === "string") return labelSource.text;
    // Add more checks if other label structures exist (e.g., labelSource.title)
  }
  // Fallback label
  return node.type ? `${node.type} (${node.id.substring(0, 4)})` : node.id;
};

export default function KnowledgeCosmos() {
  const { userId, isLoading: isUserLoading, error: userError } = useUser();

  // State for graph data and UI
  const [fullGraphData, setFullGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  }); // Store the complete graph
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  }); // Data currently displayed
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ApiNode[]>([]); // Keep API nodes for search results initially
  const [viewMode, setViewMode] = useState<"full" | "focused">("full");
  const [graphStats, setGraphStats] = useState<Record<string, any>>({});
  const [centralConcepts, setCentralConcepts] = useState<
    { name: string; connections: number }[]
  >([]); // Store processed concepts

  // Force graph reference
  const graphRef = useRef<any>(undefined); // Adjusted type for compatibility

  // Node colors by type
  const typeColors: Record<string, string> = {
    Concept: "#8b5cf6", // Purple
    File: "#3b82f6", // Blue
    Class: "#10b981", // Green
    Function: "#f59e0b", // Yellow/Orange
    Variable: "#ef4444", // Red
    Query: "#ec4899", // Pink
    Response: "#06b6d4", // Cyan
    Document: "#f97316", // Orange
    default: "#9ca3af", // Default gray
  };

  // --- Helper Function: Node Size ---
  const getNodeSize = (node: ApiNode): number => {
    let baseSize = 3;
    if (node.type === "Concept") baseSize = 5;
    else if (node.type === "File") baseSize = 4;
    else if (node.type === "Document") baseSize = 4.5;
    else if (node.type === "Query" || node.type === "Response") baseSize = 3.5;

    let referenceCount = node.properties?.referenceCount;
    // Check label object as well, based on API response example
    if (
      !referenceCount &&
      typeof node.label === "object" &&
      node.label !== null &&
      node.label.referenceCount
    ) {
      referenceCount = node.label.referenceCount;
    }

    if (typeof referenceCount === "number" && referenceCount > 0) {
      return baseSize * (1 + Math.log1p(referenceCount)); // Use log scale for less extreme sizes
    }
    if (typeof node.properties?.importance === "number") {
      return baseSize * (1 + node.properties.importance * 2);
    }
    return baseSize;
  };

  // --- Helper Function: Node Group ---
  const getNodeGroup = (node: ApiNode): number => {
    switch (node.type) {
      case "Concept":
        return 1;
      case "File":
        return 2;
      case "Document":
        return 2;
      case "Class":
        return 3;
      case "Function":
        return 4;
      case "Variable":
        return 5;
      case "Query":
        return 6;
      case "Response":
        return 7;
      default:
        return 0;
    }
  };

  // --- Helper Function: Link Color ---
  const getLinkColor = (type: string): string => {
    switch (type) {
      case "MENTIONS":
        return "rgba(139, 92, 246, 0.6)"; // Purple
      case "CONTAINS":
        return "rgba(59, 130, 246, 0.6)"; // Blue
      case "CONTAINS_CONCEPT":
        return "rgba(16, 185, 129, 0.6)"; // Green
      case "IMPORTS":
        return "rgba(16, 185, 129, 0.6)"; // Green
      case "EXTENDS":
        return "rgba(245, 158, 11, 0.6)"; // Orange
      case "IMPLEMENTS":
        return "rgba(236, 72, 153, 0.6)"; // Pink
      case "CALLS":
        return "rgba(239, 68, 68, 0.6)"; // Red
      case "ANSWERED_BY":
        return "rgba(6, 182, 212, 0.6)"; // Cyan
      case "RELATED_TO":
        return "rgba(107, 114, 128, 0.5)"; // Gray for generic relation
      default:
        return "rgba(156, 163, 175, 0.4)"; // Default Gray
    }
  };

  // --- Process API Data Function ---
  const processApiData = (apiData: ApiGraphData): GraphData => {
    const processedNodes = (apiData.nodes || []).map(
      (node: ApiNode): GraphNode => ({
        ...node, // Spread original properties
        processedLabel: getNodeLabelString(node), // Generate the string label
        originalLabel: node.label, // Keep the original label object/string
        size: getNodeSize(node),
        color: typeColors[node.type] || typeColors.default,
        group: getNodeGroup(node),
        // x, y, z etc will be added by the graph engine
      })
    );

    const nodeMap = new Map(processedNodes.map((node) => [node.id, node]));

    const processedLinks = (apiData.relationships || [])
      .map((rel: ApiRelationship): GraphLink | null => {
        const sourceId = rel.sourceId || rel.source;
        const targetId = rel.targetId || rel.target;

        // Ensure both source and target nodes exist in our processed map
        if (nodeMap.has(sourceId) && nodeMap.has(targetId)) {
          return {
            source: sourceId, // Use ID strings, ForceGraph will resolve them
            target: targetId,
            type: rel.type,
            id: rel.id,
            properties: rel.properties || {},
            value: 1, // Default thickness, could be adjusted based on properties
            color: getLinkColor(rel.type),
          };
        } else {
          console.warn(
            `Skipping link ${rel.id} due to missing node(s): S:${sourceId} T:${targetId}`
          );
          return null; // Skip link if nodes are missing
        }
      })
      .filter((link): link is GraphLink => link !== null); // Filter out null links

    console.log(
      `Processed ${processedNodes.length} nodes and ${processedLinks.length} links`
    );
    return { nodes: processedNodes, links: processedLinks };
  };

  // --- Fetch Full Graph Data ---
  const fetchFullGraph = async (graphUserId: string) => {
    try {
      setIsLoadingGraph(true);
      setError(null);

      const response = await fetch(
        `http://localhost:8000/api/knowledge-graph/${graphUserId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const apiResult = await response.json();

      if (apiResult.success && apiResult.data) {
        const processedData = processApiData(apiResult.data);
        setFullGraphData(processedData); // Store the full graph
        setGraphData(processedData); // Set current view to full graph
        setGraphStats(apiResult.data.stats || {});

        // Process and store central concepts carefully
        const rawConcepts = apiResult.data.insights?.centralConcepts || [];
        console.log(
          "Raw central concepts from API:",
          JSON.stringify(rawConcepts)
        ); // Add log to inspect

        const processedCentralConcepts = rawConcepts
          .map((c: any) => {
            let name: string | null = null; // Start with null name
            const conceptValue = c.concept;
            const connections = c.connections || 0;

            if (typeof conceptValue === "string") {
              // Check if the string is the literal "[object Object]" or empty
              if (conceptValue.trim() && conceptValue !== "[object Object]") {
                name = conceptValue; // It's a valid string name
              } else {
                console.warn(
                  `Received invalid string concept name: "${conceptValue}". Skipping.`
                );
              }
            } else if (
              typeof conceptValue === "object" &&
              conceptValue !== null
            ) {
              // If it's an object, try to get the 'name' property
              if (
                typeof conceptValue.name === "string" &&
                conceptValue.name.trim()
              ) {
                name = conceptValue.name;
              } else {
                console.warn(
                  "Received concept object without a valid 'name' string property:",
                  conceptValue,
                  ". Skipping."
                );
              }
            } else {
              // Handle other unexpected types (null, undefined, number, etc.)
              console.warn(
                "Received unexpected type or value for central concept:",
                conceptValue,
                ". Skipping."
              );
            }

            // Only return an object if we successfully got a valid name
            if (name) {
              return { name, connections };
            } else {
              return null; // Indicate failure to process this concept
            }
          })
          .filter(
            (c: any): c is { name: string; connections: number } => c !== null
          ); // Filter out the null (failed) entries

        console.log(
          "Processed central concepts for UI:",
          processedCentralConcepts
        ); // Log processed concepts
        setCentralConcepts(processedCentralConcepts);
        setViewMode("full");
        setSelectedNode(null);

        // Reset zoom after data is loaded
        setTimeout(() => {
          graphRef.current?.zoomToFit(1000);
        }, 300);
      } else {
        console.error("Failed to fetch graph data:", apiResult.error);
        setError(
          `Failed to load knowledge graph data: ${
            apiResult.error || "Unknown error"
          }`
        );
        setFullGraphData({ nodes: [], links: [] }); // Clear data on error
        setGraphData({ nodes: [], links: [] });
      }
    } catch (err: any) {
      console.error("Error fetching knowledge graph data:", err);
      setError(
        `Failed to load knowledge graph. Please try again later. (${err.message})`
      );
      setFullGraphData({ nodes: [], links: [] }); // Clear data on error
      setGraphData({ nodes: [], links: [] });
    } finally {
      setIsLoadingGraph(false);
    }
  };

  // Initial load effect
  useEffect(() => {
    if (isUserLoading) return; // Wait until user loading is finished

    const graphUserId = userId || "demo-user"; // Use demo-user if userId is not available after loading
    if (!graphUserId) {
      setError("User ID is not available.");
      return;
    }
    if (userError) {
      setError(`User context error: ${userError}`);
      return;
    }

    fetchFullGraph(graphUserId);
  }, [userId, isUserLoading, userError]); // Rerun if user changes or error state changes

  // --- Handle Search ---
  useEffect(() => {
    const searchConcepts = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const graphUserId = userId || "demo-user";
        const response = await fetch(
          `http://localhost:8000/api/knowledge-graph/${graphUserId}/search?query=${encodeURIComponent(
            searchTerm
          )}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();

        if (data.success && data.data?.concepts) {
          // Expecting API nodes here, store them directly
          setSearchResults(data.data.concepts as ApiNode[]);
        } else {
          console.error("Failed to search concepts:", data.error);
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Error searching concepts:", err);
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchConcepts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, userId]);

  // --- Focus on a specific concept ---
  const focusOnConcept = async (conceptName: string) => {
    if (!conceptName) return;
    try {
      setIsLoadingGraph(true);
      setError(null);

      const graphUserId = userId || "demo-user";
      const response = await fetch(
        `http://localhost:8000/api/knowledge-graph/${graphUserId}/concept/${encodeURIComponent(
          conceptName
        )}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const apiResult = await response.json();

      if (apiResult.success && apiResult.data) {
        const processedData = processApiData(apiResult.data);
        setGraphData(processedData); // Update displayed data to focused subset
        setViewMode("focused");

        // Find the central node in the *new* dataset
        const centralNode = processedData.nodes.find(
          (node) =>
            node.type === "Concept" && node.processedLabel === conceptName
        );

        setSelectedNode(centralNode || null); // Select the found node

        // Zoom/Center the graph on the new subset
        setTimeout(() => {
          if (graphRef.current) {
            graphRef.current.zoomToFit(1000, 150); // Zoom to fit the focused subset with padding
            // Optional: If you want to center on the specific node *within* the subset view:
            // const nodeCoords = centralNode ? { x: centralNode.x, y: centralNode.y, z: centralNode.z } : { x: 0, y: 0, z: 0 };
            // if (centralNode && typeof nodeCoords.x === 'number') { // Check if coords are available
            //     graphRef.current.cameraPosition(nodeCoords, nodeCoords, 1000); // Look at the node
            // }
          }
        }, 300); // Delay to allow graph engine to potentially position nodes
      } else {
        console.error("Failed to fetch concept data:", apiResult.error);
        setError(
          `Failed to load concept data: ${apiResult.error || "Unknown error"}`
        );
      }
    } catch (err: any) {
      console.error("Error fetching concept data:", err);
      setError(
        `Failed to load concept data. Please try again later. (${err.message})`
      );
    } finally {
      setIsLoadingGraph(false);
    }
  };

  // --- Reset to full graph view ---
  const resetView = () => {
    if (fullGraphData.nodes.length > 0) {
      setGraphData(fullGraphData); // Restore the full graph from state
      setViewMode("full");
      setSelectedNode(null);
      setSearchTerm(""); // Clear search term
      setSearchResults([]); // Clear search results
      // Reset zoom
      setTimeout(() => {
        graphRef.current?.zoomToFit(1000);
      }, 300);
    } else {
      // If fullGraphData is somehow empty, trigger a refetch
      const graphUserId = userId || "demo-user";
      if (graphUserId && !isUserLoading && !userError) {
        console.warn("Full graph data was empty, re-fetching...");
        fetchFullGraph(graphUserId);
      } else {
        setError("Cannot reset view: No user ID or full graph data available.");
      }
    }
  };

  // --- Handle Node Click ---
  const handleNodeClick = (node: NodeObject) => {
    // node from the event might not have all our custom properties directly, find the full node object
    const clickedNode = graphData.nodes.find((n) => n.id === node.id);
    if (!clickedNode) return;

    setSelectedNode(clickedNode);

    // Only focus view if it's a concept node
    if (clickedNode.type === "Concept") {
      focusOnConcept(clickedNode.processedLabel);
    } else {
      // If not a concept, just select it and maybe center view slightly?
      if (graphRef.current && typeof node.x === "number") {
        graphRef.current.cameraPosition(
          { x: node.x || 0, y: node.y || 0, z: node.z || 0 }, // New camera position
          { x: node.x || 0, y: node.y || 0, z: node.z || 0 }, // Look-at position
          500 // Transition duration in milliseconds
        ); // Gently center view
        graphRef.current.zoomToFit(500, 100); // Slightly zoom in by fitting the graph with padding
      }
    }
  };

  // --- Rendering ---
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {" "}
      {/* Added background */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <FadeInSlide className="mb-12 text-center">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-500/30 text-purple-100 rounded-full mb-3">
              KNOWLEDGE COSMOS
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Your{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Code Cosmos
              </span>{" "}
              Universe
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Explore the knowledge graph of your codebase as a celestial
              universe of interconnected concepts, classes, and functions.
            </p>
          </FadeInSlide>

          {/* Loading indicator */}
          {(isUserLoading || isLoadingGraph) && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <span className="ml-3 text-white">
                Mapping your code cosmos...
              </span>
            </div>
          )}

          {/* Error message */}
          {/* Show error only if not loading */}
          {(error || userError) && !isUserLoading && !isLoadingGraph && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-md text-white">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-300">Error</h3>
                  {/* Prioritize component-specific error, fallback to user context error */}
                  <p className="mt-1 text-sm text-white/90">
                    {error || String(userError)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content - Show only when not loading and no critical errors */}
          {!isLoadingGraph &&
            !isUserLoading &&
            !(error && graphData.nodes.length === 0) &&
            !(userError && graphData.nodes.length === 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar with controls */}
                <div className="lg:col-span-1">
                  <FadeIn>
                    <div className="backdrop-blur-md bg-white/5 border border-white/15 rounded-xl shadow-xl sticky top-24">
                      {/* Search */}
                      <div className="p-4 border-b border-white/10">
                        <div className="relative">
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search concepts..."
                            className="w-full bg-black/20 border border-white/20 rounded-md pl-10 pr-4 py-2 text-white/90 placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:outline-none" // Adjusted styling
                          />
                          <svg
                            className="w-5 h-5 text-white/40 absolute left-3 top-2.5 pointer-events-none"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>

                        {/* Search results */}
                        {searchResults.length > 0 && (
                          <div className="mt-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                            {" "}
                            {/* Added scrollbar styling */}
                            <h4 className="text-xs uppercase text-white/50 mb-2 px-1">
                              Search Results
                            </h4>
                            <div className="space-y-1">
                              {searchResults.map((conceptNode) => {
                                const label = getNodeLabelString(conceptNode); // Process label for display
                                const connections =
                                  conceptNode.properties?.connectionCount ||
                                  (typeof conceptNode.label === "object" ? conceptNode.label.connectionCount : 0) ||
                                  0; // Get connection count if available
                                return (
                                  <button
                                    key={conceptNode.id}
                                    // Only focus concepts directly
                                    onClick={() =>
                                      conceptNode.type === "Concept"
                                        ? focusOnConcept(label)
                                        : alert(
                                            `Selected ${conceptNode.type}: ${label}`
                                          )
                                    }
                                    className="w-full flex items-center justify-between text-left px-3 py-1.5 rounded-md hover:bg-white/10 text-white/90 transition-colors group"
                                  >
                                    <span className="text-sm font-medium truncate group-hover:text-purple-300">
                                      {label}
                                    </span>
                                    {connections > 0 && (
                                      <span className="text-xs bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                                        {connections}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Central Concepts */}
                      <div className="p-4 border-b border-white/10">
                        <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-1.5">
                          <svg
                            className="w-4 h-4 text-purple-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                          </svg>
                          <span>Central Concepts</span>
                        </h3>
                        {centralConcepts.length > 0 ? (
                          <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                            {centralConcepts.slice(0, 7).map(
                              (
                                concept // Slice controls how many are shown
                              ) => (
                                <button
                                  key={concept.name} // Use processed name as key
                                  onClick={() => focusOnConcept(concept.name)}
                                  className="w-full flex items-center justify-between text-left px-3 py-2 rounded-md hover:bg-white/10 text-white/90 transition-colors group"
                                >
                                  <span className="text-sm font-medium truncate group-hover:text-purple-300">
                                    {concept.name}
                                  </span>
                                  <span className="text-xs bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                                    {concept.connections}
                                  </span>
                                </button>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-white/50 py-3 text-sm">
                            No central concepts identified yet.
                          </div>
                        )}
                      </div>

                      {/* Graph Stats */}
                      <div className="p-4 border-b border-white/10">
                        <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-1.5">
                          <svg
                            className="w-4 h-4 text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          <span>Graph Statistics</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Stats rendering seems okay, uses graphStats state */}
                          <div className="bg-black/20 border border-white/10 p-2 rounded-md text-center">
                            <div className="text-xs text-white/60">Nodes</div>
                            <div className="text-xl font-bold text-white">
                              {graphStats.totalNodes || 0}
                            </div>
                          </div>
                          <div className="bg-black/20 border border-white/10 p-2 rounded-md text-center">
                            <div className="text-xs text-white/60">Links</div>
                            <div className="text-xl font-bold text-white">
                              {graphStats.totalRelationships || 0}
                            </div>
                          </div>
                          <div className="bg-black/20 border border-white/10 p-2 rounded-md text-center">
                            <div className="text-xs text-white/60">
                              Concepts
                            </div>
                            <div className="text-xl font-bold text-white">
                              {graphStats.nodeTypes?.Concept || 0}
                            </div>
                          </div>
                          <div className="bg-black/20 border border-white/10 p-2 rounded-md text-center">
                            <div className="text-xs text-white/60">
                              Files/Docs
                            </div>
                            <div className="text-xl font-bold text-white">
                              {(graphStats.nodeTypes?.Document || 0) +
                                (graphStats.nodeTypes?.File || 0)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="p-4 border-b border-white/10">
                        {" "}
                        {/* Added border bottom */}
                        <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-1.5">
                          <svg
                            className="w-4 h-4 text-green-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Legend</span>
                        </h3>
                        <div className="space-y-1.5 text-sm max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                          {Object.entries(typeColors).map(
                            ([type, color]) =>
                              type !== "default" && (
                                <div
                                  key={type}
                                  className="flex items-center gap-2 px-1"
                                >
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: color }}
                                  ></div>
                                  <span className="text-white/80 text-xs">
                                    {type}
                                  </span>
                                </div>
                              )
                          )}
                        </div>
                      </div>

                      {/* Reset Button */}
                      <div className="p-4">
                        <button
                          onClick={resetView}
                          disabled={viewMode === "full"} // Disable if already in full view
                          className="w-full bg-purple-600/60 hover:bg-purple-600/80 transition-colors text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {viewMode === "focused"
                            ? "Show Full Graph"
                            : "Reset View"}
                        </button>
                      </div>
                    </div>
                  </FadeIn>
                </div>

                {/* Main content - Graph visualization */}
                <div className="lg:col-span-3">
                  <FadeIn>
                    <div className="backdrop-blur-md bg-black/20 border border-white/15 rounded-xl shadow-xl overflow-hidden">
                      {/* Header */}
                      <div className="border-b border-white/10 p-3 flex items-center justify-between bg-black/30">
                        {" "}
                        {/* Adjusted padding */}
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5">
                            {" "}
                            {/* Window dots */}
                            <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                          </div>
                          <div className="ml-2">
                            <h2 className="text-sm font-medium text-white/90 truncate max-w-xs md:max-w-md">
                              {" "}
                              {/* Added truncation */}
                              {viewMode === "focused" && selectedNode
                                ? `Exploring: ${selectedNode.processedLabel}`
                                : "Complete Knowledge Cosmos"}
                            </h2>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                            {viewMode === "focused"
                              ? "Focused View"
                              : "Full Graph"}
                          </span>
                        </div>
                      </div>

                      {/* Graph Visualization */}
                      <div className="relative bg-black/30">
                        {" "}
                        {/* Slightly transparent background for effect */}
                        <div className="h-[70vh] md:h-[800px] w-full">
                          {" "}
                          {/* Adjusted height */}
                          {graphData.nodes.length > 0 ? (
                            <ForceGraph3D
                              ref={graphRef}
                              graphData={graphData} // Pass the current graphData state
                              nodeLabel={(node: NodeObject) => {
                                // Use NodeObject type from import
                                const graphNode = node as GraphNode; // Cast to our extended type
                                return `${graphNode.processedLabel} (${graphNode.type})`;
                              }}
                              nodeColor={(node: NodeObject) =>
                                (node as GraphNode).color || typeColors.default
                              }
                              nodeVal={(node: NodeObject) =>
                                (node as GraphNode).size || 1
                              }
                              linkColor={(link: LinkObject) =>
                                (link as GraphLink).color ||
                                "rgba(255,255,255,0.2)"
                              }
                              linkWidth={1} // Slightly thinner links
                              linkDirectionalParticles={1} // Fewer particles
                              linkDirectionalParticleWidth={1.5}
                              linkDirectionalParticleSpeed={0.006} // Slower particles
                              backgroundColor="rgba(0,0,0,0)" // Transparent background
                              nodeThreeObject={(node: NodeObject) => {
                                const graphNode = node as GraphNode; // Cast
                                const sprite = new SpriteText(
                                  graphNode.processedLabel
                                );
                                sprite.color = graphNode.color || "#ffffff";
                                sprite.textHeight = Math.max(
                                  1.5,
                                  (graphNode.size || 3) * 0.5
                                ); // Adjust text height, ensure minimum size
                                sprite.backgroundColor = "rgba(0,0,0,0.5)"; // Semi-transparent background
                                sprite.padding = [2, 1]; // Adjust padding [y, x]
                                sprite.borderRadius = 2;
                                return sprite;
                              }}
                              nodeThreeObjectExtend={true} // Important: Keep node sphere and add label
                              onNodeClick={handleNodeClick} // Use the handler function
                              cooldownTicks={100} // Let it stabilize a bit longer
                              onEngineStop={() => {
                                console.log("Graph engine stopped.");
                                // Avoid zooming automatically on stop if view is focused
                                if (viewMode === "full" && graphRef.current) {
                                  // graphRef.current.zoomToFit(400, 100); // Zoom to fit with padding
                                }
                              }}
                              // Performance optimizations
                              enablePointerInteraction={true} // Allow clicking/hovering
                              enableNavigationControls={true} // Allow zooming/panning
                              showNavInfo={false} // Hide controls info text
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-white/50">
                              No graph data to display.
                            </div>
                          )}
                        </div>
                        {/* Overlay Node Info */}
                        {selectedNode && (
                          <div className="absolute bottom-4 right-4 w-64 md:w-72 backdrop-blur-xl bg-black/60 border border-white/20 rounded-xl p-4 text-white shadow-lg animate-fadeIn">
                            {" "}
                            {/* Added animation */}
                            <button
                              onClick={() => setSelectedNode(null)}
                              className="absolute top-2 right-2 text-white/50 hover:text-white transition-colors"
                              aria-label="Close node info"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            <h3 className="font-bold text-base md:text-lg mb-2 flex items-center gap-2 pr-6">
                              {" "}
                              {/* Added padding right for close button */}
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: selectedNode.color }}
                              ></div>
                              <span className="truncate">
                                {selectedNode.processedLabel}
                              </span>
                            </h3>
                            <div className="text-xs text-purple-300 mb-2 bg-purple-500/10 px-2 py-0.5 rounded inline-block">
                              Type: {selectedNode.type}
                            </div>
                            {selectedNode.properties &&
                              Object.keys(selectedNode.properties).length >
                                0 && (
                                <div className="mt-3 space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-1">
                                  <div className="text-xs uppercase text-white/50 mb-1">
                                    Properties
                                  </div>
                                  {Object.entries(selectedNode.properties).map(
                                    ([key, value]) =>
                                      key !== "id" &&
                                      key !== "referenceCount" &&
                                      key !== "importance" && ( // Filter out properties used elsewhere
                                        <div
                                          key={key}
                                          className="flex justify-between items-start"
                                        >
                                          <span className="text-xs text-white/70 mr-2 flex-shrink-0">
                                            {key}:
                                          </span>
                                          {/* Handle different value types more gracefully */}
                                          <span className="text-xs font-mono text-white/90 text-right break-all">
                                            {typeof value === "object"
                                              ? JSON.stringify(value)
                                              : String(value)}
                                          </span>
                                        </div>
                                      )
                                  )}
                                </div>
                              )}
                            {/* Show original label if it was an object */}
                            {typeof selectedNode.originalLabel === "object" &&
                              selectedNode.originalLabel !== null && (
                                <div className="mt-3 pt-2 border-t border-white/10 space-y-1 max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-1">
                                  <div className="text-xs uppercase text-white/50 mb-1">
                                    Raw Label Data
                                  </div>
                                  {Object.entries(
                                    selectedNode.originalLabel
                                  ).map(([key, value]) => (
                                    <div
                                      key={key}
                                      className="flex justify-between items-start"
                                    >
                                      <span className="text-xs text-white/70 mr-2 flex-shrink-0">
                                        {key}:
                                      </span>
                                      <span className="text-xs font-mono text-white/90 text-right break-all">
                                        {String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  </FadeIn>

                  {/* Concept Cards - Show only in full view */}
                  {viewMode === "full" && centralConcepts.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-white/80 mb-4">
                        Key Concepts
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {centralConcepts.slice(0, 3).map(
                          (
                            concept // Show top 3
                          ) => (
                            <div key={concept.name} className="col-span-1">
                              <Tilt3DCard className="h-full">
                                <div
                                  className="h-full backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl p-5 cursor-pointer transition-colors"
                                  onClick={() => focusOnConcept(concept.name)}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <FloatingElement amplitude={2} duration={4}>
                                      {" "}
                                      {/* Subtle float */}
                                      <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                                        <svg
                                          className="w-5 h-5 text-white"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.5"
                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                          />
                                        </svg>{" "}
                                        {/* Lightbulb icon */}
                                      </div>
                                    </FloatingElement>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-200">
                                      {concept.connections} links
                                    </span>
                                  </div>
                                  <h4 className="text-md font-bold text-white mb-2">
                                    {concept.name}
                                  </h4>
                                  <p className="text-sm text-white/70 line-clamp-2">
                                    {" "}
                                    {/* Limit description length */}
                                    Central concept with {
                                      concept.connections
                                    }{" "}
                                    connections to other nodes in the graph.
                                  </p>
                                  <div className="mt-4 text-right">
                                    <span className="text-purple-400 text-sm group-hover:text-purple-300 cursor-pointer font-medium">
                                      Explore →
                                    </span>
                                  </div>
                                </div>
                              </Tilt3DCard>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          {/* Placeholder if no data and not loading/error */}
          {!isLoadingGraph &&
            !isUserLoading &&
            !error &&
            !userError &&
            graphData.nodes.length === 0 && (
              <div className="text-center py-20 text-white/60">
                <p>No knowledge graph data found for this user.</p>
                <p className="text-sm mt-2">
                  Try interacting with the assistant or analyzing a repository.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
