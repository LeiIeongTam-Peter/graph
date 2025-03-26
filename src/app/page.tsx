"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { graphData } from "./data";
import { colors } from "./data";
import { types } from "./data";

// Import ShadCN components
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Check, RotateCcw } from "lucide-react";

// Dynamically import ForceGraph2D with ssr disabled
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      Loading graph...
    </div>
  ),
});

export default function Page() {
  // Store reference to the graph
  const graphRef = useRef<any>(null);
  // Add state to track selected node
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  // Add state to track if the legend is expanded
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(true);
  // Replace single type selection with multiple selections using Set
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<Set<string>>(
    new Set()
  );

  // Function to check if a node is connected to the selected node
  const isNodeConnected = (nodeId: string) => {
    if (!selectedNode) return false;

    // Check if this node is connected to the selected node via any link
    return graphData.links.some((link: any) => {
      const sourceId =
        typeof link.source === "object" ? link.source.id : link.source;
      const targetId =
        typeof link.target === "object" ? link.target.id : link.target;

      return (
        (sourceId === selectedNode && targetId === nodeId) ||
        (targetId === selectedNode && sourceId === nodeId)
      );
    });
  };

  // Function to check if a link is connected to the selected node
  const isLinkConnected = (link: any) => {
    if (!selectedNode) return false;

    const sourceId =
      typeof link.source === "object" ? link.source.id : link.source;
    const targetId =
      typeof link.target === "object" ? link.target.id : link.target;

    // Check if this link is connected to the selected node
    return sourceId === selectedNode || targetId === selectedNode;
  };

  // Function to calculate the appropriate zoom level based on node connections
  const calculateZoomLevel = (nodeId: string) => {
    // Get all connected nodes
    const connectedNodes: any[] = [];
    const directConnections = graphData.links.filter((link: any) => {
      const sourceId =
        typeof link.source === "object" ? link.source.id : link.source;
      const targetId =
        typeof link.target === "object" ? link.target.id : link.target;

      return sourceId === nodeId || targetId === nodeId;
    });

    // Find the connected node objects
    directConnections.forEach((link: any) => {
      const sourceId =
        typeof link.source === "object" ? link.source.id : link.source;
      const targetId =
        typeof link.target === "object" ? link.target.id : link.target;

      // Add the node that isn't the selected one
      const connectedNodeId = sourceId === nodeId ? targetId : sourceId;
      const connectedNode = graphData.nodes.find(
        (n: any) => n.id === connectedNodeId
      );

      if (connectedNode) {
        connectedNodes.push(connectedNode);
      }
    });

    // Default zoom level
    if (connectedNodes.length === 0) return 3;

    // Calculate distances from the clicked node to all connected nodes
    const clickedNodeObj = graphData.nodes.find((n: any) => n.id === nodeId);
    if (
      !clickedNodeObj ||
      clickedNodeObj.x === undefined ||
      clickedNodeObj.y === undefined
    )
      return 3;

    // At this point we know x and y are defined
    const nodeX = clickedNodeObj.x as number;
    const nodeY = clickedNodeObj.y as number;

    let maxDistance = 0;
    connectedNodes.forEach((node: any) => {
      if (node.x !== undefined && node.y !== undefined) {
        const distance = Math.sqrt(
          Math.pow(nodeX - node.x, 2) + Math.pow(nodeY - node.y, 2)
        );
        maxDistance = Math.max(maxDistance, distance);
      }
    });

    // Calculate zoom level inversely proportional to the max distance
    // More distance = less zoom, to fit all nodes in view
    // Use a base zoom level of 7 for very close nodes
    // Reduced the divisor factor to make zoom closer
    const zoomLevel = Math.max(1.5, Math.min(10, 300 / (maxDistance + 20)));

    return zoomLevel;
  };

  // Handle node click to center, zoom, and highlight
  const handleNodeClick = (node: any) => {
    if (graphRef.current && node.x !== undefined && node.y !== undefined) {
      // Toggle selection: if clicking the already selected node, deselect it
      const newSelectedNode = selectedNode === node.id ? null : node.id;
      setSelectedNode(newSelectedNode);

      // Center on node position with 1000ms transition
      graphRef.current.centerAt(node.x, node.y, 1000);

      if (newSelectedNode) {
        // Calculate dynamic zoom level based on node connections
        const zoomLevel = calculateZoomLevel(node.id);
        // Zoom with 1000ms transition
        graphRef.current.zoom(zoomLevel, 1000);
      } else {
        // If deselecting, zoom out to default
        graphRef.current.zoom(1, 1000);
      }
    }
  };

  // Handle reset button click
  const handleReset = () => {
    // Clear node selection
    setSelectedNode(null);
    // Clear selected node types
    setSelectedNodeTypes(new Set());

    // Reset zoom and center if graph is available
    if (graphRef.current) {
      graphRef.current.centerAt(0, 0, 1000);
      graphRef.current.zoom(0.6, 1000);
    }
  };

  // Handle checkbox toggle for a node type
  const handleNodeTypeToggle = (type: string) => {
    setSelectedNodeTypes((prevSelectedTypes) => {
      const newSelectedTypes = new Set(prevSelectedTypes);
      // Toggle the selection
      if (newSelectedTypes.has(type)) {
        newSelectedTypes.delete(type);
      } else {
        newSelectedTypes.add(type);
      }

      // If any type is selected, clear node selection
      if (newSelectedTypes.size > 0) {
        setSelectedNode(null);
      }

      // Focus on relevant nodes when changing type selection
      if (graphRef.current) {
        // If we just added a type and it's the only type selected
        if (newSelectedTypes.has(type) && newSelectedTypes.size === 1) {
          // Find all nodes of this type
          const nodesOfType = graphData.nodes.filter(
            (node: any) => node.entity?.type === type
          );

          if (nodesOfType.length > 0) {
            // Center the graph at the position of the first node of this type
            const firstNode = nodesOfType[0];
            if (firstNode.x !== undefined && firstNode.y !== undefined) {
              graphRef.current.centerAt(firstNode.x, firstNode.y, 1000);

              // Calculate appropriate zoom level based on the number and spread of nodes
              const zoomLevel = Math.max(
                0.8,
                3 - Math.log(nodesOfType.length) / 2
              );
              graphRef.current.zoom(zoomLevel, 1000);
            }
          }
        } else if (newSelectedTypes.size === 0) {
          // If all types are deselected, reset view
          graphRef.current.zoom(0.6, 1000);
        }
      }

      return newSelectedTypes;
    });
  };

  // Helper function to check if a node type is selected
  const isNodeTypeSelected = (type: string) => {
    return selectedNodeTypes.has(type);
  };

  return (
    <div className="w-full h-full relative">
      {/* Reset button using ShadCN Button */}
      <Button
        onClick={handleReset}
        variant="outline"
        size="sm"
        className="absolute top-4 left-4 z-10 bg-white/90 hover:bg-white/100 transition-all duration-200 shadow-md"
      >
        <RotateCcw className="h-4 w-4 mr-1" />
        Reset View
      </Button>

      {/* Color Legend Sheet using ShadCN Collapsible */}
      <div className="absolute bottom-4 right-4 z-10 w-[220px]">
        <Collapsible
          open={isLegendExpanded}
          onOpenChange={setIsLegendExpanded}
          className="border rounded-md shadow-md bg-white bg-opacity-90"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 group">
            <h3 className="text-sm font-medium">Node Types</h3>
            <div className="text-gray-500">
              {isLegendExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="px-4 pb-4">
            <ScrollArea className="h-[200px] rounded-md">
              <div className="space-y-1 p-1">
                {types.map((type, index) => (
                  <div
                    key={type}
                    className={cn(
                      "flex items-center p-2 rounded-md cursor-pointer transition-colors",
                      "hover:bg-gray-100",
                      isNodeTypeSelected(type) ? "bg-gray-200" : ""
                    )}
                    onClick={() => handleNodeTypeToggle(type)}
                  >
                    <div
                      className="flex h-5 w-5 items-center justify-center rounded border border-gray-300 mr-3 flex-shrink-0 bg-white"
                      style={{
                        borderColor: isNodeTypeSelected(type)
                          ? colors[index]
                          : undefined,
                        borderWidth: isNodeTypeSelected(type) ? "2px" : "1px",
                      }}
                    >
                      {isNodeTypeSelected(type) && (
                        <Check
                          className="h-3.5 w-3.5"
                          style={{ color: colors[index] }}
                        />
                      )}
                    </div>
                    <div
                      className="w-4 h-4 rounded-full mr-3 border border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: colors[index] }}
                    ></div>
                    <span className="text-sm text-gray-700 capitalize">
                      {type}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <ForceGraph2D
        graphData={graphData}
        backgroundColor="transparent"
        /*


        Node


        */
        // node 大小
        nodeRelSize={4}
        // hover show the title
        nodeLabel="title"
        // val to set node size
        nodeVal={(node: any) => {
          // If a type is selected and this node is not of that type, set size to 0 to hide it
          if (
            selectedNodeTypes.size > 0 &&
            !selectedNodeTypes.has(node.entity?.type)
          ) {
            return 0; // Make the node invisible
          }
          // Make nodes of selected type slightly larger
          if (selectedNodeTypes.has(node.entity?.type)) {
            return node.degree * 2.5; // Increase size for selected type
          }
          return node.degree * 2;
        }}
        // node color with opacity
        nodeColor={(node: any) => {
          // Set colors based on node type
          let color;
          const nodeType = node.entity?.type;

          if (nodeType === "department") {
            color = colors[0];
          } else if (nodeType === "fruit") {
            color = colors[1];
          } else if (nodeType === "3c") {
            color = colors[2];
          } else if (nodeType === "sports") {
            color = colors[3];
          } else if (nodeType === "windows") {
            color = colors[4];
          } else if (nodeType === "apple") {
            color = colors[5];
          } else if (nodeType === "coffee") {
            color = colors[6];
          } else if (nodeType === "orange") {
            color = colors[7];
          } else if (nodeType === "banana") {
            color = colors[8];
          } else {
            color = "#666666"; // Default color
          }

          // Check for type filtering with multi-selection
          if (selectedNodeTypes.size > 0) {
            // If node types are selected, hide nodes of other types
            if (!selectedNodeTypes.has(nodeType)) {
              return "rgba(0,0,0,0)"; // Fully transparent (hidden)
            }
            // Nodes of selected types keep full opacity
            return color;
          }

          // If no type is selected, apply node selection logic
          if (!selectedNode) {
            return color; // Full opacity when no selection
          }

          // Apply opacity for nodes that aren't selected or connected
          if (node.id !== selectedNode && !isNodeConnected(node.id)) {
            // Parse color to rgba with reduced opacity
            if (color.startsWith("#")) {
              const r = parseInt(color.slice(1, 3), 16);
              const g = parseInt(color.slice(3, 5), 16);
              const b = parseInt(color.slice(5, 7), 16);
              return `rgba(${r}, ${g}, ${b}, 0.2)`;
            }
            return color; // Fallback
          }

          return color; // Selected or connected nodes keep original color
        }}
        // Use canvasObjectMode to overlay custom rendering
        nodeCanvasObjectMode={() => "before"}
        // Add a highlight for the selected node
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          // If a type is selected and this node is not of selected types, skip rendering
          if (
            selectedNodeTypes.size > 0 &&
            !selectedNodeTypes.has(node.entity?.type)
          ) {
            return false;
          }

          // If this is the selected node, draw a highlight ring
          if (selectedNode && node.id === selectedNode) {
            ctx.beginPath();
            ctx.arc(
              node.x || 0,
              node.y || 0,
              4 * (node.degree * 2) + 2,
              0,
              2 * Math.PI
            );
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.fill();
          }

          // If this is a node of a selected type, draw a subtle highlight
          if (selectedNodeTypes.has(node.entity?.type)) {
            ctx.beginPath();
            ctx.arc(
              node.x || 0,
              node.y || 0,
              4 * (node.degree * 2) + 1,
              0,
              2 * Math.PI
            );
            ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            ctx.fill();
          }

          return false; // Return false to continue with default node rendering
        }}
        /*
        

        Link


        */
        // link color with opacity
        linkColor={(link: any) => {
          // Define base colors for links
          const baseColor = "#a3b4bd"; // Default color

          // If node types are selected, check if this link connects nodes of those types
          if (selectedNodeTypes.size > 0) {
            const sourceNode =
              typeof link.source === "object"
                ? link.source
                : graphData.nodes.find((n: any) => n.id === link.source);
            const targetNode =
              typeof link.target === "object"
                ? link.target
                : graphData.nodes.find((n: any) => n.id === link.target);

            const sourceType = sourceNode?.entity?.type;
            const targetType = targetNode?.entity?.type;

            // Only show links where BOTH nodes are of the selected types
            if (
              !selectedNodeTypes.has(sourceType) ||
              !selectedNodeTypes.has(targetType)
            ) {
              return "rgba(0,0,0,0)"; // Fully transparent (hidden)
            }

            // If both nodes are of selected types, show the link
            return baseColor;
          }

          // If no node type is selected, follow the regular node selection logic
          if (!selectedNode) {
            return baseColor;
          }

          // Apply opacity for unconnected links
          if (!isLinkConnected(link)) {
            return "rgba(136, 136, 136, 0.1)"; // Faded gray for unselected links
          }

          return baseColor; // Original color for connected links
        }}
        // 箭頭粒子
        linkDirectionalParticles={(link: any) => {
          // Show particles for links of selected node types
          if (selectedNodeTypes.size > 0) {
            const sourceNode =
              typeof link.source === "object"
                ? link.source
                : graphData.nodes.find((n: any) => n.id === link.source);
            const targetNode =
              typeof link.target === "object"
                ? link.target
                : graphData.nodes.find((n: any) => n.id === link.target);

            const sourceType = sourceNode?.entity?.type;
            const targetType = targetNode?.entity?.type;

            // Only show particles for links where both nodes are of the selected types
            if (
              selectedNodeTypes.has(sourceType) &&
              selectedNodeTypes.has(targetType)
            ) {
              return 1;
            }
            return 0;
          }

          // Otherwise follow the regular node selection logic
          return selectedNode && isLinkConnected(link) ? 1 : 0;
        }}
        // 箭頭粒子速度
        linkDirectionalParticleSpeed={() => 0.01}
        // 箭頭粒子寬度
        linkDirectionalParticleWidth={6}
        // 箭頭粒子顏色
        linkDirectionalParticleColor={() => "#768d9a"}
        /*


        Render control


        */
        // 自動暫停重繪
        autoPauseRedraw={true}
        // 最小縮放
        minZoom={0.1}
        // 最大縮放
        maxZoom={10}
        // on zoom action
        onZoom={() => {
          console.log("zoom action");
        }}
        /*


        interaction
 
 
        */
        ref={graphRef}
        onNodeClick={handleNodeClick}
        onNodeRightClick={(node) => {
          console.log(node);
        }}
        onNodeHover={(node) => {
          console.log(node);
        }}
        // Performance optimizations for large graph
        cooldownTicks={500}
        cooldownTime={25000}
        d3AlphaDecay={0.01}
        d3VelocityDecay={0.25}
        warmupTicks={200} // More ticks for initial layout of 2000 nodes
        dagLevelDistance={35}
      />
    </div>
  );
}
