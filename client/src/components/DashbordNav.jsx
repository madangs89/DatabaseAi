import React from "react";
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
import { useDispatch } from "react-redux";
import { setAllToBegin } from "../redux/slice/MonacoEditorSlice";

const DashbordNav = ({ selectedTab, setSelectedTab, projectTitle }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return (
    <nav className="h-16 py-10   w-full pr-3 sticky left-0 top-0 z-[99999] bg-black border-b-[0.5px] border-[#262626] flex justify-between items-center ">
      <div className="flex gap-2 pl-2 justify-center items-center">
        <div className="flex  flex-col justify-center ">
          <div className="flex gap-1 justify-center items-center">
            <svg
              className="text-white"
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
            <h1 className="text-lg inter-font text-white font-bold">
              {projectTitle}
            </h1>
          </div>
          <p className="text-xs  text-neutral-400">main-branch</p>
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
      <div className="flex items-center justify-center gap-4 ">
        <button
          onClick={() => setSelectedTab("editor")}
          className="p-1.5 bg-[#525252] text-white inter-font font-semibold transition-all duration-200 ease-linear  rounded-md "
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setSelectedTab("api")}
          className="p-1.5 bg-[#525252] text-white inter-font font-semibold transition-all duration-200 ease-linear  rounded-md "
        >
          <Code className="w-5 h-5" />
        </button>
        <button className="p-1.5 bg-[#525252] text-white inter-font font-semibold transition-all duration-200 ease-linear  rounded-md ">
          <Settings className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            dispatch(setAllToBegin());
            navigate("/project");
          }}
          className="p-1.5 bg-[#525252] text-white inter-font font-semibold transition-all duration-200 ease-linear  rounded-md "
        >
          <ArrowLeft className="text-white w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default DashbordNav;
