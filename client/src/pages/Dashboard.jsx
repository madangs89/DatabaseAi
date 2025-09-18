import React, { useState, useCallback } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CodeBlock, dracula } from "react-code-blocks";
import { github } from "react-code-blocks";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  MiniMap,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import logoIcon from "../assets/logoIcon.png";
import {
  ArrowUp,
  Bell,
  Brain,
  ChartBarIcon,
  CircleUser,
  Copy,
  DatabaseZap,
  Search,
  SearchIcon,
  Send,
  SendIcon,
  SendToBack,
  SendToBackIcon,
  Settings,
} from "lucide-react";
import DashbordNav from "../components/DashbordNav";

// ✅ Define once outside
// ✅ Custom Table Node
const TableNode = ({ data }) => {
  const { title, fields, theme } = data;

  const themeStyles = {
    dark: {
      background: "#1e1e1e",
      color: "white",
    },
    light: {
      background: "#fff",
      color: "#000",
      // border: "1px solid #ccc",
    },
  };

  return (
    <div
      className="border border-blue-400"
      style={{
        ...themeStyles[theme],
        // borderRadius: "8px",
        padding: "10px",
        width: 200,
        boxShadow:
          theme === "dark"
            ? "0 4px 12px rgba(0,0,0,0.4)"
            : "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <h3 style={{ marginBottom: "5px" }}>{title}</h3>
      <table style={{ width: "100%", fontSize: "14px" }}>
        <tbody>
          {fields.map((f) => (
            <tr key={f.name}>
              <td>{f.name}</td>
              <td
                style={{
                  textAlign: "right",
                  color: theme === "dark" ? "#aaa" : "#555",
                }}
              >
                {f.type}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Handles for connections */}
      <Handle type="source" position={Position.Right} id="r" />
      <Handle type="target" position={Position.Left} id="l" />
    </div>
  );
};

const nodeTypes = { tableNode: TableNode };

const Dashboard = () => {
  const [theme, setTheme] = useState("dark");
  const [selectedTab, setSelectedTab] = useState("editor");

  const [chatOpen, setChatOpen] = useState(true);
  const [dbOpen, setDbOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [selectedDb, setSelectedDb] = useState(null);
  const [chatMessage, setChatMessage] = useState([]);
  const tableData = [
    {
      id: "users",
      title: "Users",
      fields: [
        { name: "id", type: "INT" },
        { name: "name", type: "VARCHAR" },
        { name: "email", type: "VARCHAR" },
      ],
      pos: { x: 100, y: 100 },
    },
    {
      id: "products",
      title: "Products",
      fields: [
        { name: "id", type: "INT" },
        { name: "name", type: "VARCHAR" },
        { name: "price", type: "DECIMAL" },
      ],
      pos: { x: 500, y: 150 },
    },
    {
      id: "orders",
      title: "Orders",
      fields: [
        { name: "id", type: "INT" },
        { name: "user_id", type: "INT" },
        { name: "total", type: "DECIMAL" },
      ],
      pos: { x: 300, y: 350 },
    },
    {
      id: "payments",
      title: "Payments",
      fields: [
        { name: "id", type: "INT" },
        { name: "order_id", type: "INT" },
        { name: "amount", type: "DECIMAL" },
      ],
      pos: { x: 700, y: 400 },
    },
    {
      id: "reviews",
      title: "Reviews",
      fields: [
        { name: "id", type: "INT" },
        { name: "product_id", type: "INT" },
        { name: "comment", type: "TEXT" },
      ],
      pos: { x: 900, y: 150 },
    },
  ];
  const chatMessages = [
    { id: 1, sender: "user", text: "Hey, how are you?" },
    { id: 2, sender: "bot", text: "I'm good, thanks! How about you?" },
    {
      id: 3,
      sender: "user",
      text: "Doing well. Can you help me with my code?",
    },
    { id: 4, sender: "bot", text: "Of course! What seems to be the problem?" },
    {
      id: 5,
      sender: "user",
      text: "I'm trying to style a chat bubble dynamically.",
    },
    {
      id: 6,
      sender: "bot",
      text: "Got it! Your code snippet looks correct for that.",
    },
    {
      id: 5,
      sender: "user",
      text: "I'm trying to style a chat bubble dynamically.",
    },
    {
      id: 6,
      sender: "bot",
      text: "Got it! Your code snippet looks correct for that.",
    },
  ];
  const entity = {
    name: "Users",
    description: "Stores user account information and login credentials.",
    attributes: [
      {
        name: "id",
        type: "INT",
        note: "PRIMARY KEY",
        description: "Unique identifier for each user.",
      },
      {
        name: "username",
        type: "VARCHAR(255)",
        note: "UNIQUE",
        description: "",
      },
      {
        name: "email",
        type: "VARCHAR(255)",
        note: "NOT NULL",
        description: "",
      },
    ],
  };

  const codeFromBackend = `const user = { name: "Alice", age: 25 };function greet(u) {
  console.log("Hello " + u.name + ", you are " + u.age + " years old");
}
greet(user);
`;
  // Convert to nodes
  const initialNodes = tableData.map((t) => ({
    id: t.id,
    type: "tableNode",
    position: t.pos,
    data: { title: t.title, fields: t.fields, theme },
  }));
  // Edges (like Xarrow before)
  const initialEdges = [
    { id: "e1", source: "users", target: "orders" },
    { id: "e2", source: "orders", target: "payments" },
    { id: "e3", source: "products", target: "reviews" },
    { id: "e4", source: "users", target: "reviews" },
  ];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update theme across nodes
  return (
    <div className="w-full overflow-hidden dm-sans-font relative bg-black h-screen flex-col flex">
      <DashbordNav selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      {/* LEFT HALF: ReactFlow canvas */}
      <div className="w-full h-full overflow-hidden flex">
        <div className="w-[67%] p-2 flex-shrink-0 items-center justify-center gap-4  border-r-[0.5px] border-[#262626] h-full flex flex-col">
          {/* Nav for left half */}
          <div className="h-12 w-full bg-inherit flex items-center justify-between px-4">
            {/* Left: Title */}
            <h2 className="text-white text-2xl font-bold">ER Diagram</h2>
            {/* Right: Search + Buttons */}
            <div className="flex items-center gap-2">
              {/* Search Box */}
              <div className="flex items-center bg-[#1c1c1c] border border-[#333] rounded-md px-2 py-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-[#525252]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search entities..."
                  className="bg-transparent placeholder:text-[#525252] outline-none text-sm text-white px-2"
                />
              </div>

              {/* Plus Button */}
              <button className="w-8 h-8 flex items-center justify-center bg-[#1c1c1c] border border-[#333] rounded-md text-white hover:bg-[#2a2a2a]">
                +
              </button>

              {/* Share Button */}
              <button className="w-8 h-8 flex items-center justify-center bg-[#1c1c1c] border border-[#333] rounded-md text-white hover:bg-[#2a2a2a]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 12v.01M12 20h.01M20 12v.01M12 4h.01M16.24 7.76L20 12l-3.76 4.24M7.76 16.24L4 12l3.76-4.24M12 20V4m8 8H4"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* <div className="w-full flex-shrink-0 border-r-[0.5px] border-[#262626] h-full flex-col flex"> */}
          <div className="h-[77%] w-[98%] bg-[#171717] rounded-lg flex-shrink-0">
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                proOptions={{ hideAttribution: true }}
                nodeTypes={nodeTypes}
              >
                <Background variant="dots" gap={20} size={1} color={"black"} />
                <Controls
                  showZoom={true}
                  showFitView={true}
                  showInteractive={true}
                  position="bottom-right"
                  className="bg-[#171717] border-[0.5px] border-[#262626]"
                />
              </ReactFlow>
            </ReactFlowProvider>
            {/* </div> */}
          </div>
          <div className="h-12 w-[98%] bg-[#171717] px-2  flex gap-2 items-center rounded-lg border-t-[0.5px] border-[#262626]">
            <SearchIcon className="w-5 h-5 text-[#525252]" />
            <input
              type="text"
              placeholder="Create a database for instagram clone..."
              className="flex-1 border-none placeholder:text-[#525252] outline-none bg-transparent text-white"
            />
            <ArrowUp className="w-5 p-1 h-5 transition-all duration-200 ease-linear text-black bg-white rounded-full " />
          </div>
        </div>
        {/* RIGHT HALF: Red div */}
        <div className="w-1/2 relative h-full  flex-col overflow-hidden bg-[#171717] flex gap-2  justify-center">
          <nav className="w-full sticky top-0 border-b pl-3 border-[#262626] py-7 left-0 h-10 flex justify-between pr-3 bg-[#171717] gap-5 items-center">
            <h1 className="text-white font-bold">Chat with AI</h1>
            <div className="flex justify-end gap-5">
              <Brain
                onClick={() => {
                  setDbOpen(false);
                  setCopyOpen(false);
                  setChatOpen(true);
                }}
                className={`w-5 h-5 cursor-pointer transition-all duration-200 ease-linear ${
                  chatOpen ? "text-white" : "text-[#525252]"
                }`}
              />
              <DatabaseZap
                onClick={() => {
                  setChatOpen(false);
                  setCopyOpen(false);
                  setDbOpen(true);
                }}
                className={`w-5 h-5 cursor-pointer transition-all duration-200 ease-linear ${
                  dbOpen ? "text-white" : "text-[#525252]"
                }`}
              />
              <Copy
                onClick={() => {
                  setChatOpen(false);
                  setDbOpen(false);
                  setCopyOpen(true);
                }}
                className={`w-5 h-5 cursor-pointer transition-all duration-200 ease-linear ${
                  copyOpen ? "text-white" : "text-[#525252]"
                }`}
              />
            </div>
          </nav>
          {/* Ai Chat bot messages */}
          {chatOpen && (
            <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-[#232323] text-gray-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          )}
          {dbOpen && (
            <div className=" flex-1 text-white px-3 overflow-y-auto rounded-lg shadow-lg w-full max-w-md">
              {/* Entity Details */}
              <div className="mb-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">
                    Entity Name
                  </label>
                  <input
                    type="text"
                    value={entity.name}
                    readOnly
                    className="w-full bg-[#232323] outline-none text-white border border-[#3d3c3c] rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={entity.description}
                    readOnly
                    className="w-full bg-[#232323] outline-none text-white border border-[#3d3c3c] rounded px-3 py-2 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Attributes */}
              <div>
                <h3 className="text-md font-semibold mb-2">Attributes</h3>
                {entity.attributes.map((attr) => (
                  <div
                    key={attr.name}
                    className="bg-[#232323] outline-none text-white border border-[#3d3c3c] p-3 rounded mb-2"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{attr.name}</span>
                      {attr.note && (
                        <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                          {attr.note}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mb-1">
                      {attr.type}
                    </div>
                    {attr.description && (
                      <div className="text-xs text-gray-500">
                        {attr.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {copyOpen && (
            <div className="flex-1 text-white px-3  overflow-y-auto rounded-lg shadow-lg w-full max-w-md">
              {/* <SyntaxHighlighter
                className="w-full h-full bg-[#232323] outline-none text-white border border-[#3d3c3c] rounded px-3 py-2 resize-none"
                language="text"
                style={docco}
              >
       
              </SyntaxHighlighter> */}
              <CodeBlock
                text={codeFromBackend}
                language="javascript"
                showLineNumbers={true}
                theme={dracula}
                wrapLines
              />
            
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
