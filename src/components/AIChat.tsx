'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { Bot, X, MessageCircle, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  // @ts-ignore
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const hour = new Date().getHours();
      let greeting = 'Good evening!';
      if (hour < 12) greeting = 'Good morning!';
      else if (hour < 18) greeting = 'Good afternoon!';

      setMessages([
        {
          id: 'initial-greeting',
          role: 'assistant',
          content: `${greeting} How can I help you discover Creative Cascade products today?`,
        },
      ]);
    }
  }, [isOpen, messages.length, setMessages]);

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-zinc-900 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6" />
              <span className="font-semibold">Creative Assistant</span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setMessages([]);
              }}
              className="hover:bg-zinc-800 p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((m: any) => (
              <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                {m.content && (
                  <div className={`max-w-[85%] rounded-2xl p-3 ${m.role === 'user'
                    ? 'bg-zinc-900 text-white rounded-br-none shadow-sm'
                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                    }`}>
                    {/* Render Markdown for AI responses */}
                    <div className={`prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:p-0 ${m.role === 'user' ? 'text-white' : ''}`}>
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Handle Tool Invocations (Product Searches) */}
                {m.toolInvocations?.map((toolInvocation: any) => {
                  const { toolName, toolCallId, state, args } = toolInvocation;

                  if (toolName === 'searchProducts') {
                    if (state === 'result') {
                      const { items } = toolInvocation.result as any;

                      if (items.length === 0) {
                        const searchTerms = [args.query, args.category, args.maxPrice ? `under $${args.maxPrice}` : null].filter(Boolean).join(', ');
                        return (
                          <div key={toolCallId} className="mt-2 text-sm text-gray-500 italic bg-white p-2 rounded-lg border">
                            No products found for {searchTerms ? `"${searchTerms}"` : 'your search'}.
                          </div>
                        );
                      }

                      return (
                        <div key={toolCallId} className="w-full mt-2 space-y-2">
                          <p className="text-xs text-gray-500 font-medium ml-1">Here is what I found:</p>
                          <div className="flex overflow-x-auto pb-4 gap-3 snap-x hide-scrollbar">
                            {items.map((item: any) => (
                              <Link
                                href={`/product/${item.id}`}
                                key={item.id}
                                className="snap-start flex-none w-[200px] bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all group"
                                onClick={() => setIsOpen(false)}
                              >
                                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                                  {item.imageUrl ? (
                                    <Image
                                      fill
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      No Image
                                    </div>
                                  )}
                                </div>
                                <div className="p-3">
                                  <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                                  <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                                  <p className="text-sm font-semibold text-zinc-900 mt-1">{formatPrice(item.price)}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    } else {
                      const searchTerms = [args.query, args.category, args.maxPrice ? `under $${args.maxPrice}` : 'products'].filter(Boolean).join(', ');
                      return (
                        <div key={toolCallId} className="flex items-center space-x-2 text-sm text-zinc-900 bg-zinc-100 py-2 px-3 rounded-lg animate-pulse w-fit mt-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Searching for &quot;{searchTerms}&quot;...</span>
                        </div>
                      );
                    }
                  } else if (toolName === 'getMarketplaceStats') {
                    if (state === 'result') {
                      const { totalProducts, categories, error } = toolInvocation.result as any;

                      if (error) {
                        return (
                          <div key={toolCallId} className="mt-2 text-sm text-gray-500 italic bg-white p-2 rounded-lg border">
                            {error}
                          </div>
                        );
                      }

                      return (
                        <div key={toolCallId} className="mt-2 w-full">
                          <div className="bg-zinc-900 border border-zinc-700 text-white rounded-xl p-4 shadow-sm">
                            <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                              <Bot className="w-5 h-5 text-zinc-400" />
                              Marketplace Overview
                            </h4>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="bg-zinc-800 p-3 rounded-lg flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-white mb-1">{totalProducts}+</span>
                                <span className="text-xs text-zinc-400 uppercase tracking-wider">Total Assets</span>
                              </div>
                              <div className="bg-zinc-800 p-3 rounded-lg flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-white mb-1">{categories.length}</span>
                                <span className="text-xs text-zinc-400 uppercase tracking-wider">Categories</span>
                              </div>
                            </div>
                            <div className="text-sm text-zinc-300">
                              <span className="font-medium text-white">Available categories: </span>
                              {categories.join(', ')}.
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={toolCallId} className="flex items-center space-x-2 text-sm text-zinc-900 bg-zinc-100 py-2 px-3 rounded-lg animate-pulse w-fit mt-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Calculating library size...</span>
                        </div>
                      );
                    }
                  } else if (toolName === 'getUserProfile') {
                    if (state === 'result') {
                      const { user, recentOrders, error } = toolInvocation.result as any;

                      if (error) {
                        return (
                          <div key={toolCallId} className="mt-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                            {error}
                          </div>
                        );
                      }

                      return (
                        <div key={toolCallId} className="mt-2 w-full space-y-3">
                          <div className="bg-white border text-sm text-gray-800 border-gray-200 rounded-xl p-4 shadow-sm">
                            <h4 className="font-semibold text-base mb-1">Welcome back, {user.name}!</h4>
                            <p className="text-gray-500 mb-4">{user.email}</p>

                            <h5 className="font-medium text-gray-900 mb-2 border-b pb-1">Recent Orders</h5>
                            {recentOrders.length === 0 ? (
                              <p className="text-gray-500 italic">No orders found.</p>
                            ) : (
                              <div className="space-y-3">
                                {recentOrders.map((order: any) => (
                                  <div key={order.orderId} className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-xs text-gray-500 mb-1">
                                        {new Date(order.date).toLocaleDateString()}
                                      </p>
                                      <ul className="list-disc list-inside space-y-0.5">
                                        {order.items?.map((item: string, i: number) => (
                                          <li key={i} className="text-zinc-900 text-sm">{item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold">{formatPrice(order.amount)}</p>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {order.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={toolCallId} className="flex items-center space-x-2 text-sm text-zinc-900 bg-zinc-100 py-2 px-3 rounded-lg animate-pulse w-fit mt-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Fetching your details...</span>
                        </div>
                      );
                    }
                  }
                  return null;
                })}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-start">
                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none shadow-sm border border-gray-200 p-4 flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200">
            <div className="relative flex items-center">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask something or search products..."
                className="w-full pr-12 pl-4 py-3 bg-zinc-50 border border-zinc-200 rounded-full focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !input?.trim()}
                className="absolute right-1.5 p-2 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-zinc-900 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-zinc-900 hover:bg-zinc-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center animate-in zoom-in"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
