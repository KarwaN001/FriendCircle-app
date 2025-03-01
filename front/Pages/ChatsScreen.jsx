import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Platform,
    ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from "../DarkMode/ThemeContext";
import { NotificationPopup } from './Popups/NotificationPopup';
import axiosInstance from '../services/api.config';

const ChatsScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [isNotificationPopupVisible, setIsNotificationPopupVisible] = React.useState(false);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/groups');
            if (response.data && Array.isArray(response.data.data)) {
                setGroups(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            setError('Failed to load groups');
        } finally {
            setLoading(false);
        }
    };

    // Memoized render item function for better performance
    const renderItem = React.useCallback(({ item }) => (
        <TouchableOpacity 
            style={styles.chatItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('GroupChat', { 
                groupId: item.id, 
                groupName: item.name 
            })}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{item.name}</Text>
                    {item.last_message && (
                        <Text style={styles.chatTime}>
                            {new Date(item.last_message.created_at).toLocaleDateString()}
                        </Text>
                    )}
                </View>
                {item.last_message && (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.last_message.sender_name}: {item.last_message.content}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    ), [isDarkMode, navigation]);

    // Memoized key extractor
    const keyExtractor = React.useCallback((item) => item.id.toString(), []);

    // Memoized empty list component
    const ListEmptyComponent = React.useCallback(() => (
        <View style={styles.emptyContainer}>
            {loading ? (
                <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} />
            ) : error ? (
                <Text style={[styles.emptyText, { color: '#FF3B30' }]}>
                    {error}
                </Text>
            ) : (
                <Text style={[styles.emptyText, { color: isDarkMode ? '#FFFFFF' : '#1A1A1A' }]}>
                    No groups yet. Create one to start chatting!
                </Text>
            )}
        </View>
    ), [isDarkMode, loading, error]);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#121212' : '#F8F9FA',
            paddingTop: StatusBar.currentHeight || 0,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            paddingTop: Platform.OS === 'ios' ? 50 : 20,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333333' : '#F0F0F0',
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                android: {
                    elevation: 4,
                },
            }),
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            letterSpacing: 0.5,
        },
        chatList: {
            flex: 1,
            paddingHorizontal: 16,
        },
        chatItem: {
            flexDirection: 'row',
            padding: 16,
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            borderRadius: 16,
            marginVertical: 6,
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                android: {
                    elevation: 2,
                },
            }),
        },
        avatar: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#007AFF',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        avatarText: {
            color: '#FFFFFF',
            fontSize: 20,
            fontWeight: '600',
        },
        chatInfo: {
            flex: 1,
        },
        chatHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
        },
        chatName: {
            fontSize: 17,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            letterSpacing: 0.3,
        },
        chatTime: {
            fontSize: 13,
            color: isDarkMode ? '#999999' : '#666666',
            fontWeight: '500',
        },
        lastMessage: {
            fontSize: 15,
            color: isDarkMode ? '#BBBBBB' : '#666666',
            lineHeight: 20,
        },
        iconButton: {
            padding: 8,
            borderRadius: 12,
            backgroundColor: isDarkMode ? '#333333' : '#F0F2F5',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 40,
        },
        emptyText: {
            fontSize: 16,
            fontWeight: '500',
            opacity: 0.7,
            textAlign: 'center',
            paddingHorizontal: 20,
        },
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => setIsNotificationPopupVisible(true)}
                >
                    <Ionicons name="notifications-outline" size={24} color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Groups</Text>
                <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => navigation.navigate('CreateGroup')}
                >
                    <Ionicons name="people-circle-outline" size={24} color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} />
                </TouchableOpacity>
            </View>

            {/* Chat List */}
            <FlatList
                data={groups}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={[
                    styles.chatList,
                    groups.length === 0 && { flex: 1 }
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={ListEmptyComponent}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'android'}
                ListHeaderComponent={<View style={{ height: 10 }} />}
                ListFooterComponent={<View style={{ height: 10 }} />}
                onRefresh={fetchGroups}
                refreshing={loading}
            />

            {/* Notification Popup */}
            <NotificationPopup
                isVisible={isNotificationPopupVisible}
                onClose={() => setIsNotificationPopupVisible(false)}
                notifications={[]}
                isDarkMode={isDarkMode}
            />
        </View>
    );
};

export default ChatsScreen; 