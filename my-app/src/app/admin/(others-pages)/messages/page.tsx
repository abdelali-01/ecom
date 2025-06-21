'use client'
import React, { useEffect, useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import axios from 'axios';

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  seen: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await axios.get(process.env.NEXT_PUBLIC_SERVER+'/api/messages', { withCredentials: true });
        setMessages(res.data.messages || []);
      } catch {
        setMessages([]);
      }
      setLoading(false);
    };
    fetchMessages();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle='Messages page' />
      <ComponentCard title='Messages List'>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No messages found.</div>
        ) : (
          <div className="space-y-6">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`rounded-xl border p-6 shadow-sm bg-white dark:bg-gray-900 ${msg.seen ? 'opacity-80' : 'border-black border-2'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">{msg.name}</span>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      {msg.email}
                    </a>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 md:mt-0">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-gray-800 dark:text-gray-200 text-base whitespace-pre-line mb-2">
                  {msg.message}
                </div>
                {msg.seen ? (
                  <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-700">Seen</span>
                ) : (
                  <span className="inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">New</span>
                )}
              </div>
            ))}
          </div>
        )}
      </ComponentCard>
    </div>
  );
}
