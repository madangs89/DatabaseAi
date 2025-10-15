import React, { useState, useEffect } from "react";
import axios from "axios";

const CommitModal = ({
  showCommitModal,
  setShowCommitModal,
  repoName,
  branchName = "main",
  gitAccessToken,
  filesToPush, // [{ path: "index.js", content: "console.log('hi')" }]
}) => {
  const [activeTab, setActiveTab] = useState("history"); // history | new
  const [commits, setCommits] = useState([]);
  const [commitMessage, setCommitMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch commits
  useEffect(() => {
    if (!repoName || !gitAccessToken) return;
    const fetchCommits = async () => {
      try {
        const res = await axios.get(
          `https://api.github.com/repos/YOUR_GITHUB_USERNAME/${repoName}/commits?sha=${branchName}`,
          {
            headers: {
              Authorization: `Bearer ${gitAccessToken}`,
            },
          }
        );
        setCommits(res.data);
      } catch (err) {
        console.error(
          "Fetch commits error:",
          err.response?.data || err.message
        );
      }
    };
    fetchCommits();
  }, [repoName, gitAccessToken, branchName]);

  const handlePush = async () => {
    if (!commitMessage) return alert("Please enter a commit message");
    setLoading(true);
    try {
      for (const file of filesToPush) {
        // Get existing file SHA if exists
        let sha = null;
        try {
          const res = await axios.get(
            `https://api.github.com/repos/YOUR_GITHUB_USERNAME/${repoName}/contents/${file.path}?ref=${branchName}`,
            {
              headers: {
                Authorization: `Bearer ${gitAccessToken}`,
              },
            }
          );
          sha = res.data.sha;
        } catch {
          sha = null; // file doesn't exist, will create
        }

        await axios.put(
          `https://api.github.com/repos/YOUR_GITHUB_USERNAME/${repoName}/contents/${file.path}`,
          {
            message: commitMessage,
            content: btoa(file.content), // base64 encode
            branch: branchName,
            sha: sha || undefined,
          },
          {
            headers: {
              Authorization: `Bearer ${gitAccessToken}`,
            },
          }
        );
      }
      alert("Files pushed successfully!");
      setShowCommitModal(false);
    } catch (err) {
      console.error("Push error:", err.response?.data || err.message);
      alert("Failed to push files. Check console.");
    }
    setLoading(false);
  };

//   if (!showCommitModal) return null;



  return (
    <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-opacity-60 flex items-center justify-center z-[99999999]">
      <div className="bg-[#1c1c1c] w-96 rounded-xl shadow-lg p-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-2">
          <h2 className="text-white font-semibold text-sm">
            Repository: {repoName}
          </h2>
          <button
            onClick={() => setShowCommitModal(false)}
            className="text-gray-400 hover:text-white"
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
          <div className="max-h-60 overflow-y-auto mt-2 border border-[#333] rounded-md p-2">
            {commits.length ? (
              commits.map((commit) => (
                <div
                  key={commit.sha}
                  className="border-b border-[#262626] py-1"
                >
                  <p className="text-gray-300 text-xs font-semibold">
                    {commit.commit.author.name} -{" "}
                    {new Date(commit.commit.author.date).toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {commit.commit.message}
                  </p>
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
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-1 rounded-md text-sm"
            >
              {loading ? "Pushing..." : "Push to GitHub"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitModal;
