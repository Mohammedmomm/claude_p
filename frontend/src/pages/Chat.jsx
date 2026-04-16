import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const CACHE_KEY = (uid, pid) => `chat_${uid}_${pid}`;

export default function Chat() {
  const { t, language, dir } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  const dark = theme === 'dark';

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState('');
  const [loading, setLoading]             = useState(true);
  const [sending, setSending]             = useState(false);
  const bottomRef = useRef(null);

  // Load conversations
  useEffect(() => {
    api.get('/chat/conversations')
      .then(({ data }) => {
        const convs = data.conversations || [];
        setConversations(convs);
        // Auto-select first conversation
        if (convs.length > 0 && !activePartner) {
          setActivePartner(convs[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load messages when partner changes
  useEffect(() => {
    if (!activePartner) return;
    // Try cache first
    const cached = localStorage.getItem(CACHE_KEY(user?.id, activePartner.partnerId));
    if (cached) { try { setMessages(JSON.parse(cached)); } catch {} }

    api.get(`/chat/${activePartner.partnerId}`)
      .then(({ data }) => {
        const msgs = data.messages || [];
        setMessages(msgs);
        localStorage.setItem(CACHE_KEY(user?.id, activePartner.partnerId), JSON.stringify(msgs));
        // Update unread to 0
        setConversations(prev => prev.map(c => c.partnerId === activePartner.partnerId ? { ...c, unread: 0 } : c));
      })
      .catch(() => {});
  }, [activePartner, user]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activePartner) return;
    setSending(true);
    try {
      const { data } = await api.post('/chat/send', { receiverId: activePartner.partnerId, message: input.trim() });
      const newMsgs = [...messages, data.message];
      setMessages(newMsgs);
      localStorage.setItem(CACHE_KEY(user?.id, activePartner.partnerId), JSON.stringify(newMsgs));
      setInput('');
      // Update last message in conversations
      setConversations(prev => prev.map(c => c.partnerId === activePartner.partnerId
        ? { ...c, lastMessage: input.trim(), lastTime: data.message.timestamp }
        : c));
    } catch { toast.error(t('common.error')); }
    finally { setSending(false); }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-red-500" />
          {t('chat.title')}
        </h1>

        <div className={`rounded-2xl overflow-hidden flex h-[500px] ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>

          {/* Conversations list */}
          <div className={`w-64 flex-shrink-0 border-e flex flex-col ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className={`p-3 border-b ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{language === 'ar' ? 'المحادثات' : 'Conversations'}</p>
            </div>
            {loading ? (
              <div className="flex-1 flex items-center justify-center"><LoadingSpinner size="sm" /></div>
            ) : conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-4 text-center">
                <p className="text-xs text-gray-400">{t('chat.no_conversations')}</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => (
                  <button key={conv.partnerId}
                    onClick={() => setActivePartner(conv)}
                    className={`w-full flex items-center gap-3 p-3 text-start transition-colors
                      ${activePartner?.partnerId === conv.partnerId
                        ? 'bg-red-50 dark:bg-red-900/20 border-e-2 border-red-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-red-400 flex items-center justify-center text-white font-bold text-sm">
                        {conv.partnerName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold truncate">{conv.partnerName}</p>
                        {conv.unread > 0 && (
                          <span className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${conv.partnerRole === 'seller' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'}`}>
                        {conv.partnerRole === 'seller' ? t('chat.seller') : t('chat.buyer')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          {!activePartner ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>{language === 'ar' ? 'اختر محادثة' : 'Select a conversation'}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className={`flex items-center gap-3 p-4 border-b ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-red-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {activePartner.partnerName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{activePartner.partnerName}</p>
                  <p className="text-xs text-green-500">{t('chat.online')}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => {
                  const mine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${mine ? (dir === 'rtl' ? 'justify-start' : 'justify-end') : (dir === 'rtl' ? 'justify-end' : 'justify-start')}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${mine
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white rounded-br-sm'
                        : dark ? 'bg-gray-800 text-white rounded-bl-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                        <p>{msg.message}</p>
                        <p className={`text-xs mt-1 ${mine ? 'text-red-100' : 'text-gray-400'}`}>{formatTime(msg.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className={`flex gap-2 p-3 border-t ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={t('chat.type_message')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-red-400
                    ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`}
                />
                <button type="submit" disabled={!input.trim() || sending}
                  className="w-10 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
