import React, { useState, useEffect, useMemo } from 'react';
import { parseDocument } from 'yaml';
import YamlEditor from './components/Editor';
import Visualizer from './components/Visualizer';
import { parseYamlToFlow } from './utils/yamlParser';

const initialYaml = `# Edit YAML here
name: YaViz
version: 1.0.0
features:
  - Real-time Parsing
  - Auto Layout
  - Glassmorphism UI
owner:
  name: Antigravity
  role: AI Assistant
`;

function App() {
  const [yamlString, setYamlString] = useState(initialYaml);
  const [expandedPaths, setExpandedPaths] = useState(new Set());
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [error, setError] = useState(null);

  const handleToggle = (path) => {
    setExpandedPaths(prev => {
        const next = new Set(prev);
        if (next.has(path)) {
            next.delete(path);
        } else {
            next.add(path);
        }
        return next;
    });
  };

  const handleEdit = (path, newValue) => {
      try {
          const doc = parseDocument(yamlString);
          const parts = path.split('::');
          if (parts[0] === 'root') parts.shift();
          
          let valueToSet = newValue;
          if (!isNaN(Number(newValue)) && newValue.trim() !== '') {
              valueToSet = Number(newValue);
          } else if (newValue === 'true') valueToSet = true;
          else if (newValue === 'false') valueToSet = false;

          // Key Type Inference: Handle numeric keys (0 vs "0")
          const typedParts = [];
          let current = doc.contents;
          for (const part of parts) {
              if (current && typeof current.has === 'function') {
                  if (current.has(part)) {
                      typedParts.push(part);
                      current = current.get(part);
                  } else if (!isNaN(Number(part)) && current.has(Number(part))) {
                      const numPart = Number(part);
                      typedParts.push(numPart);
                      current = current.get(numPart);
                  } else {
                      typedParts.push(part);
                      current = null;
                  }
              } else {
                  typedParts.push(part);
              }
          }

          // Surgical update: If it's a scalar, update value directly to preserve formatting/comments
          const node = doc.getIn(typedParts, true); // true = get node, not value
          if (node && 'value' in node) {
              node.value = valueToSet;
          } else {
              doc.setIn(typedParts, valueToSet);
          }

          // Surgical Comment Relocator: Move comments from value.commentBefore to key.comment
          // This keeps comments like '0: #BR' on the same line when the value is a block node.
          const relocateComments = (node) => {
              if (!node || typeof node !== 'object') return;
              if (node.items) {
                  node.items.forEach(item => {
                      if (item && item.key && item.value && item.value.commentBefore && !item.comment) {
                          item.key.comment = item.value.commentBefore;
                          item.value.commentBefore = null;
                      }
                      relocateComments(item.key);
                      relocateComments(item.value);
                  });
              }
          };
          relocateComments(doc.contents);

          // Detect indentation to preserve user style
          const detectIndent = (str) => {
              const match = str.match(/\n( +)[^ #\n]/);
              return (match && match[1].length > 1) ? match[1].length : 2;
          };
          const currentIndent = detectIndent(yamlString);

          setYamlString(doc.toString({ 
              lineWidth: 0, 
              indent: currentIndent,
              simpleKeys: false, // Allows comments on keys without forcing complex key syntax
              flowCollectionPadding: true
          }));

      } catch (e) {
          console.error("Failed to update YAML", e);
      }
  };

  useEffect(() => {
    // Pass callback
    const { nodes: flowNodes, edges: flowEdges, error: parseError } = parseYamlToFlow(yamlString, expandedPaths, handleToggle, handleEdit);
    if (parseError) {
      setError(parseError);
    } else {
      setError(null);
      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [yamlString, expandedPaths]);

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100vw', padding: '16px', gap: '16px', background: 'var(--bg-app)' }}>
      {/* Sidebar / Editor */}
      <div className="editor-pane" style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
          <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, background: 'linear-gradient(to right, var(--accent-secondary), var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            YaVíz
          </h1>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Interactive Diagram</span>
        </div>
        
        <YamlEditor value={yamlString} onChange={setYamlString} />
        
        {error && (
            <div className="error-panel glass-panel" style={{ padding: '12px', color: 'var(--accent-error)', fontSize: '0.9rem', borderRadius: '8px' }}>
                Error: {error}
            </div>
        )}
      </div>

      {/* Visualizer */}
      <div className="visualizer-pane glass-panel" style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
        <Visualizer nodes={nodes} edges={edges} />
      </div>
    </div>
  );
}

export default App;
