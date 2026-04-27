const AUTH_KEY = "nova-auth";
const CHAT_KEY = "nova-chats";

export const authStorage = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
    } catch {
      return null;
    }
  },
  set(value) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(value));
  },
  clear() {
    localStorage.removeItem(AUTH_KEY);
  }
};

const readChatStore = () => {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeChatStore = (value) => {
  localStorage.setItem(CHAT_KEY, JSON.stringify(value));
};

export const transcriptStorage = {
  getUserChats(userId) {
    const store = readChatStore();
    return store[userId] || {};
  },
  getMessages(userId, chatId) {
    const chats = this.getUserChats(userId);
    return chats[chatId] || [];
  },
  setMessages(userId, chatId, messages) {
    const store = readChatStore();
    store[userId] = store[userId] || {};
    store[userId][chatId] = messages;
    writeChatStore(store);
  },
  clearUserChats(userId) {
    const store = readChatStore();
    delete store[userId];
    writeChatStore(store);
  },
  deleteChat(userId, chatId) {
    const store = readChatStore();
    if (store[userId]) {
      delete store[userId][chatId];
      writeChatStore(store);
    }
  }
};
