import React, { useState } from "react";
import Xarrow from "react-xarrows";
import { Rnd } from "react-rnd";
import { motion } from "framer-motion"; // ✅ For smooth animations

// ✅ Table Component
const TableBox = ({ id, title, fields, position, setPosition, theme }) => {
  // Define theme styles
  const themeStyles = {
    dark: {
      background: "#1e1e1e",
      color: "white",
      border: "1px solid #444",
    },
    light: {
      background: "#fff",
      color: "#000",
      border: "1px solid #ccc",
    },
  };

  return (
    <Rnd
      bounds="parent"
      size={{ width: 220, height: "auto" }}
      position={{ x: position.x, y: position.y }}
      onDragStop={(e, d) => setPosition(id, { x: d.x, y: d.y })}
      onResizeStop={(e, dir, ref, delta, pos) =>
        setPosition(id, { x: pos.x, y: pos.y })
      }
      style={{
        ...themeStyles[theme],
        borderRadius: "8px",
        padding: "10px",
        cursor: "move",
        boxShadow:
          theme === "dark"
            ? "0 4px 12px rgba(0,0,0,0.4)"
            : "0 4px 12px rgba(0,0,0,0.15)",
        transition: "all 0.3s ease-in-out",
      }}
      id={id}
    >
      <h3 style={{ marginBottom: "5px" }}>{title}</h3>
      <table style={{ width: "100%", fontSize: "14px" }}>
        <tbody>
          {fields.map((f) => (
            <tr key={f.name}>
              <td>{f.name}</td>
              <td
                style={{
                  textAlign: "right",
                  color: theme === "dark" ? "#aaa" : "#555",
                }}
              >
                {f.type}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Rnd>
  );
};

// ✅ Dashboard Component
const Dashboard = () => {
  // Theme toggle state
  const [theme, setTheme] = useState("dark");

  // Dummy data (simulate backend)
  const tableData = [
    {
      id: "users",
      title: "Users",
      fields: [
        { name: "id", type: "INT" },
        { name: "name", type: "VARCHAR" },
        { name: "email", type: "VARCHAR" },
      ],
      pos: { x: 100, y: 100 },
    },
    {
      id: "products",
      title: "Products",
      fields: [
        { name: "id", type: "INT" },
        { name: "name", type: "VARCHAR" },
        { name: "price", type: "DECIMAL" },
      ],
      pos: { x: 500, y: 150 },
    },
    {
      id: "orders",
      title: "Orders",
      fields: [
        { name: "id", type: "INT" },
        { name: "user_id", type: "INT" },
        { name: "total", type: "DECIMAL" },
      ],
      pos: { x: 300, y: 350 },
    },
    {
      id: "payments",
      title: "Payments",
      fields: [
        { name: "id", type: "INT" },
        { name: "order_id", type: "INT" },
        { name: "amount", type: "DECIMAL" },
      ],
      pos: { x: 700, y: 400 },
    },
    {
      id: "reviews",
      title: "Reviews",
      fields: [
        { name: "id", type: "INT" },
        { name: "product_id", type: "INT" },
        { name: "comment", type: "TEXT" },
      ],
      pos: { x: 900, y: 150 },
    },
  ];

  // Position state
  const [positions, setPositions] = useState(
    Object.fromEntries(tableData.map((t) => [t.id, t.pos]))
  );

  const setPosition = (id, pos) => {
    setPositions((prev) => ({ ...prev, [id]: pos }));
  };

  return (
    <div className="w-full h-screen">
      <motion.div
        className="flex items-center justify-center"
        style={{
          width: "50vw",
          height: "50vh",
          overflow: "hidden",
          position: "relative",
          backgroundColor: theme === "dark" ? "#121212" : "#f5f5f5",
          backgroundImage:
            theme === "dark"
              ? "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)"
              : "linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Theme toggle button */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "8px 14px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            background: theme === "dark" ? "#fff" : "#333",
            color: theme === "dark" ? "#000" : "#fff",
            fontWeight: "bold",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        {/* Render tables */}
        {tableData.map((table) => (
          <TableBox
            key={table.id}
            id={table.id}
            title={table.title}
            fields={table.fields}
            position={positions[table.id]}
            setPosition={setPosition}
            theme={theme}
          />
        ))}

        {/* Draw arrows */}
        <Xarrow
          start="users"
          end="orders"
          color={theme === "dark" ? "white" : "black"}
          strokeWidth={2}
        />
        <Xarrow
          start="orders"
          end="payments"
          color={theme === "dark" ? "white" : "black"}
          strokeWidth={2}
        />
        <Xarrow
          start="products"
          end="reviews"
          color={theme === "dark" ? "white" : "black"}
          strokeWidth={2}
        />
        <Xarrow
          start="users"
          end="reviews"
          color={theme === "dark" ? "white" : "black"}
          strokeWidth={2}
        />
      </motion.div>
    </div>
  );
};

export default Dashboard;
