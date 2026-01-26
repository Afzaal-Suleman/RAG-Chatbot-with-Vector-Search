import React, { useState, KeyboardEvent } from "react";
import { ChatInterfaceProps } from "./types";

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onAskQuestion,
  loading,
  currentAnswer,
  currentResult
}) => {
  const [question, setQuestion] = useState<string>("");

  const handleSubmit = async (): Promise<void> => {
    if (!question.trim() || loading) return;
    await onAskQuestion(question.trim());
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Input */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Ask a Question
        </h2>
        <div className="flex flex-col space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your question here... (e.g., How do I reset my password?)"
            className="w-full p-4 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !question.trim()}
            className="self-end bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Thinking...
              </span>
            ) : (
              "Ask Question"
            )}
          </button>
        </div>

        {/* Current Answer Display */}
        {currentAnswer && currentResult && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center mb-2">
              <span className="font-semibold text-blue-800">Answer:</span>
              {currentResult.confidence && (
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    currentResult.confidence === "high"
                      ? "bg-green-100 text-green-800"
                      : currentResult.confidence === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  Confidence: {currentResult.confidence}
                </span>
              )}
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{currentAnswer}</p>

            {/* Sources */}
            {currentResult.sources && currentResult.sources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Sources:</h4>
                <div className="space-y-2">
                  {currentResult.sources.map((source, idx) => (
                    <div
                      key={`source-${idx}`}
                      className="text-sm bg-white p-3 rounded border"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Document {source.id}</span>
                        <span className="text-gray-500">Score: {source.score}</span>
                      </div>
                      <p className="text-gray-600 truncate">{source.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;