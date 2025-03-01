import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from "../../DarkMode/ThemeContext";
import axiosInstance from '../../services/api.config';

const GroupChatScreenComponent = ({ route, navigation }) => {
    const { groupId, groupName } = route.params;
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const flatListRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        const messageInterval = setInterval(fetchMessages, 5000); // Poll for new messages every 5 seconds

        return () => clearInterval(messageInterval);
    }, [groupId]);

    const fetchMessages = async () => {
        try {
            const response = await axiosInstance.get(`/groups/${groupId}/messages`);
            if (response.data && Array.isArray(response.data.data)) {
                setMessages(response.data.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError('Failed to load messages');
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            await axiosInstance.post(`/groups/${groupId}/messages`, {
                content: newMessage.trim()
            });
            setNewMessage('');
            fetchMessages();
            flatListRef.current?.scrollToEnd();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const renderMessage = ({ item }) => {
        const isOwnMessage = item.sender_id === 'current_user_id'; // Replace with actual user ID check

        return (
            <View style={[
                styles.messageContainer,
                isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
            ]}>
                {!isOwnMessage && (
                    <Text style={styles.senderName}>{item.sender_name}</Text>
                )}
                <View style={[
                    styles.messageBubble,
                    isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isOwnMessage ? styles.ownMessageText : styles.otherMessageText
                    ]}>
                        {item.content}
                    </Text>
                    <Text style={styles.messageTime}>
                        {new Date(item.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </Text>
                </View>
            </View>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#121212' : '#F8F9FA',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333333' : '#F0F0F0',
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginLeft: 16,
        },
        backButton: {
            padding: 8,
        },
        chatContainer: {
            flex: 1,
        },
        messageContainer: {
            marginVertical: 4,
            marginHorizontal: 12,
        },
        ownMessageContainer: {
            alignItems: 'flex-end',
        },
        otherMessageContainer: {
            alignItems: 'flex-start',
        },
        senderName: {
            fontSize: 12,
            color: isDarkMode ? '#999999' : '#666666',
            marginBottom: 2,
            marginLeft: 12,
        },
        messageBubble: {
            maxWidth: '80%',
            padding: 12,
            borderRadius: 20,
            marginBottom: 2,
        },
        ownMessageBubble: {
            backgroundColor: '#007AFF',
            borderBottomRightRadius: 4,
        },
        otherMessageBubble: {
            backgroundColor: isDarkMode ? '#333333' : '#E9ECEF',
            borderBottomLeftRadius: 4,
        },
        messageText: {
            fontSize: 16,
            marginBottom: 4,
        },
        ownMessageText: {
            color: '#FFFFFF',
        },
        otherMessageText: {
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
        },
        messageTime: {
            fontSize: 11,
            color: isDarkMode ? '#999999' : '#666666',
            alignSelf: 'flex-end',
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#333333' : '#F0F0F0',
        },
        input: {
            flex: 1,
            backgroundColor: isDarkMode ? '#333333' : '#F8F9FA',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginRight: 8,
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            fontSize: 16,
        },
        sendButton: {
            backgroundColor: '#007AFF',
            borderRadius: 20,
            padding: 8,
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons 
                        name="chevron-back" 
                        size={24} 
                        color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} 
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{groupName}</Text>
            </View>

            <KeyboardAvoidingView 
                style={styles.chatContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    onLayout={() => flatListRef.current?.scrollToEnd()}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Type a message..."
                        placeholderTextColor={isDarkMode ? '#999999' : '#666666'}
                        multiline
                    />
                    <TouchableOpacity 
                        style={styles.sendButton}
                        onPress={sendMessage}
                        disabled={!newMessage.trim()}
                    >
                        <Ionicons name="send" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export const GroupChatScreen = GroupChatScreenComponent; 