import React from "react";

const RelationShipDbOpen = ({
  relationshipsOpen,
  edges,
  setSelectedRelationshipId,
  setEdges,
  selectedRelationshipId,
}) => {
  return (
    <>
      {relationshipsOpen && (
        <div className="flex-1 text-white px-3  overflow-y-auto rounded-lg shadow-lg ">
          {edges?.length > 0 &&
            edges?.map((attr) => (
              <div
                onClick={() => {
                  setSelectedRelationshipId(attr.id);
                  setEdges((prev) =>
                    prev.map((e) => {
                      if (e.id == attr.id) {
                        return {
                          ...e,
                          style: { ...e.style, stroke: "#2463EB" },
                        };
                      } else {
                        return {
                          ...e,
                          style: { ...e.style, stroke: "gray" },
                        };
                      }
                    })
                  );
                }}
                key={attr.id}
                className={`bg-[#232323] cursor-pointer outline-none text-white border ${
                  selectedRelationshipId == attr.id
                    ? "border-[#2463EB]"
                    : "border-[#3d3c3c]"
                } p-3 flex flex-col justify-center gap-4 rounded mb-2`}
              >
                <div className="flex justify-between gap-2 items-center mb-1">
                  <span className="font-medium">
                    {attr.source.length > 10
                      ? attr.source.substring(0, 10) + "..."
                      : attr.source}
                  </span>
                  <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                    {attr?.data?.type}
                  </span>
                  <span className="font-medium">
                    {attr.target.length > 10
                      ? attr.target.substring(0, 10) + "..."
                      : attr.target}
                  </span>
                </div>
                <span>{attr?.data?.description}</span>
              </div>
            ))}
        </div>
      )}
    </>
  );
};

export default RelationShipDbOpen;
