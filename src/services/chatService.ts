import { getDatabase, ref, push, set, onValue, off, update } from 'firebase/database';
import { getApp, getApps } from 'firebase/app';
import { Message, ChatChannel } from '../types';

// Dynamically import the initialization module context safely
import * as clientModule from '../firebaseClient';

const getClientDatabase = () => {
  // 1. Attempt to resolve the app reference context using common project naming variations
  let resolvedApp = 
    (clientModule as any).app || 
    (clientModule as any).firebaseApp || 
    (clientModule as any).default?.app || 
    (clientModule as any).default?.firebaseApp ||
    (clientModule as any).default;

  // 2. Fallback: If the module exports don't provide it, fetch it directly from the active Firebase runtime apps array
  if (!resolvedApp || typeof resolvedApp.initializeInstance === 'function') {
    if (getApps().length > 0) {
      resolvedApp = getApp();
    }
  }

  // 3. Initialize and pass the resolved app context configuration downstream
  if (resolvedApp) {
    return getDatabase(resolvedApp);
  }

  // 4. Emergency catch-all: Try initializing a zero-argument database context if apps already live in-memory
  return getDatabase();
};

export const chatService = {
  /**
   * Initializes or fetches a persistent conversation window node channel between a buyer and lister
   */
  async createOrGetChannel(channelData: ChatChannel): Promise<string> {
    const dbInstance = getClientDatabase();
    const channelId = channelData.inquiryId; 
    const channelRef = ref(dbInstance, `chats/${channelId}/metadata`);
    
    await set(channelRef, channelData);
    return channelId;
  },

  /**
   * Pushes a new raw communication message payload into a specific active chat lane tree
   */
  async sendMessage(channelId: string, msg: Omit<Message, 'timestamp'>): Promise<void> {
    const dbInstance = getClientDatabase();
    const nowStr = new Date().toISOString();
    const messagesRef = ref(dbInstance, `chats/${channelId}/messages`);
    const newMsgRef = push(messagesRef);
    
    const absoluteMessage: Message = {
      ...msg,
      timestamp: nowStr
    };

    await set(newMsgRef, absoluteMessage);
    
    const metadataRef = ref(dbInstance, `chats/${channelId}/metadata`);
    await update(metadataRef, {
      lastMessageText: msg.text,
      lastMessageTimestamp: nowStr
    });
  },

  /**
   * Attaches a hot asynchronous streaming listener tracking newly posted lines of text live
   */
  subscribeToMessages(channelId: string, callback: (messages: Message[]) => void): () => void {
    const dbInstance = getClientDatabase();
    const messagesRef = ref(dbInstance, `chats/${channelId}/messages`);
    
    const listener = onValue(messagesRef, (snapshot) => {
      const output: Message[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          output.push({
            id: child.key || '',
            ...child.val()
          });
        });
      }
      callback(output);
    });

    return () => off(messagesRef, 'value', listener);
  },

  /**
   * Pulls all operational active chat lanes matching an explicit actor parameter structure
   */
  subscribeToChannels(userId: string, role: 'user' | 'realtor', callback: (channels: ChatChannel[]) => void): () => void {
    const dbInstance = getClientDatabase();
    const chatsRef = ref(dbInstance, 'chats');
    
    const listener = onValue(chatsRef, (snapshot) => {
      const output: ChatChannel[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childNode) => {
          const metadata = childNode.child('metadata').val() as ChatChannel;
          if (metadata) {
            if (role === 'user' && metadata.buyerId === userId) {
              output.push({ ...metadata, id: childNode.key || '' });
            } else if (role === 'realtor' && metadata.realtorId === userId) {
              output.push({ ...metadata, id: childNode.key || '' });
            }
          }
        });
      }
      output.sort((a, b) => String(b.lastMessageTimestamp || '').localeCompare(String(a.lastMessageTimestamp || '')));
      callback(output);
    });

    return () => off(chatsRef, 'value', listener);
  }
};