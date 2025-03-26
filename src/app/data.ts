import { Node, Link } from "./type";

// Helper function to generate links from a parent node to multiple child nodes
const generateTreeLinks = (
  parentId: string,
  childStartId: number,
  childCount: number,
  baseId: string,
  graph: string
) => {
  return Array.from({ length: childCount }, (_, i) => ({
    id: `${baseId}_${i + 1}`,
    source: parentId,
    target: String(childStartId + i),
    graph: graph,
  }));
};

// Helper function to create nodes for a specific community
const createCommunityNodes = (
  communityIndex: number,
  nodeType: string,
  namePrefix: string
) => {
  const startId = (communityIndex - 1) * 100 + 1;

  return Array.from({ length: 100 }, (_, i) => ({
    entity: {
      type: nodeType,
    },
    id: String(startId + i),
    title: `${namePrefix} ${i + 1}`,
    community: communityIndex,
    level: i < 5 ? 3 : i < 20 ? 2 : 1, // Top nodes have higher level
    degree: i < 5 ? 5 : i < 20 ? 3 : Math.floor(Math.random() * 2) + 1, // Top nodes have higher degree
  }));
};

// Helper function to generate cross-community links
const generateCrossCommunityLinks = (
  sourceComm: number,
  targetComm: number,
  count: number,
  baseId: string
) => {
  // Only connect from top-level nodes (first 5 nodes) of source community
  const sourceIds = Array.from({ length: 5 }, (_, i) =>
    String((sourceComm - 1) * 100 + i + 1)
  );

  // Connect to random nodes in target community
  const targetStart = (targetComm - 1) * 100 + 1;

  return Array.from({ length: count }, (_, i) => ({
    id: `${baseId}_${i + 1}`,
    source: sourceIds[i % sourceIds.length], // Distribute connections among top nodes
    target: String(Math.floor(Math.random() * 100) + targetStart),
    graph: `cross_${sourceComm}_${targetComm}`,
  }));
};

// Define the node types for the 20 communities
const communityTypes = [
  "department",
  "fruit",
  "3c",
  "sports",
  "windows",
  "apple",
  "coffee",
  "orange",
  "banana",
  "department",
  "fruit",
  "3c",
  "sports",
  "windows",
  "apple",
  "coffee",
  "orange",
  "banana",
  "department",
  "fruit",
];

// Define community names
const communityNames = [
  "Department",
  "Team",
  "Project",
  "Product",
  "Customer",
  "Partner",
  "Supplier",
  "Market",
  "Region",
  "Organization",
  "Division",
  "Group",
  "Initiative",
  "Service",
  "Client",
  "Vendor",
  "Industry",
  "Territory",
  "Unit",
  "Segment",
];

// Create 2000 nodes across 20 communities
export const graphData: { nodes: Node[]; links: Link[] } = {
  nodes: [
    // Generate nodes for all 20 communities
    ...Array.from({ length: 20 }, (_, i) =>
      createCommunityNodes(i + 1, communityTypes[i], communityNames[i])
    ).flat(),
  ],

  links: [
    // Each community gets a tree structure
    ...Array.from({ length: 20 }, (_, communityIndex: number) => {
      const startId = communityIndex * 100 + 1;
      const links = [];

      // Track which nodes have been connected
      const connectedNodes = new Set<number>();

      // Level 1: Root nodes (5 per community) connect to level 2 nodes
      for (let rootIdx = 0; rootIdx < 5; rootIdx++) {
        const rootNodeId = startId + rootIdx;
        const rootId = String(rootNodeId);
        connectedNodes.add(rootNodeId);

        // Each root connects to 3-4 level 2 nodes
        const level2Count = 3 + (rootIdx % 2); // 3 or 4 children
        const level2StartId = startId + 5 + rootIdx * level2Count;

        // Add connections from root to level 2 nodes
        const level2Links = generateTreeLinks(
          rootId,
          level2StartId,
          level2Count,
          `link_tree_l1_${startId + rootIdx}`,
          String(communityIndex + 1)
        );

        // Add child nodes to connected set
        for (let i = 0; i < level2Count; i++) {
          connectedNodes.add(level2StartId + i);
        }

        links.push(...level2Links);

        // Level 2: Each level 2 node connects to 3-5 level 3 nodes
        for (let l2Idx = 0; l2Idx < level2Count; l2Idx++) {
          const parentNodeId = level2StartId + l2Idx;
          const parentId = String(parentNodeId);
          const level3Count = 3 + Math.floor(Math.random() * 3); // 3-5 children
          const level3StartId =
            startId + 20 + rootIdx * 15 + l2Idx * level3Count;

          // Ensure we don't exceed the community's node range
          if (level3StartId + level3Count <= startId + 99) {
            const level3Links = generateTreeLinks(
              parentId,
              level3StartId,
              level3Count,
              `link_tree_l2_${parentId}`,
              String(communityIndex + 1)
            );

            // Add child nodes to connected set
            for (let i = 0; i < level3Count; i++) {
              connectedNodes.add(level3StartId + i);
            }

            links.push(...level3Links);
          }
        }
      }

      // Add some connections between the top 5 nodes to form a connected graph at the top
      for (let i = 0; i < 4; i++) {
        links.push({
          id: `link_top_${startId + i}`,
          source: String(startId + i),
          target: String(startId + i + 1),
          graph: String(communityIndex + 1),
        });
      }

      // Connect any remaining isolated nodes to the closest root or level 2 node
      for (let nodeId = startId; nodeId < startId + 100; nodeId++) {
        if (!connectedNodes.has(nodeId)) {
          // Connect to a random root node
          const rootNodeIdx = Math.floor(Math.random() * 5);
          const rootNodeId = startId + rootNodeIdx;

          links.push({
            id: `link_isolated_${nodeId}`,
            source: String(rootNodeId),
            target: String(nodeId),
            graph: String(communityIndex + 1),
          });

          connectedNodes.add(nodeId);
        }
      }

      return links;
    }).flat(),

    // Cross-community links between adjacent communities (1→2, 2→3, etc.)
    ...Array.from({ length: 19 }, (_, i) =>
      generateCrossCommunityLinks(
        i + 1,
        i + 2,
        6, // Fewer links to reduce clutter with larger dataset
        `link_adj_${i + 1}_${i + 2}`
      )
    ).flat(),

    // Link from community 20 back to 1 to complete the circle
    ...generateCrossCommunityLinks(20, 1, 6, "link_adj_20_1"),

    // Cross-community links between non-adjacent communities (more sparse with larger graph)
    ...Array.from({ length: 20 }, (_, i) => {
      const sourceComm = i + 1;

      // For each community, create links to just 1 non-adjacent community
      return Array.from({ length: 1 }, (_, j) => {
        // Select a target community that's not adjacent and is at least 3 steps away
        const targetComm =
          (sourceComm + 3 + Math.floor(Math.random() * 7)) % 20 || 20;

        // Generate links between these communities
        return generateCrossCommunityLinks(
          sourceComm,
          targetComm,
          5, // Fewer links to reduce clutter
          `link_cross_${sourceComm}_${targetComm}`
        );
      }).flat();
    }).flat(),

    // Additional links for specific important connections (reduced for performance)
    ...Array.from({ length: 40 }, (_, i) => {
      // Choose nodes from different parts of the communities
      const sourceComm = Math.floor(i / 2) + 1;
      const targetComm = (sourceComm + 5) % 20 || 20;

      // Connect specific important nodes (usually from the top of each community)
      return {
        id: `link_important_${i + 1}`,
        source: String((sourceComm - 1) * 100 + (i % 5) + 1), // Top 5 nodes
        target: String(
          (targetComm - 1) * 100 + Math.floor(Math.random() * 10) + 1
        ), // Top 10 nodes
        graph: "important",
      };
    }),

    // Extra links to ensure all communities are well-connected to each other
    ...Array.from({ length: 20 }, (_, i) => {
      const sourceComm = i + 1;
      const links = [];

      // Connect to 3 random communities (different strategy than above)
      for (let j = 0; j < 3; j++) {
        const targetComm = Math.floor(Math.random() * 20) + 1;
        if (targetComm !== sourceComm) {
          // Connect a random node from each community (including leaf nodes)
          const sourceNode =
            (sourceComm - 1) * 100 + Math.floor(Math.random() * 100) + 1;
          const targetNode =
            (targetComm - 1) * 100 + Math.floor(Math.random() * 100) + 1;

          links.push({
            id: `link_extra_${sourceComm}_${targetComm}_${j}`,
            source: String(sourceNode),
            target: String(targetNode),
            graph: "extra",
          });
        }
      }

      return links;
    }).flat(),
  ],
};

export const colos = [
  "#f87171", // red-400 (department)
  "#fb923c", // orange-400 (fruit)
  "#fbbf24", // amber-400 (3c)
  "#facc15", // yellow-400 (sports)
  "#a3e635", // lime-400 (windows)
  "#4ade80", // green-400 (apple)
  "#2dd4bf", // teal-400 (coffee)
  "#22d3ee", // cyan-400 (orange)
  "#60a5fa", // blue-400 (banana)
  "#818cf8", // indigo-400 (default)
  "#a78bfa", // violet-400
  "#c084fc", // purple-400
  "#e879f9", // fuchsia-400
  "#f472b6", // pink-400
  "#94a3b8", // slate-400
];
