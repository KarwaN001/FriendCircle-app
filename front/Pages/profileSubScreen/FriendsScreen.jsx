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
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { useTheme } from '../../DarkMode/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axiosInstance from '../../services/api.config';
import Sizing from '../../utils/Sizing';

export const FriendsScreen = () => {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';
    const navigation = useNavigation();
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState({ incoming: [], outgoing: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('friends');

    const fetchFriendRequests = async () => {
        try {
            const response = await axiosInstance.get('/friend-requests');
            console.log('Friend requests response:', response.data);
            setFriendRequests({
                incoming: response.data.incoming?.data || [],
                outgoing: response.data.outgoing?.data || []
            });
        } catch (error) {
            console.error('Error fetching friend requests:', error);
            setFriendRequests({ incoming: [], outgoing: [] });
        }
    };

    const fetchFriends = async () => {
        try {
            // Get friend requests for the Invitations tab
            await fetchFriendRequests();
            
            // Get friends using the new endpoint
            const response = await axiosInstance.get('/friends');
            console.log('Friends response:', response.data);
            
            setFriends(response.data.data || []);
        } catch (error) {
            console.error('Error fetching friends:', error);
            Alert.alert('Error', 'Failed to load friends. Please try again.');
            setFriends([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRemoveFriend = async (friendId, friendshipId) => {
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
                            await axiosInstance.delete(`/friend-requests/${friendshipId}`);
                            setFriends(friends.filter(friend => friend.id !== friendId));
                            Alert.alert('Success', 'Friend removed successfully');
                            fetchFriends(); // Refresh the friends list
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
            Alert.alert('Success', 'Friend request accepted!');
            // Refresh both friends list and requests
            fetchFriends();
        } catch (error) {
            console.error('Error accepting friend request:', error);
            Alert.alert('Error', 'Failed to accept friend request. Please try again.');
        }
    };

    const handleDeclineRequest = async (friendshipId) => {
        try {
            await axiosInstance.put(`/friend-requests/${friendshipId}/decline`);
            Alert.alert('Success', 'Friend request declined');
            // Refresh the requests list
            fetchFriendRequests();
        } catch (error) {
            console.error('Error declining friend request:', error);
            Alert.alert('Error', 'Failed to decline friend request. Please try again.');
        }
    };

    const handleCancelRequest = async (friendshipId) => {
        try {
            await axiosInstance.delete(`/friend-requests/${friendshipId}`);
            Alert.alert('Success', 'Friend request cancelled');
            // Refresh the requests list
            fetchFriendRequests();
        } catch (error) {
            console.error('Error cancelling friend request:', error);
            Alert.alert('Error', 'Failed to cancel friend request. Please try again.');
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchFriends();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchFriends();
        }, [])
    );

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
                onPress={() => handleRemoveFriend(item.id, item.friendship_id)}
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
                source={
                    type === 'incoming' 
                        ? (item.sender?.profile_photo ? { uri: item.sender.profile_photo } : require('../../assets/images/4.jpg'))
                        : (item.recipient?.profile_photo ? { uri: item.recipient.profile_photo } : require('../../assets/images/4.jpg'))
                }
                style={styles.friendImage}
            />
            <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { color: isLightTheme ? '#000' : '#fff' }]}>
                    {type === 'incoming' ? item.sender?.name : item.recipient?.name}
                </Text>
                <Text style={[styles.friendEmail, { color: isLightTheme ? '#666' : '#aaa' }]}>
                    {type === 'incoming' ? item.sender?.email : item.recipient?.email}
                </Text>
                <Text style={[styles.requestStatus, { color: isLightTheme ? '#666' : '#aaa' }]}>
                    {type === 'incoming' ? 'Wants to be your friend' : 'Request sent'}
                </Text>
            </View>
            {type === 'incoming' ? (
                <View style={styles.requestButtons}>
                    <TouchableOpacity
                        onPress={() => handleAcceptRequest(item.id)}
                        style={[styles.actionButton, styles.acceptButton]}
                    >
                        <Icon name="check" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDeclineRequest(item.id)}
                        style={[styles.actionButton, styles.declineButton]}
                    >
                        <Icon name="close" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Decline</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    onPress={() => handleCancelRequest(item.id)}
                    style={[styles.actionButton, styles.cancelButton]}
                >
                    <Icon name="close" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
            )}
        </View>
    );

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

            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[
                        styles.tab,
                        activeTab === 'friends' && styles.activeTab,
                        { borderColor: isLightTheme ? '#1a73e8' : '#64B5F6' }
                    ]}
                    onPress={() => setActiveTab('friends')}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'friends' && styles.activeTabText,
                        { color: activeTab === 'friends' 
                            ? (isLightTheme ? '#1a73e8' : '#64B5F6')
                            : (isLightTheme ? '#666' : '#aaa')
                        }
                    ]}>
                        Friends ({friends?.length || 0})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[
                        styles.tab,
                        activeTab === 'invitations' && styles.activeTab,
                        { borderColor: isLightTheme ? '#1a73e8' : '#64B5F6' }
                    ]}
                    onPress={() => setActiveTab('invitations')}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'invitations' && styles.activeTabText,
                        { color: activeTab === 'invitations' 
                            ? (isLightTheme ? '#1a73e8' : '#64B5F6')
                            : (isLightTheme ? '#666' : '#aaa')
                        }
                    ]}>
                        Invitations ({(friendRequests.incoming?.length || 0) + (friendRequests.outgoing?.length || 0)})
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={[styles.container, { backgroundColor: isLightTheme ? '#f8f9fa' : '#121212' }]}>
                    <ActivityIndicator size="large" color={isLightTheme ? '#1a73e8' : '#64B5F6'} />
                </View>
            ) : activeTab === 'friends' ? (
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
                            <TouchableOpacity
                                style={[styles.addFriendButton, { backgroundColor: isLightTheme ? '#1a73e8' : '#64B5F6' }]}
                                onPress={() => navigation.navigate('AddFriend')}
                            >
                                <Text style={styles.addFriendButtonText}>Find Friends</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            ) : (
                <ScrollView 
                    style={styles.invitationsContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[isLightTheme ? '#1a73e8' : '#64B5F6']}
                            tintColor={isLightTheme ? '#1a73e8' : '#64B5F6'}
                        />
                    }
                >
                    {friendRequests.incoming?.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: isLightTheme ? '#000' : '#fff' }]}>
                                Incoming Requests ({friendRequests.incoming.length})
                            </Text>
                            {friendRequests.incoming.map(item => 
                                <View key={item.id}>
                                    {renderFriendRequest({ item, type: 'incoming' })}
                                </View>
                            )}
                        </View>
                    )}

                    {friendRequests.outgoing?.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: isLightTheme ? '#000' : '#fff' }]}>
                                Sent Requests ({friendRequests.outgoing.length})
                            </Text>
                            {friendRequests.outgoing.map(item => 
                                <View key={item.id}>
                                    {renderFriendRequest({ item, type: 'outgoing' })}
                                </View>
                            )}
                        </View>
                    )}

                    {(!friendRequests.incoming?.length && !friendRequests.outgoing?.length) && (
                        <View style={styles.emptyContainer}>
                            <Icon 
                                name="account-clock-outline" 
                                size={64} 
                                color={isLightTheme ? '#1a73e8' : '#64B5F6'} 
                            />
                            <Text style={[styles.emptyText, { color: isLightTheme ? '#666' : '#aaa' }]}>
                                No pending invitations
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Sizing.deviceHeight * 0.02,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Sizing.deviceWidth * 0.03,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    headerTitle: {
        fontSize: Sizing.deviceWidth * 0.042,
        fontWeight: '600',
    },
    backButton: {
        padding: Sizing.deviceWidth * 0.015,
    },
    addButton: {
        padding: Sizing.deviceWidth * 0.015,
    },
    section: {
        paddingHorizontal: Sizing.deviceWidth * 0.03,
        paddingTop: Sizing.deviceHeight * 0.015,
    },
    sectionTitle: {
        fontSize: Sizing.deviceWidth * 0.038,
        fontWeight: '600',
        marginBottom: Sizing.deviceHeight * 0.012,
    },
    listContainer: {
        padding: Sizing.deviceWidth * 0.03,
    },
    friendCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Sizing.deviceWidth * 0.03,
        marginBottom: Sizing.deviceHeight * 0.012,
        borderRadius: Sizing.deviceWidth * 0.025,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    friendImage: {
        width: Sizing.deviceWidth * 0.1,
        height: Sizing.deviceWidth * 0.1,
        borderRadius: Sizing.deviceWidth * 0.05,
    },
    friendInfo: {
        flex: 1,
        marginLeft: Sizing.deviceWidth * 0.03,
    },
    friendName: {
        fontSize: Sizing.deviceWidth * 0.035,
        fontWeight: '600',
        marginBottom: Sizing.deviceHeight * 0.004,
    },
    friendEmail: {
        fontSize: Sizing.deviceWidth * 0.03,
    },
    removeButton: {
        padding: Sizing.deviceWidth * 0.015,
    },
    requestButtons: {
        flexDirection: 'row',
        gap: Sizing.deviceWidth * 0.015,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Sizing.deviceHeight * 0.03,
    },
    emptyText: {
        marginTop: Sizing.deviceHeight * 0.015,
        fontSize: Sizing.deviceWidth * 0.035,
        fontWeight: '500',
        marginBottom: Sizing.deviceHeight * 0.015,
    },
    addFriendButton: {
        paddingHorizontal: Sizing.deviceWidth * 0.04,
        paddingVertical: Sizing.deviceHeight * 0.01,
        borderRadius: Sizing.deviceWidth * 0.04,
    },
    addFriendButtonText: {
        color: '#fff',
        fontSize: Sizing.deviceWidth * 0.035,
        fontWeight: '600',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: Sizing.deviceWidth * 0.03,
        marginBottom: Sizing.deviceHeight * 0.008,
    },
    tab: {
        flex: 1,
        paddingVertical: Sizing.deviceHeight * 0.012,
        marginHorizontal: Sizing.deviceWidth * 0.008,
        borderBottomWidth: 2,
        borderColor: 'transparent',
    },
    activeTab: {
        borderBottomWidth: 2,
    },
    tabText: {
        textAlign: 'center',
        fontSize: Sizing.deviceWidth * 0.032,
        fontWeight: '500',
    },
    activeTabText: {
        fontWeight: '600',
    },
    invitationsContainer: {
        flex: 1,
        padding: Sizing.deviceWidth * 0.03,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Sizing.deviceWidth * 0.03,
        paddingVertical: Sizing.deviceHeight * 0.008,
        borderRadius: Sizing.deviceWidth * 0.04,
        justifyContent: 'center',
    },
    acceptButton: {
        backgroundColor: '#22c55e',
        marginRight: Sizing.deviceWidth * 0.015,
    },
    declineButton: {
        backgroundColor: '#dc2626',
    },
    cancelButton: {
        backgroundColor: '#dc2626',
    },
    actionButtonText: {
        color: '#fff',
        marginLeft: Sizing.deviceWidth * 0.008,
        fontSize: Sizing.deviceWidth * 0.032,
        fontWeight: '600',
    },
    requestStatus: {
        fontSize: Sizing.deviceWidth * 0.028,
        marginTop: Sizing.deviceHeight * 0.004,
        fontStyle: 'italic',
    },
}); 