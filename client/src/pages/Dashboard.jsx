import React, { useState, useCallback } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
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
  CloudLightning,
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
import { typeMessage } from "../utils/elak";
import Chat from "../components/Chat";
import DatabaseOpen from "../components/DatabaseOpen";
import CodeCopyOpen from "../components/CodeCopyOpen";
import RelationShipDbOpen from "../components/RelationShipDbOpen";
import DashboardRightNav from "../components/DashboardRightNav";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import {
  setChatLoading,
  setDashboardPageLoading,
  setEntityLoading,
  setPageLoading,
} from "../redux/slice/loadingSlice";
import SpinnerLoader from "../components/loaders/SpinnerLoader";
import toast from "react-hot-toast";
import MonacoEditor from "../components/MonacoEditor";

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

  const neutralBgColors = [
    "bg-gray-700",
    "bg-[#78350f]",
    "bg-[#14532d]",
    "bg-[#164e63]",
    "bg-[#1e3a8a]",
    "bg-[#4a044e]",
    "bg-[#500724]",
    "bg-gray-800", // neutral dark gray
    "bg-slate-800", // cool gray-blue
    "bg-indigo-900", // deep indigo
    "bg-purple-900", // rich purple
    "bg-emerald-900", // dark green
    "bg-teal-900", // dark teal
    "bg-rose-900", // muted dark red/pink
    "bg-amber-900", // dark golden
    "bg-cyan-900", // deep cyan
    "bg-fuchsia-900",
  ];

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
  const [index, setIndex] = useState(0);

  // Run once when the node mounts
  useEffect(() => {
    setIndex(Math.floor(Math.random() * neutralBgColors.length)); // pick random color
  }, []);
  return (
    <div
      className={`border  ${
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
      <h3
        className={`font-bold text-lg ${neutralBgColors[index]} text-center py-2 `}
        style={{ marginBottom: "5px" }}
      >
        {title}
      </h3>
      <table style={{ width: "100%", fontSize: "14px" }}>
        <tbody>
          {fields?.map((f, index) => (
            <tr key={f.name + index}>
              <td className="text-lg">{f.name}</td>
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
  const [projectTitle, setProjectTitle] = useState("");
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
  const location = useLocation();
  let { aiPrompt } = location.state || {};
  const auth = useSelector((state) => state?.auth);
  const initialScrollDone = useRef(false);
  const endRef = useRef(null);
  const dispatch = useDispatch();
  const [isWritting, setIsWritting] = useState(false);
  const loadingSlice = useSelector((state) => state.loading);
  const messageQueue = useRef(Promise.resolve());
  const [index, setIndex] = useState(0);
  const { id } = useParams();
  const [isEditingDbCall, setIsEditingDbCall] = useState(false);
  const socket = useSelector((state) => state?.project?.socket);

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
      index,
      setIndex,
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
  const handleInputSubmit = async (e, isAiPrompt = false, aiPrompt = "") => {
    e?.preventDefault();

    if (loading) return;
    let inn;
    if (isAiPrompt == true) {
      inn = aiPrompt;
    } else {
      inn = input;
    }

    if (inn.length <= 0) {
      return;
    }
    setChatOpen(true);
    setCopyOpen(false);
    setDbOpen(false);
    setRelationshipsOpen(false);
    setLoading(true);

    setInput("");

    console.log("setting inn", inn);

    await new Promise((resolve) => {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { sender: "user", text: inn, _id: uuidv4() },
        ]);
        resolve();
      }, 100);
    });

    console.log("chat messages", chatMessages);

    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      console.log("is calling editing api", isEditingDbCall);

      if (isEditingDbCall) {
        console.log("isCallingEditApi");
      } else {
        const userQueryResult = await axios.post(
          "http://localhost:5000/create-db",
          {
            message: inn,
            userId: auth?.user?._id,
            prompt: llmChatHistory,
            projectId: id,
          },
          {
            withCredentials: true,
          }
        );
        console.log(userQueryResult.data);

        if (userQueryResult?.data?.data?.initialResponse.length > 0) {
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
        setChatMessages((prev) => prev.filter((c) => c.type !== "status"));
        if (userQueryResult?.data?.data?.initialResponse.length > 0) {
          await typeMessage({
            text: userQueryResult.data.data.initialResponse,
            sender: "system",
            setChatMessages,
            type: "normal",
            autoScroll,
            bottomRef,
            isWritting,
            setIsWritting,
            messageQueue,
          });
        }
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
              code: t?.code?.length ? t.code : null,
              id: t.name.toLowerCase(),
              description: t?.description ? t.description : null,
              theme,
              setSelectedDb, // pass the setter
              selectedDb,
              setDbOpen,
              index,
              setIndex,
              setSelectedDbData,
              setRelationshipsOpen,
              setChatOpen,
              loading,
              setCopyOpen,
            },
          }));

          let edges = userQueryResult?.data?.data?.relationships.map((t) => ({
            id: uuidv4(),
            source: t?.source.toLowerCase(),
            target: t?.target.toLowerCase(),
            data: { type: t?.type, description: t?.description },
            style: { stroke: "gray", strokeWidth: 2 },
          }));
          nodes.forEach((node) => {
            setLlmCodeFromServer((prev) => prev + node.data.code);
          });
          setSelectedDbData(nodes[0]);

          setNodes(nodes);
          setEdges(edges);

          setFitViewChangeTracker((prev) => prev + 1);
          setTimeout(() => {
            fitView({ padding: 0.2, duration: 800 }); // smooth zoom
          }, 50);

          setIsEditingDbCall(true);
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
          setIsEditingDbCall(true);
          await typeMessage({
            text: userQueryResult.data.data.finalExplanation,
            sender: "system",
            type: "normal",
            setChatMessages,
            bottomRef,
            autoScroll,
            isWritting,
            setIsWritting,
            messageQueue,
          });
        }
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
      setChatMessages((prev) => prev.filter((c) => c.type !== "status"));
      setLoading(false);
    }
  };
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 150; // 50px threshold
    setAutoScroll(isAtBottom);
  };

  useEffect(() => {
    if (nodes.length > 0 && !selectedDbData?.id) {
      setSelectedDbData(nodes[0]);
    }
  }, [nodes]);
  useEffect(() => {
    if (aiPrompt && aiPrompt.length > 0) {
      (async () => {
        await handleInputSubmit({ preventDefault: () => {} }, true, aiPrompt);
      })();
    } else {
      (async () => {
        dispatch(setDashboardPageLoading(true));
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/project/${id}`,
            { withCredentials: true }
          );
          if (res.data.success) {
            setProjectTitle(res.data.data.title);
          }
          dispatch(setDashboardPageLoading(false));
        } catch (error) {
          toast.error("Unable to fetch project");
          dispatch(setDashboardPageLoading(false));
        }
      })();
      (async () => {
        dispatch(setEntityLoading(true));
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/schema/${id}`,
            { withCredentials: true }
          );
          if (res.data.success) {
            console.log(res.data.data);

            let nodes = res?.data?.data?.nodes.map((i) => {
              return {
                id: i.id.toLowerCase(),
                type: "tableNode",
                position: i.position,
                data: {
                  ...i.data,
                  theme,
                  setSelectedDb, // pass the setter
                  selectedDb,
                  setDbOpen,
                  setSelectedDbData,
                  setRelationshipsOpen,
                  setChatOpen,
                  loading,
                  index,
                  setIndex,
                  setCopyOpen,
                },
              };
            });

            let code = "";
            nodes.forEach((node) => {
              code += node.data.code;
            });
            setSelectedDbData(nodes[0]);
            setLlmCodeFromServer(code);
            setNodes(nodes);
            let edges = res?.data?.data?.edges.map((e) => {
              return { ...e, style: { stroke: "gray", strokeWidth: 2 } };
            });
            setEdges(edges);
          }
          console.log("setting is calling editing api true");

          setIsEditingDbCall(true);
          dispatch(setEntityLoading(false));
        } catch (error) {
          toast.error("Unable to fetch schema");
          dispatch(setEntityLoading(false));
        }
      })();
      (async () => {
        try {
          dispatch(setChatLoading(true));
          const chat = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/conversation/chat/${id}`
          );
          if (chat.data.success) {
            setChatMessages(chat?.data?.data);
            console.log(chat?.data?.data);

            console.log("chat", chat.data.data);

            let llmHistory = chat?.data?.data?.map((i) => {
              console.log("i", i.sender, i.text);

              if (i?.sender == "user") {
                return {
                  role: "user",
                  parts: [{ text: JSON.stringify(i?.text) }],
                };
              } else {
                return {
                  role: "model",
                  parts: [
                    {
                      text: JSON.stringify({
                        isDbCall: false,
                        dbPrompt: "",
                        dbConvKey: "",
                        initialResponse: i?.text,
                      }),
                    },
                  ],
                };
              }
            });

            console.log("llm chat history", llmHistory);

            setLlmChatHistory(llmHistory);
          }
          dispatch(setChatLoading(false));
        } catch (error) {
          console.log("unable to fetch chat", error);

          toast.error("Unable to fetch Chat");
          dispatch(setChatLoading(false));
        }
      })();
    }
  }, [aiPrompt, id, dispatch]);

  // For socket connection
  useEffect(() => {
    if (socket) {
      socket.on("statusUpdate", (data) => {
        if (data.projectId == id) {
          setLoading(true);
          messageQueue.current = messageQueue.current.then(async () => {
            if (data?.isScroll) {
              await typeMessage({
                text: data.message,
                sender: "system",
                type: "status",
                setChatMessages,
                autoScroll,
                bottomRef,
                isWritting,
                setIsWritting,
                messageQueue,
              });
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            } else {
              await typeMessage({
                text: data.message,
                sender: "system",
                type: "normal",
                setChatMessages,
                autoScroll,
                bottomRef,
                isWritting,
                setIsWritting,
                messageQueue,
              });
            }
          });
        }
      });
    }
    return () => {
      if (socket) {
        socket.off("statusUpdate");
      }
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("nodesAndEdgesData", async (data) => {
        const { nodes, edges, projectId, initialResponse, finalExplanation } =
          JSON.parse(data);
        console.log("handle comes to nodes and edges", nodes, edges);

        if (projectId == id && isEditingDbCall == false) {
          console.log("both project ids are same so it is adding here");
          setChatMessages((prev) => prev.filter((c) => c.type !== "status"));
          setLlmChatHistory((prev) => [
            ...prev,
            {
              role: "model",
              parts: [
                {
                  text: JSON.stringify(initialResponse),
                },
              ],
            },
          ]);
          await typeMessage({
            text: initialResponse,
            sender: "system",
            type: "normal",
            setChatMessages,
            bottomRef,
            autoScroll,
            isWritting,
            setIsWritting,
            messageQueue,
          });

          let nod = nodes.map((i) => {
            return {
              id: i.id.toLowerCase(),
              type: "tableNode",
              position: i.position,
              data: {
                ...i.data,
                theme,
                setSelectedDb, // pass the setter
                selectedDb,
                setDbOpen,
                setSelectedDbData,
                setRelationshipsOpen,
                setChatOpen,
                loading,
                index,
                setIndex,
                setCopyOpen,
              },
            };
          });
          let code = "";
          nodes.forEach((node) => {
            code += node.data.code;
          });
          setSelectedDbData(nodes[0]);
          setLlmCodeFromServer(code);
          setNodes(nod);
          dispatch(setEntityLoading(false));
          let edg = edges.map((e) => {
            return { ...e, style: { stroke: "gray", strokeWidth: 2 } };
          });
          setEdges(edg);
          setLlmChatHistory((prev) => [
            ...prev,
            {
              role: "model",
              parts: [
                {
                  text: JSON.stringify(finalExplanation),
                },
              ],
            },
          ]);
          await typeMessage({
            text: finalExplanation,
            sender: "system",
            type: "normal",
            setChatMessages,
            bottomRef,
            autoScroll,
            isWritting,
            setIsWritting,
            messageQueue,
          });
          setChatMessages((prev) => prev.filter((c) => c.type !== "status"));
          setIsEditingDbCall(true);
          setLoading(false);
        }
      });

      socket.on("apiError", async (data) => {
        const { projectId, text } = JSON.parse(data);
        if (projectId == id) {
          setLoading(false);
          setChatMessages((prev) => prev.filter((c) => c.type !== "status"));
          toast.error(text || "Something went wrong, Please Try Again Later");
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("nodesAndEdgesData");
        socket.off("apiError");
      }
    };
  }, [socket]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!socket || !auth?.user?._id) return;
    try {
      socket.emit(
        "locationUpdate",
        JSON.stringify({
          userId: auth?.user?._id,
          location: "dashboard",
        })
      );
    } catch (error) {
      console.log(error);
    }
    return () => {
      socket.emit(
        "locationUpdate",
        JSON.stringify({
          userId: auth?.user?._id,
          location: "locationUpdate",
          isStayOutCall: loading ? true : false,
          projectId: id,
        })
      );
    };
  }, [socket, auth?.user?._id , loading]);

  useEffect(() => {
    if (!initialScrollDone.current && chatMessages.length > 0) {
      const scrollToBottom = () => {
        // bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
        initialScrollDone.current = true; // mark as done
      };

      // Wait for DOM to render fully (especially dynamic Markdown)
      const id = requestAnimationFrame(scrollToBottom);

      return () => cancelAnimationFrame(id);
    }
  }, [chatMessages]);

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      fitView({ padding: 0.2, duration: 800 });
    }
  }, [nodes, edges, fitView]);

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

  if (loadingSlice?.dashboardPageLoading) {
    return (
      <div className="flex justify-center bg-black items-center w-full h-screen">
        <SpinnerLoader />
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden dm-sans-font relative bg-black h-screen flex-col flex">
      <DashbordNav
        selectedTab={selectedTab}
        projectTitle={projectTitle}
        setSelectedTab={setSelectedTab}
      />
      <div className="w-full h-full overflow-hidden flex">
        {selectedTab == "api" ? (
          <MonacoEditor />
        ) : (
          <>
            <div className="flex-1 overflow-hidden p-2 flex-shrink-0 items-center justify-center gap-4  border-r-[0.5px] border-[#262626] h-full flex flex-col">
              {/* Nav for left half */}
              <div className="h-12 w-full bg-inherit overflow-hidden flex items-center justify-between px-4 ">
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
              <div className="flex-1 h-full w-full bg-[#171717] rounded-lg flex-shrink-0">
                {loadingSlice?.setEntityLoading ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <SpinnerLoader />
                  </div>
                ) : (
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    onInit={(reactFlowInstance) => {
                      reactFlowInstance.fitView({
                        padding: 0.2,
                        duration: 800,
                      });
                    }}
                    minZoom={0.1}
                    maxZoom={2}
                    proOptions={{ hideAttribution: true }}
                    nodeTypes={nodeTypes}
                  >
                    <Background
                      variant="dots"
                      gap={20}
                      size={1}
                      color={"black"}
                    />
                    <Controls
                      showZoom={true}
                      showFitView={true}
                      showInteractive={true}
                      position="bottom-right"
                      className="bg-[#171717] border-[0.5px] border-[#262626]"
                    />
                  </ReactFlow>
                )}
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
                <button
                  className="flex items-center justify-center"
                  type="submit"
                >
                  {" "}
                  {loading ? (
                    <Loader />
                  ) : (
                    <ArrowUp className="w-5 cursor-pointer p-1 h-5 transition-all duration-200 ease-linear text-black bg-white rounded-full " />
                  )}
                </button>
              </form>
            </div>

            <div className="w-[35%] relative h-full  flex-col overflow-hidden bg-[#171717] lg:flex hidden  gap-2  justify-center">
              <DashboardRightNav
                chatOpen={chatOpen}
                dbOpen={dbOpen}
                copyOpen={copyOpen}
                relationshipsOpen={relationshipsOpen}
                setChatOpen={setChatOpen}
                setDbOpen={setDbOpen}
                setCopyOpen={setCopyOpen}
                setRelationshipsOpen={setRelationshipsOpen}
                selectedDb={selectedDb}
              />
              <Chat
                chatOpen={chatOpen}
                chatMessages={chatMessages}
                chatContainerRef={chatContainerRef}
                handleScroll={handleScroll}
                bottomRef={bottomRef}
              />
              <DatabaseOpen dbOpen={dbOpen} selectedDbData={selectedDbData} />
              <CodeCopyOpen
                llmCodeFromServer={llmCodeFromServer}
                copyOpen={copyOpen}
              />
              <RelationShipDbOpen
                relationshipsOpen={relationshipsOpen}
                edges={edges}
                setSelectedRelationshipId={setSelectedRelationshipId}
                setEdges={setEdges}
                selectedRelationshipId={selectedRelationshipId}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
