export interface Node {
  entity: {
    type: string;
  };
  id: string;
  title: string;
  community: number;
  level: number;
  degree: number;
}
export interface Link {
  id: string;
  source: string;
  target: string;
  graph: string;
}
