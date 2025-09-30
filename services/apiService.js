import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: config.baseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('API Error:', error.message);
    console.error('API Error Config:', error.config);
    console.error('API Error Response:', error.response?.data);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user_id');
      // Navigate to login screen if needed
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // Send OTP
  sendOtp: async (phone_number, type = 'registration') => {
    const response = await apiClient.post('/driver/send/otp', {
      phone_number,
      type
    });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (phone_number, otp) => {
    const response = await apiClient.post('/driver/verify/otp', {
      phone_number,
      otp
    });
    return response; // Return full response object, not just response.data
  },

  // Register driver
  register: async (phone_number, password, email = null) => {
    console.log('API Service - Registering:', phone_number);
    const payload = {
      phone_number,
      password
    };
    
    if (email) {
      payload.email = email;
    }
    
    const response = await apiClient.post('/driver/register', payload);
    console.log('API Service - Register response:', response.data);
    return response.data;
  },

  // Login driver
  login: async (identifier, password) => {
    // identifier can be either phone_number or email
    const payload = {
      password
    };
    
    if (identifier.includes('@')) {
      payload.email = identifier;
    } else {
      payload.phone_number = identifier;
    }
    
    const response = await apiClient.post('/driver/login', payload);
    return response.data;
  },

  // Reset password
  resetPassword: async (phone_number, otp, newPassword) => {
    const response = await apiClient.post('/driver/change/password', {
      phone_number,
      otp,
      newPassword
    });
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      const response = await apiClient.post('/account/logout');
      
      // Clear all user data from AsyncStorage after successful logout
      await AsyncStorage.multiRemove([
        'authToken',
        'user_id', 
        'userProfile',
        'language',
        'phone_number',
        'verified_phone',
        'signup_flow',
        'login_flow'
      ]);
      
      console.log('✅ User logged out and data cleared');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local data
      await AsyncStorage.multiRemove([
        'authToken',
        'user_id', 
        'userProfile',
        'language',
        'phone_number',
        'verified_phone',
        'signup_flow',
        'login_flow'
      ]);
      throw error;
    }
  },
};

// Driver profile API calls
export const driverAPI = {
  // Get driver info
  getInfo: async (userId) => {
    const response = await apiClient.get(`/driver/info/${userId}`);
    return response.data;
  },

  // Setup initial profile (no auth required - for new signups)
  setupProfile: async (userId, data) => {
    console.log('🔧 Using setup endpoint for initial profile setup');
    const response = await axios.put(`${config.baseUrl}/driver/setup/${userId}`, data, {
      headers: {
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  },

  // Update driver profile (auth required - for existing users)
  updateProfile: async (userId, formData) => {
    console.log('🔐 Using authenticated update endpoint');
    const response = await apiClient.put(`/driver/update/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Smart profile update - chooses setup or update based on auth status
  smartUpdateProfile: async (userId, data) => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      const storedUserId = await AsyncStorage.getItem('user_id');
      const isSetupFlow = await AsyncStorage.getItem('signup_flow') === 'true';
      
      console.log('🤖 Smart update decision:', {
        hasAuthToken: !!authToken,
        isSetupFlow,
        userId,
        storedUserId,
        userIdMatch: storedUserId === userId
      });

      // If no token, or setup flow, or user ID mismatch, use setup endpoint
      if (!authToken || isSetupFlow || storedUserId !== userId) {
        console.log('🔧 Using setup endpoint because:', {
          noToken: !authToken,
          setupFlow: isSetupFlow,
          userIdMismatch: storedUserId !== userId
        });
        return await driverAPI.setupProfile(userId, data);
      } else {
        // Use authenticated update for existing users with matching IDs
        console.log('🔐 Using authenticated update - user ID matches token');
        return await driverAPI.updateProfile(userId, data);
      }
    } catch (error) {
      console.error('Smart update failed:', error);
      // Fallback to setup if auth fails
      console.log('🔄 Falling back to setup endpoint');
      return await driverAPI.setupProfile(userId, data);
    }
  },

  // Upload profile image
  uploadProfileImage: async (userId, formData) => {
    const response = await apiClient.put(`/driver/upload/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Chat API calls
export const chatAPI = {
  // Get online users
  getOnlineUsers: async (role) => {
    const response = await apiClient.get('/chat/online-users', {
      params: { role }
    });
    return response.data;
  },

  // Get user status
  getUserStatus: async (userId) => {
    const response = await apiClient.get(`/chat/user-status/${userId}`);
    return response.data;
  },

  // Get conversations
  getConversations: async () => {
    const response = await apiClient.get('/chat/conversations');
    return response.data;
  },

  // Get conversation messages
  getConversationMessages: async (otherUserId) => {
    const response = await apiClient.get(`/chat/conversations/${otherUserId}/messages`);
    return response.data;
  },

  // Start conversation
  startConversation: async (participantId) => {
    const response = await apiClient.post('/chat/conversations/start', {
      participantId
    });
    return response.data;
  },

  // Mark messages as read
  markMessagesAsRead: async (messageIds) => {
    const response = await apiClient.put('/chat/messages/read', {
      messageIds
    });
    return response.data;
  },

  // Delete message
  deleteMessage: async (messageId) => {
    const response = await apiClient.delete(`/chat/messages/${messageId}`);
    return response.data;
  },
};

export default apiClient;
