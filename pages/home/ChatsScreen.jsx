import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import userImg from '../../assets/images/home/user.png';
import BottomNavbar from '../../components/BottomNavbar';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { chatAPI } from '../../services/apiService';
import socketService from '../../services/socketService';
import Toast from 'react-native-toast-message';

const ChatsScreen = () => {
    const navigation = useNavigation();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchConversations = async () => {
        try {
            const response = await chatAPI.getConversations();
            setConversations(response || []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load conversations'
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations();
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        
        const messageDate = new Date(dateString);
        const now = new Date();
        const diffMs = now - messageDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return messageDate.toLocaleDateString();
    };

    const getOtherParticipant = (participants, currentUserId) => {
        return participants.find(p => p._id !== currentUserId);
    };

    const handleChatPress = (conversation) => {
        navigation.navigate("home/msg", { 
            conversation,
            otherUser: getOtherParticipant(conversation.participants, conversation.currentUserId)
        });
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchConversations();
            
            // Connect socket if not connected
            if (!socketService.isConnected) {
                socketService.connect();
            }

            // Listen for new messages
            const handleNewMessage = (data) => {
                fetchConversations(); // Refresh conversations when new message arrives
            };

            const handleConversationUpdate = (data) => {
                fetchConversations(); // Refresh conversations on updates
            };

            socketService.on('newMessage', handleNewMessage);
            socketService.on('receiveMessage', handleNewMessage);
            socketService.on('conversationRead', handleConversationUpdate);

            return () => {
                socketService.off('newMessage', handleNewMessage);
                socketService.off('receiveMessage', handleNewMessage);
                socketService.off('conversationRead', handleConversationUpdate);
            };
        }, [])
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#34BF02" />
                <Text style={styles.loadingText}>Loading conversations...</Text>
                <BottomNavbar />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginTop: 40 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Inbox</Text>
                <AntDesign name="search1" size={24} color="black" />
            </View>
            
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {conversations.length === 0 ? (
                    <View style={styles.emptyState}>
                        <AntDesign name="message1" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No conversations yet</Text>
                        <Text style={styles.emptySubtext}>Start a conversation with other users</Text>
                    </View>
                ) : (
                    conversations.map((conversation) => {
                        const otherUser = getOtherParticipant(conversation.participants, conversation.currentUserId);
                        const lastMessage = conversation.lastMessage;
                        
                        return (
                            <TouchableOpacity 
                                key={conversation._id} 
                                style={styles.chatItem}
                                onPress={() => handleChatPress(conversation)}
                            >
                                <Image 
                                    source={otherUser?.profileImage ? { uri: otherUser.profileImage } : userImg} 
                                    style={styles.userImage} 
                                />
                                <View style={styles.chatInfo}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.name}>
                                            {otherUser?.fullName || otherUser?.phoneNumber || 'Unknown User'}
                                        </Text>
                                        {otherUser?.isOnline && (
                                            <View style={styles.onlineIndicator} />
                                        )}
                                    </View>
                                    <Text style={styles.lastMessage} numberOfLines={1}>
                                        {lastMessage?.text || lastMessage?.messageType === 'image' ? '📷 Image' : 
                                         lastMessage?.messageType === 'file' ? '📎 File' : 'No messages yet'}
                                    </Text>
                                </View>
                                <View style={styles.timeContainer}>
                                    <Text style={styles.time}>
                                        {formatTime(lastMessage?.createdAt || conversation.updatedAt)}
                                    </Text>
                                    {/* Unread message indicator could go here */}
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
            <BottomNavbar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
    chatItem: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    chatInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    onlineIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#34BF02',
        marginLeft: 8,
    },
    lastMessage: {
        color: '#666',
        fontSize: 14,
    },
    timeContainer: {
        alignItems: 'flex-end',
    },
    time: {
        color: '#999',
        fontSize: 12,
    },
});

export default ChatsScreen;