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
  Download,
  Menu,
  Search,
  SearchIcon,
  Send,
  SendIcon,
  SendToBack,
  SendToBackIcon,
  Settings,
  Share,
  Share2,
  X,
} from "lucide-react";
import axios from "axios";
import DashbordNav from "../components/DashbordNav";
import { useRef } from "react";
import { useEffect } from "react";
import Loader from "../components/Loader";

import { apiCodeTreeFormatHandler, typeMessage } from "../utils/elak";
import Chat from "../components/Chat";
import DatabaseOpen from "../components/DatabaseOpen";
import CodeCopyOpen from "../components/CodeCopyOpen";
import RelationShipDbOpen from "../components/RelationShipDbOpen";
import DashboardRightNav from "../components/DashboardRightNav";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  setChatLoading,
  setDashboardPageLoading,
  setEntityLoading,
  setPageLoading,
} from "../redux/slice/loadingSlice";
import SpinnerLoader from "../components/loaders/SpinnerLoader";
import toast from "react-hot-toast";
import MonacoEditor from "../components/MonacoEditor";
import {
  setDbConvKey,
  setErrorText,
  setLoadingState,
  setSliceNodes,
  setTree,
} from "../redux/slice/MonacoEditorSlice";
import { setCurrentProjectId } from "../redux/slice/projectSlice";
import { setChatScroll } from "../redux/slice/scrollSlice";
import { setGitAuth } from "../redux/slice/repoSlice";
import { exportProject } from "../utils/exportHelper";

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
  const [selectedProjectDetails, setSelectedProjectDetails] = useState({});
  const [autoScroll, setAutoScroll] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [dbOpen, setDbOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [relationshipsOpen, setRelationshipsOpen] = useState(false);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState("");
  const [selectedDb, setSelectedDb] = useState(null);
  const [selectedDbData, setSelectedDbData] = useState({});
  const [isSaved, setIsSaved] = useState(0);
  const [fitViewChangeTracker, setFitViewChangeTracker] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [isCallingEditApi, setIsCallingEditApi] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [llmChatHistory, setLlmChatHistory] = useState([]);
  const chatContainerRef = useRef(null);
  const [mobileSelectedTab, setMobileSelectedTab] = useState(false);
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
  const navigate = useNavigate();
  const rfInstance = useRef(null);
  const [isEditingDbCall, setIsEditingDbCall] = useState(false);
  const socket = useSelector((state) => state?.project?.socket);
  const monacoSlice = useSelector((state) => state?.monaco);
  const scrollSlice = useSelector((state) => state?.scrollS);
  const repoSlice = useSelector((state) => state?.repo);
  const [showShare, setShowShare] = useState(false);
  const [shareLink, setShareLink] = useState("No link loaded yet.Please Wait");
  const [shareLoader, setShareLoader] = useState(false);
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

  const [editLlmHistory, setEditLlmHistory] = useState([]);
  // Convert to nodes
  const initialNodes = tableData.map((t) => ({
    id: t.id,
    type: "tableNode",
    position: t.pos?.x
      ? t.pos
      : { x: Math.random() * 500, y: Math.random() * 500 },
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

    if (auth?.usageToken >= 1000000) {
      toast.error(
        "Token Limit for free users has been exceeded. Please upgrade to premium to continue using this feature."
      );
      return;
    }

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
    dispatch(setLoadingState(1));

    setInput("");

    console.log("setting inn", inn);

    setTimeout(() => {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }, 100);

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

    setMobileSelectedTab(true);

    if (isEditingDbCall) {
      try {
        const formatedNode = nodes.map((n) => ({
          id: n.id,
          data: {
            title: n.data.title,
            fields: n.data.fields,
            code: n.data.code,
            description: n.data.description,
          },
        }));

        const EditQuery = await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/edit-db`,
          {
            message: inn,
            projectId: id,
            nodes: formatedNode,
            edges: edges,
            history: editLlmHistory.length > 0 ? editLlmHistory : [],
          },
          {
            withCredentials: true,
          }
        );
        setEditLlmHistory((prev) => [
          ...prev,
          { role: "user", parts: [{ text: inn }] },
        ]);
        setEditLlmHistory((prev) => [
          ...prev,
          {
            role: "model",
            parts: [
              {
                text: JSON.stringify(EditQuery?.data?.data),
              },
            ],
          },
        ]);
        console.log(EditQuery.data);
        if (EditQuery?.data?.success) {
          console.log(EditQuery.data.data);
          if (
            EditQuery?.data?.data?.operation &&
            EditQuery?.data?.data?.id &&
            EditQuery?.data?.data?.id?.length > 0 &&
            EditQuery?.data?.data?.operation?.length > 0
          ) {
            setIsSaved(2);
            switch (EditQuery?.data?.data?.operation) {
              case "addEntity":
                {
                  const id =
                    EditQuery?.data?.data?.target || EditQuery?.data?.data?.id;
                  if (id.length <= 0) {
                    return;
                  }
                  const newNodeData = {
                    id: id.toLowerCase(),
                    type: "tableNode",
                    position: {
                      x:
                        Math.random() *
                        ((nodes[nodes.length - 1]?.position?.x || 0) + 100),
                      y:
                        Math.random() *
                        ((nodes[nodes.length - 1]?.position?.y || 0) + 100),
                    },
                    data: {
                      id: EditQuery?.data?.data?.details?.title?.toLowerCase(),
                      title: EditQuery?.data?.data?.details?.title,
                      fields: EditQuery?.data?.data?.details?.fields,
                      code: EditQuery?.data?.data?.details?.code
                        ? EditQuery?.data?.data?.details?.code
                        : null,
                      theme,
                      selectedDb,
                      loading,
                      index: nodes.length,
                      description: EditQuery?.data?.data?.details?.description,
                    },
                  };
                  setNodes((prev) => [...prev, newNodeData]);
                  toast.success(
                    `${EditQuery?.data?.data?.details?.title} added Successfully`
                  );
                }
                break;
              case "addField":
                {
                  const id =
                    EditQuery?.data?.data?.id?.toLowerCase() ||
                    EditQuery?.data?.data?.target?.toLowerCase();
                  if (id.length <= 0) {
                    return;
                  }
                  setNodes((prev) => {
                    return prev.map((n) => {
                      if (n?.id?.toLowerCase() === id) {
                        return {
                          ...n,
                          data: {
                            ...n?.data,
                            fields: [
                              ...(n?.data?.fields ? n.data.fields : []),
                              EditQuery?.data?.data?.details.field,
                            ],
                            code: EditQuery?.data?.data?.details?.code
                              ? EditQuery?.data?.data?.details?.code
                              : n?.data?.code,
                          },
                        };
                      }
                      return n;
                    });
                  });
                  toast.success(`Added Successfully`);
                }
                break;
              case "addRelationship":
                {
                  const id = uuidv4();
                  if (id.length <= 0) {
                    return;
                  }
                  const newEdgeData = {
                    id,
                    source: EditQuery?.data?.data?.details?.from?.toLowerCase(),
                    target: EditQuery?.data?.data?.details?.to?.toLowerCase(),
                    data: {
                      type: EditQuery?.data?.data?.details?.type,
                      description: EditQuery?.data?.data?.details?.description,
                      style: { stroke: "gray", strokeWidth: 2 },
                    },
                  };
                  setEdges((prev) => [...prev, newEdgeData]);
                  toast.success(
                    `${
                      EditQuery?.data?.data?.target
                        ? EditQuery.data.data.target
                        : ""
                    } Added Successfully`
                  );
                }
                break;
              case "editField":
                {
                  const id =
                    EditQuery?.data?.data?.id?.toLowerCase() ||
                    EditQuery?.data?.data?.target?.toLowerCase();
                  if (id.length <= 0) {
                    return;
                  }
                  setNodes((prev) => {
                    return prev.map((n) => {
                      if (n?.id?.toLowerCase() == id) {
                        return {
                          ...n,
                          data: {
                            ...n?.data,
                            fields: n.data.fields.map((f) => {
                              if (
                                f.name.toLowerCase() ==
                                EditQuery?.data?.data?.details?.oldName.toLowerCase()
                              ) {
                                return {
                                  ...f,
                                  ...EditQuery?.data?.data?.details?.newField,
                                };
                              }
                              return f;
                            }),
                          },
                        };
                      }
                      return n;
                    });
                  });
                  toast.success(`Edited Successfully`);
                }
                break;
              case "editFieldType":
                {
                  const id =
                    EditQuery?.data?.data?.id?.toLowerCase() ||
                    EditQuery?.data?.data?.target?.toLowerCase();
                  if (id.length <= 0) {
                    return;
                  }
                  setNodes((prev) => {
                    return prev.map((n) => {
                      if (n?.id?.toLowerCase() == id) {
                        return {
                          ...n,
                          data: {
                            ...n?.data,
                            fields: n.data.fields.map((f) => {
                              if (
                                f?.name.toLowerCase() ==
                                EditQuery?.data?.data?.details?.fieldName.toLowerCase()
                              ) {
                                return {
                                  ...f,
                                  type: EditQuery?.data?.data?.details?.newType,
                                };
                              }
                              return f;
                            }),
                          },
                        };
                      }
                      return n;
                    });
                  });
                  toast.success(`Edited field type Successfully`);
                }
                break;
              case "editFieldConstraints":
                {
                  const id =
                    EditQuery?.data?.data?.id?.toLowerCase() ||
                    EditQuery?.data?.data?.target?.toLowerCase();
                  if (!id || id.length <= 0) return;
                  setNodes((prev) => {
                    return prev.map((n) => {
                      if (n?.id?.toLowerCase() === id) {
                        return {
                          ...n,
                          data: {
                            ...n.data,
                            fields: n.data.fields.map((f) => {
                              if (
                                f?.name.toLowerCase() ===
                                EditQuery?.data?.data?.details?.fieldName.toLowerCase()
                              ) {
                                return {
                                  ...f,
                                  ...EditQuery?.data?.data?.details
                                    ?.constraints,
                                };
                              }
                              return f;
                            }),
                          },
                        };
                      }
                      return n;
                    });
                  });
                  toast.success(`Field constraints updated successfully`);
                }
                break;
              case "editEntityName":
                {
                  const id =
                    EditQuery?.data?.data?.id?.toLowerCase() ||
                    EditQuery?.data?.data?.target?.toLowerCase();
                  if (!id || id.length <= 0) return;

                  const newName = EditQuery?.data?.data?.details?.newName;

                  setNodes((prev) => {
                    return prev.map((n) => {
                      if (n?.id?.toLowerCase() === id) {
                        return {
                          ...n,
                          data: {
                            ...n.data,
                            id: newName.toLowerCase(), // Update node id
                            title: newName, // Update displayed title
                          },
                        };
                      }
                      return n;
                    });
                  });

                  setEdges((prev) =>
                    prev.map((e) => {
                      return {
                        ...e,
                        source:
                          e.source.toLowerCase() ==
                          EditQuery?.data?.data?.target.toLowerCase()
                            ? newName.toLowerCase()
                            : e.source,
                        target:
                          e.target.toLowerCase() ==
                          EditQuery?.data?.data?.target.toLowerCase()
                            ? newName.toLowerCase()
                            : e.target,
                      };
                    })
                  );

                  toast.success(
                    `Renamed entity '${EditQuery?.data?.data?.target}' to '${newName}'`
                  );
                }
                break;
              case "editEntityDescription":
                {
                  const id =
                    EditQuery?.data?.data?.id?.toLowerCase() ||
                    EditQuery?.data?.data?.target?.toLowerCase();
                  if (!id || id.length <= 0) return;

                  const newDescription =
                    EditQuery?.data?.data?.details?.newDescription;

                  setNodes((prev) => {
                    return prev.map((n) => {
                      if (n?.id?.toLowerCase() === id) {
                        return {
                          ...n,
                          data: {
                            ...n.data,
                            description: newDescription, // Update description
                          },
                        };
                      }
                      return n;
                    });
                  });

                  toast.success(
                    `Updated the description of '${EditQuery?.data?.data?.target}' entity.`
                  );
                }
                break;
              case "editRelationship":
                {
                  const id = EditQuery?.data?.data?.id.toLowerCase();
                  if (!id || id.length <= 0) return;

                  const { type, from, to } =
                    EditQuery?.data?.data?.details || {};

                  setEdges((prev) => {
                    return prev.map((e) => {
                      if (e.id.toLowerCase() === id) {
                        return {
                          ...e,
                          source: from?.toLowerCase() || e.source,
                          target: to?.toLowerCase() || e.target,
                          data: {
                            ...e.data,
                            type: type || e.data.type,
                          },
                        };
                      }
                      return e;
                    });
                  });

                  toast.success(
                    `Edited relationship ${EditQuery?.data?.data?.target}`
                  );
                }
                break;
              case "editRelationshipEndpoints":
                {
                  const id = EditQuery?.data?.data?.id.toLowerCase();
                  if (!id || id.length <= 0) return;

                  // Safely destructure details
                  const { from, to } = EditQuery?.data?.data?.details || {};

                  setEdges((prev) => {
                    return prev.map((e) => {
                      if (e?.id?.toLowerCase() === id) {
                        return {
                          ...e,
                          source: from?.toLowerCase() || e.source,
                          target: to?.toLowerCase() || e.target,
                        };
                      }
                      return e;
                    });
                  });

                  toast.success(
                    `Updated the endpoints of '${EditQuery?.data?.data?.target}' relationship to connect '${from}' and '${to}'.`
                  );
                }
                break;
              case "editRelationshipCardinality":
                {
                  const id = EditQuery?.data?.data?.id.toLowerCase();
                  if (!id || id.length <= 0) return;

                  // Safely get new type
                  const { newType } = EditQuery?.data?.data?.details || {};

                  setEdges((prev) => {
                    return prev.map((e) => {
                      if (e.id.toLowerCase() === id) {
                        return {
                          ...e,
                          data: {
                            ...e.data,
                            type: newType || e.data.type, // Update cardinality/type
                          },
                        };
                      }
                      return e;
                    });
                  });

                  toast.success(
                    `Changed relationship cardinality to '${newType}'`
                  );
                }
                break;
              case "deleteField":
                {
                  const id =
                    EditQuery?.data?.data?.id?.toLowerCase() ||
                    EditQuery?.data?.data?.target?.toLowerCase();
                  if (!id || id.length <= 0) return;

                  const { fieldName } = EditQuery?.data?.data?.details || {};

                  setNodes((prev) => {
                    return prev.map((n) => {
                      if (n?.id?.toLowerCase() === id) {
                        return {
                          ...n,
                          data: {
                            ...n.data,
                            fields: (n.data.fields || []).filter(
                              (f) =>
                                f?.name.toLowerCase() !==
                                fieldName?.toLowerCase()
                            ),
                          },
                        };
                      }
                      return n;
                    });
                  });

                  toast.success(
                    `Deleted field '${fieldName}' from '${EditQuery?.data?.data?.target}'`
                  );
                }
                break;

              case "deleteEntity":
                {
                  const id =
                    EditQuery?.data?.data?.id?.toLowerCase() ||
                    EditQuery?.data?.data?.target?.toLowerCase();
                  if (!id || id.length <= 0) return;

                  setNodes((prev) =>
                    prev.filter((n) => n?.id?.toLowerCase() !== id)
                  );

                  setEdges((prev) =>
                    prev.filter(
                      (e) =>
                        e.source.toLowerCase() !=
                          EditQuery?.data?.data?.target ||
                        e.target.toLowerCase() != EditQuery?.data?.data?.target
                    )
                  );

                  toast.success(
                    `Deleted '${EditQuery?.data?.data?.target}' entity`
                  );
                }
                break;

              case "deleteRelationship":
                {
                  const id = EditQuery?.data?.data?.id;
                  if (!id || id.length <= 0) return;

                  // Remove the edge with the given id
                  setEdges((prev) => prev.filter((e) => e.id !== id));

                  toast.success(
                    `Deleted '${EditQuery?.data?.data?.target}' relationship`
                  );
                }
                break;
            }
            console.log("operation", EditQuery?.data?.data);
          }
          if (
            EditQuery?.data?.data?.initialResponse &&
            EditQuery?.data?.data?.initialResponse?.length > 0
          ) {
            setChatMessages((prev) => {
              const filtered = prev.filter((c) => c.type !== "status");
              return [...filtered];
            });
            await typeMessage({
              text: EditQuery?.data?.data?.initialResponse,
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
        }
        setChatMessages((prev) => {
          const filtered = prev.filter((c) => c.type !== "status");
          return [...filtered];
        });
        setLoading(false);
      } catch (error) {
        toast.error("Something went wrong, Please Try Again Later");
        console.log("Error while sending api error", error);
        setLoading(false);
      } finally {
        setChatMessages((prev) => {
          const filtered = prev.filter((c) => c.type !== "status");
          return [...filtered];
        });
        setLoading(false);
        setIsSaved(3);
      }
    } else {
      try {
        console.log("is calling editing api", isEditingDbCall);

        const userQueryResult = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/create-db`,
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

        if (
          userQueryResult?.data?.data?.initialResponse &&
          userQueryResult?.data?.data?.initialResponse?.length > 0
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
        setChatMessages((prev) => {
          const filtered = prev.filter((c) => c.type !== "status");
          return [...filtered];
        });
        if (
          userQueryResult?.data?.data?.initialResponse &&
          userQueryResult?.data?.data?.initialResponse?.length > 0
        ) {
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
        console.log("dbconvokey", userQueryResult?.data?.data?.dbConvKey);
        if (userQueryResult?.data?.data?.dbConvKey) {
          if (userQueryResult?.data?.data?.projectId == id) {
            dispatch(setDbConvKey(userQueryResult?.data?.data?.dbConvKey));
          }
        }
        if (
          userQueryResult?.data?.data?.entities?.length > 0 &&
          userQueryResult?.data?.data?.relationships?.length > 0
        ) {
          let nodes = userQueryResult?.data?.data?.entities.map((t) => ({
            id: t.name.toLowerCase(),
            type: "tableNode",
            position: t.pos?.x
              ? t.pos
              : { x: Math.random() * 500, y: Math.random() * 500 },
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
          // setSelectedDbData(nodes[0]);

          setNodes(nodes);
          setEdges(edges);

          setFitViewChangeTracker((prev) => prev + 1);
          setTimeout(() => {
            fitView({ padding: 0.2, duration: 800 }); // smooth zoom
          }, 50);

          if (monacoSlice?.tree.length <= 0) {
            dispatch(setLoadingState(2));
          }
          setIsEditingDbCall(true);
        }
        if (
          userQueryResult?.data?.data?.finalExplanation &&
          userQueryResult?.data?.data?.finalExplanation?.length > 0
        ) {
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
          setChatMessages((prev) => {
            const filtered = prev.filter((c) => c.type !== "status");
            return [...filtered];
          });
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
        setIsSaved(1);
        setLoading(false);
        console.log("updating monaco slice ", monacoSlice.loadingState);
      } catch (error) {
        console.log(error);
        setChatMessages((prev) => {
          const filtered = prev.filter((c) => c.type !== "status");
          return [...filtered];
        });
        toast.error("Something went wrong, Please Try Again Later");
        if (monacoSlice?.tree.length <= 0) {
          dispatch(setLoadingState(3));
        }
        dispatch(setErrorText("Something went wrong please try again"));
        setLoading(false);
      }
    }
  };
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // const isAtBottom = scrollHeight - scrollTop <= clientHeight + 150;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    dispatch(setChatScroll(scrollTop));
    setAutoScroll(isAtBottom);
  };

  useEffect(() => {
    if (selectedDb) {
      console.log("finding", selectedDb);

      // const node = nodes.find((n) => (n?.id || n?.data?.title) == selectedDb);
      let n;
      nodes.forEach((node) => {
        if (
          node.id.toLowerCase() == selectedDb.toLowerCase() ||
          node.data.title.toLowerCase() == selectedDb.toLowerCase()
        ) {
          n = node;
        }
      });
      console.log("finded", n);
      setSelectedDbData(n);
    }
  }, [selectedDb]);

  const handleFromSubmit = async (e) => {
    e.preventDefault();
    try {
      const { title, description, status, privacy } = selectedProjectDetails;
      if (!title || !description || !status || !privacy) {
        return toast.error("Please fill all the fields");
      }
      const result = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/project/${id}`,
        {
          title,
          description,
          status,
          privacy,
        },
        { withCredentials: true }
      );

      if (result.data.success) {
        toast.success("Project updated successfully");
        setSelectedTab("editor");
      }
    } catch (error) {
      toast.error("Unable to update project Details, Please Try Again Later");
      console.log(error);
    }
  };

  useEffect(() => {
    setIsSaved(3);
    const editSaveHandler = async () => {
      if (isSaved == 3) {
        try {
          if (nodes.length > 0 && edges.length > 0) {
            const newNode = nodes.map((node) => {
              return {
                id: node?.id,
                position: node?.position,
                data: {
                  title: node?.data?.title,
                  fields: node?.data?.fields,
                  code: node?.data?.code?.length ? node.data.code : null,
                  description: node?.data?.description
                    ? node.data.description
                    : null,
                },
              };
            });
            const newEdges = edges.map((edge) => {
              return {
                id: edge?.id,
                source: edge?.source,
                target: edge?.target,
                data: {
                  type: edge?.data?.type,
                  description: edge?.data?.description,
                },
              };
            });

            const reSavingEditedNodesAndEdgeResponse = await axios.patch(
              `${import.meta.env.VITE_BACKEND_URL}/schema/update-nodes-edges`,
              {
                projectId: id,
                nodes: newNode,
                edges: newEdges,
              },
              {
                withCredentials: true,
              }
            );
            console.log(reSavingEditedNodesAndEdgeResponse);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    editSaveHandler();
    let code = "";
    nodes.forEach((node) => {
      code += node.data.code;
    });
    setLlmCodeFromServer(code);
    // setSelectedDbData(nodes[0]);
    setIsSaved(1);
  }, [nodes, edges, isSaved, id]);

  useEffect(() => {
    if (loading == false) {
      setChatMessages((prev) => {
        const filtered = prev.filter((c) => c.type !== "status");
        return [...filtered];
      });
    }
  }, [loading]);

  // useEffect(() => {
  //   if (nodes.length > 0 && !selectedDbData?.id) {
  //     // setSelectedDbData(nodes[0]);
  //   }
  // }, [nodes]);
  useEffect(() => {
    (async () => {
      dispatch(setDashboardPageLoading(true));
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/project/${id}`,
          { withCredentials: true }
        );
        if (res.data.success) {
          console.log("selected Project Detials", res.data.data);

          setSelectedProjectDetails(res.data.data);
          setProjectTitle(res.data.data.title);
        }
        dispatch(setDashboardPageLoading(false));
      } catch (error) {
        toast.error("Unable to fetch project");
        dispatch(setDashboardPageLoading(false));
      }
    })();

    if (aiPrompt && aiPrompt.length > 0) {
      (async () => {
        await handleInputSubmit({ preventDefault: () => {} }, true, aiPrompt);
      })();
    } else {
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
                position: i.position?.x
                  ? i.position
                  : { x: Math.random() * 500, y: Math.random() * 500 },
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
            // setSelectedDbData(nodes[0]);
            setLlmCodeFromServer(code);
            setNodes(nodes);
            let edges = res?.data?.data?.edges.map((e) => {
              return { ...e, style: { stroke: "gray", strokeWidth: 2 } };
            });

            if (res?.data?.data?.dbConvKey) {
              if (res?.data?.data?.projectId == id) {
                dispatch(setDbConvKey(res?.data?.data?.dbConvKey));
              }
            }
            setEdges(edges);
            console.log("adding api codes");
            if (
              (res?.data?.data?.apiCodes != null ||
                res?.data?.data?.apiCodes != undefined) &&
              Object.keys(res?.data?.data?.apiCodes).length > 0
            ) {
              const formatedTree = apiCodeTreeFormatHandler(
                res?.data?.data?.apiCodes
              );
              dispatch(setTree(formatedTree));
              console.log(
                "setting set loading state to 0 after formatting tree"
              );
              dispatch(setLoadingState(0));
            } else {
              const apiCodeStatus = await axios.get(
                `${
                  import.meta.env.VITE_BACKEND_URL
                }/project/api-code-status/${id}`,
                { withCredentials: true }
              );
              console.log("api code status", apiCodeStatus);
              console.log(apiCodeStatus.data);

              if (apiCodeStatus?.data?.success) {
                const status = apiCodeStatus?.data?.isGenerating;
                console.log(status);

                if (status) {
                  console.log("setting set loading state to 2  status", status);

                  dispatch(setLoadingState(2));
                } else {
                  dispatch(
                    setErrorText(
                      "Unable to fetch code. May be not generated yet. Please try again later"
                    )
                  );
                  console.log(
                    "setting set loading state to 0 in else of status block"
                  );
                  dispatch(setLoadingState(3));
                }
              } else {
                dispatch(
                  setErrorText(
                    "Unable to fetch code. May be not generated yet. Please try again later"
                  )
                );
                console.log(
                  "setting set loading state to 0 in else of status block"
                );
                dispatch(setLoadingState(3));
              }
            }
          }
          console.log("setting is calling editing api true");
          setIsSaved(1);
          setIsEditingDbCall(true);
          dispatch(setEntityLoading(false));
        } catch (error) {
          console.log(error);

          if (monacoSlice?.tree.length <= 0) {
            dispatch(setLoadingState(3));
          }
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
        console.log("status update", data);
        if (data.projectId == id) {
          dispatch(setLoadingState(1));
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
              let t;
              if (data?.type == "error") {
                t = "error";
              }
              await typeMessage({
                text: data.message,
                sender: "system",
                type: t ? t : "normal",
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
          setChatMessages((prev) => {
            const filtered = prev.filter((c) => c.type !== "status");
            return [...filtered];
          });
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
              position: i.position?.x
                ? i.position
                : { x: Math.random() * 500, y: Math.random() * 500 },
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
          // setSelectedDbData(nodes[0]);
          setLlmCodeFromServer(code);
          setNodes(nod);
          dispatch(setLoadingState(2));
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
          setChatMessages((prev) => {
            const filtered = prev.filter((c) => c.type !== "status");
            return [...filtered];
          });

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
          setIsEditingDbCall(true);
          setLoading(false);
          setIsSaved(1);
        }
      });

      socket.on("apiError", async (data) => {
        const { projectId, text } = JSON.parse(data);
        if (projectId == id) {
          console.log("api error");
          toast.error("api Error");
          setLoading(false);
          if (monacoSlice?.tree?.length <= 0) {
            dispatch(setLoadingState(3));
          }
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
  }, [socket, auth?.user?._id, loading]);

  useEffect(() => {
    if (!initialScrollDone.current && chatMessages.length > 0) {
      const scrollToBottom = () => {
        // bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
        initialScrollDone.current = true; // mark as done

        if (bottomRef.current) {
          bottomRef?.scrollIntoView({ behavior: "smooth" });
        }
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

  useEffect(() => {
    if (socket) {
      socket.on("apiCode", async (data) => {
        try {
          console.log("apiCode", data);
          data = JSON.parse(data);
          const { projectId, code } = data;
          console.log("reciving api code requrest", projectId);
          const formatedTree = apiCodeTreeFormatHandler(code);
          if (projectId == id) {
            dispatch(setTree(formatedTree));
            dispatch(setLoadingState(0));
            toast.success("Backend Code Generated Successfully");
          }
        } catch (error) {
          console.log(error);
        }
      });
    }
    return () => {
      if (socket) {
        socket.off("apiCode");
      }
    };
  }, [socket]);
  useEffect(() => {
    if (socket) {
      socket.on("apiCodeError", async (data) => {
        try {
          console.log("apiCodeError", data);
          data = JSON.parse(data);
          const { projectId, text } = data;
          if (projectId == id) {
            dispatch(
              setErrorText(text || "Something went wrong please try again")
            );
            dispatch(setLoadingState(3));
          }
        } catch (error) {
          console.log(error);
          data = JSON.parse(data);
          const { projectId, text } = data;
          if (projectId == id) {
            dispatch(
              setErrorText(text || "Something went wrong please try again")
            );
            dispatch(setLoadingState(3));
          }
        }
      });
    }
    return () => {
      if (socket) {
        socket.off("apiCodeError");
      }
    };
  }, [socket]);
  useEffect(() => {
    if (socket) {
      socket.on("apiCodeGenerating", async (data) => {
        data = JSON.parse(data);
        const { projectId } = data;
        if (projectId == id) {
          dispatch(setLoadingState(2));
        }
      });
    }
    return () => {
      if (socket) {
        socket.off("apiCodeGenerating");
      }
    };
  }, [socket]);

  useEffect(() => {
    if (monacoSlice.tree.length > 0) {
      dispatch(setLoadingState(0));
    }
  }, [monacoSlice.tree, monacoSlice.loadingState, loading]);

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      dispatch(setSliceNodes({ nodes, edges }));
    }
  }, [nodes, edges, dispatch]);

  useEffect(() => {
    if (id.length > 0) {
      dispatch(setCurrentProjectId(id));
    }
  }, [id, dispatch]);

  // useEffect(() => {
  //   if (auth?.isAuth == false) {
  //     navigate("/");
  //   }
  // }, [auth.isAuth]);

  useEffect(() => {
    (async () => {
      const data = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/repo/is-git-auth`,
        { withCredentials: true }
      );
      if (data?.data?.success) {
        const { gitAvatarUrl, gitName } = data?.data?.user || {};
        const payload = { gitAvatarUrl, gitName };
        dispatch(setGitAuth(payload));
      }
    })();
  }, []);

  const handleShare = async () => {
    if (
      selectedProjectDetails &&
      selectedProjectDetails?.privacy == "private"
    ) {
      toast.error(
        "This project is private. Edit the project settings to make it public and shareable."
      );

      return;
    }
    setShowShare(true);
    try {
      setShareLoader(true);

      const shareData = await axios.post(
        `
        ${import.meta.env.VITE_BACKEND_URL}/share`,
        {
          projectId: id,
        },
        {
          withCredentials: true,
        }
      );

      if (shareData?.data?.success) {
        setShareLink(
          `${import.meta.env.VITE_FRONTEND_URL}/share/${
            shareData?.data?.share?.projectId
          }/${shareData?.data?.share?.userId}/${shareData?.data?.share?._id}`
        );
      }
      console.log(shareData);

      setShareLoader(false);
    } catch (error) {
      console.log(error);
      setShareLoader(false);
      toast.error("Unable to share project, please Try again!!");
      setShowShare(false);
    } finally {
      setShareLoader(false);
    }
  };

  if (loadingSlice?.dashboardPageLoading) {
    return (
      <div className="flex justify-center bg-black items-center w-full h-screen">
        <SpinnerLoader />
      </div>
    );
  }

  if (!auth?.isAuth) {
    return (
      <div className=" w-full h-screen flex  bg-black bg-opacity-70 backdrop-blur-md  flex-col items-center justify-center z-[9999] p-4">
        <div className="bg-[#171717] text-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-semibold mb-4">You are not logged in</h2>
          <p className="text-gray-400 mb-6">
            Please log in to access this page.
          </p>
          <button
            onClick={() => {
              const pathName = location?.pathname || "/";
              localStorage.setItem(
                "redirectUrlForNotLogin",
                JSON.stringify(pathName)
              );
              navigate("/");
            }}
            className="bg-white text-black px-6 py-2 rounded-xl hover:bg-gray-200 transition-all font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-full  overflow-hidden dm-sans-font relative bg-black h-screen flex-col flex">
        <DashbordNav
          setMobileSelectedTab={setMobileSelectedTab}
          selectedTab={selectedTab}
          projectTitle={projectTitle}
          setSelectedTab={setSelectedTab}
          loading={loading}
        />
        <div className="w-full h-full overflow-hidden flex">
          {selectedTab == "api" ? (
            <MonacoEditor />
          ) : (
            <>
              <div className="flex-1 overflow-hidden p-2 flex-shrink-0 items-center justify-center gap-4  border-r-[0.5px] border-[#262626] h-full flex flex-col">
                {/* Nav for left half */}
                <div className="h-12 w-full bg-inherit overflow-hidden flex items-center justify-between lg:px-4 px-1 ">
                  {/* Left: Title */}
                  <h2 className="text-white text-2xl font-bold">ER Diagram</h2>
                  {/* Right: Search + Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Search Box */}

                    <div className="">
                      {isSaved == 1 && (
                        <p className="text-[#525252] text-sm mr-2">Saved</p>
                      )}
                      {isSaved == 2 && (
                        <p className="text-[#525252] text-sm mr-2">Not Saved</p>
                      )}
                      {isSaved == 3 && (
                        <p className="text-[#525252] text-sm mr-2">Saving..</p>
                      )}
                    </div>

                    {/* Plus Button */}
                    <button
                      onClick={() => {
                        exportProject(
                          rfInstance,
                          monacoSlice.tree,
                          llmCodeFromServer
                        );
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-[#1c1c1c] border border-[#333] rounded-md text-white hover:bg-[#2a2a2a]"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={handleShare}
                      className="w-8 h-8 flex items-center justify-center bg-[#1c1c1c] border border-[#333] rounded-md text-white hover:bg-[#2a2a2a]"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setMobileSelectedTab(true)}
                      className="w-8 h-8 flex lg:hidden items-center justify-center bg-[#1c1c1c] border border-[#333] rounded-md text-white hover:bg-[#2a2a2a]"
                    >
                      <Menu className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <div
                  ref={rfInstance}
                  className="flex-1 h-full w-full bg-[#171717] rounded-lg flex-shrink-0"
                >
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
                      minZoom={0.2}
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
                  llmCodeFromServer={llmCodeFromServer}
                  dbOpen={dbOpen}
                  mobileSelectedTab={mobileSelectedTab}
                  setMobileSelectedTab={setMobileSelectedTab}
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
                  autoScroll={autoScroll}
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
        <aside
          className={`fixed ${
            selectedTab === "setting"
              ? "w-[80%] z-[9999999] md:w-[50%] border-t border-[#262626]  lg:w-[35%]"
              : "w-0"
          } h-[calc(100vh-64px)] right-0 top-20
  bg-black/40 backdrop-blur-md 
  transition-all duration-300 ease-in-out overflow-y-scroll`}
        >
          {/* Project Details */}
          <div className="p-6 border-b border-[#262626] flex-1 flex flex-col">
            <h2 className="text-white text-lg w-full justify-between flex gap-1 items-center font-bold">
              <p>Project Details</p>
              {selectedTab == "setting" && (
                <button
                  onClick={() => setSelectedTab("editor")}
                  className="w-8 h-8 flex  cursor-pointer items-center justify-center bg-[#1c1c1c] border border-[#333] rounded-md text-white hover:bg-[#2a2a2a]"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
            </h2>

            <form
              onSubmit={handleFromSubmit}
              className="flex flex-col gap-4 flex-1"
            >
              {/* Project Name */}
              <div className="flex flex-col pt-3">
                <label className="text-gray-300 text-sm mb-1">
                  Project Name
                </label>
                <input
                  required
                  value={selectedProjectDetails?.title}
                  onChange={(e) => {
                    setSelectedProjectDetails({
                      ...selectedProjectDetails,
                      title: e.target.value,
                    });
                  }}
                  name="title"
                  type="text"
                  placeholder="Project Name"
                  className="bg-[#1c1c1c] border outline-none border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-[#808080]"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col pt-3">
                <label className="text-gray-300 text-sm mb-1">
                  Description
                </label>
                <textarea
                  rows="5"
                  value={selectedProjectDetails?.description}
                  required
                  onChange={(e) => {
                    setSelectedProjectDetails({
                      ...selectedProjectDetails,
                      description: e.target.value,
                    });
                  }}
                  name="description"
                  placeholder="Project Description"
                  className="bg-[#1c1c1c] w-full border outline-none border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-[#808080] resize-none"
                ></textarea>
              </div>

              {/* Dates */}
              <div className="flex flex-col pt-3">
                <label className="text-gray-300 text-sm mb-1">Created At</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={
                      selectedProjectDetails?.createdAt
                        ? new Date(selectedProjectDetails.createdAt)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      setSelectedProjectDetails({
                        ...selectedProjectDetails,
                        createdAt: e.target.value,
                      });
                    }}
                    className="bg-[#1c1c1c] border border-[#333] outline-none rounded-lg px-3 py-2 text-sm text-gray-200 flex-1"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col pt-3">
                <label className="text-gray-300 text-sm mb-1">Status</label>
                <select
                  name="status"
                  value={selectedProjectDetails?.status}
                  required
                  onChange={(e) => {
                    setSelectedProjectDetails({
                      ...selectedProjectDetails,
                      status: e.target.value,
                    });
                  }}
                  className={`bg-[#1c1c1c] border border-[#333] outline-none rounded-lg px-3 py-2 text-sm ${
                    selectedProjectDetails?.status === ""
                      ? "text-[#808080]"
                      : "text-gray-200"
                  }`}
                >
                  <option value="">--Select Status--</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Privacy */}
              <div className="flex flex-col pt-3">
                <label className="text-gray-300 text-sm mb-1">Privacy</label>
                <select
                  name="privacy"
                  value={selectedProjectDetails?.privacy}
                  required
                  onChange={(e) => {
                    setSelectedProjectDetails({
                      ...selectedProjectDetails,
                      privacy: e.target.value,
                    });
                  }}
                  className={`bg-[#1c1c1c] border border-[#333] outline-none rounded-lg px-3 py-2 text-sm ${
                    selectedProjectDetails?.privacy === ""
                      ? "text-[#808080]"
                      : "text-gray-200"
                  }`}
                >
                  <option value="">--Select Privacy--</option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>

              {/* Save Button */}
              <div className="mt-auto pt-3">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-blue-700 transition-all shadow"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </aside>

        <aside
          className={`fixed ${
            mobileSelectedTab ? "w-[90%] md:w-[50%] lg:w-[35%]" : "w-0"
          } h-[calc(100vh-64px)] right-0 top-20 
  bg-black/40 backdrop-blur-md 
  transition-all duration-300 ease-in-out overflow-y-scroll pb-2 lg:hidden`}
        >
          {/* Project Details */}
          <DashboardRightNav
            mobileSelectedTab={mobileSelectedTab}
            setMobileSelectedTab={setMobileSelectedTab}
            chatOpen={chatOpen}
            dbOpen={dbOpen}
            copyOpen={copyOpen}
            relationshipsOpen={relationshipsOpen}
            setChatOpen={setChatOpen}
            setDbOpen={setDbOpen}
            setCopyOpen={setCopyOpen}
            setRelationshipsOpen={setRelationshipsOpen}
            selectedDb={selectedDb}
            llmCodeFromServer={llmCodeFromServer}
          />
          <Chat
            chatOpen={chatOpen}
            autoScroll={autoScroll}
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
        </aside>

        {showShare && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-[99999999999] p-4"
            onClick={() => setShowShare(false)}
          >
            <div
              className="bg-[#171717] rounded-2xl shadow-xl p-6 w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
              <h2 className="text-xl text-white font-semibold mb-4 text-center">
                Share This Link
              </h2>

              {shareLoader ? (
                <div className="flex justify-center items-center py-8">
                  <SpinnerLoader clr="white" />
                </div>
              ) : (
                <>
                  <p className="text-gray-400 text-center break-all">
                    {shareLink}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      toast.success("Copied to clipboard");
                    }}
                    className="mt-6 w-full bg-black text-white py-2 rounded-xl hover:bg-gray-800 transition-all"
                  >
                    Copy to clipboard
                  </button>
                </>
              )}

              <button
                onClick={() => setShowShare(false)}
                className="absolute top-3 right-3 text-gray-300 hover:text-gray-100 text-lg"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default Dashboard;
