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
import SharedMonaco from "../components/SharedMonaco";
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

const SharedDashboard = () => {
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
  const { projectId, userId, shareId } = useParams();
  const navigate = useNavigate();
  const [isEditingDbCall, setIsEditingDbCall] = useState(false);
  const socket = useSelector((state) => state?.project?.socket);
  const monacoSlice = useSelector((state) => state?.monaco);
  const scrollSlice = useSelector((state) => state?.scrollS);
  const repoSlice = useSelector((state) => state?.repo);
  const [showShare, setShowShare] = useState(false);
  const [shareLink, setShareLink] = useState("No link loaded yet.Please Wait");
  const [shareLoader, setShareLoader] = useState(false);
  const rfInstance = useRef(null);
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

  const locatoin = useLocation();

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
          `${import.meta.env.VITE_BACKEND_URL}/project/${projectId}`,
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
    (async () => {
      dispatch(setEntityLoading(true));
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/schema/${projectId}`,
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
            if (res?.data?.data?.projectId == projectId) {
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
            console.log("setting set loading state to 0 after formatting tree");
            dispatch(setLoadingState(0));
          } else {
            const apiCodeStatus = await axios.get(
              `${
                import.meta.env.VITE_BACKEND_URL
              }/project/api-code-status/${projectId}`,
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
          `${import.meta.env.VITE_BACKEND_URL}/conversation/chat/${projectId}`
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
  }, [aiPrompt, projectId, userId, shareId, dispatch]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
    if (relationshipsOpen == true || chatOpen == true || copyOpen == true) {
      setSelectedDb("");
    }

    if (dbOpen == true || chatOpen || copyOpen) {
      setEdges((prev) =>
        prev.map((e) => ({ ...e, style: { stroke: "gray", strokeWidth: 2 } }))
      );
    }
  }, [relationshipsOpen, chatOpen, dbOpen, copyOpen]);

  // useEffect(() => {
  //   if (auth?.isAuth == false) {
  //     navigate("/");
  //   }
  // }, [auth.isAuth]);

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
          share={true}
          setMobileSelectedTab={setMobileSelectedTab}
          selectedTab={selectedTab}
          projectTitle={projectTitle}
          setSelectedTab={setSelectedTab}
          loading={loading}
        />
        <div className="w-full h-full overflow-hidden flex">
          {selectedTab == "api" ? (
            <SharedMonaco />
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
                      <p className="text-blue-500 text-sm mr-2">Shared</p>
                    </div>

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

        
      </div>
    );
  }
};

export default SharedDashboard;
