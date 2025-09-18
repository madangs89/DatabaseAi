import React from "react";
import logoIcon from "../assets/logoIcon.png";
import { Bell, CircleUser, Settings } from "lucide-react";

const DashbordNav = ({ selectedTab, setSelectedTab }) => {
  return (
    <nav className="h-16 py-10  w-full pr-3 sticky left-0 top-0 z-[99999] bg-black border-b-[0.5px] border-[#262626] flex justify-between items-center ">
      <div className="flex gap-1 justify-center">
        <img src={logoIcon} className="w-14 h-14 object-contain" alt="" />
        <div className="flex  flex-col justify-center">
          <h1 className="text-lg inter-font text-white font-bold">
            E-commerce Platform
          </h1>
          <p className="text-xs text-neutral-400">main-branch</p>
        </div>
      </div>
      <div className="flex text-sm flex-1 items-center justify-center gap-4">
        <button
          onClick={() => setSelectedTab("editor")}
          className={`${
            selectedTab === "editor" && "bg-[#525252]"
          } px-4 py-2 text-[#a3a3a3] dm-sans-font   font-[800] transition-all duration-200 ease-linear  rounded-md `}
        >
          Editor
        </button>
        <button
          onClick={() => setSelectedTab("api")}
          className={`${
            selectedTab === "api" && "bg-[#525252]"
          } px-4 py-2 text-[#a3a3a3] dm-sans-font  font-[800] transition-all duration-200 ease-linear  rounded-md `}
        >
          Api Explored
        </button>
        <button
          onClick={() => setSelectedTab("version")}
          className={`${
            selectedTab === "version" && "bg-[#525252]"
          } px-4 py-2 text-[#a3a3a3] dm-sans-font  font-[800] transition-all duration-200 ease-linear rounded-md `}
        >
          Version Control
        </button>
      </div>
      <div className="flex items-center justify-center gap-4 ">
        <button className="p-1.5 bg-[#525252] text-white inter-font font-semibold transition-all duration-200 ease-linear  rounded-md ">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-1.5 bg-[#525252] text-white inter-font font-semibold transition-all duration-200 ease-linear  rounded-md ">
          <Settings className="w-5 h-5" />
        </button>
        <button className="p-1.5 bg-[#525252] text-white inter-font font-semibold transition-all duration-200 ease-linear  rounded-md ">
          <CircleUser className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default DashbordNav;
