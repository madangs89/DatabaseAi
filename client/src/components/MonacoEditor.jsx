import React, { useEffect } from "react";
import Editor from "@monaco-editor/react";
import { ChevronDown, ChevronRight, File, Folder, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleExpandable,
  setHoverId,
  openFile,
  closeFile,
} from "../redux/slice/MonacoEditorSlice";
import LoadingScreen from "./loaders/LoadingScreen";

const fakeTreeStructure = {
  "package.json": `{
  "name": "fake-project",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js",
    "test": "jest"
  },
  "dependencies": {
    "react": "^18.0.0"
  }
}`,
  "README.md": `# Fake Project
This is a fake project structure for testing your editor and tree view.`,
  "index.js": `import { greet } from "./src/utils/greet.js";
console.log(greet("World"));`,
  "src/app.js": `import React from "react";
import Header from "./components/Header.jsx";
import Button from "./components/Button.jsx";

export default function App() {
  return (
    <div>
      <Header />
      <Button label="Click Me" />
    </div>
  );
}`,
  "src/components/Header.jsx": `import React from "react";
export default function Header() {
  return <h1>Welcome to Fake Project</h1>;
}`,
  "src/components/Button.jsx": `import React from "react";
export default function Button({ label }) {
  return <button>{label}</button>;
}`,
  "src/utils/greet.js": `export function greet(name) {
  return "Hello, " + name + "!";
}`,
  "src/styles/global.css": `body { 
  font-family: Arial, sans-serif; 
  background-color: #f5f5f5; 
  color: #333; 
}`,
  "src/styles/button.css": `.button { 
  padding: 8px 16px; 
  background-color: #007bff; 
  color: white; 
  border-radius: 4px; 
}`,
  "controller/auth.js": `export function login(user, pass) {
  return user === "admin" && pass === "1234";
}`,
  "controller/user.js": `export function getUser() {
  return { id: 1, name: "John Doe" };
}`,
  "controller/user/auth/user.js": `export function authUser(userId) {
  return userId === 1 ? "Authenticated" : "Not Authenticated";
}`,
  "assets/logo.png": "FAKE_IMAGE_DATA_BASE64_OR_PATH",
  "assets/background.jpg": "FAKE_IMAGE_DATA_BASE64_OR_PATH",
  "tests/app.test.js": `import { greet } from "../src/utils/greet.js";

test("greet function", () => {
  expect(greet("Alice")).toBe("Hello, Alice!");
});`,
  "tests/button.test.js": `import { render } from "@testing-library/react";
import Button from "../src/components/Button.jsx";

test("Button renders with label", () => {
  const { getByText } = render(<Button label="Click Me" />);
  expect(getByText("Click Me")).toBeInTheDocument();
});`,
};

const TreeNode = ({
  nodes,
  level = 0,
  toggleExpandable,
  expandedFiles,
  openFile,
  selectedFile,
}) => {
  const isFolder = nodes.type === "folder";
  const isOpen = isFolder && expandedFiles.includes(nodes.id);

  // Indentation for tree levels
  const indentStyle = { paddingLeft: `${level * 16}px` };

  return (
    <div className="flex flex-col">
      <div
        key={nodes.id}
        style={indentStyle}
        className={`flex items-center gap-2 cursor-pointer select-none rounded-sm px-2 py-1
          ${
            selectedFile?.id === nodes?.id
              ? "bg-[#2a2a2a] text-white"
              : "text-[#a3a3a3] hover:bg-[#1e1e1e] hover:text-white"
          }
        `}
        onClick={() =>
          isFolder ? toggleExpandable(nodes.id) : openFile(nodes)
        }
      >
        {isFolder ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Folder className="w-4 h-4" />
            <span className="truncate">{nodes.name}</span>
          </>
        ) : (
          <>
            <File className="w-4 h-4 ml-4" />
            <span className="truncate">{nodes.name}</span>
          </>
        )}
      </div>

      {/* Render children if folder is open */}
      {isFolder && isOpen && nodes.children && nodes.children.length > 0 && (
        <div className="flex flex-col">
          {nodes.children.map((child) => (
            <TreeNode
              key={child.id}
              nodes={child}
              level={level + 1}
              toggleExpandable={toggleExpandable}
              expandedFiles={expandedFiles}
              openFile={openFile}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const MonacoEditor = () => {
  const socket = useSelector((state) => state?.project?.socket);
  const dispatch = useDispatch();
  const {
    tree,
    expandedFiles,
    hoverId,
    selectedFile,
    selectedFileHistory,
    loadingState,
  } = useSelector((state) => state.monaco);
  const handleLanguage = (name) => {
    if (name && name.length > 2) {
      if (name.endsWith(".js")) return "javascript";
      if (name.endsWith(".jsx")) return "javascript";
      if (name.endsWith(".ts")) return "typescript";
      if (name.endsWith(".tsx")) return "typescript";
      if (name.endsWith(".css")) return "css";
      if (name.endsWith(".html")) return "html";
      if (name.endsWith(".json")) return "json";
      if (name.endsWith(".md")) return "markdown";
    }
    return "plaintext";
  };
  const selectedFileHandler = () => {
    if (selectedFile) {
      if (selectedFile.name.endsWith(".json")) {
        return JSON.parse(selectedFile.content);
      } else {
        return selectedFile.content;
      }
    }
    return "// Select a file to view/edit"
  };

  return (
    <div className="w-full h-screen overflow-hidden flex bg-[#0a0a0a] text-[#e5e5e5] font-sans">
      {/* Sidebar */}
      {loadingState > 0 && loadingState <= 3 ? (
        <LoadingScreen state={loadingState} />
      ) : (
        <>
          <div className="w-[22%] pt-2 border-r overflow-hidden border-[#2a2a2a] bg-[#111111] h-full pb-20 justify-between flex flex-col">
            <h2 className="text-white ml-3 text-2xl font-bold">
              Project Explorer
            </h2>
            <ul className="mt-3 flex-1 ml-3  gap-1  monaco overflow-y-scroll flex flex-col text-sm text-[#a3a3a3]">
              {tree &&
                tree.length > 0 &&
                tree.map((item) => (
                  <TreeNode
                    key={item.id}
                    toggleExpandable={(id) => dispatch(toggleExpandable(id))}
                    expandedFiles={expandedFiles}
                    nodes={item}
                    openFile={(node) => dispatch(openFile(node))}
                    selectedFile={selectedFile}
                    level={0}
                  />
                ))}
            </ul>
            <div className="py-2 ml-3 border-t items-center justify-center border-[#2a2a2a] text-xs text-[#737373]">
              ⓘ Workspace ready
            </div>
          </div>

          {/* Editor Section */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center monaco2 bg-[#111111] border-b overflow-x-scroll overflow-y-hidden border-[#2a2a2a] h-12 text-xs text-[#a3a3a3]">
              {selectedFileHistory &&
                selectedFileHistory.length > 0 &&
                selectedFileHistory.map((item, index) => (
                  <span
                    key={index}
                    onMouseOver={() => dispatch(setHoverId(item.id))}
                    onMouseLeave={() => dispatch(setHoverId(""))}
                    onClick={() => dispatch(openFile(item))}
                    className={`${
                      selectedFile?.id !== item?.id ? "hover:bg-[#1e1e1e]" : ""
                    } text-[14px] border-[0.5px] min-w-[250px] overflow-hidden border-[#2a2a2a] px-4 py-3 cursor-pointer flex items-center justify-center gap-2 ${
                      selectedFile?.id === item?.id ? "bg-[#1e1e1e]" : ""
                    }`}
                  >
                    {item.name}
                    {hoverId == item.id ? (
                      <X
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(closeFile(item));
                        }}
                        className="w-4 h-4 text-[#a3a3a3] hover:text-white cursor-pointer"
                      />
                    ) : (
                      <div className="w-3 h-3"></div>
                    )}
                  </span>
                ))}
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 bg-[#1a1a1a]">
              <Editor
                theme="vs-dark"
                height="100%"
                defaultLanguage="javascript"
                language={handleLanguage(selectedFile?.name)}
                value={
                  selectedFile
                    ? selectedFile.content
                    : "// Select a file to view/edit"
                }
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
        </>
      )}
    </div>
  );
};

export default MonacoEditor;
