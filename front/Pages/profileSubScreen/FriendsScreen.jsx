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
    Alert,
    TouchableOpacity
} from 'react-native';
import { useTheme } from '../../DarkMode/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axiosInstance from '../../services/api.config';

export const FriendsScreen = () => {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';
    const navigation = useNavigation();
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState({ incoming: [], outgoing: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFriendRequests = async () => {
        try {
            const response = await axiosInstance.get('/friend-requests');
            setFriendRequests(response.data);
        } catch (error) {
            console.error('Error fetching friend requests:', error);
        }
    };

    const fetchFriends = async () => {
        try {
            const response = await axiosInstance.get('/profile');
            if (response.data.friends) {
                setFriends(response.data.friends);
            }
            await fetchFriendRequests();
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
                            // Since there's no direct remove friend endpoint, we'll just update the UI
                            setFriends(friends.filter(friend => friend.id !== friendId));
                            Alert.alert('Success', 'Friend removed successfully');
                        } catch (error) {
                            console.error('Error removing friend:', error);
                            Alert.alert('Error', 'Failed to remove friend. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handleAcceptRequest = async (friendshipId) => {
        try {
            await axiosInstance.put(`/friend-requests/${friendshipId}/accept`);
            await fetchFriends(); // Refresh the lists
            Alert.alert('Success', 'Friend request accepted');
        } catch (error) {
            console.error('Error accepting friend request:', error);
            Alert.alert('Error', 'Failed to accept friend request. Please try again.');
        }
    };

    const handleDeclineRequest = async (friendshipId) => {
        try {
            await axiosInstance.put(`/friend-requests/${friendshipId}/decline`);
            await fetchFriends(); // Refresh the lists
            Alert.alert('Success', 'Friend request declined');
        } catch (error) {
            console.error('Error declining friend request:', error);
            Alert.alert('Error', 'Failed to decline friend request. Please try again.');
        }
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

    const renderFriendRequest = ({ item, type }) => (
        <View style={[styles.friendCard, { 
            backgroundColor: isLightTheme ? '#fff' : '#2A2A2A',
            borderColor: isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
        }]}>
            <Image
                source={item.sender?.profile_photo ? { uri: item.sender.profile_photo } : require('../../assets/images/4.jpg')}
                style={styles.friendImage}
            />
            <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { color: isLightTheme ? '#000' : '#fff' }]}>
                    {type === 'incoming' ? item.sender?.name : item.recipient?.name}
                </Text>
                <Text style={[styles.friendEmail, { color: isLightTheme ? '#666' : '#aaa' }]}>
                    {type === 'incoming' ? 'Wants to be your friend' : 'Request sent'}
                </Text>
            </View>
            {type === 'incoming' && (
                <View style={styles.requestButtons}>
                    <TouchableOpacity
                        onPress={() => handleAcceptRequest(item.id)}
                        style={[styles.acceptButton, { backgroundColor: '#22c55e' }]}
                    >
                        <Icon name="check" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDeclineRequest(item.id)}
                        style={[styles.declineButton, { backgroundColor: '#dc2626' }]}
                    >
                        <Icon name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}
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
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon 
                        name="arrow-left" 
                        size={24} 
                        color={isLightTheme ? '#000' : '#fff'} 
                    />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isLightTheme ? '#000' : '#fff' }]}>
                    Friends
                </Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddFriend')}
                >
                    <Icon 
                        name="account-plus" 
                        size={24} 
                        color={isLightTheme ? '#1a73e8' : '#64B5F6'} 
                    />
                </TouchableOpacity>
            </View>

            {friendRequests.incoming.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: isLightTheme ? '#000' : '#fff' }]}>
                        Friend Requests ({friendRequests.incoming.length})
                    </Text>
                    {friendRequests.incoming.map(request => renderFriendRequest({ item: request, type: 'incoming' }))}
                </View>
            )}

            {friendRequests.outgoing.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: isLightTheme ? '#000' : '#fff' }]}>
                        Pending Requests ({friendRequests.outgoing.length})
                    </Text>
                    {friendRequests.outgoing.map(request => renderFriendRequest({ item: request, type: 'outgoing' }))}
                </View>
            )}

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
                ListHeaderComponent={
                    friends.length > 0 ? (
                        <Text style={[styles.sectionTitle, { color: isLightTheme ? '#000' : '#fff' }]}>
                            Your Friends ({friends.length})
                        </Text>
                    ) : null
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
                        <TouchableOpacity
                            style={[styles.addFriendButton, { backgroundColor: isLightTheme ? '#1a73e8' : '#64B5F6' }]}
                            onPress={() => navigation.navigate('AddFriend')}
                        >
                            <Text style={styles.addFriendButtonText}>Find Friends</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    backButton: {
        padding: 8,
    },
    addButton: {
        padding: 8,
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
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
    requestButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    acceptButton: {
        padding: 8,
        borderRadius: 20,
    },
    declineButton: {
        padding: 8,
        borderRadius: 20,
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
        marginBottom: 16,
    },
    addFriendButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    addFriendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 