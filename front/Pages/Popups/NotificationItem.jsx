import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const NotificationItem = ({
                                     title,
                                     message,
                                     time,
                                     isRead,
                                     onPress,
                                     isDarkMode,
                                 }) => {
    const styles = StyleSheet.create({
        container: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333' : '#e0e0e0',
            backgroundColor: isRead ? (isDarkMode ? '#1a1a1a' : '#fff') : (isDarkMode ? '#2a2a2a' : '#f0f0f0'),
        },
        title: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#333',
            marginBottom: 4,
        },
        message: {
            fontSize: 14,
            color: isDarkMode ? '#ccc' : '#666',
            marginBottom: 4,
        },
        timeContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        time: {
            fontSize: 12,
            color: isDarkMode ? '#999' : '#999',
        },
        unreadDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#007AFF',
        },
    });

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message} numberOfLines={2}>
                {message}
            </Text>
            <View style={styles.timeContainer}>
                <Text style={styles.time}>{time}</Text>
                {!isRead && <View style={styles.unreadDot} />}
            </View>
        </TouchableOpacity>
    );
};