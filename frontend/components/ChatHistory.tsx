import React from "react";
import { ChatHistoryProps, Message } from "./types";

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Conversations
        </h2>
        <p className="text-gray-500 text-center py-8">
          No conversations yet. Ask a question to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Recent Conversations
      </h2>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.type === "question"
                ? "bg-gray-100"
                : message.type === "answer"
                ? "bg-blue-50"
                : message.type === "success"
                ? "bg-green-50"
                : "bg-red-50"
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center">
                {message.type === "question" && "🙋‍♂️"}
                {message.type === "answer" && "🤖"}
                {message.type === "success" && "✅"}
                {message.type === "error" && "❌"}
                <span className="ml-2 font-semibold">
                  {message.type === "question"
                    ? "You"
                    : message.type === "answer"
                    ? "Assistant"
                    : message.type === "success"
                    ? "System"
                    : "Error"}
                </span>
                {message.confidence && (
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      message.confidence === "high"
                        ? "bg-green-100 text-green-800"
                        : message.confidence === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {message.confidence}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{message.timestamp}</span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">
              {message.content}
            </p>

            {/* Sources for answers */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <details>
                  <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                    View {message.sources.length} source
                    {message.sources.length > 1 ? "s" : ""}
                  </summary>
                  <div className="mt-2 space-y-2">
                    {message.sources.slice(0, 3).map((source, idx) => (
                      <div
                        key={`source-${idx}`}
                        className="text-xs bg-white p-2 rounded border"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">Doc {source.id}</span>
                          <span className="text-gray-500">
                            Score: {source.score}
                          </span>
                        </div>
                        <p className="text-gray-600 truncate">
                          {source.text.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;