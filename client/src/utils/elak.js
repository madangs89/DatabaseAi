import { v4 as uuidv4 } from "uuid";

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

  // Wait until isWritting is false
  while (isWritting) {
    await new Promise((r) => setTimeout(r, 50)); // poll every 50ms
  }

  // Mark as writing
  setIsWritting(true);

  // Add empty message
  setChatMessages((prev) => {
    const filtered = prev.filter((m) => m.type !== "status");

    if (type === "status") {
      // Avoid adding status again if already last message is status
      if (prev.length && prev[prev.length - 1].type === "status") {
        return prev;
      }
      return [...filtered, { id, text, sender, type }];
    }

    return [...filtered, { id, text: "", sender, type }];
  });

  // Type text character by character
  await new Promise((resolve) => {
    let index = 0;
    const interval = setInterval(() => {
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, text: text.slice(0, index++) } : m
        )
      );
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
