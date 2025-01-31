import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from "../DarkMode/ThemeContext";
import { NotificationPopup } from './Popups/NotificationPopup';

const chatList = [
    { id: 'f1', name: 'Family', lastMessage: 'Mom: Where are you? Dinner\'s ready!', time: '2m ago', unread: 1, initial: 'F' },
    { id: 't1', name: 'Trip Planning', lastMessage: 'Sarah: Let\'s meet at the park!', time: '15m ago', unread: 0, initial: 'T' },
    { id: 'w1', name: 'Work Team', lastMessage: 'Mike: Updated my location for meeting', time: '1h ago', unread: 0, initial: 'W' },
];

const ChatsScreen = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [isNotificationPopupVisible, setIsNotificationPopupVisible] = React.useState(false);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
            paddingTop: StatusBar.currentHeight || 0,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333333' : '#e0e0e0',
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : '#333333',
        },
        searchBar: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#333333' : '#f5f5f5',
            borderRadius: 10,
            padding: 12,
            margin: 16,
        },
        searchInput: {
            flex: 1,
            marginLeft: 8,
            color: isDarkMode ? '#ffffff' : '#333333',
            fontSize: 16,
        },
        chatList: {
            flex: 1,
        },
        chatItem: {
            flexDirection: 'row',
            padding: 16,
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333333' : '#f0f0f0',
        },
        avatar: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#007AFF',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        avatarText: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 'bold',
        },
        chatInfo: {
            flex: 1,
        },
        chatHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 4,
        },
        chatName: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : '#333333',
        },
        chatTime: {
            fontSize: 12,
            color: isDarkMode ? '#999999' : '#666666',
        },
        lastMessage: {
            fontSize: 14,
            color: isDarkMode ? '#cccccc' : '#666666',
        },
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setIsNotificationPopupVisible(true)}>
                    <Ionicons name="notifications-outline" size={24} color={isDarkMode ? '#ffffff' : '#333333'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Messages</Text>
                <TouchableOpacity>
                    <Ionicons name="create-outline" size={24} color={isDarkMode ? '#ffffff' : '#333333'} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={20} color={isDarkMode ? '#999999' : '#666666'} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search messages..."
                    placeholderTextColor={isDarkMode ? '#999999' : '#666666'}
                />
            </View>

            {/* Chat List */}
            <ScrollView style={styles.chatList}>
                {chatList.map((chat) => (
                    <TouchableOpacity key={chat.id} style={styles.chatItem}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{chat.initial}</Text>
                        </View>
                        <View style={styles.chatInfo}>
                            <View style={styles.chatHeader}>
                                <Text style={styles.chatName}>{chat.name}</Text>
                                <Text style={styles.chatTime}>{chat.time}</Text>
                            </View>
                            <Text style={styles.lastMessage} numberOfLines={1}>
                                {chat.lastMessage}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

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