import React, { useState } from "react";
import { Plus, Search, Edit, Trash, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const dummyProjects = [
  {
    id: 1,
    name: "E-commerce Platform",
    description:
      "A comprehensive e-commerce solution with product management, order processing, and customer accounts.",
    date: "Jan 15, 2024",
    status: "Active",
  },
  {
    id: 2,
    name: "Social Media App",
    description:
      "A social networking application with user profiles, posts, and messaging features.",
    date: "Feb 22, 2024",
    status: "Active",
  },
  {
    id: 3,
    name: "Task Management System",
    description:
      "A tool for managing tasks, projects, and team collaboration with deadlines and progress tracking.",
    date: "Mar 10, 2024",
    status: "Archived",
  },
  {
    id: 4,
    name: "Blog Platform",
    description:
      "A blogging platform with user authentication, post creation, and comment functionality.",
    date: "Apr 5, 2024",
    status: "Active",
  },
  {
    id: 4,
    name: "Blog Platform",
    description:
      "A blogging platform with user authentication, post creation, and comment functionality.",
    date: "Apr 5, 2024",
    status: "Active",
  },
  {
    id: 4,
    name: "Blog Platform",
    description:
      "A blogging platform with user authentication, post creation, and comment functionality.",
    date: "Apr 5, 2024",
    status: "Active",
  },
];

export default function Project() {
  const [projects, setProjects] = useState(dummyProjects);
  const navigate = useNavigate();

  return (
    <div className="bg-black border-none text-gray-200 h-screen flex flex-col">
      {/* Header */}
      <header
        onClick={() => navigate("/dashboard")}
        className="flex items-center justify-between border-b border-[#262626] px-6 py-4 bg-black cursor-pointer"
      >
        <div className="flex items-center gap-3 cursor-pointer">
          <svg
            className="text-white"
            fill="none"
            height="24"
            viewBox="0 0 48 48"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
              fill="currentColor"
            ></path>
          </svg>
          <h1 className="text-lg font-bold text-white">SchemaGenius</h1>
        </div>
        <button className="bg-white text-sm text-black font-medium px-3 py-2 rounded-xl flex items-center gap-2 shadow hover:bg-gray-200 transition">
          <Plus size={16} /> New Project
        </button>
      </header>

      {/* Main Layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Projects Section */}
        <section className="flex-1 flex flex-col border-r border-[#262626] bg-black">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 ">
            <h2 className="text-lg font-semibold text-white">Projects</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  placeholder="Search projects"
                  className="bg-[#1c1c1c] border border-[#333] rounded-lg pl-8 pr-3 py-1.5 text-sm text-gray-200 placeholder:text-[#525252] focus:border-white focus:ring-0"
                />
              </div>
              <button className="px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded-lg text-sm text-gray-300 hover:border-white hover:text-white transition">
                Tag
              </button>
              <button className="px-3 py-1.5 bg-[#1c1c1c] border border-[#333] rounded-lg text-sm text-gray-300 hover:border-white hover:text-white transition">
                Status
              </button>
            </div>
          </div>

          {/* Scrollable Project List */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-[#1c1c1c] p-5 rounded-lg border border-[#262626] hover:border-white/40 transition shadow-[0_0_15px_rgba(0,0,0,0.4)] flex flex-col"
                >
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">
                      {project.date} •{" "}
                      <span
                        className={
                          project.status === "Active"
                            ? "text-white"
                            : "text-gray-600"
                        }
                      >
                        {project.status}
                      </span>
                    </p>
                    <h3 className="text-lg font-semibold mt-1 text-white">
                      {project.name}
                    </h3>
                    <p className="text-gray-300 mt-1 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button className="bg-white text-black px-3 py-1.5 rounded-md text-sm font-medium shadow hover:bg-gray-200 transition">
                      Open
                    </button>
                    <button className="bg-[#171717] border border-[#333] p-1.5 rounded-xl text-white hover:border-white hover:text-white transition">
                      <Edit size={14} />
                    </button>
                    <button className="bg-[#171717] border border-[#333] p-1.5 rounded-xl text-white hover:border-red-500 hover:text-red-500 transition">
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-center py-12 bg-[#1c1c1c] border border-[#333] rounded-2xl">
                <p className="text-gray-400 text-sm mb-2">No projects found</p>
                <button className="bg-white text-black font-medium px-3 py-2 rounded-xl flex items-center gap-2 shadow hover:bg-gray-200 transition">
                  <Plus size={16} /> Create your first project
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar */}
        {/* Sidebar */}
        <aside className="w-96 flex flex-col bg-[#111] border-l border-[#262626] h-full">
          {/* Add Project */}
          <div className="p-6 border-b border-[#262626] flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-white">
              Add Project
            </h2>
            <form className="flex flex-col gap-4 flex-1">
              {/* Project Name */}
              <input
                type="text"
                placeholder="Project Name"
                className="bg-[#1c1c1c] border outline-none border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-white"
              />

              {/* Description */}
              <textarea
                rows="5"
                placeholder="Description"
                className="bg-[#1c1c1c] border outline-none border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-white resize-none"
              ></textarea>

              {/* Tags */}
              <input
                type="text"
                placeholder="Tags (comma separated)"
                className="bg-[#1c1c1c] border border-[#333] outline-none rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-white"
              />

              {/* Status */}
              <select className="bg-[#1c1c1c] border border-[#333] outline-none rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Button pinned to bottom */}

              <div className="mt-auto flex flex-col gap-4">
                <textarea
                  rows="4"
                  placeholder="AI Prompt (e.g., Generate schema for blog app)"
                  className="bg-[#1c1c1c] border border-blue-500/50 outline-none rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-white resize-none"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-white text-black py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-gray-200 transition shadow"
                >
                  <Send size={14} /> Create Project & Generate with AI
                </button>
              </div>
            </form>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 text-xs text-[#1c1c1c] border-t border-[#262626] bg-black">
        <p className="mt-2">© 2024 SchemaGenius. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
