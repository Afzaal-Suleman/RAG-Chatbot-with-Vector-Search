"use client";

import { useState, useCallback } from 'react';
import axios from 'axios';
import ChatInterface from '@/components/ChatInterface';
import ChatHistory from '@/components/ChatHistory';
import { Message, ChatResponse } from '@/components/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ChatPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [currentResult, setCurrentResult] = useState<ChatResponse | undefined>();
  const [error, setError] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'success',
      content: 'Welcome! Ask me anything based on the documents in the knowledge base.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const generateId = useCallback((): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }, []);
const handleAskQuestion = useCallback(async (question: string): Promise<void> => {
  setLoading(true);
  setError('');
  
  try {
    // Update the type to match what backend actually returns
    const response = await axios.post<{
      success: boolean;
      answer?: string;
      confidence?: "high" | "medium" | "low" | "none";
      sources?: Array<{
        id: number;
        text: string;
        score: string;
        timestamp?: string;
      }>;
      stats?: {
        documentsSearched: number;
        bestMatchScore: string;
        contextLength: number;
      };
      error?: string;
    }>(`${API_BASE_URL}/api/chat`, { question });
    
    console.log("Backend response:", response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get answer');
    }

    // Extract data directly from response.data (not response.data.data)
    const result:any = {
      answer: response.data.answer || '',
      confidence: response.data.confidence || 'medium',
      sources: response.data.sources || [],
      stats: response.data.stats || {
        documentsSearched: 0,
        bestMatchScore: '0',
        contextLength: 0
      }
    };
    
    setCurrentAnswer(result.answer);
    setCurrentResult(result);

    // Add to chat history
    const questionMessage: Message = {
      id: generateId(),
      type: 'question',
      content: question,
      timestamp: new Date().toLocaleTimeString(),
    };

    const answerMessage: Message = {
      id: generateId(),
      type: 'answer',
      content: result.answer,
      confidence: result.confidence,
      timestamp: new Date().toLocaleTimeString(),
      sources: result.sources,
    };

    setMessages((prev) => [answerMessage, questionMessage, ...prev.slice(0, 8)]);
    
  } catch (err: any) {
    console.error('Error asking question:', err);
    const errorMsg = err.response?.data?.error || err.message || 'Failed to get answer';
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          💬 Chat with Knowledge Base
        </h1>
        <p className="text-gray-600">
          Ask questions and get answers based on semantic search across all documents
        </p>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface - Takes 2/3 on large screens */}
        <div className="lg:col-span-2 space-y-6">
          <ChatInterface
            onAskQuestion={handleAskQuestion}
            loading={loading}
            currentAnswer={currentAnswer}
            currentResult={currentResult}
          />
          
          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Knowledge Base Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-gray-600">Documents</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">153</div>
                <div className="text-sm text-gray-600">Conversations</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">97%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">2.1s</div>
                <div className="text-sm text-gray-600">Avg Response</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat History - Takes 1/3 on large screens */}
        <div className="lg:col-span-1">
          <ChatHistory messages={messages} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-2">Example Questions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• How do I reset my password?</li>
              <li>• What is the refund policy?</li>
              <li>• How to contact support?</li>
            </ul>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-2">Features</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Semantic search across documents</li>
              <li>• Confidence scoring</li>
              <li>• Source attribution</li>
            </ul>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
            <p className="text-sm text-gray-600 mb-3">
              Visit our documentation or add more documents for better results.
            </p>
            <a
              href="/add"
              className="inline-block bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Documents
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}