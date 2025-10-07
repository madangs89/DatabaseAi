import { v4 as uuidv4 } from "uuid";
import { setTree } from "../redux/slice/MonacoEditorSlice";

let ELK;
export const initELK = async () => {
  if (!ELK) {
    const module = await import("elkjs/lib/elk.bundled.js");
    ELK = module.default; // ELK class
  }
  return new ELK();
};

export const getElkLayout = async (nodes, edges) => {
  const elk = await initELK();
  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.spacing.nodeNode": "50", // spacing between nodes on the same layer
      "elk.layered.spacing.nodeNodeBetweenLayers": "200", // vertical spacing between layers
      "elk.layered.spacing.nodeNode": "100", // horizontal spacing between nodes in same layer
      "elk.layered.spacing.edgeNodeBetweenLayers": "50", // spacing around edges
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.spacing.edgeNode": "50", // spacing between edges and nodes
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: 200,
      height: 200,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layout = await elk.layout(graph);

  const layoutedNodes = nodes.map((node) => {
    const layoutNode = layout.children.find((n) => n.id === node.id);
    return {
      ...node,
      position: { x: layoutNode.x, y: layoutNode.y },
    };
  });

  // Map edges with updated bend points if ELK provides them
  const layoutedEdges = edges.map((edge) => {
    const layoutEdge = layout.edges.find((e) => e.id === edge.id);
    return {
      ...edge,
      data: {
        ...edge.data,
        bendPoints: layoutEdge?.sections?.[0]?.bendPoints || [],
      },
    };
  });
  return { layoutedEdges, layoutedNodes };
};

export const typeMessage = async ({
  text,
  sender = "system",
  type = "normal",
  setChatMessages,
  isWritting = false,
  setIsWritting,
}) => {
  const id = uuidv4();

  // Wait until not writing
  while (isWritting) {
    await new Promise((r) => setTimeout(r, 50));
  }

  // Mark as writing
  setIsWritting(true);

  // Add or update message
  setChatMessages((prev) => {
    // Check if last message is a status and current one also status → update same id
    if (
      type === "status" &&
      prev.length &&
      prev[prev.length - 1].type === "status"
    ) {
      const lastMsg = prev[prev.length - 1];
      // Update existing status message
      return prev.map((m) =>
        m.id === lastMsg.id
          ? { ...m, text: "", text2: "Estimated Time: 3 min" }
          : m
      );
    }

    // Otherwise, just append a new message
    return [...prev, { id, text: "", sender, type }];
  });

  // Typing animation
  await new Promise((resolve) => {
    let index = 0;
    const interval = setInterval(() => {
      setChatMessages((prev) =>
        prev.map((m) => {
          // Find message to animate (either the one we just added or the last status)
          if (
            type === "status" &&
            m.type === "status" &&
            index <= text.length
          ) {
            return { ...m, text: text.slice(0, index) };
          }
          if (m.id === id && index <= text.length) {
            return { ...m, text: text.slice(0, index) };
          }
          return m;
        })
      );

      index++;
      if (index > text.length) {
        clearInterval(interval);
        resolve();
      }
    }, 6);
  });

  // Finished typing
  setIsWritting(false);
};

export const typeMessage2 = ({
  text,
  sender = "system",
  setChatMessages,
  bottomRef,
  autoScroll = false,
}) => {
  return new Promise((resolve) => {
    const id = uuidv4();
    let index = 0;

    // Add empty message first
    setChatMessages((prev) => [...prev, { sender, text: "", id }]);

    let interval = setInterval(() => {
      setChatMessages((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            return { ...m, text: text.slice(0, index++) };
          }
          return m;
        })
      );
      if (index > text.length) {
        clearInterval(interval);
        resolve(); // ✅ typing finished
      }
    }, 6);
  });
};

export const apiCodeTreeFormatHandler = (fakeTreeStructure) => {
  let root = {};
  Object.entries(fakeTreeStructure).forEach(([key, value]) => {
    let parts = key.split("/");
    let current = root;
    let accumulated = "";
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      accumulated = accumulated ? `${accumulated}/${part}` : part;
      if (!current[part]) {
        if (isFile) {
          current[part] = {
            type: "file",
            id: accumulated,
            name: part,
            content: value,
          };
        } else {
          current[part] = {
            type: "folder",
            id: accumulated,
            name: part,
            children: {},
          };
        }
      }
      if (!isFile) {
        current = current[part].children;
      }
    });
  });

  const convertObjectToArray = (obj) => {
    return Object.values(obj)
      .map((item) => {
        if (item.type == "folder") {
          return { ...item, children: convertObjectToArray(item.children) };
        } else {
          return { ...item };
        }
      })
      .sort((a, b) => {
        if (a.type == b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type == "folder" ? -1 : 1;
      });
  };

  let t = convertObjectToArray(root);
  let final = [
    {
      type: "folder",
      id: "root",
      name: "backend",
      children: [...t],
    },
  ];

  return final;
};
