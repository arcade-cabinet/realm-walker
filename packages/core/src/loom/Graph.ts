export type NodeId = string;

export interface WorldNode {
    id: NodeId;
    name: string;
    description: string;
    theme: string; // e.g., "Frozen", "Techno"
    entities: string[]; // Entity IDs present in this node
}

export interface WorldEdge {
    id: string;
    from: NodeId;
    to: NodeId;
    description: string; // e.g., "A narrow mountain pass"
    travelTime: number; // Ticks to cross
}

export class WorldGraph {
    nodes: Map<NodeId, WorldNode> = new Map();
    edges: WorldEdge[] = [];
    activeNodeId: NodeId | null = null;

    constructor() { }

    addNode(node: WorldNode) {
        this.nodes.set(node.id, node);
        if (!this.activeNodeId) this.activeNodeId = node.id;
    }

    addEdge(edge: WorldEdge) {
        this.edges.push(edge);
    }

    getActiveNode(): WorldNode | undefined {
        if (!this.activeNodeId) return undefined;
        return this.nodes.get(this.activeNodeId);
    }

    getExits(nodeId: NodeId): WorldEdge[] {
        return this.edges.filter(e => e.from === nodeId);
    }
}
