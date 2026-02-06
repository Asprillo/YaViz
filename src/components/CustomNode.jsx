import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data }) => {
  return (
    <div 
      className="glass-panel"
      style={{ 
        padding: '8px 16px', 
        borderRadius: '8px', 
        minWidth: '150px',
        textAlign: 'center',
        border: '1px solid var(--accent-primary)',
        background: 'rgba(24, 24, 27, 0.85)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: 'var(--text-muted)' }} />
      
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {data.label}
      </div>
      
      <Handle type="source" position={Position.Right} style={{ background: 'var(--text-muted)' }} />
    </div>
  );
};

export default memo(CustomNode);
