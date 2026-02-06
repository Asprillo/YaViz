import React, { useMemo } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  ConnectionLineType
} from 'reactflow';
import 'reactflow/dist/style.css';
import TableNode from './TableNode';

const Visualizer = ({ nodes, edges }) => {
  const nodeTypes = useMemo(() => ({ table: TableNode }), []);
  
  const defaultEdgeOptions = useMemo(() => ({
    style: { stroke: '#818cf8', strokeWidth: 2 }, // Indigo-400
    type: 'default', // Bezier Curve
    animated: true,
  }), []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        <Background color="#555" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default Visualizer;
