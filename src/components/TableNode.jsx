import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { ChevronRight, ChevronDown } from 'lucide-react';

// Separate component for editable input to manage local state
const EditableScalar = ({ value, path, onEdit }) => {
    const [localValue, setLocalValue] = useState(value);
    
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleBlur = () => {
        if (localValue !== value) {
            onEdit(path, localValue);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur(); // Trigger blur to save
        }
    };

    return (
        <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
                background: 'transparent',
                border: 'none',
                color: '#a5f3fc',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                width: '100%',
                textAlign: 'right',
                outline: 'none',
                padding: 0,
                margin: 0
            }}
        />
    );
};

const TableNode = ({ data }) => {
  return (
    <div 
      className="glass-panel"
      style={{ 
        minWidth: '250px',
        maxWidth: '350px',
        borderRadius: '8px', 
        // overflow: 'hidden', // REMOVED to allow handles/lines to show
        border: '1px solid var(--border-subtle)',
        background: 'rgba(24, 24, 27, 0.95)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Header */}
      <div style={{ 
        padding: '8px 12px', 
        background: 'rgba(255, 255, 255, 0.05)', 
        borderBottom: '1px solid var(--border-subtle)',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        fontWeight: 600,
        fontSize: '0.9rem',
        color: 'var(--accent-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <span>{data.label}</span>
        </div>
        
        <Handle 
            type="target" 
            position={Position.Left} 
            style={{ 
                left: -6,
                width: 8, height: 8, 
                background: 'var(--accent-secondary)',
                border: 'none',
                borderRadius: '2px' 
            }} 
        />
      </div>

      {/* Rows */}
      <div style={{ padding: '4px 0' }}>
        {data.items.map((item, idx) => (
          <div 
            key={idx} 
            // Add click handler to the entire row if it's a relation
            onClick={(e) => {
                if (item.type === 'relation') {
                    e.stopPropagation();
                    data.onToggle(item.path);
                }
            }}
            style={{ 
              position: 'relative', 
              padding: '6px 12px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem',
              // Increased opacity for visibility
              borderBottom: idx === data.items.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)',
              height: '32px',
              // Add cursor pointer if it's a relation
              cursor: item.type === 'relation' ? 'pointer' : 'default',
              // Add hover effect
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
                if (item.type === 'relation') e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
                if (item.type === 'relation') e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                {/* Icon */}
                {item.type === 'relation' && (
                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                        {item.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </div>
                )}
                {/* Indent if not relation */}
                {item.type !== 'relation' && <div style={{ width: 14 }}></div>}

                <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {item.key}
                </span>
            </div>

            {/* Value (if scalar) */}
            {item.type === 'scalar' && (
              <div style={{ 
                  maxWidth: '140px',
                  minWidth: '60px',
                  display: 'flex',
                  justifyContent: 'flex-end' 
              }}>
                <EditableScalar 
                    value={item.value} 
                    path={item.path} 
                    onEdit={data.onEdit} 
                />
              </div>
            )}

            {/* Handle - Visual only, handled logic in parser */}
            {item.type === 'relation' && !item.collapsed && (
              <Handle 
                type="source" 
                position={Position.Right} 
                id={item.handleId}
                style={{ 
                    right: -6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 8, height: 8, 
                    background: 'var(--accent-primary)',
                    border: 'none',
                    borderRadius: '2px'
                }} 
                onClick={(e) => e.stopPropagation()} 
              />
            )}
            
            {item.type === 'relation' && item.collapsed && (
               <div style={{
                   position: 'absolute',
                   right: -4,
                   top: '50%',
                   transform: 'translateY(-50%)',
                   width: 4, height: 4,
                   borderRadius: '50%',
                   background: 'var(--text-muted)'
               }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(TableNode);
