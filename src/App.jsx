import React, { useState, useEffect, useMemo } from 'react';
import yaml from 'js-yaml';
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
          // 1. Parse current YAML
          const obj = yaml.load(yamlString);
          
          // 2. Update object at path
          // Path is like 'root.features.0' or 'root.version'
          // 'root' is the obj itself.
          
          const parts = path.split('.');
          // Remove 'root'
          if (parts[0] === 'root') parts.shift();
          
          if (parts.length === 0) {
              // Editing root scalar? Unlikely for object root, but possible if root is just "Hello".
              // If it's an object, we can't really "edit" it to a string easily without replacing everything.
              // Assuming we are editing a property.
              // If we are here, something is weird or specific scalar root.
              // Let's re-dump newValue.
              const newYaml = yaml.dump(newValue);
              setYamlString(newYaml);
              return;
          }

          let current = obj;
          for (let i = 0; i < parts.length - 1; i++) {
              current = current[parts[i]];
          }
          
          const lastKey = parts[parts.length - 1];
          // Determine if we should parse newValue as number/boolean
          // Simple heuristic: if it looks like a number, cast it.
          let valueToSet = newValue;
          if (!isNaN(Number(newValue)) && newValue.trim() !== '') {
              valueToSet = Number(newValue);
          } else if (newValue === 'true') valueToSet = true;
          else if (newValue === 'false') valueToSet = false;

          current[lastKey] = valueToSet;

          // 3. Dump back to YAML
          const newYaml = yaml.dump(obj);
          setYamlString(newYaml);

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
