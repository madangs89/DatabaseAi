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
];

export default function Project() {
  const [projects, setProjects] = useState(dummyProjects);
  const navigate = useNavigate();

  return (
    <div className="bg-black text-gray-200 h-screen flex flex-col">
      {/* Header */}
      <header
        onClick={() => navigate("/dashboard")}
        className="flex items-center justify-between border-b border-gray-800 px-6 py-3"
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
        <button className="bg-white text-sm text-black font-medium px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition">
          <Plus size={16} /> New Project
        </button>
      </header>

      {/* Main Layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Projects Section */}
        <section className="flex-1 flex flex-col border-r border-gray-800">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800">
            <h2 className="text-lg font-semibold">Projects</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  placeholder="Search projects"
                  className="bg-black border border-gray-700 rounded-md pl-8 pr-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-white"
                />
              </div>
              <button className="px-3 py-1.5 bg-black border border-gray-700 rounded-md text-sm text-gray-300 hover:bg-white hover:text-black transition">
                Tag
              </button>
              <button className="px-3 py-1.5 bg-black border border-gray-700 rounded-md text-sm text-gray-300 hover:bg-white hover:text-black transition">
                Status
              </button>
            </div>
          </div>

          {/* Scrollable Project List */}
          <div className="flex-1 hide-scrollbar-2 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-black p-4 rounded-lg border border-gray-700 hover:border-white transition flex flex-col"
                >
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">
                      {project.date} •{" "}
                      <span
                        className={
                          project.status === "Active"
                            ? "text-white"
                            : "text-gray-500"
                        }
                      >
                        {project.status}
                      </span>
                    </p>
                    <h3 className="text-lg font-semibold mt-1 text-white">
                      {project.name}
                    </h3>
                    <p className="text-gray-400 mt-1 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button className="bg-white text-black px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200 transition">
                      Open
                    </button>
                    <button className="bg-black border border-gray-700 p-1.5 rounded-md text-gray-400 hover:bg-white hover:text-black transition">
                      <Edit size={14} />
                    </button>
                    <button className="bg-black border border-gray-700 p-1.5 rounded-md text-gray-400 hover:bg-white hover:text-black transition">
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-center py-12 bg-black border border-gray-700 rounded-xl">
                <p className="text-gray-400 text-sm mb-2">No projects found</p>
                <button className="bg-white text-black font-medium px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition">
                  <Plus size={16} /> Create your first project
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="w-96 flex flex-col bg-black border-l border-gray-800">
          {/* Add Project */}
          <div className="p-6 border-b border-gray-800 flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Add Project</h2>
            <form className="flex flex-col gap-3 flex-1">
              <input
                type="text"
                placeholder="Project Name"
                className="bg-black border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-white"
              />
              <textarea
                rows="3"
                placeholder="Description"
                className="bg-black border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-white resize-none"
              ></textarea>
              <select className="bg-black border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:ring-1 focus:ring-white">
                <option>Select tech stack</option>
                <option>React & Node.js</option>
                <option>Vue & Firebase</option>
                <option>Angular & .NET</option>
              </select>
              <input
                type="text"
                placeholder="Tags (comma separated)"
                className="bg-black border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-white"
              />
              <button
                type="submit"
                className="bg-white text-black py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium hover:bg-gray-200 transition"
              >
                <Send size={14} /> Generate Schema with AI
              </button>
            </form>
          </div>

          {/* AI Chat */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-3">AI Chat</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Ask schema ideas..."
                className="w-full bg-black border border-gray-700 rounded-md pl-3 pr-10 py-2 text-sm text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-white"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black p-1.5 rounded-md hover:bg-gray-200 transition">
                <Send size={14} />
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 text-xs text-gray-500 border-t border-gray-800">
        <div className="flex justify-center gap-6">
          <a href="#" className="hover:text-white transition">
            Export
          </a>
          <a href="#" className="hover:text-white transition">
            Templates
          </a>
          <a href="#" className="hover:text-white transition">
            Version Control
          </a>
        </div>
        <p className="mt-2">© 2024 SchemaGenius. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
