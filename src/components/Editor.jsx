import React, { useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// Configure loader to use local monaco instance (Offline support / Electron)
loader.config({ monaco });

const YamlEditor = ({ value, onChange, selection }) => {
  const editorRef = React.useRef(null);

  const handleEditorChange = (value) => {
    onChange(value);
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (editorRef.current && selection) {
      const { start, end } = selection;
      
      // We use a tiny timeout to ensure Monaco has finished applying the 'value' update
      // otherwise it might clear the selection immediately after we set it.
      const timer = setTimeout(() => {
        const model = editorRef.current.getModel();
        if (model) {
          const startPos = model.getPositionAt(start);
          const endPos = model.getPositionAt(end);
          
          const range = {
            startLineNumber: startPos.lineNumber,
            startColumn: startPos.column,
            endLineNumber: endPos.lineNumber,
            endColumn: endPos.column
          };

          editorRef.current.revealRangeInCenterIfOutsideViewport(range);
          editorRef.current.setSelection(range);
          editorRef.current.focus();
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [selection]);

  return (
    <div className="glass-panel" style={{ height: '100%', width: '100%', overflow: 'hidden', borderRadius: '8px' }}>
      <Editor
        height="100%"
        defaultLanguage="yaml"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
};

export default YamlEditor;
