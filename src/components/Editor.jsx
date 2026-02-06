import React, { useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// Configure loader to use local monaco instance (Offline support / Electron)
loader.config({ monaco });

const YamlEditor = ({ value, onChange }) => {
  const handleEditorChange = (value) => {
    onChange(value);
  };

  return (
    <div className="glass-panel" style={{ height: '100%', width: '100%', overflow: 'hidden', borderRadius: '8px' }}>
      <Editor
        height="100%"
        defaultLanguage="yaml"
        value={value}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          backgroundColor: 'transparent', // Attempt to blend, but Monaco has own background
        }}
      />
    </div>
  );
};

export default YamlEditor;
