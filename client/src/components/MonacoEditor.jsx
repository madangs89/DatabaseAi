import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  ChevronDown,
  ChevronRight,
  Cross,
  File,
  Folder,
  X,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
const fakeTreeStructure = {
  // Root files
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

  // Root JS file
  "index.js": `import { greet } from "./src/utils/greet.js";
console.log(greet("World"));`,

  // Source folder
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

  // Components
  "src/components/Header.jsx": `import React from "react";
export default function Header() {
  return <h1>Welcome to Fake Project</h1>;
}`,

  "src/components/Button.jsx": `import React from "react";
export default function Button({ label }) {
  return <button>{label}</button>;
}`,

  // Utilities
  "src/utils/greet.js": `export function greet(name) {
  return "Hello, " + name + "!";
}`,

  // Styles
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

  // Controller folder
  "controller/auth.js": `export function login(user, pass) {
  return user === "admin" && pass === "1234";
}`,

  "controller/user.js": `export function getUser() {
  return { id: 1, name: "John Doe" };
}`,

  "controller/user/auth/user.js": `export function authUser(userId) {
  return userId === 1 ? "Authenticated" : "Not Authenticated";
}`,

  // Assets folder
  "assets/logo.png": "FAKE_IMAGE_DATA_BASE64_OR_PATH",
  "assets/background.jpg": "FAKE_IMAGE_DATA_BASE64_OR_PATH",

  // Tests
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
  let indentSpace = { marginLeft: `${level * 10}px` };

  if (nodes.type == "folder") {
    const isOpen = expandedFiles.has(nodes.id);
    return (
      <div className="space-y-2">
        <div
          key={nodes.id}
          onClick={() => toggleExpandable(nodes.id)}
          style={indentSpace}
          className="flex items-center gap-2  cursor-pointer select-none hover:text-white"
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <Folder className="w-3 h-3" />
          <span>{nodes.name}</span>
        </div>
        {isOpen &&
          nodes.children &&
          nodes.children.length > 0 &&
          nodes.children.map((child) => {
            return (
              <TreeNode
                toggleExpandable={toggleExpandable}
                expandedFiles={expandedFiles}
                nodes={child}
                openFile={openFile}
                selectedFile={selectedFile}
                level={level + 1}
              />
            );
          })}
      </div>
    );
  }
  return (
    <div
      onClick={() => openFile(nodes)}
      style={indentSpace}
      key={nodes.id}
      className={`flex items-center gap-2 cursor-pointer px-2  py-2 hover:text-white text-sm ${
        selectedFile?.id == nodes?.id ? "bg-[#1e1e1e]" : ""
      }`}
    >
      <File className="w-3 h-3" />
      <span>{nodes.name}</span>
    </div>
  );
};

const MonacoEditor = () => {
  const [tree, setTree] = useState({});
  const [expandedFiles, setExpandedFiles] = useState(new Set());
  const [hoverId, setHoverId] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileHistory, setSelectedFileHistory] = useState([]);

  const toggleExpandable = (id) => {
    setExpandedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const findFileInTree = (nodesArray, fileId) => {
    for (let node of nodesArray) {
      if (node.type === "file" && node.id === fileId) {
        return node; // found the file
      }
      if (node.type === "folder") {
        const nested = findFileInTree(node.children, fileId);
        if (nested) return nested; // bubble up the found file
      }
    }
    return null; // not found
  };

  const openFile = (node) => {
    setSelectedFile({
      id: node.id,
      name: node.name,
      type: node.type,
      content: node.content,
    });
    setSelectedFileHistory((prev) => {
      const exists = prev.some((n) => n.id === node.id);
      if (exists) {
        return prev; // already in history → do nothing
      }
      // Not in history → add to the end
      return [...prev, node];
    });
  };

  const closeFile = (node) => {
    setSelectedFileHistory((prev) => {
      const newHistory = prev.filter((n) => n.id !== node.id);

      // Determine the next selected file
      let nextFile = null;
      if (newHistory.length > 0) {
        const closedIndex = prev.findIndex((n) => n.id === node.id);
        // Prefer the next tab if exists, otherwise previous
        const nextIndex =
          closedIndex < newHistory.length ? closedIndex : newHistory.length - 1;
        nextFile = newHistory[nextIndex];
      }

      setSelectedFile(nextFile || null); // Update selected file
      return newHistory;
    });
  };

  useEffect(() => {
    let root = {};
    Object.entries(fakeTreeStructure).forEach(([key, value]) => {
      let parts = key.split("/");
      let current = root;
      let accumulated = "";
      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        accumulated = accumulated ? `${accumulated}/${part}` : part;
        if (!current[part]) {
          if (isFile) {
            current[part] = {
              type: "file",
              id: accumulated,
              name: part,
              content: value,
            };
          } else {
            current[part] = {
              type: "folder",
              id: accumulated,
              name: part,
              children: {},
            };
          }
        }
        if (!isFile) {
          current = current[part].children;
        }
      });
    });

    console.log(root);

    const convertObjectToArray = (obj) => {
      return Object.values(obj)
        .map((item) => {
          if (item.type == "folder") {
            return { ...item, children: convertObjectToArray(item.children) };
          } else {
            return { ...item };
          }
        })
        .sort((a, b) => {
          if (a.type == b.type) {
            return a.name.localeCompare(b.name);
          }

          return a.type == "folder" ? -1 : 1;
        });
    };
    let t = convertObjectToArray(root);

    let final = [
      {
        type: "folder",
        id: "root",
        name: "backend",
        children: [...t],
      },
    ];
    setTree(final);
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden flex bg-[#0a0a0a] text-[#e5e5e5] font-sans">
      {/* Sidebar */}
      <div className="w-[28%] pt-2 px-3 flex-shrink-0 border-r overflow-hidden border-[#2a2a2a] bg-[#111111] h-full pb-20 justify-between flex flex-col">
        <div className="">
          <h2 className="text-white text-2xl font-bold">Project Explorer</h2>
          <ul className="mt-3 gap-1 h-[400px] overflow-y-scroll flex flex-col text-sm text-[#a3a3a3]">
            {tree &&
              tree.length > 0 &&
              tree.map((item) => {
                return (
                  <TreeNode
                    toggleExpandable={toggleExpandable}
                    expandedFiles={expandedFiles}
                    nodes={item}
                    openFile={openFile}
                    selectedFile={selectedFile}
                    level={0}
                  />
                );
              })}
          </ul>
        </div>
        <div className=" py-2 border-t items-center justify-center border-[#2a2a2a] text-xs text-[#737373]">
          ⓘ Workspace ready
        </div>
      </div>
      {/* Editor Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center bg-[#111111] border-b overflow-x-scroll overflow-y-hidden border-[#2a2a2a] h-9 text-xs text-[#a3a3a3]">
          {selectedFileHistory &&
            selectedFileHistory.length > 0 &&
            selectedFileHistory.map((item, index) => {
              return (
                <span
                  key={index}
                  onMouseOver={() => setHoverId(item.id)}
                  onMouseLeave={() => setHoverId("")}
                  onClick={() => openFile(item)}
                  className={`${
                    selectedFile?.id !== item?.id ? "hover:bg-[#1e1e1e]" : ""
                  } text-[14px] border-[0.5px] min-w-[150px] overflow-hidden border-[#2a2a2a] px-4 py-3 cursor-pointer flex items-center justify-center gap-2 ${
                    selectedFile?.id === item?.id ? "bg-[#1e1e1e]" : ""
                  }`}
                >
                  {item.name}

                  {hoverId == item.id ? (
                    <X
                      onClick={(e) => {
                        e.stopPropagation();
                        closeFile(item, index);
                      }}
                      className="w-3 h-3  text-[#a3a3a3] hover:text-white cursor-pointer"
                    />
                  ) : (
                    <div className="w-3 h-3"></div>
                  )}
                </span>
              );
            })}
        </div>
        {/* Monaco Editor */}
        <div className="flex-1 bg-[#1a1a1a]">
          <Editor
            theme="vs-dark"
            height="100%"
            defaultLanguage="javascript"
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
    </div>
  );
};

export default MonacoEditor;
