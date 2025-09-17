import React, { useState, useCallback } from "react";
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
import { Bell, CircleUser, Settings } from "lucide-react";

// ✅ Custom Table Node
const TableNode = ({ data }) => {
  const { title, fields, theme } = data;

  const themeStyles = {
    dark: {
      background: "#1e1e1e",
      color: "white",
      border: "1px solid #444",
    },
    light: {
      background: "#fff",
      color: "#000",
      border: "1px solid #ccc",
    },
  };

  return (
    <div
      style={{
        ...themeStyles[theme],
        borderRadius: "8px",
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
const Dashboard = () => {
  const [theme, setTheme] = useState("dark");
  const [selectedTab, setSelectedTab] = useState("editor");
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
  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, theme: newTheme },
      }))
    );
  }, [theme, setNodes]);

  return (
    <div className="w-full relative bg-black h-screen flex">
      <nav className="h-16 py-10  w-full pr-3 fixed left-0 top-0 z-[99999] bg-black border-b-[0.5px] border-[#262626] flex justify-between items-center ">
        <div className="flex gap-1 justify-center">
          <img src={logoIcon} className="w-20 h-20 object-contain" alt="" />
          <div className="flex  flex-col justify-center">
            <h1 class="text-lg inter-font text-white font-bold">
              E-commerce Platform
            </h1>
            <p class="text-xs text-neutral-400">main-branch</p>
          </div>
        </div>
        <div className="flex text-md flex-1 items-center justify-center gap-4">
          <button
            onClick={() => setSelectedTab("editor")}
            className={`${
              selectedTab === "editor" && "bg-[#525252]"
            } px-4 py-2 text-[#a3a3a3] dm-sans  font-[800] transition-all duration-200 ease-linear  rounded-md `}
          >
            Editor
          </button>
          <button
            onClick={() => setSelectedTab("api")}
            className={`${
              selectedTab === "api" && "bg-[#525252]"
            } px-4 py-2 text-[#a3a3a3] dm-sans font-[800] transition-all duration-200 ease-linear  rounded-md `}
          >
            Api Explored
          </button>
          <button
            onClick={() => setSelectedTab("version")}
            className={`${
              selectedTab === "version" && "bg-[#525252]"
            } px-4 py-2 text-[#a3a3a3] dm-sans font-[800] transition-all duration-200 ease-linear rounded-md `}
          >
            Version Control
          </button>
        </div>
        <div className="flex items-center justify-center gap-4 ">
          <button className="px-2 py-2 bg-[#525252] text-white inter-font font-semibold transition-all duration-200 ease-linear  rounded-md ">
            <Bell />
          </button>
          <button className="px-2 py-2 bg-[#525252] text-white inter-font font-semibold transition-all duration-200 ease-linear  rounded-md ">
            <Settings />
          </button>
          <button className="px-2 py-2 bg-[#525252] text-white inter-font font-semibold transition-all duration-200 ease-linear  rounded-md ">
            <CircleUser />
          </button>
        </div>
      </nav>
      {/* LEFT HALF: ReactFlow canvas */}
      <div className="w-[75%] flex-shrink-0 border-r-[0.5px] border-[#262626] h-full flex-col flex">
        <div className="flex-1 flex-shrink-0">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              nodeTypes={{ tableNode: TableNode }}
            >
              <Background
                variant="dots"
                gap={20}
                size={1}
                color={theme === "dark" ? "#444" : "#bbb"}
              />
              <MiniMap />
              <Controls />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
        <div className="h-24 w-full border-t-[0.5px] border-[#262626]"></div>
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            padding: "8px 14px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            background: theme === "dark" ? "#fff" : "#333",
            color: theme === "dark" ? "#000" : "#fff",
            fontWeight: "bold",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* RIGHT HALF: Red div */}
      <div className="w-1/2 h-full  flex items-center justify-center">
        <h1 className="text-white text-2xl font-bold">Right Side Content</h1>
      </div>
    </div>
  );
};

export default Dashboard;
