import React, { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewProject,
  projectEditHandler,
  removeProject,
  setIsButtonLoading,
  setIsError,
  setIsLoading,
  setProjects,
} from "../redux/slice/projectSlice";
import toast from "react-hot-toast";
import PageLoader from "../components/loaders/PageLoader";
import SpinnerLoader from "../components/loaders/SpinnerLoader";
export default function Project() {
  // const [projects, setProjects] = useState(dummyProjects);
  const projects = useSelector((state) => state?.project?.projects);
  const projectSlice = useSelector((state) => state?.project);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [privacy, setPrivacy] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const navigate = useNavigate();
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const auth = useSelector((state) => state?.auth);

  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [toEditSelectedId, setToEditSelectedId] = useState(null);
  const [isSuggestionGenearting, setIsSuggestionGenearting] = useState(false);
  const [isPromptGenerating, setIsPromptGenerating] = useState(false);

  const socket = useSelector((state) => state.project.socket);
  const handleFromSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      try {
        setIsEditing(false);
        if (!title || !description || !status || !privacy) {
          return toast.error("Please fill all the fields");
        }
        const result = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/project/${toEditSelectedId}`,
          {
            title,
            description,
            status,
            privacy,
          },
          { withCredentials: true }
        );

        if (result.data.success) {
          dispatch(projectEditHandler(result.data.data));
          setTitle("");
          setDescription("");
          setStatus("");
          setPrivacy("");
          setToEditSelectedId(null);
          setIsEditing(false);
          setAiPrompt("");
          toast.success("Project updated successfully");
        }
      } catch (error) {
        console.log(error);
        toast.error("Unable to edit project");
        setIsEditing(false);
      }
    } else {
      if (!title || !description || !status || !privacy) {
        return toast.error("Please fill all the fields");
      }
      try {
        dispatch(setIsButtonLoading(true));
        const result = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/project`,
          {
            title,
            description,
            status,
            privacy,
          },
          { withCredentials: true }
        );
        if (result.data.success) {
          toast.success("Project created successfully");
          dispatch(addNewProject(result.data.data));
          setTitle("");
          setDescription("");
          setStatus("");
          setPrivacy("");
          dispatch(setIsButtonLoading(false));
          navigate(`/${result.data.data._id}/dashboard`, {
            state: {
              aiPrompt: aiPrompt,
            },
          });
          setAiPrompt("");
        }
      } catch (error) {
        console.log(error);
        toast.error("Unable to create project");
        dispatch(setIsButtonLoading(false));
      }
    }
  };
  const handleSuggestion = async () => {
    if (isSuggestionGenearting) {
      toast.error("Please wait");
      return;
    }
    try {
      if (!title) {
        return toast.error("Title is required for suggestion");
      }
      setIsSuggestionGenearting(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/suggestions`,
        {
          title,
          description,
        },
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setDescription(res.data.data.description);
      }
      setIsSuggestionGenearting(false);
    } catch (error) {
      console.log(error);
      toast.error("Unable to give suggestions");
      setIsSuggestionGenearting(false);
    }
  };
  const handlePrompt = async () => {
    if (isPromptGenerating) {
      toast.error("Please wait");
      return;
    }
    try {
      if (!title) {
        return toast.error("Title is required for suggestion");
      }
      setIsPromptGenerating(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/prompt`,
        {
          title,
          description,
        },
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setAiPrompt(res.data.data.prompt);
      }
      setIsPromptGenerating(false);
    } catch (error) {
      console.log(error);
      toast.error("Unable to give prompt");
      setIsPromptGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this project?"
      );
      if (!confirmDelete) return;
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/project/${id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Project deleted successfully");

        dispatch(removeProject(id));
      }
    } catch (error) {
      console.log(error);
      toast.error("Unable to delete project");
    }
  };

  const editHandler = (id, index) => {
    try {
      setIsEditing(true);
      setToEditSelectedId(id);
      const projectToEdit = projects.find((project) => project._id === id);
      setTitle(projectToEdit.title);
      setDescription(projectToEdit.description);
      setStatus(projectToEdit.status.toLowerCase());
      setPrivacy(projectToEdit.privacy.toLowerCase());
    } catch (error) {
      console.log(error);
      toast.error("Unable to edit project");
    }
  };

  useEffect(() => {
    const filteredProjects = projects.filter((project) =>
      project.title.toLowerCase().trim().includes(search.toLowerCase())
    );
    setFilteredProjects(filteredProjects);
  }, [search, projects]);

  useEffect(() => {
    (async () => {
      dispatch(setIsLoading(true));
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/project`,
          {
            withCredentials: true,
          }
        );
        if (res?.data?.success) {
          console.log(res.data.data);
          // toast.success("Projects Fetched Successfully");

          dispatch(setProjects(res.data.data));
        }
        dispatch(setIsLoading(false));
      } catch (error) {
        console.log(error);
        toast.error("Unable To Fetch Projects");
        dispatch(setProjects([]));
        dispatch(setIsError("Unable To Fetch Projects"));
        dispatch(setIsLoading(false));
      }
    })();
  }, []);

  useEffect(() => {
    if (!socket || !auth?.user?._id) return;
    try {
      socket.emit(
        "locationUpdate",
        JSON.stringify({
          userId: auth?.user?._id,
          location: "project",
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
          location: "",
        })
      );
    };
  }, [socket, auth?.user?._id]);

  return (
    <div className="bg-black border-none text-gray-200 h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#262626] px-6 py-4 bg-black ">
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
        {projectSlice.isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <SpinnerLoader />
          </div>
        ) : (
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
                    name="search"
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search projects"
                    className="bg-[#1c1c1c] border outline-none border-[#333] rounded-lg pl-8 pr-3 py-1.5 text-sm text-gray-200 placeholder:text-[#525252] "
                  />
                </div>
              </div>
            </div>

            {/* Scrollable Project List */}
            <div className="flex-1 overflow-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <div
                    key={project._id}
                    className="bg-[#1c1c1c] gap-3 max-h-[250px] p-4 rounded-lg border border-[#262626] hover:border-white/40 transition shadow justify-between flex flex-col"
                  >
                    <div>
                      <p className="text-xs text-gray-500">
                        {project.createdAt} •{" "}
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
                        {project.title}
                      </h3>
                      <p className="text-gray-300 mt-1 line-clamp-6 text-sm">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          navigate(`/${project._id}/dashboard`, {
                            state: {
                              aiPrompt: "",
                            },
                          })
                        }
                        className="bg-white text-black px-3 py-1.5 rounded-md text-sm font-medium shadow hover:bg-gray-200 transition"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => editHandler(project._id, index)}
                        className="bg-[#171717] border border-[#333] p-1.5 rounded-xl text-white hover:border-white hover:text-white transition"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="bg-[#171717] border border-[#333] p-1.5 rounded-xl text-white hover:border-red-500 hover:text-red-500 transition"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full relative flex flex-col items-center justify-center text-center py-8 bg-[#1c1c1c] border border-[#333] rounded-2xl">
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Top-Left Blob */}
                    <div
                      className="
      absolute -top-24 -left-24 
      w-[200px] h-[200px]
      sm:w-[100px] sm:h-[100px]
      md:w-[200px] md:h-[200px]
      bg-gradient-to-br from-white/10 to-transparent
      rounded-full blur-[80px] sm:blur-[100px]
      animate-lightMove1
    "
                    ></div>

                    {/* Bottom-Right Blob */}
                    <div
                      className="
      absolute -bottom-32 -right-32 
      w-[250px] h-[250px]
      sm:w-[150px] sm:h-[150px]
      md:w-[200px] md:h-[200px]
      bg-gradient-to-tr from-white/15 to-transparent
      rounded-full blur-[90px] sm:blur-[120px]
      animate-lightMove2
    "
                    ></div>

                    {/* Center Blob */}
                    <div
                      className="
      absolute top-1/2 left-1/2 
      -translate-x-1/2 -translate-y-1/2
      w-[180px] h-[180px]
      sm:w-[250px] sm:h-[250px]
      md:w-[300px] md:h-[300px]
      bg-gradient-to-tl from-white/8 to-transparent
      rounded-full blur-[70px] sm:blur-[90px]
      animate-lightMove3
    "
                    ></div>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">
                    No projects found
                  </p>
                  <button className="bg-white text-black font-medium px-3 py-2 rounded-xl flex items-center gap-2 shadow hover:bg-gray-200 transition">
                    <Plus size={16} /> Create your first project
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
        {/* Sidebar */}
        {/* Sidebar */}
        <aside className="w-96  flex-col hidden lg:flex bg-[#111] border-l border-[#262626] h-full">
          {/* Add Project */}
          <div className="p-6 border-b border-[#262626] flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-white">
              {isEditing ? "Edit Project" : "Add Project"}
            </h2>
            <form
              onSubmit={handleFromSubmit}
              className="flex flex-col gap-4 flex-1"
            >
              {/* Project Name */}
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                name="title"
                type="text"
                placeholder="Project Name"
                className="bg-[#1c1c1c] border outline-none border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-[#808080]"
              />

              {/* Description */}
              <div className="relative hide-scrollbar-2  flex items-center justify-center w-[100%]">
                <h1
                  onClick={handleSuggestion}
                  className={`absolute right-3 top-2 cursor-pointer ${
                    isSuggestionGenearting ? "animate-pulse" : ""
                  }`}
                >
                  ✨
                </h1>
                <textarea
                  rows="5"
                  value={description}
                  required
                  onChange={(e) => setDescription(e.target.value)}
                  name="description"
                  placeholder="Description"
                  className="bg-[#1c1c1c] w-full border outline-none border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-[#808080] resize-none"
                ></textarea>
              </div>
              {/* Status */}
              <select
                name="status"
                value={status}
                required
                onChange={(e) => setStatus(e.target.value)}
                className={`bg-[#1c1c1c] border border-[#333] outline-none rounded-lg px-3 py-2 text-sm ${
                  status === "" ? "text-[#808080]" : "text-gray-200"
                } placeholder:text-[#808080]`}
              >
                <option value="" className="text-[#808080] ">
                  --Select Status--
                </option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                name="privacy"
                value={privacy}
                required
                onChange={(e) => setPrivacy(e.target.value)}
                className={`bg-[#1c1c1c] border border-[#333] outline-none rounded-lg px-3 py-2 text-sm ${
                  privacy === "" ? "text-[#808080]" : "text-gray-200"
                }`}
              >
                <option value="" className="text-[#808080] ">
                  --Select Privacy--
                </option>
                <option value="private">private</option>
                <option value="public">public</option>
              </select>
              {/* Button pinned to bottom */}
              <div className="mt-auto flex w-full flex-col gap-4">
                <div className="relative hide-scrollbar-2  flex items-center justify-center w-[100%]">
                  <h1
                    onClick={handlePrompt}
                    className={`absolute right-3 top-2 cursor-pointer ${
                      isPromptGenerating ? "animate-pulse" : ""
                    }`}
                  >
                    ✨
                  </h1>
                  {
                    <textarea
                      rows="4"
                      required={isEditing ? false : true}
                      value={aiPrompt}
                      disabled={isEditing}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      name="aiPrompt"
                      placeholder="(e.g., Generate schema for blog app)"
                      className={`bg-[#1c1c1c] border w-full border-blue-500/50 outline-none rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-[#808080] resize-none ${
                        isEditing == true && "cursor-not-allowed"
                      }`}
                    ></textarea>
                  }
                </div>

                {projectSlice?.isButtonLoading ? (
                  <button
                    type="submit"
                    className="w-full bg-white text-black py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-gray-200 transition shadow"
                  >
                    <SpinnerLoader clr={"black"} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-white text-black py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-gray-200 transition shadow"
                  >
                    {isEditing ? (
                      <p className="flex gap-3 items-center justify-center">
                        <Send size={14} />
                        Update Project
                      </p>
                    ) : (
                      <p className="flex items-center gap-3 justify-center">
                        <Plus size={14} />
                        Create Project & Generate with AI
                      </p>
                    )}
                  </button>
                )}
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
