
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import AutoReplyPage from './AutoReplyPage';
import FacebookAuthPage from './FacebookAuthPage';
import AgentEditorPage from './AgentEditorPage';
import InstagramLogin from './InstagramAuthPage';

const notificationSound = new Audio("https://notificationsounds.com/storage/sounds/file-sounds-1156-pristine.mp3");

const clientId = import.meta.env.VITE_CLIENT_ID;
const PROD_API = import.meta.env.VITE_API_BASE;
const LOCAL_API = 'http://127.0.0.1:5000';
const USE_LOCAL = window.location.hostname === 'localhost';
const API_BASE = USE_LOCAL ? LOCAL_API : PROD_API;
const SABRES_API = 'https://api.sabresai.com';
const pageName = import.meta.env.VITE_PAGE_NAME;

const LanguageContext = React.createContext();

const translations = {
  he: {
    chatManagement: 'ניהול שיחות',
    sendMessages: 'שליחת הודעות',
    agentEditor: 'עריכת הסוכן החכם',
    searchChat: 'חפש שיחה...',
    refreshAgentStatus: 'רענון סטטוס סוכן',
    chatWindow: 'חלון שיחה',
    typeMessage: 'הקלד הודעה...',
    send: 'שלח',
    selectChatToView: 'בחר שיחה כדי לראות הודעות',
    loading: 'טוען...',
    login: 'התחברות',
    username: 'שם משתמש',
    password: 'סיסמה',
    loginError: 'שם משתמש או סיסמה שגויים',
    agentActive: 'סוכן פעיל',
    agentOff: 'סוכן כבוי',
    new: 'חדש',
    me: 'אני',
    phoneNumber: 'מספר טלפון',
    messageContent: 'תוכן ההודעה',
    messageSent: 'ההודעה נשלחה בהצלחה!',
    sendFailed: 'שליחה נכשלה',
    contentCreation: 'יצירת תוכן',
    contentCalendar: 'ניהול יומן תוכן'
  },
  en: {
    chatManagement: 'Chat Management',
    sendMessages: 'Send Messages',
    agentEditor: 'Smart Agent Editor',
    searchChat: 'Search chat...',
    refreshAgentStatus: 'Refresh Agent Status',
    chatWindow: 'Chat Window',
    typeMessage: 'Type a message...',
    send: 'Send',
    selectChatToView: 'Select a chat to view messages',
    loading: 'Loading...',
    login: 'Login',
    username: 'Username',
    password: 'Password',
    loginError: 'Incorrect username or password',
    agentActive: 'Agent Active',
    agentOff: 'Agent Off',
    new: 'New',
    me: 'Me',
    phoneNumber: 'Phone Number',
    messageContent: 'Message Content',
    messageSent: 'Message sent successfully!',
    sendFailed: 'Send failed',
    contentCreation: 'Content Creation',
    contentCalendar: 'Content Calendar Management'
  }
};

const ChatsPage = () => {
  const { language, t, dir } = React.useContext(LanguageContext);
  const [chats, setChats] = useState([]);
  const [readChats, setReadChats] = useState(new Set());
  const [unreadMessages, setUnreadMessages] = useState(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('readChats');
    if (stored) {
      try {
        setReadChats(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error("Failed to parse readChats from localStorage", e);
      }
    }
  }, []);

  const handleChatClick = (chat) => {
    setReadChats(prev => {
      const newSet = new Set(prev);
      newSet.add(chat.id);
      localStorage.setItem('readChats', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  return (
    <div dir={dir}>
      {chats.map(chat => {
        const isUnread = unreadMessages.has(chat.id) || !readChats.has(chat.id);
        return (
          <div key={chat.id} onClick={() => handleChatClick(chat)}>
            {chat.username} {isUnread && <span>{t('new')}</span>}
          </div>
        );
      })}
    </div>
  );
};

const App = () => {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'he');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => translations[language][key] || key;
  const dir = language === 'he' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      <Router>
        <Routes>
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/facebook-auth" element={<FacebookAuthPage />} />
          <Route path="/Instagram-auth" element={<InstagramLogin />} />
          <Route path="/auto-reply" element={<AgentEditorPage />} />
          <Route path="*" element={<ChatsPage />} />
        </Routes>
      </Router>
    </LanguageContext.Provider>
  );
};

export default App;
