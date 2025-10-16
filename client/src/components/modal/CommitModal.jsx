import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import SpinnerLoader from "../loaders/SpinnerLoader";

const CommitModal = ({
  showPushRepo,
  setShowCreateRepo,
  commits,
  setCommits,
}) => {
  const [activeTab, setActiveTab] = useState("history"); // history | new

  const [commitMessage, setCommitMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const repoSlice = useSelector((state) => state?.repo);
  const projectSlice = useSelector((state) => state?.project);
  const monacoSlice = useSelector((state) => state?.monaco);

  const handlePush = async () => {
    if (!commitMessage) return toast.error("Please enter a commit message");
    setLoading(true);
    try {
      // tree, projectId, commitMessage, repoName
      const results = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/repo/push-code`,
        {
          repoName: repoSlice?.currentRepoName,
          projectId: projectSlice?.currentProjectId,
          tree: monacoSlice?.tree,
          commitMessage,
        },
        {
          withCredentials: true,
        }
      );
      console.log(results);
      if (results?.data?.success) {
        setShowCreateRepo(false);
        setCommits(results?.data?.data?.history);
        toast.success("Code pushed successfully");
      }
    } catch (err) {
      console.error("Push error:", err.response?.data || err.message);
      toast.error(err?.response?.data?.message || "Unable to push code");
    } finally {
      setLoading(false);
    }
  };

  // Fetch commits
  // useEffect(() => {
  //   const fetchCommits = async () => {
  //     try {
  //       const res = await axios.get(
  //         `${import.meta.env.VITE_BACKEND_URL}/repo/commits/${
  //           projectSlice?.currentProjectId
  //         }/${repoSlice?.currentRepoName}`,
  //         { withCredentials: true }
  //       );
  //       if (res?.data?.success) {
  //         setCommits(res?.data?.data?.history);
  //       }
  //     } catch (err) {
  //       console.error(
  //         "Fetch commits error:",
  //         err.response?.data || err.message
  //       );
  //     }
  //   };

  //   if (repoSlice.isGitAuth) {
  //     fetchCommits();
  //   }
  // }, []);

  return (
    <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-opacity-60 flex items-center justify-center z-[99999999]">
      <div className="bg-[#1c1c1c] w-96 rounded-xl shadow-lg p-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-2">
          <h2 className="text-white font-semibold text-sm">
            Repository: {repoSlice?.currentRepoName}
          </h2>
          <button
            onClick={() => setShowCreateRepo(false)}
            disabled={loading}
            className={`text-gray-400 hover:text-white ${
              loading && "cursor-not-allowed"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-2">
          <button
            className={`flex-1 text-sm py-1 rounded-md ${
              activeTab === "history" ? "bg-[#333] text-white" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("history")}
          >
            Commit History
          </button>
          <button
            className={`flex-1 text-sm py-1 rounded-md ${
              activeTab === "new" ? "bg-[#333] text-white" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("new")}
          >
            New Commit
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "history" && (
          <div className="max-h-60 overflow-y-auto mt-2 border border-[#333] rounded-lg p-2 bg-[#121212]/60 backdrop-blur-sm">
            {commits.length ? (
              commits.map((commit, index) => (
                <div
                  key={index}
                  className="mb-3 p-3 rounded-md border border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] hover:from-[#1f1f1f] hover:to-[#141414] transition-all duration-200 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                >
                  {/* Branch & Time */}
                  <div className="flex flex-wrap justify-between items-center text-xs text-gray-400 mb-1">
                    <p className="flex items-center gap-1 font-semibold text-green-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5c0 1.1.9 2 2 2h5"
                        />
                      </svg>
                      {commit.repoBranch}
                    </p>
                    <p className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3"
                        />
                      </svg>
                      {new Date(commit.pushedAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Commit message */}
                  <p className="text-gray-300 text-sm mb-1 break-words">
                    {commit.commitMessage}
                  </p>

                  {/* File count & Status */}
                  <div className="flex flex-wrap justify-between items-center text-xs">
                    <p className="flex items-center gap-1 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                      {commit.totalFiles} file{commit.totalFiles !== 1 && "s"}{" "}
                      changed
                    </p>

                    <p
                      className={`font-semibold flex items-center gap-1 ${
                        commit.status === "success"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {commit.status === "success" ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        )}
                      </svg>
                      {commit.status.toUpperCase()}
                    </p>
                  </div>

                  {/* Error message */}
                  {commit.status === "failed" && commit.errorMessage && (
                    <p className="text-red-500 text-xs mt-1">
                      Error: {commit.errorMessage}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center">
                No commits found.
              </p>
            )}
          </div>
        )}
        {activeTab === "new" && (
          <div className="flex flex-col gap-2 mt-2">
            <textarea
              rows={3}
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Enter commit message..."
              className="bg-[#111] text-white p-2 rounded-md border border-[#333] focus:outline-none focus:border-[#555] resize-none text-sm"
            />
            <button
              onClick={handlePush}
              disabled={loading}
              className="bg-[#2563eb] flex items-center justify-center hover:bg-[#1d4ed8] text-white py-1 rounded-md text-sm"
            >
              {loading ? <SpinnerLoader /> : "Push to GitHub"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitModal;
