import React, { useState } from "react";
import axios from "axios";

const Chat = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you with your research?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input.trim(), sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input.trim();
    setInput("");

    try {
      const response = await axios.post("http://localhost:5000/research", {
        prompt: userInput,
      });
      const botResponse = { text: response.data.research, sender: "bot" };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Error fetching response from backend:", error);
      const errorMessage = { text: "Sorry, an error occurred while fetching the response.", sender: "bot" };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-grey-900 text-white">
      <header className="p-4 bg-gray-800 shadow-md">
        <h1 className="text-3xl font-bold">Mantra AI</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg shadow-md max-w-lg break-words ${
              msg.sender === "user" ? "bg-blue-600 self-end" : "bg-gray-700 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </main>
      <footer className="p-4 bg-gray-800 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Start your company research"
          className="flex-1 p-3 rounded-l-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button onClick={sendMessage} className="p-3 bg-blue-600 hover:bg-blue-500 rounded-r-lg">
          Send
        </button>
      </footer>
    </div>
  );
};

export default Chat;