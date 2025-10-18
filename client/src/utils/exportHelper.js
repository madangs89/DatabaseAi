import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toPng } from "html-to-image";

/**
 * Export a ReactFlow diagram along with code tree and server code as a ZIP file
 * @param {React.RefObject} rfWrapperRef - Ref to the container wrapping ReactFlow
 * @param {Array|Object} codeTree - Code tree structure with files/folders
 * @param {string} servercode - Full database/server code
 */
export const exportProject = async (rfWrapperRef, codeTree, servercode) => {
  if (!rfWrapperRef || !rfWrapperRef.current) {
    console.error("ReactFlow wrapper ref not provided or invalid!");
    return;
  }

  try {
    const zip = new JSZip();

    // 1️⃣ Export ER Diagram as PNG
    let pngDataUrl = null;
    try {
      pngDataUrl = await toPng(rfWrapperRef.current, {
        cacheBust: true,
        backgroundColor: "#171717",
        pixelRatio: 3,
          // Force default font to avoid cross-origin font issues
        style: {
          fontFamily: "Arial, sans-serif",
        },
      });
      const base64 = pngDataUrl.split(",")[1];
      zip.file("ER-diagram.png", base64, { base64: true });
    } catch (err) {
      console.warn(
        "Warning: Could not generate ER-diagram PNG. SecurityError likely due to cross-origin fonts.",
        err
      );
    }

    // 2️⃣ Recursively add code tree
    const addFilesRecursively = (folder, obj) => {
      if (!obj) return;

      if (Array.isArray(obj)) {
        obj.forEach((child) => addFilesRecursively(folder, child));
      } else if (obj.type === "file") {
        folder.file(obj.name, obj.content || "");
      } else if (obj.type === "folder") {
        const subFolder = folder.folder(obj.name);
        if (obj.children?.length) {
          obj.children.forEach((child) =>
            addFilesRecursively(subFolder, child)
          );
        }
      }
    };

    if (codeTree) {
      addFilesRecursively(zip, codeTree);
    }

    // 3️⃣ Add server code
    if (servercode) {
      zip.file("FullDataBase.js", servercode);
    }

    // 4️⃣ Generate zip and trigger download
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "project-export.zip");

    console.log("Project export completed successfully!");
  } catch (err) {
    console.error("Error exporting project:", err);
  }
};
