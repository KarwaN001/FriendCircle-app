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
import Sizing from '../utils/Sizing';

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
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingTop: Platform.OS === 'ios' ? 48 : 12,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333333' : '#F0F0F0',
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            textAlign: 'center',
            flex: 1,
        },
        chatList: {
            flex: 1,
            paddingHorizontal: Sizing.deviceWidth * 0.03,
        },
        chatItem: {
            flexDirection: 'row',
            padding: Sizing.deviceWidth * 0.035,
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            borderRadius: Sizing.deviceWidth * 0.04,
            marginVertical: Sizing.deviceHeight * 0.006,
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
            width: Sizing.deviceWidth * 0.12,
            height: Sizing.deviceWidth * 0.12,
            borderRadius: Sizing.deviceWidth * 0.06,
            backgroundColor: '#007AFF',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: Sizing.deviceWidth * 0.035,
        },
        avatarText: {
            color: '#FFFFFF',
            fontSize: Sizing.deviceWidth * 0.045,
            fontWeight: '600',
        },
        chatInfo: {
            flex: 1,
        },
        chatHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: Sizing.deviceHeight * 0.006,
        },
        chatName: {
            fontSize: Sizing.deviceWidth * 0.04,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            letterSpacing: 0.3,
        },
        chatTime: {
            fontSize: Sizing.deviceWidth * 0.032,
            color: isDarkMode ? '#999999' : '#666666',
            fontWeight: '500',
        },
        lastMessage: {
            fontSize: Sizing.deviceWidth * 0.035,
            color: isDarkMode ? '#BBBBBB' : '#666666',
            lineHeight: Sizing.deviceHeight * 0.024,
        },
        iconButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 20,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: Sizing.deviceHeight * 0.04,
        },
        emptyText: {
            fontSize: Sizing.deviceWidth * 0.04,
            fontWeight: '500',
            opacity: 0.7,
            textAlign: 'center',
            paddingHorizontal: Sizing.deviceWidth * 0.04,
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
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
                    <Ionicons name="notifications-outline" size={22} color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Groups</Text>
                <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => navigation.navigate('CreateGroup')}
                >
                    <Ionicons name="people-circle-outline" size={22} color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} />
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