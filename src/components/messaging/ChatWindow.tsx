import React, { useEffect, useState, useRef } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { Message } from '../../types';

interface ChatWindowProps {
  channelId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'user' | 'realtor';
  title: string;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  channelId,
  currentUserId,
  currentUserName,
  currentUserRole,
  title,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = chatService.subscribeToMessages(channelId, (incoming: Message[]) => {
      setMessages(incoming);
    });

    return () => unsubscribe();
  }, [channelId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await chatService.sendMessage(channelId, {
        senderId: currentUserId,
        senderName: currentUserName,
        senderRole: currentUserRole,
        text: text.trim()
      });
      setText('');
    } catch (err) {
      console.error('Failed to dispatch message:', err);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md bg-cream-50 rounded-2xl shadow-2xl border border-walnut-100 overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-teak-600 to-walnut-700 px-4 py-3 text-cream-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-cream-200" />
          <div>
            <h4 className="font-semibold text-sm line-clamp-1">{title}</h4>
            <span className="text-[10px] text-cream-200 uppercase tracking-wider font-medium">Live Connection</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-cream-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream-100/20">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-walnut-400 pt-12 italic">Secure channel active. Type a message below to start communicating live.</p>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-walnut-400 mb-0.5 px-1 font-medium">
                  {isMe ? 'You' : msg.senderName}
                </span>
                <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm shadow-sm font-sans leading-relaxed ${
                  isMe 
                    ? 'bg-teak-600 text-cream-50 rounded-tr-none' 
                    : 'bg-white border border-walnut-100 text-walnut-800 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                <span className="text-[9px] text-walnut-300 mt-0.5 px-1">
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Field Form */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-walnut-100 flex gap-2 items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 px-4 py-2.5 bg-cream-50 border border-walnut-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 placeholder-walnut-400"
        />
        <button
          type="submit"
          className="p-2.5 bg-teak-600 hover:bg-teak-700 text-cream-50 rounded-xl transition-all shadow-sm flex items-center justify-center flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};