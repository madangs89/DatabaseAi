import React from "react";

const DatabaseOpen = ({ dbOpen, selectedDbData }) => {
  return (
    <>
      {dbOpen && (
        <div className=" flex-1  text-white px-3 overflow-y-auto  rounded-lg shadow-lg w-full">
          {(selectedDbData && selectedDbData?.title) ||
          selectedDbData?.data?.title ? (
            <div className="mb-6 ">
              {/* Entity Details */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">
                  Entity Name
                </label>
                <input
                  type="text"
                  value={selectedDbData?.title || selectedDbData?.data?.title}
                  readOnly
                  className="w-full bg-[#232323] outline-none text-white border border-[#3d3c3c] rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={
                    selectedDbData?.description || selectedDbData?.data?.description
                  }
                  readOnly
                  className="w-full bg-[#232323] outline-none text-white border border-[#3d3c3c] rounded px-3 py-2 resize-none"
                  rows={3}
                />
              </div>

              {/* Attributes */}
              <div>
                <h3 className="text-md font-semibold mb-2">Attributes</h3>
                {selectedDbData?.fields &&
                  selectedDbData?.fields?.length > 0 &&
                  selectedDbData?.fields?.map((attr) => (
                    <div
                      key={attr.name}
                      className="bg-[#232323] outline-none text-white border border-[#3d3c3c] p-3 rounded mb-2"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{attr.name}</span>
                        <div className="flex gap-2 items-center justify-center">
                          {attr.primaryKey == true && (
                            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                              {"Primary Key"}
                            </span>
                          )}
                          {attr.required == true && (
                            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                              {"Required"}
                            </span>
                          )}
                          {attr.unique == true && (
                            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                              {"Unique"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mb-1">
                        {attr.type}
                      </div>
                      {attr.description && (
                        <div className="text-xs text-gray-500">
                          {attr.description}
                        </div>
                      )}
                    </div>
                  ))}
                {selectedDbData?.data?.fields &&
                  selectedDbData?.data?.fields?.length > 0 &&
                  selectedDbData?.data?.fields?.map((attr) => (
                    <div
                      key={attr.name}
                      className="bg-[#232323] outline-none text-white border border-[#3d3c3c] p-3 rounded mb-2"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{attr.name}</span>
                        <div className="flex gap-2 items-center justify-center">
                          {attr.primaryKey == true && (
                            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                              {"Primary Key"}
                            </span>
                          )}
                          {attr.required == true && (
                            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                              {"Required"}
                            </span>
                          )}
                          {attr.unique == true && (
                            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                              {"Unique"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mb-1">
                        {attr.type}
                      </div>
                      {attr.description && (
                        <div className="text-xs text-gray-500">
                          {attr.description}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#525252]">Select a database entity</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DatabaseOpen;
