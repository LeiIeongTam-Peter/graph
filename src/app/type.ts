export interface Node {
  entity: {
    type: string;
  };
  id: string;
  title: string;
  community: number;
  level: number;
  degree: number;
  x?: number; // Optional x coordinate for graph positioning
  y?: number; // Optional y coordinate for graph positioning
}
export interface Link {
  id: string;
  source: string;
  target: string;
  graph: string;
}
