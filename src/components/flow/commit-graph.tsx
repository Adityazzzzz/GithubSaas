'use client'
import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css'; 
import CommitNode from './commit-node';
import dagre from 'dagre';
import { useTheme } from 'next-themes';

// 1. Mock Data
const initialCommits = [
    { id: '1', message: 'Initial commit', author: 'Aditya', hash: '8a2b9c', parentId: null },
    { id: '2', message: 'Setup Shadcn UI', author: 'Aditya', hash: '9d3f1a', parentId: '1' },
    { id: '3', message: 'Add Prisma Schema', author: 'Aditya', hash: '2b4c6e', parentId: '2' },
    { id: '4', message: 'Feat: Auth implementation', author: 'Aditya', hash: '5f8e2d', parentId: '2' }, 
    { id: '5', message: 'Fix: Database connection', author: 'Aditya', hash: '1a7b9c', parentId: '3' },
    { id: '6', message: 'Merge pull request #1', author: 'Aditya', hash: '3c5d8e', parentId: '4' }, 
];

// 2. Dagre Layout Helper
const getLayoutedElements = (nodes: any[], edges: any[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    
    // ✅ FIX: Required for dagre to work with edges
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: 'TB' }); // Top to Bottom layout

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 200, height: 80 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.position = {
            x: nodeWithPosition.x - 100, // Center adjust based on width
            y: nodeWithPosition.y - 40,  // Center adjust based on height
        };
    });

    return { nodes, edges };
};

// 3. Process Data
const processCommits = () => {
    const nodes = initialCommits.map((commit) => ({
        id: commit.id,
        type: 'commitNode',
        data: { 
            message: commit.message, 
            hash: commit.hash, 
            author: commit.author,
            authorAvatar: 'https://github.com/shadcn.png' 
        },
        position: { x: 0, y: 0 }
    }));

    const edges = initialCommits
        .filter(c => c.parentId)
        .map((commit) => ({
            id: `e${commit.parentId}-${commit.id}`,
            source: commit.parentId!,
            target: commit.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#3b82f6',
            },
        }));

    return getLayoutedElements(nodes, edges);
};

export default function CommitGraph() {
    // Memoize the initial layout to prevent re-calculations
    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => processCommits(), []);
    
    const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
    const [edges, , onEdgesChange] = useEdgesState(layoutedEdges);
    const { theme } = useTheme();

    // Memoize node types
    const nodeTypes = useMemo(() => ({ commitNode: CommitNode }), []);

    return (
        <div className="h-[500px] w-full border rounded-xl bg-neutral-50 dark:bg-neutral-950 overflow-hidden shadow-sm relative">
            
            <div className='absolute top-4 left-4 z-10 bg-background/80 backdrop-blur border p-2 rounded-lg shadow-sm'>
                <h3 className='text-sm font-semibold'>Neural Commit Map</h3>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                className="bg-neutral-50 dark:bg-neutral-950"
            >
                <Background 
                    color={theme === 'dark' ? '#555' : '#ccc'} 
                    gap={16} 
                    size={1}
                />
                <Controls className='!bg-background !border-border !fill-foreground' />
            </ReactFlow>
        </div>
    );
}