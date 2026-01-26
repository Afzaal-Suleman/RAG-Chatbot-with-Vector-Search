"use client";

import { useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import AddDocument from '@/components/AddDocument';
import { ApiResponse, AddDocumentResponse, Message } from '@/components/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AddDocumentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ApiResponse<AddDocumentResponse> | undefined>();
  const [error, setError] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'success',
      content: 'Add documents to expand the knowledge base. They will be immediately searchable.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const generateId = useCallback((): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }, []);

  const handleAddDocument = useCallback(async (text: string): Promise<void> => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post<ApiResponse<AddDocumentResponse>>(
        `${API_BASE_URL}/api/chat/add`,
        {
          text,
          category: 'user_content',
          tags: ['user_added'],
        }
      );
      
      setResult(response.data);

      if (response.data.success) {
        const successMessage: Message = {
          id: generateId(),
          type: 'success',
          content: `✅ Document added successfully! ID: ${response.data.data!.id}`,
          timestamp: new Date().toLocaleTimeString(),
        };
        
        setMessages((prev) => [successMessage, ...prev.slice(0, 9)]);
        
        // Clear the form after successful submission
        setTimeout(() => {
          setResult(undefined);
        }, 5000);
      } else {
        throw new Error(response.data.error || 'Failed to add document');
      }
      
    } catch (err: any) {
      console.error('Error adding document:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to add document';
      setError(errorMsg);
      
      const errorMessage: Message = {
        id: generateId(),
        type: 'error',
        content: `❌ Error: ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages((prev) => [errorMessage, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
    }
  }, [generateId]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          📝 Add to Knowledge Base
        </h1>
        <p className="text-gray-600">
          Add new documents that will be searchable through semantic search
        </p>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Document Form - Takes 2/3 on large screens */}
        <div className="lg:col-span-2">
          <AddDocument
            onAddDocument={handleAddDocument}
            loading={loading}
            result={result}
            error={error}
          />
        </div>

        {/* Sidebar - Takes 1/3 on large screens */}
        <div className="space-y-6">
          {/* Recent Additions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Additions
            </h3>
            <div className="space-y-3">
              {messages
                .filter((msg) => msg.type === 'success')
                .slice(0, 3)
                .map((msg) => (
                  <div key={msg.id} className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-700 truncate">
                      {msg.content.replace('✅ Document added successfully! ID: ', '')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{msg.timestamp}</p>
                  </div>
                ))}
              {messages.filter((msg) => msg.type === 'success').length === 0 && (
                <p className="text-gray-500 text-sm">No documents added yet</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="text-blue-700 font-medium">Back to Chat</span>
                <span className="text-blue-500">→</span>
              </button>
              <button
                onClick={() => {
                  // Example template
                  setError('');
                  // You could set a template text here if needed
                }}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-gray-700 font-medium">View Templates</span>
                <span className="text-gray-500">→</span>
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📚 Best Practices
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Keep documents focused on single topics
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Include key information in first sentence
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Use clear, concise language
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Documents are searchable immediately
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Categories and tags improve search
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Document Types */}
      <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Supported Document Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-2">FAQ Items</h4>
            <p className="text-sm text-gray-600">Common questions and answers</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-2">Policies</h4>
            <p className="text-sm text-gray-600">Company policies and procedures</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-2">How-To Guides</h4>
            <p className="text-sm text-gray-600">Step-by-step instructions</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-2">Knowledge</h4>
            <p className="text-sm text-gray-600">General knowledge and information</p>
          </div>
        </div>
      </div>
    </div>
  );
}