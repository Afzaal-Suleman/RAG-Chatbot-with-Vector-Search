import React, { useState, KeyboardEvent } from "react";
import { AddDocumentProps, AddDocumentResponse } from "./types";

const AddDocument: React.FC<AddDocumentProps> = ({
  onAddDocument,
  loading,
  result,
  error
}) => {
  const [text, setText] = useState<string>("");

  const handleSubmit = async (): Promise<void> => {
    if (!text.trim() || loading) return;
    await onAddDocument(text.trim());
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Add to Knowledge Base
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">
            Document Text
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter the document text you want to add to the knowledge base..."
            className="w-full p-4 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            rows={6}
            disabled={loading}
          />
          <div className="flex justify-between mt-1">
            <span
              className={`text-sm ${
                text.length > 10000 ? "text-red-500" : "text-gray-500"
              }`}
            >
              {text.length}/10000 characters
            </span>
            <span className="text-sm text-gray-500">{wordCount} words</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
        >
          {loading ? (
            <span className="flex items-center justify-center">
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
              Adding to knowledge base...
            </span>
          ) : (
            "Add Document"
          )}
        </button>

        {/* Success Result */}
        {result?.success && result.data && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800">
                Document Added Successfully!
              </h3>
            </div>

            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Document ID:</span>
                  <p className="font-mono text-sm bg-white p-2 rounded border">
                    {result.data.id}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Category:</span>
                  <p className="text-sm font-medium">{result.data.category}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-600">Text Preview:</span>
                <p className="mt-1 p-3 bg-white rounded border text-gray-700">
                  {result.data.textPreview}
                </p>
              </div>

              <div className="flex space-x-4 text-sm">
                <div>
                  <span className="text-gray-600">Length:</span>
                  <span className="ml-2 font-medium">
                    {result.data.textLength} chars
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Dimensions:</span>
                  <span className="ml-2 font-medium">
                    {result.data.embeddingDimensions}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Added:</span>
                  <span className="ml-2 font-medium">
                    {new Date(result.data.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-semibold text-blue-800 mb-2">
            Tips for adding documents:
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Be clear and concise for best search results</li>
            <li>• Include key information in the first sentence</li>
            <li>• Avoid markdown formatting and special characters</li>
            <li>• Each document should cover a specific topic or concept</li>
            <li>• Documents are searchable immediately after adding</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddDocument;