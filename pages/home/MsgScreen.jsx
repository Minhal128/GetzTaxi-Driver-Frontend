import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import userImg from '../../assets/images/home/user.png';
import carImg from '../../assets/images/home/car2.png';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socketService from '../../services/socketService';
import Toast from 'react-native-toast-message';
import { Keyboard } from 'react-native';
const Msg = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const scrollViewRef = useRef();
    
    // Get conversation data from route params
    const { otherUserId, otherUserName = 'Abena Platt', otherUserPhone, conversationId } = route.params || {};
    
    // State management
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Initialize socket connection and fetch messages
    useEffect(() => {
        initializeMessaging();
        return () => {
            // Cleanup socket listeners
            if (socketService.socket) {
                socketService.socket.off('receive_message');
                socketService.socket.off('message_sent');
                socketService.socket.off('message_error');
                socketService.socket.off('user_status_change');
            }
        };
    }, []);

    const initializeMessaging = async () => {
        try {
            // Get current user ID
            const userProfile = await AsyncStorage.getItem('userProfile');
            if (userProfile) {
                const userData = JSON.parse(userProfile);
                setCurrentUserId(userData.data._id);
            }

            // Connect to socket if not connected
            if (!socketService.socket?.connected) {
                await socketService.connect();
            }

            // Set up socket listeners
            setupSocketListeners();

            // Fetch existing messages if we have otherUserId
            if (otherUserId) {
                await fetchMessages();
                checkUserStatus();
            } else {
                // Load sample messages for demo
                loadSampleMessages();
            }

        } catch (error) {
            console.error('Error initializing messaging:', error);
            Toast.show({
                type: 'error',
                text1: 'Connection Error',
                text2: 'Failed to initialize messaging'
            });
        } finally {
            setLoading(false);
        }
    };

    const setupSocketListeners = () => {
        if (!socketService.socket) return;

        // Listen for incoming messages
        socketService.socket.on('receive_message', (data) => {
            console.log('Received message:', data);
            const { message } = data;
            setMessages(prev => [...prev, message]);
            scrollToBottom();
        });

        // Listen for message sent confirmation
        socketService.socket.on('message_sent', (data) => {
            console.log('Message sent:', data);
            // Message already added to state when sending
        });

        // Listen for message errors
        socketService.socket.on('message_error', (error) => {
            console.error('Message error:', error);
            Toast.show({
                type: 'error',
                text1: 'Message Error',
                text2: error.error || 'Failed to send message'
            });
        });

        // Listen for user status changes
        socketService.socket.on('user_status_change', (data) => {
            if (data.userId === otherUserId) {
                setIsOnline(data.isOnline);
            }
        });
    };

    const fetchMessages = async () => {
        try {
            // This would use the chat API to fetch messages
            // For now, we'll use sample data
            loadSampleMessages();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const checkUserStatus = async () => {
        try {
            // Check if other user is online
            // For demo, set to true
            setIsOnline(true);
        } catch (error) {
            console.error('Error checking user status:', error);
        }
    };

    const loadSampleMessages = () => {
        const sampleMessages = [
            {
                _id: '1',
                text: 'Hello?',
                sender: { _id: currentUserId || 'current_user', fullName: 'You' },
                receiver: { _id: otherUserId || 'other_user', fullName: otherUserName },
                createdAt: new Date('2024-01-01T01:55:00'),
                messageType: 'text'
            },
            {
                _id: '2',
                text: 'How may I be of help Abena?',
                sender: { _id: otherUserId || 'other_user', fullName: otherUserName },
                receiver: { _id: currentUserId || 'current_user', fullName: 'You' },
                createdAt: new Date('2024-01-01T01:56:00'),
                messageType: 'text'
            },
            {
                _id: '3',
                text: 'I have booked your taxi, can you come pick me up right away?',
                sender: { _id: currentUserId || 'current_user', fullName: 'You' },
                receiver: { _id: otherUserId || 'other_user', fullName: otherUserName },
                createdAt: new Date('2024-01-01T01:57:00'),
                messageType: 'text'
            },
            {
                _id: '4',
                text: 'Yes, ma\'am, I\'m currently rushing down to your location',
                sender: { _id: otherUserId || 'other_user', fullName: otherUserName },
                receiver: { _id: currentUserId || 'current_user', fullName: 'You' },
                createdAt: new Date('2024-01-01T01:58:00'),
                messageType: 'text'
            },
            {
                _id: '5',
                text: 'Can you take a photo of the location around you? so that I can find you easily',
                sender: { _id: otherUserId || 'other_user', fullName: otherUserName },
                receiver: { _id: currentUserId || 'current_user', fullName: 'You' },
                createdAt: new Date('2024-01-01T01:58:30'),
                messageType: 'text'
            },
            {
                _id: '6',
                text: 'Of course! I will send now',
                sender: { _id: currentUserId || 'current_user', fullName: 'You' },
                receiver: { _id: otherUserId || 'other_user', fullName: otherUserName },
                createdAt: new Date('2024-01-01T01:59:00'),
                messageType: 'text'
            }
        ];
        setMessages(sampleMessages);
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const messageText = inputText.trim();
        setInputText('');

        try {
            // Create optimistic message
            const optimisticMessage = {
                _id: Date.now().toString(),
                text: messageText,
                sender: { _id: currentUserId, fullName: 'You' },
                receiver: { _id: otherUserId, fullName: otherUserName },
                createdAt: new Date(),
                messageType: 'text',
                sending: true
            };

            // Add to messages immediately for better UX
            setMessages(prev => [...prev, optimisticMessage]);
            scrollToBottom();

            // Send via socket
            if (socketService.socket?.connected && otherUserId) {
                socketService.socket.emit('send_text_message', {
                    receiverId: otherUserId,
                    text: messageText,
                    conversationId: conversationId
                });
            } else {
                // For demo purposes, simulate receiving the message
                setTimeout(() => {
                    setMessages(prev => prev.map(msg => 
                        msg._id === optimisticMessage._id 
                            ? { ...msg, sending: false }
                            : msg
                    ));
                }, 1000);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            Toast.show({
                type: 'error',
                text1: 'Send Error',
                text2: 'Failed to send message'
            });
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isMyMessage = (message) => {
        return message.sender._id === currentUserId || message.sender.fullName === 'You';
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                    <View style={styles.profile}>
                        <Image source={userImg} style={styles.profileImage} />
                        <View>
                            <Text style={styles.name}>{otherUserName}</Text>
                            <Text style={[styles.onlineStatus, { color: isOnline ? 'green' : '#999' }]}>
                                • {isOnline ? 'Online' : 'Offline'}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Feather name="more-vertical" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* Message Area */}
            <ScrollView 
                ref={scrollViewRef}
                style={styles.messageArea}
                onContentSizeChange={() => scrollToBottom()}
            >
                <Text style={styles.dateSeparator}>Today...</Text>

                {messages.map((message) => {
                    const isMyMsg = isMyMessage(message);
                    return (
                        <View key={message._id} style={isMyMsg ? styles.outgoingMessage : styles.incomingMessage}>
                            <View style={isMyMsg ? styles.outgoingBubble : styles.incomingBubble}>
                                <Text style={isMyMsg ? styles.outgoingText : styles.incomingText}>
                                    {message.text}
                                </Text>
                                <View style={isMyMsg ? styles.messageStatus : { alignItems: 'flex-start' }}>
                                    <Text style={styles.timestamp}>{formatTime(message.createdAt)}</Text>
                                    {isMyMsg && (
                                        <MaterialIcons 
                                            name={message.sending ? "schedule" : "done-all"} 
                                            size={16} 
                                            color={message.sending ? "#999" : "#4CAF50"} 
                                        />
                                    )}
                                </View>
                            </View>
                        </View>
                    );
                })}

                {/* Sample image message */}
                <View style={styles.outgoingMessage}>
                    <Image source={carImg} style={styles.sentImage} />
                </View>

            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputArea}>
                <TouchableOpacity>
                    <MaterialIcons name="mood" size={24} color="#555" />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Message..."
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    onSubmitEditing={sendMessage}
                />
                <View style={styles.inputActions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Feather name="camera" size={24} color="#555" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <MaterialIcons name="mic-none" size={24} color="#555" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Ionicons name="send" size={14} color="white" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        justifyContent: 'space-between',
        marginTop:40
    },
    profile: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    onlineStatus: {
        color: 'green',
        fontSize: 12,
    },
    messageArea: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 15,
    },
    dateSeparator: {
        textAlign: 'center',
        color: '#777',
        marginVertical: 10,
    },
    outgoingMessage: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    outgoingBubble: {
        backgroundColor: '#DCF8C6',
        borderRadius: 10,
        padding: 8,
        maxWidth: '80%',
    },
    outgoingText: {
        fontSize: 16,
        color: 'black',
    },
    messageStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 3,
    },
    timestamp: {
        fontSize: 12,
        color: '#777',
        marginRight: 5,
    },
    incomingMessage: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 10,
    },
    incomingBubble: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 8,
        maxWidth: '80%',
    },
    incomingText: {
        fontSize: 16,
        color: 'black',
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    input: {
        flex: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 10,
        height: 50
    },
    inputActions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 10,
    },
    sendButton: {
        backgroundColor: '#25D366',
        borderRadius: 25,
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sentImage: {
        width: 100,
        height: 80,
        borderRadius: 8,
        marginTop: 5,
    },
});

export default Msg;