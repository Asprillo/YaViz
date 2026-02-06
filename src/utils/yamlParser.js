import yaml from 'js-yaml';
import dagre from 'dagre';

const NODE_WIDTH = 250;
const HEADER_HEIGHT = 40;
const ROW_HEIGHT = 32;

/**
 * Parses YAML with support for collapsibility.
 * @param {string} yamlStr 
 * @param {Set<string>} expandedPaths - Set of paths that are EXPANDED.
 * @param {Function} onToggle - Callback for toggling collapse
 */
export const parseYamlToFlow = (yamlStr, expandedPaths = new Set(), onToggle = () => {}, onEdit = () => {}) => {
  try {
    const data = yaml.load(yamlStr);
    
    if (!data || (typeof data !== 'object')) {
       if (!yamlStr.trim()) return { nodes: [], edges: [], error: null };
       return { 
         nodes: [{ 
            id: 'root', 
            position: { x: 0, y: 0 }, 
            type: 'table',
            data: { 
                label: 'Root', 
                items: [{ key: 'Value', value: String(data), type: 'scalar', path: 'root' }], // Added path
                onToggle,
                onEdit
            } 
         }], 
         edges: [], 
         error: null 
       };
    }

    const flowNodes = [];
    const flowEdges = [];

    const processObject = (obj, path = 'root', label = 'Root') => {
        const id = path; 
        const items = [];
        
        // 1. Array handling
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                const key = String(index);
                const itemPath = `${path}.${key}`;
                
                if (item && typeof item === 'object') {
                    // Logic Inversion: Null/False in Map means collapsed?
                    // We use a Set of EXPANDED paths.
                    // If expandedPaths.has(itemPath) -> Expanded.
                    const isExpanded = expandedPaths.has(itemPath);
                    const isCollapsed = !isExpanded;
                    
                    items.push({ 
                        key, 
                        type: 'relation', 
                        handleId: key,
                        path: itemPath, 
                        collapsed: isCollapsed
                    });

                    // Only process children if Expanded
                    if (isExpanded) {
                        const childId = processObject(item, itemPath, `Item ${index}`);
                        flowEdges.push({ 
                            id: `e_${id}_${key}_${childId}`, 
                            source: id, 
                            sourceHandle: key,
                            target: childId 
                        });
                    }
                } else {
                    items.push({ key, value: String(item), type: 'scalar', path: itemPath });
                }
            });
        } 
        // 2. Object handling
        else if (obj && typeof obj === 'object') {
            Object.entries(obj).forEach(([key, value]) => {
                const itemPath = `${path}.${key}`;

                if (value && typeof value === 'object') {
                   let childLabel = key;
                   if (Array.isArray(value)) childLabel = `${key} [${value.length}]`;
                   
                   const isExpanded = expandedPaths.has(itemPath);
                   const isCollapsed = !isExpanded;

                   items.push({ 
                       key, 
                       type: 'relation', 
                       handleId: key,
                       path: itemPath,
                       collapsed: isCollapsed
                   });

                   if (isExpanded) {
                       const childId = processObject(value, itemPath, childLabel);
                       flowEdges.push({ 
                            id: `e_${id}_${key}_${childId}`, 
                            source: id, 
                            sourceHandle: key,
                            target: childId 
                        });
                   }
                } else {
                    items.push({ key, value: String(value), type: 'scalar', path: itemPath });
                }
            });
        }
        else {
             items.push({ key: 'value', value: String(obj), type: 'scalar', path });
        }

        flowNodes.push({
            id,
            type: 'table',
            data: { label, items, onToggle, onEdit },
            position: { x: 0, y: 0 },
            width: NODE_WIDTH,
            height: HEADER_HEIGHT + (items.length * ROW_HEIGHT) + 20 
        });

        return id;
    };

    processObject(data);

    // Layout
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR', ranksep: 100, nodesep: 50 });
    g.setDefaultEdgeLabel(() => ({}));

    flowNodes.forEach((node) => {
      g.setNode(node.id, { width: node.width, height: node.height });
    });

    flowEdges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    const layoutedNodes = flowNodes.map((node) => {
      const nodeWithPosition = g.node(node.id);
      if (!nodeWithPosition) return node;

      return {
        ...node,
        position: {
          x: nodeWithPosition.x - node.width / 2,
          y: nodeWithPosition.y - node.height / 2,
        },
      };
    });

    return { nodes: layoutedNodes, edges: flowEdges, error: null };

  } catch (e) {
    return { nodes: [], edges: [], error: e.message };
  }
};
