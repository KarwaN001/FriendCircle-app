import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NotificationItem } from './NotificationItem';

const { width, height } = Dimensions.get('window');

export const NotificationPopup = ({
                                      isVisible,
                                      onClose,
                                      notifications,
                                      isDarkMode,
                                  }) => {
    const slideAnim = useRef(new Animated.Value(-width)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -width,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible, slideAnim]);

    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: width * 0.8,
            backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
            borderRightWidth: 1,
            borderRightColor: isDarkMode ? '#333' : '#e0e0e0',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333' : '#e0e0e0',
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#333',
        },
        closeButton: {
            padding: 4,
        },
        emptyText: {
            fontSize: 16,
            color: isDarkMode ? '#ccc' : '#666',
            textAlign: 'center',
            padding: 20,
        },
    });

    if (!isVisible) return null;

    const handleNotificationPress = (item) => {
        // Mark notification as read
        item.isRead = true;
        
    
        console.log('Notification pressed:', item);
    };

    return (
        <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
        >
            <Animated.View
                style={[
                    styles.container,
                    {
                        transform: [{ translateX: slideAnim }],
                    },
                ]}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Notifications</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <NotificationItem
                            title={item.title}
                            message={item.message}
                            time={item.time}
                            isRead={item.isRead}
                            onPress={() => handleNotificationPress(item)}
                            isDarkMode={isDarkMode}
                        />
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No notifications</Text>
                    }
                />
            </Animated.View>
        </TouchableOpacity>
    );
};