import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  X,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleExpandable,
  setHoverId,
  openFile,
  closeFile,
  handleUpdateFileMonacoSlice,
  setChangeToCode,
} from "../redux/slice/MonacoEditorSlice";
import LoadingScreen from "./loaders/LoadingScreen";
import { convertTreeToObject } from "../utils/elak";
import toast from "react-hot-toast";
import { useLocation, useParams } from "react-router-dom";
import { setCurrentRepoDetails, setGitAuth } from "../redux/slice/repoSlice";
import SpinnerLoader from "./loaders/SpinnerLoader";
import CommitModal from "./modal/CommitModal";

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
  const repoSlice = useSelector((state) => state?.repo);
  const { id } = useParams();
  const [commits, setCommits] = useState([]);
  const dispatch = useDispatch();
  const {
    tree,
    expandedFiles,
    hoverId,
    selectedFile,
    selectedFileHistory,
    loadingState,
    changesToCode,
  } = useSelector((state) => state.monaco);
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  console.log(location);

  const projectSlice = useSelector((state) => state.project);
  const monacoSlice = useSelector((state) => state.monaco);

  const [expandable, setExandable] = useState(false);
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [showPushRepo, setShowPushRepo] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [addGitignore, setAddGitignore] = useState(false);
  const [addLicense, setAddLicense] = useState(false);
  const [gitLoader, setGitLoader] = useState(false);

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

  const handleUpdate = (selectedFile, content) => {
    console.log("handleUpdate", selectedFile, content);
    if (!selectedFile.name || !selectedFile.id) {
      return;
    }
    dispatch(handleUpdateFileMonacoSlice({ selectedFile, content }));
  };

  const handleSaveClick = async () => {
    if (!projectSlice?.currentProjectId || tree.length == 0) {
      return;
    }
    const ObjectTree = convertTreeToObject(tree[0].children);
    console.log("tree", ObjectTree);
    try {
      const data = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/schema/update-code`,
        { code: ObjectTree, projectId: projectSlice?.currentProjectId },
        { withCredentials: true }
      );
      if (data?.data?.success) {
        dispatch(setChangeToCode(false));
        toast.success("Code saved successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Unable to save code");
    }
  };

  const handleGituLogin = () => {
    if (monacoSlice?.loadingState == 1 || monacoSlice?.loadingState == 2) {
      return toast.error("Please wait until code generated");
    }
    let url;
    if (location?.pathname) {
      url = `${import.meta.env.VITE_FRONTEND_URL}${location?.pathname}`;
      localStorage.setItem("redirectUrl", JSON.stringify(url));
    }
    const REDIRECT_URI = "http://localhost:5173/auth/callback";
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${
      import.meta.env.VITE_GIT_CLIENT_ID
    }&redirect_uri=${REDIRECT_URI}&scope=repo,user`;
    window.open(githubAuthUrl, "_self");
  };

  const handleCreateRepo = async () => {
    try {
      if (!repoName) {
        return toast.error("Repo name is required");
      }

      const payload = {
        repoName,
        description,
        visibility,
        addGitignore,
        projectId: id,
        addLicense,
      };

      setGitLoader(true);
      const repoCreateResult = await axios.post(
        `
        ${import.meta.env.VITE_BACKEND_URL}/repo/create-repo`,
        {
          ...payload,
        },
        {
          withCredentials: true,
        }
      );
      console.log(repoCreateResult);
      if (repoCreateResult?.data?.success) {
        toast.success("Repo created successfully");
        dispatch(setCurrentRepoDetails(repoCreateResult?.data?.data));
        setShowCreateRepo(false);
      }
      console.log("Creating repo:", payload);
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to create repo , Please Try again later"
      );
    } finally {
      setGitLoader(false);
    }
  };

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/repo/commits/${
            projectSlice?.currentProjectId
          }/${repoSlice?.currentRepoName}`,
          { withCredentials: true }
        );
        if (res?.data?.success) {
          setCommits(res?.data?.data?.history);
        }
      } catch (err) {
        console.error(
          "Fetch commits error:",
          err.response?.data || err.message
        );
      }
    };

    if (repoSlice.isGitAuth) {
      fetchCommits();
    }
  }, [
    repoSlice.isGitAuth,
    projectSlice?.currentProjectId,
    repoSlice?.currentRepoName,
  ]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/repo/is-repo-created/${id}`,
          {
            withCredentials: true,
          }
        );
        console.log(res);
        if (res?.data?.success) {
          if (res?.data?.data?.isThere) {
            dispatch(setCurrentRepoDetails(res?.data?.data?.repo));
          }
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    })();
  }, [repoSlice.isGitAuth, id, dispatch]);

  console.log(id, "from monaco editor");
  return (
    <div className="w-full relative h-screen overflow-hidden flex bg-[#0a0a0a] text-[#e5e5e5] font-sans">
      {/* Sidebar */}
      {loadingState > 0 && loadingState <= 3 ? (
        <LoadingScreen state={loadingState} />
      ) : (
        <>
          <div
            className={`${
              expandable
                ? "lg:w-[6%]  w-[10%]"
                : "lg:w-[22%] md:[w-30%] w-[40%]"
            } pt-2 border-r overflow-hidden border-[#2a2a2a] bg-[#111111] h-full pb-20 justify-between flex flex-col`}
          >
            <div
              className={`flex items-center w-full ${
                !expandable ? "justify-between" : "justify-end"
              } pr-2`}
            >
              {!expandable && (
                <h2 className="text-white ml-3 md:text-xl text-md lg:text-2xl font-bold">
                  Project Explorer
                </h2>
              )}
              {!expandable ? (
                <ArrowLeft
                  onClick={() => setExandable(!expandable)}
                  className="w-5 h-5  cursor-pointer text-white"
                />
              ) : (
                <ArrowRight
                  onClick={() => setExandable(!expandable)}
                  className="w-5 h-5  cursor-pointer text-white"
                />
              )}
            </div>
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
            <div className="flex flex-col  gap-2  items-center justify-center  border-t border-[#2a2a2a] w-full">
              {/* Top Action Bar */}
              <div className="flex flex-col items-center justify-center gap-3 border-b border-[#2a2a2a]  h-auto py-3 w-full text-xs text-[#737373]">
                {/* Login with GitHub */}

                {!repoSlice?.isGitAuth && (
                  <button
                    onClick={handleGituLogin}
                    className="flex items-center justify-center cursor-pointer  gap-2 py-2 px-4 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 active:bg-black transition-colors duration-200"
                  >
                    {loading ? (
                      <SpinnerLoader />
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.3 1.1 2.9.8.1-.7.4-1.1.7-1.3-2.6-.3-5.4-1.3-5.4-6A4.7 4.7 0 015 7.7a4.4 4.4 0 01.1-3.2s1-.3 3.3 1.2a11.4 11.4 0 016 0C16.7 4.2 17.7 4.5 17.7 4.5a4.4 4.4 0 01.1 3.2 4.7 4.7 0 011.2 3.3c0 4.7-2.8 5.7-5.4 6 .4.3.8.9.8 1.9v2.8c0 .3.2.7.8.6A12 12 0 0012 0z" />
                        </svg>
                        Login with GitHub
                      </>
                    )}
                  </button>
                )}

                {/* Create Repo */}
                {repoSlice?.isGitAuth &&
                  (repoSlice?.currentRepo == null ||
                    repoSlice?.currentRepo == "") && (
                    <button
                      onClick={() => setShowCreateRepo(true)}
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-500 active:bg-green-700 transition-colors duration-200"
                    >
                      {loading ? (
                        <SpinnerLoader />
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Create Repo
                        </>
                      )}
                    </button>
                  )}
                {/* Push Code */}

                {repoSlice?.isGitAuth &&
                  repoSlice.currentRepo &&
                  repoSlice.currentRepo == id && (
                    <button
                      onClick={() => setShowPushRepo(true)}
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 transition-colors duration-200"
                    >
                      {loading ? (
                        <SpinnerLoader />
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 12h14m-7-7l7 7-7 7"
                            />
                          </svg>
                          Push Code
                        </>
                      )}
                    </button>
                  )}
              </div>

              {/* Bottom Info Section */}
              <div className="w-full flex flex-col  items-center justify-center  gap-2 ">
                {!changesToCode && (
                  <div className="text-xs py-2 text-[#737373] flex items-center justify-center">
                    ⓘ Workspace ready
                  </div>
                )}

                {changesToCode && (
                  <div
                    onClick={handleSaveClick}
                    className="py-1 cursor-pointer text-sm bg-green-500 px-3 rounded-md hover:bg-green-600 active:bg-green-700 transition-colors"
                  >
                    Save
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editor Section */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center monaco2 bg-[#111111] border-b overflow-x-scroll overflow-y-hidden border-[#2a2a2a] min-h-12 text-xs text-[#a3a3a3]">
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
                onChange={(content) => handleUpdate(selectedFile, content)}
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

          {showCreateRepo && (
            <div className="fixed inset-0 flex items-center justify-center z-[999999999] bg-black/50 backdrop-blur-sm">
              <div className="w-[90%] max-w-md bg-gradient-to-br from-[#181818] to-[#0d0d0d] border border-[#2a2a2a] rounded-xl shadow-2xl p-5 animate-[fadeIn_0.2s_ease-out]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#262626] pb-3 mb-4">
                  <h2 className="text-white text-base font-semibold tracking-wide">
                    🪄 Create New Repository
                  </h2>
                  <button
                    onClick={() => setShowCreateRepo(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Repo Name */}
                <div className="flex flex-col gap-1 mb-3">
                  <label className="text-gray-400 text-xs font-medium">
                    Repository Name *
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="bg-[#111] text-white text-sm p-2 rounded-md border border-[#333] focus:outline-none focus:ring-1 focus:ring-[#2563eb] transition-all"
                    placeholder="e.g. spotify-clone"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1 mb-3">
                  <label className="text-gray-400 text-xs font-medium">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-[#111] text-white text-sm p-2 rounded-md border border-[#333] focus:outline-none focus:ring-1 focus:ring-[#2563eb] resize-none transition-all"
                    rows="2"
                    placeholder="Write a short description..."
                  />
                </div>

                {/* Visibility */}
                <div className="flex flex-col gap-2 mb-3">
                  <label className="text-gray-400 text-xs font-medium">
                    Visibility
                  </label>
                  <div className="flex gap-5 mt-1">
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="radio"
                        value="public"
                        checked={visibility === "public"}
                        onChange={() => setVisibility("public")}
                        className="accent-[#2563eb] cursor-pointer"
                      />
                      <span>🌐 Public</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="radio"
                        value="private"
                        checked={visibility === "private"}
                        onChange={() => setVisibility("private")}
                        className="accent-[#2563eb] cursor-pointer"
                      />
                      <span>🔒 Private</span>
                    </label>
                  </div>
                </div>

                {/* Options */}
                <div className="flex flex-col gap-2 mb-4">
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addGitignore}
                      onChange={() => setAddGitignore(!addGitignore)}
                      className="accent-[#2563eb] cursor-pointer"
                    />
                    Add{" "}
                    <code className="text-xs bg-[#222] px-1 rounded">
                      .gitignore
                    </code>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addLicense}
                      onChange={() => setAddLicense(!addLicense)}
                      className="accent-[#2563eb] cursor-pointer"
                    />
                    Add License
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowCreateRepo(false)}
                    disabled={gitLoader}
                    className="text-gray-400 text-sm px-3 py-1.5 rounded-md hover:bg-[#222] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRepo}
                    className="bg-[#2563eb] flex items-center justify-center text-white text-sm px-4 py-1.5 rounded-md hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
                    disabled={gitLoader}
                  >
                    {gitLoader ? <SpinnerLoader /> : "Create"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPushRepo && (
            <CommitModal
              commits={commits}
              setCommits={setCommits}
              showPushRepo={showPushRepo}
              setShowCreateRepo={setShowPushRepo}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MonacoEditor;
