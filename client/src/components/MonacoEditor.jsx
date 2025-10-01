import React from "react";
import Editor from "@monaco-editor/react";

const MonacoEditor = () => {
  return (
    <div className="w-full h-full overflow-hidden flex">
      <div className="w-[25%] bg-red-600 h-full"></div>
      <div className="flex-1  flex flex-col bg-yellow-400">
        <div className="w-full h-12 bg-green-400"></div>
        <Editor
          theme="vs-dark"
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Start typing your code here..."
          options={{
            fontSize: 20,
            minimap: { enabled: false },
            wordWrap: "on",
            automaticLayout: true,

            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorStyle: "line-thin",
            mouseWheelZoom: true,
            formatOnPaste: true,
          }}
        />
      </div>
    </div>
  );
};

export default MonacoEditor;
