import { Brain, Cable, Copy, DatabaseZap, X } from "lucide-react";
import React from "react";

const DashboardRightNav = ({
  chatOpen,
  dbOpen,
  copyOpen,
  relationshipsOpen,
  setChatOpen,
  setDbOpen,
  setCopyOpen,
  setRelationshipsOpen,
  selectedDb,
  mobileSelectedTab,
  setMobileSelectedTab,
}) => {
  return (
    <>
      <nav className="w-full sticky z-[99999] top-0 border-b pl-3 border-[#262626] py-7 left-0 h-10 flex justify-between pr-3 bg-[#171717] gap-5 items-center">
        <h1 className="text-white flex-1 flex gap-1 justify-between items-center font-bold">
          {chatOpen && "Chat with AI"}
          {dbOpen && `${selectedDb == null ? "" : selectedDb} Entity Details`}
          {copyOpen && "Copy to clipboard"}
          {relationshipsOpen && "Relationships"}
          {mobileSelectedTab && (
            <button
              onClick={() => setMobileSelectedTab(false)}
              className="w-8 h-8 flex lg:hidden cursor-pointer items-center justify-center bg-[#1c1c1c] border border-[#333] rounded-md text-white hover:bg-[#2a2a2a]"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </h1>
        <div className="flex justify-end gap-5">
          <Brain
            onClick={() => {
              setDbOpen(false);
              setRelationshipsOpen(false);
              setCopyOpen(false);
              setChatOpen(true);
            }}
            className={`w-5 h-5 cursor-pointer transition-all duration-200 ease-linear ${
              chatOpen ? "text-white" : "text-[#525252]"
            }`}
          />
          <DatabaseZap
            onClick={() => {
              setChatOpen(false);
              setCopyOpen(false);
              setRelationshipsOpen(false);
              setDbOpen(true);
            }}
            className={`w-5 h-5 cursor-pointer transition-all duration-200 ease-linear ${
              dbOpen ? "text-white" : "text-[#525252]"
            }`}
          />
          <Copy
            onClick={() => {
              setChatOpen(false);
              setDbOpen(false);
              setRelationshipsOpen(false);
              setCopyOpen(true);
            }}
            className={`w-5 h-5 cursor-pointer transition-all duration-200 ease-linear ${
              copyOpen ? "text-white" : "text-[#525252]"
            }`}
          />
          <Cable
            onClick={() => {
              setChatOpen(false);
              setDbOpen(false);
              setCopyOpen(false);
              setRelationshipsOpen(true);
            }}
            className={`w-5 h-5 cursor-pointer transition-all duration-200 ease-linear ${
              relationshipsOpen ? "text-white" : "text-[#525252]"
            }`}
          />
        </div>
      </nav>
    </>
  );
};

export default DashboardRightNav;
