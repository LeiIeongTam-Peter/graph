"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { graphData } from "./data";
import { colos } from "./data";

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

  // Handle node click to center, zoom, and highlight
  const handleNodeClick = (node: any) => {
    if (graphRef.current && node.x !== undefined && node.y !== undefined) {
      // Center on node position with 1000ms transition
      graphRef.current.centerAt(node.x, node.y, 1000);
      // Zoom to level 2 with 1000ms transition
      graphRef.current.zoom(2, 1000);

      // Toggle selection: if clicking the already selected node, deselect it
      setSelectedNode(selectedNode === node.id ? null : node.id);
    }
  };

  return (
    <div className="w-full h-full ">
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
        nodeVal={(node: any) => node.value / 4}
        // node color with opacity
        nodeColor={(node: any) => {
          // Set colors based on node type
          let color;

          if (node.type === "department") {
            color = colos[0];
          } else if (node.type === "fruit") {
            color = colos[1];
          } else if (node.type === "3c") {
            color = colos[2];
          } else if (node.type === "sports") {
            color = colos[3];
          } else if (node.type === "windows") {
            color = colos[4];
          } else if (node.type === "apple") {
            color = colos[5];
          } else if (node.type === "coffee") {
            color = colos[6];
          } else if (node.type === "orange") {
            color = colos[7];
          } else if (node.type === "banana") {
            color = colos[8];
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
              4 * (node.value / 4) + 2,
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
        linkLabel={(link: any) =>
          `${
            typeof link.source === "object" ? link.source.id : link.source
          } → ${
            typeof link.target === "object" ? link.target.id : link.target
          }: ${link.description}`
        }
        // link width based on visibility
        linkWidth={(link: any) => {
          // Make selected links thicker
          if (selectedNode && isLinkConnected(link)) {
            return 2; // Thicker for connected links
          }
          return 1; // Default width
        }}
        // link color with opacity
        linkColor={(link: any) => {
          // Define base colors for links
          const baseColor = "#888888"; // Default color

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
        linkDirectionalArrowLength={(link: any) => 5 + link.value / 100}
        // 箭頭顏色
        linkDirectionalArrowColor={() => "rgba(50, 50, 50, 0.8)"}
        // 箭頭位置 (0: start, 1: end)
        linkDirectionalArrowRelPos={0.5}
        // 箭頭粒子
        linkDirectionalParticles={(link: any) =>
          selectedNode && isLinkConnected(link) ? 3 : 0
        }
        // 箭頭粒子速度
        linkDirectionalParticleSpeed={(link: any) => link.value / 5000}
        // 箭頭粒子寬度
        linkDirectionalParticleWidth={(link: any) => link.value / 10}
        // 箭頭粒子顏色
        linkDirectionalParticleColor={() => "white"}
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
      />
    </div>
  );
}
