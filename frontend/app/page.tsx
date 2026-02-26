"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");

  const connectBackend = async () => {
    try {
      const res = await fetch("http://localhost:5000/test");

      const data = await res.json();

      setMessage(data.message);
    } catch (error) {
      setMessage("Connection failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-3xl font-bold">Next.js ↔ NestJS Connection</h1>

      <button
        onClick={connectBackend}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        Connect Backend
      </button>

      {message && (
        <p className="text-xl font-semibold">{message}</p>
      )}
    </div>
  );
}