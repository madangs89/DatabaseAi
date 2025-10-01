import React from "react";
import Editor from "@monaco-editor/react";

const MonacoEditor = () => {
  return (
    <div className="w-full h-screen overflow-hidden flex bg-[#0a0a0a] text-[#e5e5e5] font-sans">
      {/* Sidebar */}
      <div className="w-[28%] flex-shrink-0 border-r overflow-hidden border-[#2a2a2a] bg-[#111111] h-full p-5 flex flex-col">
        <h2 className="text-base font-semibold mb-6 tracking-wide text-[#f5f5f5]">
          Project Explorer
        </h2>
        <ul className="space-y-3 text-sm text-[#a3a3a3]">
          <li className="hover:text-[#f5f5f5] cursor-pointer transition">
            index.js
          </li>
          <li className="hover:text-[#f5f5f5] cursor-pointer transition">
            app.js
          </li>
          <li className="hover:text-[#f5f5f5] cursor-pointer transition">
            style.css
          </li>
        </ul>
        <div className="mt-auto pt-4 border-t border-[#2a2a2a] text-xs text-[#737373]">
          ⓘ Workspace ready
        </div>
      </div>

      {/* Editor Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center bg-[#111111] border-b border-[#2a2a2a] h-9 px-3 space-x-4 text-xs text-[#a3a3a3]">
          <span className="text-[#f5f5f5] border-b-2 border-[#f5f5f5] pb-1 cursor-pointer">
            index.js
          </span>
          <span className="hover:text-[#f5f5f5] cursor-pointer">app.js</span>
          <span className="hover:text-[#f5f5f5] cursor-pointer">style.css</span>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 bg-[#1a1a1a]">
          <Editor
            theme="vs-dark"
            height="100%"
            defaultLanguage="javascript"
            defaultValue={`// Welcome to Monaco Editor\nconsole.log("Hello, world!");`}
            options={{
              fontSize: 15,
              minimap: { enabled: false },
              wordWrap: "on",
              automaticLayout: true,
              scrollBeyondLastLine: true,
              smoothScrolling: true,
              cursorStyle: "line-thin",
              mouseWheelZoom: true,
              formatOnPaste: true,
              tabSize: 2,
              lineNumbers: "on",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MonacoEditor;
