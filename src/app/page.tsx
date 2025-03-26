"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { graphData } from "./data";
import { colors } from "./data";
import { types } from "./data";

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
  // Add state to track selected node type for filtering
  const [selectedType, setSelectedType] = useState<string | null>(null);

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

    // Clear type filter
    setSelectedType(null);

    // Reset zoom and center if graph is available
    if (graphRef.current) {
      graphRef.current.centerAt(0, 0, 1000);
      graphRef.current.zoom(0.6, 1000);
    }
  };

  // Handle type filter click in legend
  const handleTypeClick = (type: string) => {
    // Toggle selection: if clicking the already selected type, deselect it
    setSelectedType(selectedType === type ? null : type);

    // Clear node selection when changing type filter
    setSelectedNode(null);

    // Reset zoom to show all filtered nodes
    if (graphRef.current) {
      graphRef.current.centerAt(0, 0, 1000);
      graphRef.current.zoom(0.4, 1000);
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Reset button */}
      <button
        onClick={handleReset}
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-white bg-opacity-80 text-gray-800 rounded-md shadow-md hover:bg-opacity-100 transition-all duration-200 font-medium"
      >
        Reset View
      </button>

      {/* Color Legend Sheet */}
      <div
        className="absolute bottom-4 right-4 z-10 bg-white bg-opacity-90 rounded-md shadow-md overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isLegendExpanded ? "300px" : "40px",
          width: "200px",
        }}
      >
        {/* Legend Header */}
        <div
          className="px-4 py-2 bg-gray-100 flex justify-between items-center cursor-pointer"
          onClick={() => setIsLegendExpanded(!isLegendExpanded)}
        >
          <h3 className="font-medium text-gray-800">Node Types</h3>
          <span className="text-gray-500">{isLegendExpanded ? "▼" : "▲"}</span>
        </div>

        {/* Legend Content */}
        <div className="p-3">
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
            {types.map((type, index) => (
              <div
                key={type}
                className={`flex items-center p-1 rounded hover:bg-gray-100 cursor-pointer ${
                  selectedType === type ? "bg-gray-200" : ""
                }`}
                onClick={() => handleTypeClick(type)}
              >
                <div
                  className="w-5 h-5 rounded-full mr-3 border border-gray-200"
                  style={{ backgroundColor: colors[index] }}
                ></div>
                <span className="text-sm text-gray-700 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ForceGraph2D
        graphData={
          selectedType
            ? {
                nodes: graphData.nodes.filter((node: any) =>
                  selectedType === "other"
                    ? !types.includes(node.entity?.type) || !node.entity?.type
                    : node.entity?.type === selectedType
                ),
                links: graphData.links.filter((link: any) => {
                  // Keep links where both source and target match the filter
                  const sourceNode =
                    typeof link.source === "object"
                      ? link.source
                      : graphData.nodes.find((n: any) => n.id === link.source);

                  const targetNode =
                    typeof link.target === "object"
                      ? link.target
                      : graphData.nodes.find((n: any) => n.id === link.target);

                  if (!sourceNode || !targetNode) return false;

                  const sourceMatches =
                    selectedType === "other"
                      ? !types.includes(sourceNode.entity?.type) ||
                        !sourceNode.entity?.type
                      : sourceNode.entity?.type === selectedType;

                  const targetMatches =
                    selectedType === "other"
                      ? !types.includes(targetNode.entity?.type) ||
                        !targetNode.entity?.type
                      : targetNode.entity?.type === selectedType;

                  // Only show links where both nodes match the selected type
                  return sourceMatches && targetMatches;
                }),
              }
            : graphData
        }
        backgroundColor="transparent"
        /*


        Node


        */
        // node 大小
        nodeRelSize={4}
        // hover show the title
        nodeLabel="title"
        // val to set node size
        nodeVal={(node: any) => node.degree * 2}
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

          // Apply opacity based on selection
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

          return false; // Return false to continue with default node rendering
        }}
        /*
        

        Link


        */
        // 定義連結標籤
        // linkLabel={(link: any) =>
        //   `${
        //     typeof link.source === "object" ? link.source.id : link.source
        //   } → ${
        //     typeof link.target === "object" ? link.target.id : link.target
        //   }${link.graph ? ` (${link.graph})` : ""}`
        // }
        // link width based on visibility
        // linkWidth={(link: any) => {
        //   // Make selected links thicker
        //   if (selectedNode && isLinkConnected(link)) {
        //     return 2; // Thicker for connected links
        //   }
        //   return 1; // Default width
        // }}
        // link color with opacity
        linkColor={(link: any) => {
          // Define base colors for links
          const baseColor = "#a3b4bd"; // Default color

          // If no node is selected, use normal opacity
          if (!selectedNode) {
            return baseColor;
          }

          // Apply opacity for unconnected links
          if (!isLinkConnected(link)) {
            return "rgba(136, 136, 136, 0.1)"; // Faded gray for unselected links
          }

          return baseColor; // Original color for connected links
        }}
        // Add directional arrows to links
        // linkDirectionalArrowLength={(link: any) =>
        //   selectedNode && isLinkConnected(link) ? 5 : 0
        // }
        // 箭頭顏色
        // linkDirectionalArrowColor={() => "gray"}
        // 箭頭位置 (0: start, 1: end)
        // linkDirectionalArrowRelPos={0.7}
        // 箭頭粒子
        linkDirectionalParticles={(link: any) =>
          selectedNode && isLinkConnected(link) ? 1 : 0
        }
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
        // Enable tree-like visualization
        // dagMode="radialout"
        dagLevelDistance={35}
        // Adjust force parameters for tree structure
        // linkDistance={40} // Longer distance between nodes
        // nodeStrength={-150} // Stronger repulsive force
        // linkStrength={0.8} // Stronger link force
      />
    </div>
  );
}
