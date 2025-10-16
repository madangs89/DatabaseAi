import React, { useState } from "react";
import axios from "axios";
import logoIcon from "../assets/logoIcon.png";
import {
  ArrowLeft,
  Bell,
  CircleUser,
  Code,
  Edit,
  LayoutGrid,
  MoveLeft,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAllToBegin } from "../redux/slice/MonacoEditorSlice";
import { setCurrentProjectId } from "../redux/slice/projectSlice";
import toast from "react-hot-toast";
import { setGitLogout } from "../redux/slice/repoSlice";
import SpinnerLoader from "./loaders/SpinnerLoader";

const DashbordNav = ({
  selectedTab,
  setSelectedTab,
  projectTitle,
  setMobileSelectedTab,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const repoSlice = useSelector((state) => state?.repo);
  const [userProfileHover, setUserProfileHover] = useState(false);
  const [logoutLoader, setLogoutLoader] = useState(false);

  const handleLogout = async () => {
    try {
      setLogoutLoader(true);
      const logoutRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/repo/git-logout`,
        {},
        {
          withCredentials: true,
        }
      );
      console.log(logoutRes);

      if (logoutRes?.data?.success) {
        toast.success("Git Logout Done");
        dispatch(setGitLogout());
      }
    } catch (error) {
      console.log(error);
      toast.error("Unable to logout Git Account");
    } finally {
      setLogoutLoader(false);
    }
  };
  return (
    <nav className="h-16 py-10    w-full pr-3 sticky left-0 top-0 z-[99999] bg-black border-b-[0.5px] border-[#262626] flex justify-between items-center ">
      <div className="flex gap-2 pl-2 justify-center items-center flex-wrap">
        <div className="flex flex-col justify-center w-full sm:w-auto">
          <div className="flex gap-1 justify-center items-center">
            <svg
              className="text-white flex-shrink-0"
              fill="none"
              height="23"
              viewBox="0 0 48 48"
              width="23"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
                fill="currentColor"
              ></path>
            </svg>
            <h1 className="text-lg inter-font text-white font-bold truncate max-w-[150px] sm:max-w-full">
              {projectTitle}
            </h1>
          </div>
          <p className="text-xs text-neutral-400 truncate max-w-[150px] sm:max-w-full">
            main-branch
          </p>
        </div>
      </div>

      {/* <div className="flex text-sm flex-1 items-center justify-center gap-4">
        <button
          className={`${
            selectedTab === "editor" && "bg-[#525252]"
          } px-4 py-2 text-sm uppercase font-semibold mt-1 text-white   transition-all duration-200 ease-linear  rounded-md `}
        >
          Editor
        </button>
        <button
          className={`${
            selectedTab === "api" && "bg-[#525252]"
          } px-4 py-2 text-sm uppercase font-semibold mt-1 text-white   transition-all duration-200 ease-linear  rounded-md  `}
        >
          Api Explored
        </button>
      </div> */}
      <div className="flex items-center justify-center lg:gap-4 gap-2">
        <button
          onClick={() => {
            setSelectedTab("editor");
          }}
          className={`p-1.5 bg-[#525252] ${
            selectedTab === "editor" ? "text-blue-500" : "text-white"
          } inter-font font-semibold transition-all duration-200 ease-linear  rounded-md`}
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setSelectedTab("api")}
          className={`p-1.5 bg-[#525252]  ${
            selectedTab === "api" ? "text-blue-500" : "text-white"
          } inter-font font-semibold transition-all duration-200 ease-linear  rounded-md`}
        >
          <Code className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            setMobileSelectedTab(false);
            setSelectedTab("setting");
          }}
          className={`p-1.5 bg-[#525252] ${
            selectedTab === "setting" ? "text-blue-500" : "text-white"
          } inter-font font-semibold transition-all duration-200 ease-linear  rounded-md `}
        >
          <Settings className="w-5 h-5" />
        </button>

        {repoSlice?.isGitAuth && repoSlice?.gitAvatarUrl && (
          <button
            onMouseOver={() => setUserProfileHover(true)}
            onMouseLeave={() => setUserProfileHover(false)}
            className=""
          >
            <div className="w-7 h-7 rounded-full overflow-hidden">
              <img
                src={repoSlice?.gitAvatarUrl}
                className="w-full h-full object-contain"
                alt=""
              />
            </div>
          </button>
        )}
        <button
          onClick={() => {
            dispatch(setAllToBegin());
            dispatch(setGitLogout());

            dispatch(setCurrentProjectId(null));
            navigate("/project");
          }}
          className="p-1.5 bg-[#525252] text-white inter-font font-semibold transition-all duration-200 ease-linear  rounded-md "
        >
          <ArrowLeft className="text-white w-5 h-5" />
        </button>
      </div>

      {userProfileHover && repoSlice?.isGitAuth && repoSlice?.gitAvatarUrl && (
        <div
          onMouseOver={() => setUserProfileHover(true)}
          onMouseLeave={() => setUserProfileHover(false)}
          className="absolute  right-6 top-12 w-64 bg-[#1c1c1c] border border-[#333] rounded-xl shadow-lg p-4 flex flex-col gap-3 transition-all z-[999999999]"
        >
          {/* User Info */}
          <div className="flex items-center gap-3 border-b border-[#262626] pb-3">
            <img
              src={
                repoSlice?.gitAvatarUrl ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="User Avatar"
              className="w-10 h-10 rounded-full border border-[#333] object-cover"
            />
            <div className="flex flex-col">
              <p className="text-white text-sm font-semibold">
                {repoSlice?.gitName || "Guest User"}
              </p>
            </div>
          </div>

          {/* Account Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleLogout} // replace with real logout logic
              className="text-red-400 flex items-center justify-center text-sm text-left px-2 py-1 hover:bg-[#222] rounded-md transition"
            >
              {logoutLoader ? <SpinnerLoader /> : " Log Out"}
            </button>
          </div>

          {/* Footer */}
          <p className="text-[10px] text-gray-500 text-center mt-2">
            Verified Member
          </p>
        </div>
      )}
    </nav>
  );
};

export default DashbordNav;
