// Dashboard.jsx
import React, { useState, useEffect } from "react";
import Xarrow from "react-xarrows";
import { Rnd } from "react-rnd";
import { motion } from "framer-motion";

/*
  Full Schema Editor Dashboard
  - Theme (dark/light)
  - Draggable / resizable tables
  - Click a table to edit in the right panel
  - Bottom JSON output view
  - Comments are added throughout so you can follow/modify easily
*/

const DEFAULT_TABLES = [
  {
    id: "users",
    title: "Users",
    description: "Stores user account information and login credentials.",
    fields: [
      { name: "id", type: "INT", constraints: ["PRIMARY KEY"] },
      { name: "username", type: "VARCHAR(255)", constraints: ["UNIQUE"] },
      { name: "email", type: "VARCHAR(255)", constraints: ["NOT NULL"] },
    ],
    pos: { x: 60, y: 80 },
  },
  {
    id: "products",
    title: "Products",
    description: "Product catalog with pricing and metadata.",
    fields: [
      { name: "id", type: "INT", constraints: ["PRIMARY KEY"] },
      { name: "name", type: "VARCHAR(255)", constraints: [] },
      { name: "price", type: "DECIMAL", constraints: [] },
    ],
    pos: { x: 440, y: 150 },
  },
  {
    id: "orders",
    title: "Orders",
    description: "Customer orders placed on the platform.",
    fields: [
      { name: "id", type: "INT", constraints: ["PRIMARY KEY"] },
      { name: "user_id", type: "INT", constraints: [] },
      { name: "total", type: "DECIMAL", constraints: [] },
    ],
    pos: { x: 300, y: 360 },
  },
  {
    id: "payments",
    title: "Payments",
    description: "Payment records for completed orders.",
    fields: [
      { name: "id", type: "INT", constraints: ["PRIMARY KEY"] },
      { name: "order_id", type: "INT", constraints: [] },
      { name: "amount", type: "DECIMAL", constraints: [] },
    ],
    pos: { x: 720, y: 380 },
  },
  {
    id: "reviews",
    title: "Reviews",
    description: "Product reviews by customers.",
    fields: [
      { name: "id", type: "INT", constraints: ["PRIMARY KEY"] },
      { name: "product_id", type: "INT", constraints: [] },
      { name: "comment", type: "TEXT", constraints: [] },
    ],
    pos: { x: 920, y: 140 },
  },
];

// Helper to create a new id
const makeId = (prefix = "t") =>
  prefix + Math.random().toString(36).substr(2, 6);

// Small badge for constraints
const ConstraintBadge = ({ c, theme }) => (
  <span
    style={{
      marginLeft: 8,
      padding: "2px 6px",
      borderRadius: 12,
      fontSize: 11,
      background: theme === "dark" ? "#2b2b2b" : "#e9eef6",
      color: theme === "dark" ? "#ddd" : "#222",
      border: theme === "dark" ? "1px solid #3b3b3b" : "1px solid #d0d7e6",
    }}
  >
    {c}
  </span>
);

// TableBox component (draggable + resizable box)
const TableBox = ({
  id,
  title,
  fields,
  position,
  setPosition,
  onClick,
  theme,
  isSelected,
}) => {
  // Theme styles for the box
  const themeStyles = {
    dark: {
      background: "#1e1e1e",
      color: "#fff",
      border: "1px solid #333",
      headerBg: "#252525",
    },
    light: {
      background: "#ffffff",
      color: "#111",
      border: "1px solid #ddd",
      headerBg: "#f2f2f2",
    },
  };

  return (
    // Rnd must have a stable id so Xarrow can reference it
    <Rnd
      bounds="parent"
      size={{ width: 240, height: "auto" }}
      position={{ x: position.x, y: position.y }}
      onDragStop={(e, d) => setPosition(id, { x: d.x, y: d.y })}
      onResizeStop={(e, dir, ref, delta, pos) =>
        setPosition(id, { x: pos.x, y: pos.y })
      }
      style={{
        ...themeStyles[theme],
        borderRadius: 8,
        padding: 10,
        cursor: "move",
        boxShadow:
          theme === "dark"
            ? "0 6px 18px rgba(0,0,0,0.45)"
            : "0 6px 18px rgba(0,0,0,0.12)",
        transition: "transform 0.12s ease, box-shadow 0.12s ease",
        transform: isSelected ? "scale(1.02)" : "none",
        zIndex: isSelected ? 3 : 1,
      }}
      id={id}
      // Clicking the Rnd wrapper selects the entity (but dragging won't trigger click)
      onClick={(e) => {
        // avoid selecting while dragging or resizing; Rnd already handles that.
        onClick(id);
      }}
    >
      {/* Header */}
      <div
        style={{
          background: themeStyles[theme].headerBg,
          padding: "8px 10px",
          borderRadius: 6,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      {/* Fields table */}
      <table style={{ width: "100%", fontSize: 13 }}>
        <tbody>
          {fields.map((f) => (
            <tr key={f.name}>
              <td style={{ padding: "6px 0" }}>{f.name}</td>
              <td
                style={{
                  textAlign: "right",
                  fontFamily: "monospace",
                  color: theme === "dark" ? "#bdbdbd" : "#666",
                }}
              >
                {f.type}
                {/* show small constraint badges inline */}
                {f.constraints &&
                  f.constraints.map((c) => (
                    <ConstraintBadge key={c} c={c} theme={theme} />
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Rnd>
  );
};

// Main Dashboard component
export default function Dashboard() {
  // Theme state (global single variable controlling theme)
  const [theme, setTheme] = useState("dark");

  // Table data (stateful so edits update JSON & UI)
  const [tables, setTables] = useState(DEFAULT_TABLES);

  // Positions map derived from tables, kept separate for quick updates
  const [positions, setPositions] = useState(
    Object.fromEntries(tables.map((t) => [t.id, t.pos]))
  );

  // Selected entity id (click a table to edit on the right panel)
  const [selectedId, setSelectedId] = useState(tables[0].id);

  // Search filter for the left canvas (top search box)
  const [search, setSearch] = useState("");

  // Keep positions in sync if tables change (e.g., add/remove)
  useEffect(() => {
    setPositions((prev) => {
      const next = { ...prev };
      for (const t of tables) {
        if (!next[t.id]) next[t.id] = t.pos || { x: 60, y: 60 };
      }
      // remove deleted ids
      Object.keys(next).forEach((k) => {
        if (!tables.find((t) => t.id === k)) delete next[k];
      });
      return next;
    });
  }, [tables]);

  // Update position for table by id
  const setPosition = (id, pos) => {
    setPositions((prev) => ({ ...prev, [id]: pos }));
    // also persist into tables state so JSON uses last positions
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, pos } : t)));
  };

  // Helper: get selected table object
  const selectedTable = tables.find((t) => t.id === selectedId) || tables[0];

  // Update a table's top-level field (title / description)
  const updateTable = (id, patch) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  // Update fields array for a table
  const updateTableFields = (id, newFields) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, fields: newFields } : t)));
  };

  // Add a new attribute/field to selected table
  const addFieldToSelected = () => {
    if (!selectedId) return;
    const newField = { name: "new_field", type: "VARCHAR(255)", constraints: [] };
    const t = tables.find((x) => x.id === selectedId);
    updateTableFields(selectedId, [...t.fields, newField]);
  };

  // Remove a field by index
  const removeField = (idx) => {
    if (!selectedId) return;
    const t = tables.find((x) => x.id === selectedId);
    const next = t.fields.filter((_, i) => i !== idx);
    updateTableFields(selectedId, next);
  };

  // Toggle a constraint on a field (e.g., add/remove 'UNIQUE')
  const toggleConstraint = (fieldIdx, constraint) => {
    const t = tables.find((x) => x.id === selectedId);
    const next = t.fields.map((f, i) => {
      if (i !== fieldIdx) return f;
      const has = f.constraints && f.constraints.includes(constraint);
      const constraints = has
        ? f.constraints.filter((c) => c !== constraint)
        : [...(f.constraints || []), constraint];
      return { ...f, constraints };
    });
    updateTableFields(selectedId, next);
  };

  // Update name/type of a specific field
  const editField = (idx, patch) => {
    const t = tables.find((x) => x.id === selectedId);
    const next = t.fields.map((f, i) => (i === idx ? { ...f, ...patch } : f));
    updateTableFields(selectedId, next);
  };

  // Add a new table (placed at a default offset)
  const addTable = () => {
    const id = makeId("t");
    const newTable = {
      id,
      title: "NewEntity",
      description: "",
      fields: [{ name: "id", type: "INT", constraints: ["PRIMARY KEY"] }],
      pos: { x: 160, y: 200 },
    };
    setTables((p) => [...p, newTable]);
    setSelectedId(id);
  };

  // Remove selected table
  const removeSelectedTable = () => {
    if (!selectedId) return;
    setTables((p) => p.filter((t) => t.id !== selectedId));
    setSelectedId((prev) => {
      const remaining = tables.filter((t) => t.id !== prev);
      return remaining.length ? remaining[0].id : null;
    });
  };

  // Simple relation list for arrows (you can derive this by inspecting fields in real app)
  // For demo, we'll hardcode some relationships similar to the screenshot
  const relations = [
    { start: "users", end: "orders" },
    { start: "orders", end: "payments" },
    { start: "products", end: "reviews" },
    { start: "users", end: "reviews" },
  ];

  // Filter tables by search term (searching titles)
  const visibleTables = tables.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  // JSON output for bottom panel (formatted)
  const schemaJson = JSON.stringify(
    Object.fromEntries(
      tables.map((t) => [
        t.id,
        {
          title: t.title,
          description: t.description,
          pos: t.pos,
          columns: t.fields.map((f) => ({
            name: f.name,
            type: f.type,
            constraints: f.constraints || [],
          })),
        },
      ])
    ),
    null,
    2
  );

  // Styles (kept inline for single-file ease)
  const styles = {
    header: {
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      borderBottom: theme === "dark" ? "1px solid #232323" : "1px solid #e6e6e6",
      background: theme === "dark" ? "#0f0f0f" : "#fff",
      color: theme === "dark" ? "#fff" : "#111",
    },
    leftPane: {
      flex: 1,
      padding: 18,
    },
    canvasWrap: {
      height: "calc(100% - 120px)",
      borderRadius: 8,
      overflow: "hidden",
      padding: 12,
      position: "relative",
      boxSizing: "border-box",
    },
    rightPanel: {
      width: 380,
      padding: 18,
      boxSizing: "border-box",
    },
    bottomJson: {
      height: 160,
      padding: 12,
      overflow: "auto",
      borderTop: theme === "dark" ? "1px solid #252525" : "1px solid #e7e7e7",
      background: theme === "dark" ? "#0b0b0b" : "#fafafa",
      color: theme === "dark" ? "#e6e6e6" : "#111",
      fontFamily: "monospace",
      fontSize: 13,
    },
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>
            <span style={{ marginRight: 10 }}>📦</span> E-commerce Platform
            <div style={{ fontSize: 11, color: theme === "dark" ? "#a6a6a6" : "#6b6b6b" }}>
              main-branch
            </div>
          </div>
          {/* Top navigation */}
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ padding: "6px 10px", borderRadius: 6, opacity: 0.95, background: theme === "dark" ? "#111" : "#f3f3f3" }}>
              Editor
            </div>
            <div style={{ padding: "6px 10px", borderRadius: 6, background: theme === "dark" ? "#222" : "#fff", boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.05)" }}>
              API Explorer
            </div>
            <div style={{ padding: "6px 10px", borderRadius: 6 }}>Version Control</div>
          </div>
        </div>

        {/* Right header controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            placeholder="Search entities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #3333",
              background: theme === "dark" ? "#121212" : "#fff",
              color: theme === "dark" ? "#fff" : "#111",
              outline: "none",
            }}
          />
          <button onClick={addTable} style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}>
            + Add
          </button>

          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              cursor: "pointer",
              background: theme === "dark" ? "#fff" : "#111",
              color: theme === "dark" ? "#000" : "#fff",
            }}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>

      {/* Main content area: left canvas + right panel */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, background: theme === "dark" ? "#0b0b0b" : "#f5f6f9" }}>
        {/* Left area */}
        <div style={styles.leftPane}>
          <div
            style={{
              ...styles.canvasWrap,
              backgroundColor: theme === "dark" ? "#0e0e0e" : "#fff",
              border: theme === "dark" ? "1px solid #222" : "1px solid #e8e8e8",
              // grid background (subtle)
              backgroundImage:
                theme === "dark"
                  ? "linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)"
                  : "linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            {/* Canvas area where Rnd boxes will be placed */}
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              {/* Render visible tables (filtered by search) */}
              {visibleTables.map((table) => (
                <TableBox
                  key={table.id}
                  id={table.id}
                  title={table.title}
                  fields={table.fields}
                  position={positions[table.id] || table.pos}
                  setPosition={setPosition}
                  onClick={(id) => setSelectedId(id)}
                  theme={theme}
                  isSelected={selectedId === table.id}
                />
              ))}

              {/* Draw arrows for relations */}
              {relations.map((r, i) => {
                // only draw if both endpoints exist in current tables list
                if (!tables.find((t) => t.id === r.start) || !tables.find((t) => t.id === r.end)) return null;
                const color = theme === "dark" ? "#9fb8ff" : "#333";
                return (
                  <Xarrow
                    key={i}
                    start={r.start}
                    end={r.end}
                    strokeWidth={2}
                    color={color}
                    headSize={6}
                    path="smooth"
                    showHead={true}
                    zIndex={0}
                  />
                );
              })}
            </div>
          </div>

          {/* Bottom JSON output bar */}
          <div style={styles.bottomJson}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>Schema Output (JSON)</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    // copy JSON to clipboard
                    navigator.clipboard?.writeText(schemaJson);
                  }}
                  style={{ padding: "6px 8px", borderRadius: 6 }}
                >
                  Copy
                </button>
                <button
                  onClick={() => {
                    // download JSON
                    const blob = new Blob([schemaJson], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "schema.json";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  style={{ padding: "6px 8px", borderRadius: 6 }}
                >
                  Download
                </button>
              </div>
            </div>

            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{schemaJson}</pre>
          </div>
        </div>

        {/* Right panel: Entity Details */}
        <div
          style={{
            ...styles.rightPanel,
            borderLeft: theme === "dark" ? "1px solid #202020" : "1px solid #e8e8e8",
            background: theme === "dark" ? "#0f0f0f" : "#fff",
            color: theme === "dark" ? "#fff" : "#111",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>Entity Details</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addFieldToSelected} style={{ padding: "6px 8px", borderRadius: 6 }}>+ Field</button>
              <button onClick={removeSelectedTable} style={{ padding: "6px 8px", borderRadius: 6 }}>Delete</button>
            </div>
          </div>

          {!selectedTable ? (
            <div style={{ color: theme === "dark" ? "#a6a6a6" : "#666" }}>No entity selected</div>
          ) : (
            <>
              {/* Entity name */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: theme === "dark" ? "#a6a6a6" : "#777" }}>Entity Name</div>
                <input
                  value={selectedTable.title}
                  onChange={(e) => updateTable(selectedTable.id, { title: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    marginTop: 6,
                    borderRadius: 8,
                    border: "1px solid #3333",
                    background: theme === "dark" ? "#121212" : "#fff",
                    color: theme === "dark" ? "#fff" : "#111",
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: theme === "dark" ? "#a6a6a6" : "#777" }}>Description</div>
                <textarea
                  value={selectedTable.description}
                  onChange={(e) => updateTable(selectedTable.id, { description: e.target.value })}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    marginTop: 6,
                    borderRadius: 8,
                    border: "1px solid #3333",
                    background: theme === "dark" ? "#121212" : "#fff",
                    color: theme === "dark" ? "#fff" : "#111",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ marginBottom: 8, fontWeight: 700 }}>Attributes</div>

              {/* Attribute list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedTable.fields.map((f, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      background: theme === "dark" ? "#101010" : "#fbfbfb",
                      border: theme === "dark" ? "1px solid #222" : "1px solid #ebebeb",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                          value={f.name}
                          onChange={(e) => editField(idx, { name: e.target.value })}
                          style={{
                            padding: "6px 8px",
                            borderRadius: 6,
                            border: "1px solid #ddd",
                            background: theme === "dark" ? "#0f0f0f" : "#fff",
                            color: theme === "dark" ? "#fff" : "#111",
                          }}
                        />
                        <input
                          value={f.type}
                          onChange={(e) => editField(idx, { type: e.target.value })}
                          style={{
                            padding: "6px 8px",
                            borderRadius: 6,
                            border: "1px solid #ddd",
                            fontFamily: "monospace",
                            background: theme === "dark" ? "#0f0f0f" : "#fff",
                            color: theme === "dark" ? "#fff" : "#111",
                          }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => toggleConstraint(idx, "PRIMARY KEY")} style={{ padding: "6px 8px", borderRadius: 6 }}>
                          PK
                        </button>
                        <button onClick={() => toggleConstraint(idx, "UNIQUE")} style={{ padding: "6px 8px", borderRadius: 6 }}>
                          UNIQUE
                        </button>
                        <button onClick={() => toggleConstraint(idx, "NOT NULL")} style={{ padding: "6px 8px", borderRadius: 6 }}>
                          NOT NULL
                        </button>
                        <button onClick={() => removeField(idx)} style={{ padding: "6px 8px", borderRadius: 6 }}>
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* show active constraints */}
                    <div style={{ display: "flex", gap: 8 }}>
                      {(f.constraints || []).map((c) => (
                        <ConstraintBadge key={c} c={c} theme={theme} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
