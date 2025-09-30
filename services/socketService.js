import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found for socket connection');
        return;
      }

      this.socket = io(config.socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupEventListeners();
      
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    // User status events
    this.socket.on('user_status_change', (data) => {
      this.emit('userStatusChange', data);
    });

    this.socket.on('online_users_list', (users) => {
      this.emit('onlineUsersList', users);
    });

    // Message events
    this.socket.on('receive_message', (data) => {
      this.emit('receiveMessage', data);
    });

    this.socket.on('message_sent', (data) => {
      this.emit('messageSent', data);
    });

    this.socket.on('new_message', (data) => {
      this.emit('newMessage', data);
    });

    this.socket.on('message_read', (data) => {
      this.emit('messageRead', data);
    });

    this.socket.on('message_deleted', (data) => {
      this.emit('messageDeleted', data);
    });

    // Typing events
    this.socket.on('user_typing', (data) => {
      this.emit('userTyping', data);
    });

    // Conversation events
    this.socket.on('conversation_joined', (data) => {
      this.emit('conversationJoined', data);
    });

    this.socket.on('conversation_left', (data) => {
      this.emit('conversationLeft', data);
    });

    this.socket.on('conversation_read', (data) => {
      this.emit('conversationRead', data);
    });

    // Error events
    this.socket.on('message_error', (error) => {
      this.emit('messageError', error);
    });

    this.socket.on('conversation_error', (error) => {
      this.emit('conversationError', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket event callback:', error);
        }
      });
    }
  }

  // Socket actions
  getOnlineUsers(filter = {}) {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_online_users', filter);
    }
  }

  subscribeToUserStatus(userIds) {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_to_user_status', userIds);
    }
  }

  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  sendTextMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_text_message', messageData);
    }
  }

  sendImageMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_image_message', messageData);
    }
  }

  sendFileMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_file_message', messageData);
    }
  }

  startTyping(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', data);
    }
  }

  stopTyping(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', data);
    }
  }

  markAsRead(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_as_read', data);
    }
  }

  markConversationAsRead(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_conversation_as_read', data);
    }
  }

  deleteMessage(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('delete_message', data);
    }
  }

  updateUserStatus(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('update_user_status', data);
    }
  }

  ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping');
    }
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;
