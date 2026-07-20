declare module "d3-force-3d" {
  export interface ForceCollide<NodeType = unknown> {
    (alpha: number): void;
    radius(radius: number | ((node: NodeType) => number)): this;
    strength(strength: number): this;
    iterations(n: number): this;
    initialize(nodes: NodeType[]): void;
  }

  export function forceCollide<NodeType = unknown>(
    radius?: number | ((node: NodeType) => number)
  ): ForceCollide<NodeType>;
}
