import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useTheme } from '../../DarkMode/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../services/api.config';

export const FriendsScreen = () => {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFriends = async () => {
        try {
            const response = await axiosInstance.get('/friends');
            setFriends(response.data);
        } catch (error) {
            console.error('Error fetching friends:', error);
            Alert.alert('Error', 'Failed to load friends. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchFriends();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchFriends();
    }, []);

    const handleRemoveFriend = async (friendId) => {
        Alert.alert(
            'Remove Friend',
            'Are you sure you want to remove this friend?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axiosInstance.delete(`/friends/${friendId}`);
                            setFriends(friends.filter(friend => friend.id !== friendId));
                        } catch (error) {
                            console.error('Error removing friend:', error);
                            Alert.alert('Error', 'Failed to remove friend. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const renderFriendItem = ({ item }) => (
        <View style={[styles.friendCard, { 
            backgroundColor: isLightTheme ? '#fff' : '#2A2A2A',
            borderColor: isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
        }]}>
            <Image
                source={item.profile_photo ? { uri: item.profile_photo } : require('../../assets/images/4.jpg')}
                style={styles.friendImage}
            />
            <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { color: isLightTheme ? '#000' : '#fff' }]}>
                    {item.name}
                </Text>
                <Text style={[styles.friendEmail, { color: isLightTheme ? '#666' : '#aaa' }]}>
                    {item.email}
                </Text>
            </View>
            <Pressable
                onPress={() => handleRemoveFriend(item.id)}
                style={({ pressed }) => [
                    styles.removeButton,
                    { opacity: pressed ? 0.7 : 1 }
                ]}
            >
                <Icon name="account-remove" size={24} color="#dc2626" />
            </Pressable>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: isLightTheme ? '#f8f9fa' : '#121212' }]}>
                <ActivityIndicator size="large" color={isLightTheme ? '#1a73e8' : '#64B5F6'} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isLightTheme ? '#f8f9fa' : '#121212' }]}>
            <FlatList
                data={friends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[isLightTheme ? '#1a73e8' : '#64B5F6']}
                        tintColor={isLightTheme ? '#1a73e8' : '#64B5F6'}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon 
                            name="account-group-outline" 
                            size={64} 
                            color={isLightTheme ? '#1a73e8' : '#64B5F6'} 
                        />
                        <Text style={[styles.emptyText, { color: isLightTheme ? '#666' : '#aaa' }]}>
                            No friends yet
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContainer: {
        padding: 16,
    },
    friendCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    friendImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    friendInfo: {
        flex: 1,
        marginLeft: 16,
    },
    friendName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    friendEmail: {
        fontSize: 14,
    },
    removeButton: {
        padding: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    },
}); 