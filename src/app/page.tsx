"use client";

import React, { useRef } from "react";
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

  // Handle node click to center and zoom
  const handleNodeClick = (node: any) => {
    if (graphRef.current) {
      // Center on node position with 1000ms transition
      graphRef.current.centerAt(node.x, node.y, 1000);
      // Zoom to level 3 with 2000ms transition
      graphRef.current.zoom(2, 1000);
    }
  };

  return (
    <div className="w-full h-full ">
      <ForceGraph2D
        graphData={graphData}
        // node move area, default full screen
        // width={window.innerWidth}
        // height={window.innerHeight}
        backgroundColor="transparent"
        /*


        Node


        */
        // node 大小
        nodeRelSize={4}
        // hover show the title
        nodeLabel="title"
        // val to set node size
        nodeVal={(node) => node.value / 4}
        // val to set node visibility: boolean
        // nodeVisibility={(node) => node.value > 5}
        // node color
        nodeColor={(node) => {
          // Set colors based on node type
          if (node.type === "department") {
            return colos[0];
          } else if (node.type === "fruit") {
            return colos[1];
          } else if (node.type === "3c") {
            return colos[2];
          } else if (node.type === "sports") {
            return colos[3];
          } else if (node.type === "windows") {
            return colos[4];
          } else if (node.type === "apple") {
            return colos[5];
          } else if (node.type === "coffee") {
            return colos[6];
          } else if (node.type === "orange") {
            return colos[7];
          } else if (node.type === "banana") {
            return colos[8];
          } else {
            return "#666666"; // Default color
          }
        }}
        // randomly set node color by value, Only affects nodes without a color attribute.
        // nodeAutoColorBy="value"
        /*
        

        Link


        */
        // 定義連結標籤
        linkLabel={(link) =>
          `${link.source} → ${link.target}: ${link.description}`
        }
        // 寬度
        // linkWidth={(link) => link.value / 100}
        // 顏色
        // linkColor={() => "rgba(0, 127, 255, 0.5)"}
        // 顏色
        linkAutoColorBy="value"
        // link 是否顯示
        // linkVisibility={(link) => {
        //   // Make sure we're returning a proper boolean
        //   const isVisible = typeof link.value === "number" && link.value > 20;
        //   return isVisible;
        // }}
        // link line dash (array of line, gap lengths)
        // linkLineDash={[10, 1]}
        // link 曲線
        // linkCurvature={(link) => link.value / 10}
        // Add directional arrows to links
        linkDirectionalArrowLength={(link) => 5 + link.value / 100}
        // 箭頭顏色
        linkDirectionalArrowColor={() => "rgba(50, 50, 50, 0.8)"}
        // 箭頭位置 (0: start, 1: end)
        linkDirectionalArrowRelPos={0.5}
        // 箭頭粒子
        linkDirectionalParticles={2}
        // 箭頭粒子速度
        linkDirectionalParticleSpeed={(link) => link.value / 5000}
        // 箭頭粒子寬度
        linkDirectionalParticleWidth={(link) => link.value / 10}
        // 箭頭粒子顏色
        linkDirectionalParticleColor={(link) => "gray"}
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
        onZoom={(event) => {
          console.log("asdad");
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
