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
import Sizing from '../../utils/Sizing';

const GroupChatScreenComponent = ({ route, navigation }) => {
    const { groupId, groupName } = route.params;
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const flatListRef = useRef(null);

    // Estimate item height for getItemLayout
    const MESSAGE_ITEM_HEIGHT = 80; // Estimated average height of a message item

    const getItemLayout = (data, index) => ({
        length: MESSAGE_ITEM_HEIGHT,
        offset: MESSAGE_ITEM_HEIGHT * index,
        index,
    });

    useEffect(() => {
        fetchCurrentUser();
        fetchMessages();
        const messageInterval = setInterval(fetchMessages, 5000); // Poll for new messages every 5 seconds

        return () => clearInterval(messageInterval);
    }, [groupId]);

    const fetchCurrentUser = async () => {
        try {
            const response = await axiosInstance.get('/profile');
            setCurrentUserId(response.data.id);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await axiosInstance.get(`/groups/${groupId}/messages`);
            if (response.data && Array.isArray(response.data.data)) {
                // Sort messages by created_at in ascending order (oldest to newest)
                const sortedMessages = response.data.data.sort((a, b) => 
                    new Date(a.created_at) - new Date(b.created_at)
                );
                setMessages(sortedMessages);
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
        const isOwnMessage = item.user.id === currentUserId;

        return (
            <View style={[
                styles.messageContainer,
                isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
            ]}>
                <Text style={[
                    styles.senderName,
                    isOwnMessage ? styles.ownSenderName : styles.otherSenderName
                ]}>
                    {item.user.name}
                </Text>
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
            padding: Sizing.deviceWidth * 0.04,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333333' : '#F0F0F0',
            justifyContent: 'space-between',
        },
        headerTitle: {
            fontSize: Sizing.deviceWidth * 0.045,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            flex: 1,
            textAlign: 'center',
        },
        backButton: {
            padding: Sizing.deviceWidth * 0.02,
        },
        infoButton: {
            padding: Sizing.deviceWidth * 0.02,
        },
        chatContainer: {
            flex: 1,
        },
        messageContainer: {
            marginVertical: Sizing.deviceHeight * 0.004,
            marginHorizontal: Sizing.deviceWidth * 0.03,
        },
        ownMessageContainer: {
            alignItems: 'flex-end',
        },
        otherMessageContainer: {
            alignItems: 'flex-start',
        },
        senderName: {
            fontSize: Sizing.deviceWidth * 0.03,
            marginBottom: Sizing.deviceHeight * 0.002,
            fontWeight: '500',
        },
        ownSenderName: {
            color: isDarkMode ? '#007AFF' : '#0056b3',
            marginRight: Sizing.deviceWidth * 0.03,
        },
        otherSenderName: {
            color: isDarkMode ? '#999999' : '#666666',
            marginLeft: Sizing.deviceWidth * 0.03,
        },
        messageBubble: {
            maxWidth: '80%',
            padding: Sizing.deviceWidth * 0.03,
            borderRadius: Sizing.deviceWidth * 0.05,
            marginBottom: Sizing.deviceHeight * 0.002,
        },
        ownMessageBubble: {
            backgroundColor: '#007AFF',
            borderBottomRightRadius: Sizing.deviceWidth * 0.01,
        },
        otherMessageBubble: {
            backgroundColor: isDarkMode ? '#333333' : '#E9ECEF',
            borderBottomLeftRadius: Sizing.deviceWidth * 0.01,
        },
        messageText: {
            fontSize: Sizing.deviceWidth * 0.04,
            marginBottom: Sizing.deviceHeight * 0.004,
        },
        ownMessageText: {
            color: '#FFFFFF',
        },
        otherMessageText: {
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
        },
        messageTime: {
            fontSize: Sizing.deviceWidth * 0.028,
            color: isDarkMode ? '#999999' : '#666666',
            alignSelf: 'flex-end',
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: Sizing.deviceWidth * 0.03,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#333333' : '#F0F0F0',
        },
        input: {
            flex: 1,
            backgroundColor: isDarkMode ? '#333333' : '#F8F9FA',
            borderRadius: Sizing.deviceWidth * 0.05,
            paddingHorizontal: Sizing.deviceWidth * 0.04,
            paddingVertical: Sizing.deviceHeight * 0.01,
            marginRight: Sizing.deviceWidth * 0.02,
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            fontSize: Sizing.deviceWidth * 0.04,
        },
        sendButton: {
            backgroundColor: '#007AFF',
            borderRadius: Sizing.deviceWidth * 0.05,
            padding: Sizing.deviceWidth * 0.02,
            width: Sizing.deviceWidth * 0.1,
            height: Sizing.deviceWidth * 0.1,
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
                        size={Sizing.deviceWidth * 0.06} 
                        color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} 
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{groupName}</Text>
                <TouchableOpacity 
                    style={styles.infoButton}
                    onPress={() => navigation.navigate('GroupInfo', { groupId, groupName })}
                >
                    <Ionicons 
                        name="information-circle-outline" 
                        size={Sizing.deviceWidth * 0.06} 
                        color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} 
                    />
                </TouchableOpacity>
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
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    getItemLayout={getItemLayout}
                    showsVerticalScrollIndicator={true}
                    maintainVisibleContentPosition={{
                        minIndexForVisible: 0,
                        autoscrollToTopThreshold: 10
                    }}
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
                        <Ionicons name="send" size={Sizing.deviceWidth * 0.05} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export const GroupChatScreen = GroupChatScreenComponent; 