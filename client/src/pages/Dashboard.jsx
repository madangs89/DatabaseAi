import React, { useState, useCallback } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";
import { CodeBlock, dracula } from "react-code-blocks";
import { github } from "react-code-blocks";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  useReactFlow,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import logoIcon from "../assets/logoIcon.png";
import {
  ArrowUp,
  Bell,
  Brain,
  Cable,
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
import axios from "axios";
import DashbordNav from "../components/DashbordNav";
import { useRef } from "react";
import { useEffect } from "react";
import Loader from "../components/Loader";
import { getElkLayout, typeMessage } from "../utils/elak";

const TableNode = ({ data }) => {
  const {
    title,
    fields,
    theme,
    id,
    code,
    description,
    setSelectedDb, // pass the setter
    selectedDb,
    setRelationshipsOpen,
    setDbOpen,
    setChatOpen,
    setCopyOpen,
    loading,
    setSelectedDbData,
  } = data;

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
      className={`border ${
        title === selectedDb ? "border-blue-500" : "border-black"
      } cursor-pointer ${loading && "pulseAnime"}`}
      onClick={() => {
        setSelectedDb(title);
        setDbOpen(true);
        setChatOpen(false);
        setCopyOpen(false);
        setRelationshipsOpen(false);
        setSelectedDbData({
          title,
          fields,
          theme,
          id,
          code,
          description,
        });
      }}
      style={{
        ...themeStyles[theme],
        // borderRadius: "8px",
        padding: "10px",
        minWidth: 200,
        boxShadow:
          theme === "dark"
            ? "0 4px 12px rgba(0,0,0,0.4)"
            : "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <h3 style={{ marginBottom: "5px" }}>{title}</h3>
      <table style={{ width: "100%", fontSize: "14px" }}>
        <tbody>
          {fields?.map((f, index) => (
            <tr key={f.name + index}>
              <td>{f.name}</td>
              <td
                style={{
                  textAlign: "right",
                  color: theme === "dark" ? "#aaa" : "#555",
                }}
              >
                {f.type.length > 15 ? f.type.substring(0, 10) + "..." : f.type}
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
  const [autoScroll, setAutoScroll] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [dbOpen, setDbOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [relationshipsOpen, setRelationshipsOpen] = useState(false);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState("");
  const [selectedDb, setSelectedDb] = useState(null);
  const [selectedDbData, setSelectedDbData] = useState({});
  const [fitViewChangeTracker, setFitViewChangeTracker] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [isCallingEditApi, setIsCallingEditApi] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [llmChatHistory, setLlmChatHistory] = useState([]);
  const chatContainerRef = useRef(null);
  const [llmCodeFromServer, setLlmCodeFromServer] = useState("");
  const bottomRef = useRef(null);
  const { fitView } = useReactFlow();

  const tableData = [
    {
      id: "welcome",
      name: "🌟 Welcome",

      pos: { x: 100, y: 100 },
    },
    {
      id: "create",
      name: "Create",

      pos: { x: 500, y: 150 },
    },
    {
      id: "your",
      name: "Your",

      pos: { x: 300, y: 350 },
    },
    {
      id: "database",
      name: "Database",

      pos: { x: 700, y: 400 },
    },
    {
      id: "start",
      name: "Get Started",

      pos: { x: 900, y: 150 },
    },
  ];
  // const entity = {
  //   name: "Users",
  //   description: "Stores user account information and login credentials.",
  //   attributes: [
  //     {
  //       name: "id",
  //       type: "INT",
  //       note: "PRIMARY KEY",
  //       description: "Unique identifier for each user.",
  //     },
  //     {
  //       name: "username",
  //       type: "VARCHAR(255)",
  //       note: "UNIQUE",
  //       description: "",
  //     },
  //     {
  //       name: "email",
  //       type: "VARCHAR(255)",
  //       note: "NOT NULL",
  //       description: "",
  //     },
  //   ],
  // };

  // Convert to nodes
  const initialNodes = tableData.map((t) => ({
    id: t.id,
    type: "tableNode",
    position: t.pos,
    code: t?.code ? t.code : null,
    description: t?.description ? t.description : null,
    data: {
      title: t?.name,
      fields: t?.fields,
      theme,
      code: t?.code?.length ? t.code : null,
      id: t?.name?.toLowerCase(),
      description: t?.description ? t?.description : null,
      setSelectedDb, // pass the setter
      selectedDb,
      setDbOpen,
      setChatOpen,
      setCopyOpen,
      loading,
      setSelectedDbData,
    },
  }));
  // Edges (like Xarrow before)
  const initialEdges = [
    {
      id: "e1",
      source: "welcome",
      target: "create",
      data: {
        type: "ONE_TO_ONE",
        description: "Welcome unlocks the power to create.",
      },
      style: { stroke: "gold", strokeWidth: 2 },
    },
    {
      id: "e2",
      source: "create",
      target: "your",
      data: {
        type: "ONE_TO_ONE",
        description: "Creation flows into your world.",
      },
      style: { stroke: "violet", strokeWidth: 2 },
    },
    {
      id: "e3",
      source: "your",
      target: "database",
      data: {
        type: "ONE_TO_ONE",
        description: "Your essence shapes the database.",
      },
      style: { stroke: "turquoise", strokeWidth: 2 },
    },
    {
      id: "e4",
      source: "database",
      target: "start",
      data: {
        type: "ONE_TO_ONE",
        description: "The database invites you to begin.",
      },
      style: { stroke: "pink", strokeWidth: 2 },
    },
  ];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // All Refs
  const inputRef = useRef(null);
  // Handling the submit function
  const handleInputSubmit = async (e) => {
    e.preventDefault();
    if (input.length <= 0) {
      return;
    }

    setChatOpen(true);
    setCopyOpen(false);
    setDbOpen(false);
    setRelationshipsOpen(false);
    setLoading(true);

    const inn = input;
    setInput("");
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: inn, id: uuidv4() },
    ]);

    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    const userQueryResult = await axios.post(
      "http://localhost:5000/create-db",
      {
        message: inn,
        prompt: isCallingEditApi == false ? llmChatHistory : [],
      }
    );
    console.log(userQueryResult.data.data);

    if (
      isCallingEditApi == false &&
      userQueryResult?.data?.data?.initialResponse.length > 0
    ) {
      setLlmChatHistory((prev) => [
        ...prev,
        { role: "user", parts: [{ text: inn }] },
      ]);
      setLlmChatHistory((prev) => [
        ...prev,
        {
          role: "model",
          parts: [
            {
              text: JSON.stringify(userQueryResult?.data?.data),
            },
          ],
        },
      ]);
    }
    if (userQueryResult?.data?.data?.initialResponse.length > 0) {
      await typeMessage({
        text: userQueryResult.data.data.initialResponse,
        sender: "system",
        setChatMessages,
        autoScroll,
        bottomRef,
      });
    }

    setLoading(false);
    if (
      userQueryResult?.data?.data?.entities?.length > 0 &&
      userQueryResult?.data?.data?.relationships?.length > 0
    ) {
      let nodes = userQueryResult?.data?.data?.entities.map((t) => ({
        id: t.name.toLowerCase(),
        type: "tableNode",
        position: t.pos,
        data: {
          title: t?.name,
          fields: t?.fields,
          theme,
          code: t?.code?.length ? t.code : null,
          id: t.name.toLowerCase(),
          description: t?.description ? t.description : null,
          setSelectedDb, // pass the setter
          selectedDb,
          setDbOpen,
          setSelectedDbData,
          setRelationshipsOpen,
          setChatOpen,
          loading,
          setCopyOpen,
        },
      }));
      let edges = userQueryResult?.data?.data?.relationships.map((t) => ({
        id: "e" + new Date().getTime() + Math.random(),
        source: t?.source.toLowerCase(),
        target: t?.target.toLowerCase(),
        data: { type: t?.type, description: t?.description },
        style: { stroke: "gray", strokeWidth: 2 },
      }));
      nodes.forEach((node) => {
        setLlmCodeFromServer((prev) => prev + node.data.code);
      });

      setNodes(nodes);
      setEdges(edges);

      setSelectedDbData(edges[0]);

      setFitViewChangeTracker((prev) => prev + 1);
      setTimeout(() => {
        fitView({ padding: 0.2 });
      }, 100);
      setIsCallingEditApi(true);
    }
    if (userQueryResult?.data?.data?.finalExplanation.length > 0) {
      setLlmChatHistory((prev) => [
        ...prev,
        {
          role: "model",
          parts: [
            {
              text: JSON.stringify(
                userQueryResult?.data?.data?.finalExplanation
              ),
            },
          ],
        },
      ]);

      await typeMessage({
        text: userQueryResult.data.data.finalExplanation,
        sender: "system",
        setChatMessages,
        bottomRef,
        autoScroll,
      });
    }
  };

  // detect user scroll
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 150; // 50px threshold
    setAutoScroll(isAtBottom);
  };
  // Scroll to bottom For Chat
  // useEffect(() => {
  //   if (autoScroll) {
  //     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [chatMessages, autoScroll]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // if (nodes.length > 0 && edges.length > 0) {
    fitView({ padding: 0.2 });
    // }
  }, [fitView, fitViewChangeTracker]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          selectedDb: selectedDb,
          setSelectedDb,
          setDbOpen,
          setSelectedDbData,
          setChatOpen,
          setCopyOpen,
          setRelationshipsOpen,
          loading,
        },
      }))
    );
  }, [selectedDb, loading]);

  useEffect(() => {
    if (relationshipsOpen == true || chatOpen == true || copyOpen == true) {
      setSelectedDb("");
    }

    if (dbOpen == true || chatOpen || copyOpen) {
      setEdges((prev) =>
        prev.map((e) => ({ ...e, style: { stroke: "gray", strokeWidth: 2 } }))
      );
    }
  }, [relationshipsOpen, chatOpen, dbOpen, copyOpen]);

  return (
    <div className="w-full overflow-hidden dm-sans-font relative bg-black h-screen flex-col flex">
      <DashbordNav selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      <div className="w-full h-full overflow-hidden flex">
        {/* LEFT HALF: ReactFlow canvas */}
        <div className="w-[67%] overflow-hidden p-2 flex-shrink-0 items-center justify-center gap-4  border-r-[0.5px] border-[#262626] h-full flex flex-col">
          {/* Nav for left half */}
          <div className="h-12 w-full bg-inherit overflow-hidden flex items-center justify-between px-4">
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
          <div className="flex-1 h-full w-full bg-[#171717]  rounded-lg flex-shrink-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              minZoom={0.1}
              maxZoom={2}
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
            {/* </div> */}
          </div>
          <form
            onSubmit={handleInputSubmit}
            className="h-12 w-[98%] bg-[#171717] px-2  flex gap-2 items-center rounded-lg border-t-[0.5px] border-[#262626]"
          >
            <SearchIcon className="w-5 h-5 text-[#525252]" />
            <input
              type="text"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Create a database for instagram clone..."
              className="flex-1 border-none placeholder:text-[#525252] outline-none bg-transparent text-white"
            />
            <button className="flex items-center justify-center" type="submit">
              {" "}
              {loading ? (
                <Loader />
              ) : (
                <ArrowUp className="w-5 cursor-pointer p-1 h-5 transition-all duration-200 ease-linear text-black bg-white rounded-full " />
              )}
            </button>
          </form>
        </div>
        {/* RIGHT HALF: Red div */}
        <div className="w-1/2 relative h-full  flex-col overflow-hidden bg-[#171717] flex gap-2  justify-center">
          <nav className="w-full sticky top-0 border-b pl-3 border-[#262626] py-7 left-0 h-10 flex justify-between pr-3 bg-[#171717] gap-5 items-center">
            <h1 className="text-white font-bold">
              {chatOpen && "Chat with AI"}
              {dbOpen &&
                `${selectedDb == null ? "" : selectedDb} Entity Details`}
              {copyOpen && "Copy to clipboard"}
              {relationshipsOpen && "Relationships"}
            </h1>
            <div className="flex justify-end gap-5">
              <Brain
                onClick={() => {
                  setDbOpen(false);
                  setRelationshipsOpen(false);
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
                  setRelationshipsOpen(false);
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
                  setRelationshipsOpen(false);
                  setCopyOpen(true);
                }}
                className={`w-5 h-5 cursor-pointer transition-all duration-200 ease-linear ${
                  copyOpen ? "text-white" : "text-[#525252]"
                }`}
              />
              <Cable
                onClick={() => {
                  setChatOpen(false);
                  setDbOpen(false);
                  setCopyOpen(false);
                  setRelationshipsOpen(true);
                }}
                className={`w-5 h-5 cursor-pointer transition-all duration-200 ease-linear ${
                  relationshipsOpen ? "text-white" : "text-[#525252]"
                }`}
              />
            </div>
          </nav>
          {/* Ai Chat bot messages */}
          {chatOpen && (
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-4"
            >
              {chatMessages && chatMessages.length > 0 ? (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex  ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[90%] whitespace-pre-line  px-4 py-2 rounded-lg ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-[#232323] text-gray-200"
                      }`}
                    >
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => {
                            const text = String(props.children);
                            if (/^[A-Z].*:$/g.test(text)) {
                              return (
                                <h3 className="font-bold text-white mt-2 mb-1">
                                  {text}
                                </h3>
                              );
                            }
                            return (
                              <p {...props} className="mb-1 leading-relaxed" />
                            );
                          },
                          ul: ({ node, ...props }) => (
                            <ul {...props} className="list-disc ml-5 mb-1" />
                          ),
                          li: ({ node, ...props }) => (
                            <li {...props} className="mb-0.5" />
                          ),
                        }}
                      >
                        {msg.text.replace(/\n{2,}/g, "\n")}
                      </ReactMarkdown>
                    </div>
                    <div ref={bottomRef} />
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[#525252]">Start a conversation</p>
                </div>
              )}
            </div>
          )}
          {dbOpen && (
            <div className=" flex-1 text-white px-3 overflow-y-auto  rounded-lg shadow-lg w-full max-w-md">
              {selectedDbData && selectedDbData.title ? (
                <div className="mb-6">
                  {/* Entity Details */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">
                      Entity Name
                    </label>
                    <input
                      type="text"
                      value={selectedDbData.title}
                      readOnly
                      className="w-full bg-[#232323] outline-none text-white border border-[#3d3c3c] rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Description
                    </label>
                    <textarea
                      value={selectedDbData.description}
                      readOnly
                      className="w-full bg-[#232323] outline-none text-white border border-[#3d3c3c] rounded px-3 py-2 resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Attributes */}
                  <div>
                    <h3 className="text-md font-semibold mb-2">Attributes</h3>
                    {selectedDbData?.fields &&
                      selectedDbData?.fields.length > 0 &&
                      selectedDbData?.fields?.map((attr) => (
                        <div
                          key={attr.name}
                          className="bg-[#232323] outline-none text-white border border-[#3d3c3c] p-3 rounded mb-2"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{attr.name}</span>
                            <div className="flex gap-2 items-center justify-center">
                              {attr.primaryKey == true && (
                                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                                  {"Primary Key"}
                                </span>
                              )}
                              {attr.required == true && (
                                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                                  {"Required"}
                                </span>
                              )}
                              {attr.unique == true && (
                                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                                  {"Unique"}
                                </span>
                              )}
                            </div>
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
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[#525252]">Select a database entity</p>
                </div>
              )}
            </div>
          )}
          {copyOpen && (
            <div className="flex-1 text-white px-3  overflow-y-auto rounded-lg shadow-lg w-full max-w-md">
              {llmCodeFromServer.length > 0 ? (
                <CodeBlock
                  text={llmCodeFromServer}
                  language="javascript"
                  showLineNumbers={true}
                  theme={dracula}
                  wrapLines
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[#525252]">
                    Please create your database.
                    <br /> then we handle the coding part
                  </p>
                </div>
              )}
            </div>
          )}
          {relationshipsOpen && (
            <div className="flex-1 text-white px-3  overflow-y-auto rounded-lg shadow-lg w-full max-w-md">
              {edges?.length > 0 &&
                edges?.map((attr) => (
                  <div
                    onClick={() => {
                      setSelectedRelationshipId(attr.id);
                      setEdges((prev) =>
                        prev.map((e) => {
                          if (e.id == attr.id) {
                            return {
                              ...e,
                              style: { ...e.style, stroke: "#2463EB" },
                            };
                          } else {
                            return {
                              ...e,
                              style: { ...e.style, stroke: "gray" },
                            };
                          }
                        })
                      );
                    }}
                    key={attr.id}
                    className={`bg-[#232323] cursor-pointer outline-none text-white border ${
                      selectedRelationshipId == attr.id
                        ? "border-[#2463EB]"
                        : "border-[#3d3c3c]"
                    } p-3 flex flex-col justify-center gap-4 rounded mb-2`}
                  >
                    <div className="flex justify-between gap-2 items-center mb-1">
                      <span className="font-medium">
                        {attr.source.length > 10
                          ? attr.source.substring(0, 10) + "..."
                          : attr.source}
                      </span>
                      <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                        {attr?.data?.type}
                      </span>
                      <span className="font-medium">
                        {attr.target.length > 10
                          ? attr.target.substring(0, 10) + "..."
                          : attr.target}
                      </span>
                    </div>
                    <span>{attr?.data?.description}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
