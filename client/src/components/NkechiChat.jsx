import { API_URL } from '../lib/api';
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function NkechiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am Nkechi, the INGEC Intelligence Assistant. I can help you find verified information about ongoing projects. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/agents/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        hasAbandoned: data.has_abandoned
      }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting to the intelligence database right now. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (content) => {
    // Simple formatter for flags in text
    let formatted = content;
    if (formatted.includes('[ABANDONMENT ALERT]')) {
      return (
        <div>
          {formatted.split('[ABANDONMENT ALERT]').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold mx-1">
                  <AlertTriangle size={12} /> ABANDONMENT ALERT
                </span>
              )}
            </span>
          ))}
        </div>
      );
    }
    if (formatted.includes('[PROTECTED - Cannot be cancelled]')) {
         return (
        <div>
          {formatted.split('[PROTECTED - Cannot be cancelled]').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold mx-1">
                  <ShieldCheck size={12} /> PROTECTED - Cannot be cancelled
                </span>
              )}
            </span>
          ))}
        </div>
      );
    }
    return content;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105 flex items-center justify-center z-50"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50" style={{ height: '500px', maxHeight: '80vh' }}>
      <div className="bg-green-600 p-4 text-white flex justify-between items-center">
        <div>
          <h3 className="font-bold flex items-center gap-2">
            <MessageSquare size={18} /> Nkechi AI
          </h3>
          <p className="text-xs text-green-100">INGEC Intelligence Assistant</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-green-100 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
              msg.role === 'user'
                ? 'bg-green-600 text-white rounded-tr-sm'
                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
            }`}>
              <div className="text-sm whitespace-pre-wrap">{renderContent(msg.content)}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a project..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
