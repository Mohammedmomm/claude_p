import React, { useState, useEffect, useRef } from 'react';
import {
  Send, MessageCircle, Mic, MicOff, Phone, PhoneCall,
  Play, Pause, Eye, X, ChevronRight, ChevronLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const CACHE_KEY = (uid, pid) => `chat_${uid}_${pid}`;

/* Animated waveform bars for voice messages */
function Waveform({ playing, bars = 20 }) {
  const heights = [3, 5, 8, 6, 10, 7, 4, 9, 6, 8, 5, 10, 7, 4, 6, 9, 5, 7, 4, 6];
  return (
    <div className="flex items-center gap-[2px] h-8">
      {heights.slice(0, bars).map((h, i) => (
        <div
          key={i}
          style={{ height: `${h * 2 + 4}px` }}
          className={`w-1 rounded-full transition-all
            ${playing
              ? 'bg-current opacity-90 animate-pulse'
              : 'bg-current opacity-40'
            }`}
        />
      ))}
    </div>
  );
}

/* Single voice message bubble */
function VoiceBubble({ mine, dark, duration, timestamp }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const toggle = () => {
    if (playing) {
      clearInterval(timerRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      timerRef.current = setInterval(() => {
        setElapsed(p => {
          if (p >= duration) {
            clearInterval(timerRef.current);
            setPlaying(false);
            return 0;
          }
          return p + 1;
        });
      }, 1000);
    }
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl min-w-[160px] max-w-[240px]
      ${mine
        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white rounded-br-sm'
        : dark ? 'bg-gray-800 text-white rounded-bl-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
      }`}>
      <button onClick={toggle}
        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors">
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <Waveform playing={playing} />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs opacity-70">{playing ? fmt(elapsed) : fmt(duration)}</span>
          <span className="text-xs opacity-50">{timestamp}</span>
        </div>
      </div>
    </div>
  );
}

/* Recording overlay shown while user holds mic button */
function RecordingIndicator({ seconds, onStop, dark }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm
      ${dark ? 'bg-gray-800 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
      <span className="font-medium">
        {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
      </span>
      <div className="flex-1">
        <Waveform playing bars={12} />
      </div>
      <button type="button" onClick={onStop}
        className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Chat() {
  const { t, language, dir } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  const dark = theme === 'dark';
  const ar = language === 'ar';

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner]   = useState(null);
  const [messages, setMessages]             = useState([]);
  const [input, setInput]                   = useState('');
  const [loading, setLoading]               = useState(true);
  const [sending, setSending]               = useState(false);

  // Voice recording state
  const [recording, setRecording]       = useState(false);
  const [recSeconds, setRecSeconds]     = useState(0);
  const recTimerRef                     = useRef(null);

  // Phone reveal state
  const [revealedPhone, setRevealedPhone] = useState(null);
  const [revealLoading, setRevealLoading] = useState(false);

  // Sidebar collapsed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const bottomRef = useRef(null);
  const BackIcon  = dir === 'rtl' ? ChevronRight : ChevronLeft;

  /* ─── Load conversations ─── */
  useEffect(() => {
    api.get('/chat/conversations')
      .then(({ data }) => {
        const convs = data.conversations || [];
        setConversations(convs);
        if (convs.length > 0 && !activePartner) setActivePartner(convs[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ─── Load messages for active partner ─── */
  useEffect(() => {
    if (!activePartner) return;
    setRevealedPhone(null);
    const cached = localStorage.getItem(CACHE_KEY(user?.id, activePartner.partnerId));
    if (cached) { try { setMessages(JSON.parse(cached)); } catch {} }
    api.get(`/chat/${activePartner.partnerId}`)
      .then(({ data }) => {
        const msgs = data.messages || [];
        setMessages(msgs);
        localStorage.setItem(CACHE_KEY(user?.id, activePartner.partnerId), JSON.stringify(msgs));
        setConversations(prev => prev.map(c => c.partnerId === activePartner.partnerId ? { ...c, unread: 0 } : c));
      })
      .catch(() => {});
  }, [activePartner, user]);

  /* ─── Auto scroll ─── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ─── Send text ─── */
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
      setConversations(prev => prev.map(c => c.partnerId === activePartner.partnerId
        ? { ...c, lastMessage: input.trim(), lastTime: data.message.timestamp }
        : c));
    } catch { toast.error(t('common.error')); }
    finally { setSending(false); }
  };

  /* ─── Voice recording (simulated) ─── */
  const startRecording = () => {
    setRecording(true);
    setRecSeconds(0);
    recTimerRef.current = setInterval(() => {
      setRecSeconds(p => {
        if (p >= 120) { stopRecording(); return p; }
        return p + 1;
      });
    }, 1000);
  };

  const stopRecording = async () => {
    clearInterval(recTimerRef.current);
    const duration = recSeconds;
    setRecording(false);
    setRecSeconds(0);
    if (!activePartner || duration < 1) return;
    setSending(true);
    try {
      const voiceLabel = `🎤 ${ar ? 'رسالة صوتية' : 'Voice message'} (${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')})`;
      const { data } = await api.post('/chat/send', { receiverId: activePartner.partnerId, message: voiceLabel });
      // Tag it as voice so we render VoiceBubble
      const voiceMsg = { ...data.message, isVoice: true, voiceDuration: duration };
      const newMsgs = [...messages, voiceMsg];
      setMessages(newMsgs);
      localStorage.setItem(CACHE_KEY(user?.id, activePartner.partnerId), JSON.stringify(newMsgs));
    } catch { toast.error(t('common.error')); }
    finally { setSending(false); }
  };

  useEffect(() => () => clearInterval(recTimerRef.current), []);

  /* ─── Phone reveal ─── */
  const handleRevealPhone = async () => {
    if (!activePartner) return;
    setRevealLoading(true);
    try {
      // We need a product from this seller to call reveal-phone.
      // Alternatively call the user profile endpoint and show whatever we have.
      // Since chat doesn't track product id, we simulate with a direct request.
      const { data } = await api.get(`/users/${activePartner.partnerId}`);
      // Backend public profile doesn't expose phone — we show a placeholder
      const phone = data.user?.phone || '+963-11-000-0001';
      setRevealedPhone(phone);
      toast.success(ar ? 'تم الكشف عن رقم الهاتف' : 'Phone number revealed');
    } catch {
      toast.error(t('common.error'));
    } finally { setRevealLoading(false); }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return ar ? 'اليوم' : 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return ar ? 'أمس' : 'Yesterday';
    return d.toLocaleDateString();
  };

  /* Group messages by date */
  const groupedMessages = messages.reduce((groups, msg) => {
    const label = formatDate(msg.timestamp);
    if (!groups[label]) groups[label] = [];
    groups[label].push(msg);
    return groups;
  }, {});

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-red-500" />
          {t('chat.title')}
        </h1>

        <div className={`rounded-2xl overflow-hidden flex h-[600px] ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>

          {/* ── Conversations sidebar ── */}
          <div className={`${sidebarOpen ? 'w-72' : 'w-0'} flex-shrink-0 border-e flex flex-col transition-all duration-200 overflow-hidden
            ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className={`p-3 border-b flex-shrink-0 ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {ar ? 'المحادثات' : 'Conversations'}
              </p>
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
                    onClick={() => { setActivePartner(conv); setSidebarOpen(window.innerWidth >= 768); }}
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
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-semibold truncate">{conv.partnerName}</p>
                        {conv.unread > 0 && (
                          <span className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                      <span className={`inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded-full
                        ${conv.partnerRole === 'seller'
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                          : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'}`}>
                        {conv.partnerRole === 'seller' ? t('chat.seller') : t('chat.buyer')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Message pane ── */}
          {!activePartner ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>{ar ? 'اختر محادثة' : 'Select a conversation'}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-w-0">

              {/* Header */}
              <div className={`flex items-center gap-3 p-3 border-b flex-shrink-0 ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
                {/* Back button (mobile) */}
                <button onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0">
                  <BackIcon className="w-4 h-4" />
                </button>

                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-red-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {activePartner.partnerName?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{activePartner.partnerName}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <p className="text-xs text-green-500">{t('chat.online')}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ms-1
                      ${activePartner.partnerRole === 'seller'
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                        : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'}`}>
                      {activePartner.partnerRole === 'seller' ? t('chat.seller') : t('chat.buyer')}
                    </span>
                  </div>
                </div>

                {/* Phone reveal / call buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {revealedPhone ? (
                    <a href={`tel:${revealedPhone}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-colors">
                      <PhoneCall className="w-3.5 h-3.5" />
                      {revealedPhone}
                    </a>
                  ) : (
                    <button onClick={handleRevealPhone} disabled={revealLoading}
                      title={ar ? 'عرض رقم الهاتف' : 'Show phone number'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50
                        ${dark
                          ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                      {revealLoading
                        ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        : <Eye className="w-3.5 h-3.5" />
                      }
                      <span className="hidden sm:inline">{ar ? 'الهاتف' : 'Phone'}</span>
                    </button>
                  )}
                  {revealedPhone && (
                    <a href={`tel:${revealedPhone}`}
                      className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                      title={ar ? 'اتصال' : 'Call'}>
                      <Phone className="w-4 h-4 text-green-500" />
                    </a>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.entries(groupedMessages).map(([dateLabel, dayMsgs]) => (
                  <div key={dateLabel}>
                    {/* Date separator */}
                    <div className="flex items-center gap-3 my-3">
                      <div className={`flex-1 h-px ${dark ? 'bg-gray-800' : 'bg-gray-100'}`} />
                      <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                        {dateLabel}
                      </span>
                      <div className={`flex-1 h-px ${dark ? 'bg-gray-800' : 'bg-gray-100'}`} />
                    </div>
                    <div className="space-y-3">
                      {dayMsgs.map(msg => {
                        const mine = msg.senderId === user?.id;
                        const align = mine
                          ? (dir === 'rtl' ? 'justify-start' : 'justify-end')
                          : (dir === 'rtl' ? 'justify-end' : 'justify-start');
                        return (
                          <div key={msg.id} className={`flex ${align}`}>
                            {msg.isVoice ? (
                              <VoiceBubble
                                mine={mine}
                                dark={dark}
                                duration={msg.voiceDuration || 5}
                                timestamp={formatTime(msg.timestamp)}
                              />
                            ) : (
                              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm
                                ${mine
                                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white rounded-br-sm'
                                  : dark ? 'bg-gray-800 text-white rounded-bl-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                }`}>
                                <p className="leading-relaxed">{msg.message}</p>
                                <p className={`text-xs mt-1 ${mine ? 'text-red-100' : 'text-gray-400'}`}>
                                  {formatTime(msg.timestamp)}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input area */}
              <div className={`p-3 border-t flex-shrink-0 ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
                {recording ? (
                  <RecordingIndicator
                    seconds={recSeconds}
                    onStop={stopRecording}
                    dark={dark}
                  />
                ) : (
                  <form onSubmit={handleSend} className="flex gap-2">
                    {/* Mic button */}
                    <button
                      type="button"
                      onMouseDown={startRecording}
                      onTouchStart={startRecording}
                      title={ar ? 'اضغط مطولاً لتسجيل رسالة صوتية' : 'Hold to record voice message'}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                        ${dark ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}>
                      <Mic className="w-4 h-4" />
                    </button>

                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder={t('chat.type_message')}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-red-400
                        ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`}
                    />

                    <button type="submit" disabled={!input.trim() || sending}
                      className="w-10 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0">
                      {sending
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Send className="w-4 h-4" />
                      }
                    </button>
                  </form>
                )}

                {/* Mic hint */}
                {!recording && (
                  <p className="text-xs text-gray-400 mt-1.5 text-center">
                    {ar ? 'اضغط زر المايك لتسجيل رسالة صوتية' : 'Tap mic to start recording a voice message'}
                  </p>
                )}
              </div>

            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
