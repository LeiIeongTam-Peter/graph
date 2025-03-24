"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

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
      graphRef.current.zoom(3, 1000);
    }
  };

  const graphData = {
    nodes: [
      { id: "1", title: "Node 1", value: 1 },
      { id: "2", title: "Node 2", value: 2 },
      { id: "3", title: "Node 3", value: 3 },
      { id: "4", title: "Node 4", value: 4 },
      { id: "5", title: "Node 5", value: 5 },
      { id: "6", title: "Node 6", value: 6 },
      { id: "7", title: "Node 7", value: 7 },
      { id: "8", title: "Node 8", value: 8 },
      { id: "9", title: "Node 9", value: 9 },
      { id: "10", title: "Node 10", value: 10 },
      { id: "11", title: "Node 11", value: 11 },
      { id: "12", title: "Node 12", value: 12 },
      { id: "13", title: "Node 13", value: 13 },
      { id: "14", title: "Node 14", value: 14 },
      { id: "15", title: "Node 15", value: 15 },
      { id: "16", title: "Node 16", value: 16 },
    ],
    links: [
      { source: "1", target: "2", value: 5, description: "Link 1-2" },
      { source: "2", target: "3", value: 10, description: "Link 2-3" },
      { source: "3", target: "4", value: 15, description: "Link 3-4" },
      { source: "4", target: "5", value: 20, description: "Link 4-5" },
      { source: "5", target: "1", value: 25, description: "Link 5-1" },
      { source: "6", target: "7", value: 30, description: "Link 6-7" },
      { source: "7", target: "8", value: 35, description: "Link 7-8" },
      { source: "8", target: "9", value: 40, description: "Link 8-9" },
      { source: "9", target: "10", value: 45, description: "Link 9-10" },
      { source: "10", target: "6", value: 50, description: "Link 10-6" },
      { source: "1", target: "6", value: 55, description: "Link 1-6" },
      { source: "11", target: "12", value: 55, description: "Link 11-12" },
      { source: "12", target: "13", value: 55, description: "Link 12-13" },
      { source: "13", target: "14", value: 55, description: "Link 13-14" },
      { source: "14", target: "15", value: 55, description: "Link 14-15" },
      { source: "15", target: "16", value: 55, description: "Link 15-16" },
      { source: "16", target: "11", value: 55, description: "Link 16-11" },
    ],
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
        nodeVal={(node) => node.value}
        // val to set node visibility: boolean
        // nodeVisibility={(node) => node.value > 5}
        // node color
        // nodeColor={(node) =>
        //   node.value > 4 ? "purple" : node.value > 2 ? "pink" : "blue"
        // }
        // randomly set node color by value, Only affects nodes without a color attribute.
        nodeAutoColorBy="value"
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
        linkDirectionalParticleColor={(link) => "rgba(50, 50, 50, 0.8)"}
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
