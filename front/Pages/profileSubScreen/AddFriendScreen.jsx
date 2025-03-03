import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList, ActivityIndicator, Platform, StatusBar, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../DarkMode/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance from '../../services/api.config';
import Sizing from '../../utils/Sizing';

export const AddFriendScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [sendingRequests, setSendingRequests] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [friendRequests, setFriendRequests] = useState({});
    const [activeTab, setActiveTab] = useState('suggestions');
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

    const fetchSuggestions = async (page = 1, shouldRefresh = false) => {
        try {
            if (!isInitialDataLoaded) return;
            if (page > 1) {
                setLoadingMore(true);
            }
            setError(null);
            console.log('Fetching friend suggestions...');
            const response = await axiosInstance.get('/friend-suggestions', {
                params: {
                    page,
                    search: searchQuery
                }
            });
            console.log('Friend suggestions response:', response.data);
            
            // Filter out users who already have pending friend requests
            const newSuggestions = (response.data.data || []).filter(
                user => !friendRequests[user.id]
            );

            if (shouldRefresh || page === 1) {
                setSuggestions(newSuggestions);
            } else {
                setSuggestions(prev => [...prev, ...newSuggestions]);
            }
            
            setCurrentPage(page);
            setHasMorePages(response.data.current_page < response.data.last_page);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setError('Failed to load friend suggestions. Please check your connection and try again.');
            if (error.response) {
                console.log('Error response data:', error.response.data);
                console.log('Error response status:', error.response.status);
                console.log('Error response headers:', error.response.headers);
            } else if (error.request) {
                console.log('Error request:', error.request);
            } else {
                console.log('Error message:', error.message);
            }
        } finally {
            if (page > 1) {
                setLoadingMore(false);
            }
            setRefreshing(false);
        }
    };

    const fetchFriendRequests = async () => {
        try {
            const response = await axiosInstance.get('/friend-requests');
            const outgoingRequestsMap = {};
            setOutgoingRequests(response.data.outgoing.data || []);
            response.data.outgoing.data.forEach(request => {
                outgoingRequestsMap[request.recipient_id] = request.id;
            });
            setFriendRequests(outgoingRequestsMap);
            setIsInitialDataLoaded(true);
        } catch (error) {
            console.error('Error fetching friend requests:', error);
            setError('Failed to load friend requests. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMorePages) {
            fetchSuggestions(currentPage + 1);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchSuggestions(1, true);
    };

    const handleSearch = () => {
        setCurrentPage(1);
        setHasMorePages(true);
        fetchSuggestions(1, true);
    };

    const sendFriendRequest = async (userId) => {
        try {
            setSendingRequests(prev => ({ ...prev, [userId]: true }));
            const response = await axiosInstance.post('/friend-requests', {
                recipient_id: userId
            });
            Alert.alert('Success', 'Friend request sent successfully!');
            
            // Update the friend requests state
            setFriendRequests(prev => ({
                ...prev,
                [userId]: response.data.id
            }));

            // Remove the user from suggestions
            setSuggestions(prev => prev.filter(user => user.id !== userId));

            // Update outgoing requests
            const userToAdd = suggestions.find(user => user.id === userId);
            if (userToAdd) {
                setOutgoingRequests(prev => [...prev, {
                    id: response.data.id,
                    recipient: userToAdd,
                    created_at: new Date().toISOString()
                }]);
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to send friend request. Please try again.'
            );
        } finally {
            setSendingRequests(prev => ({ ...prev, [userId]: false }));
        }
    };

    const cancelFriendRequest = async (userId) => {
        try {
            setSendingRequests(prev => ({ ...prev, [userId]: true }));
            await axiosInstance.delete(`/friend-requests/${friendRequests[userId]}`);
            Alert.alert('Success', 'Friend request cancelled successfully!');
            
            // Remove the friend request from states
            setFriendRequests(prev => {
                const newState = { ...prev };
                delete newState[userId];
                return newState;
            });

            // Remove from outgoing requests
            setOutgoingRequests(prev => prev.filter(request => request.recipient.id !== userId));

            // Refresh suggestions to potentially show the user again
            fetchSuggestions(1, true);
        } catch (error) {
            console.error('Error cancelling friend request:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to cancel friend request. Please try again.'
            );
        } finally {
            setSendingRequests(prev => ({ ...prev, [userId]: false }));
        }
    };

    useEffect(() => {
        fetchFriendRequests(); // Only fetch friend requests initially
    }, []);

    useEffect(() => {
        if (isInitialDataLoaded) {
            fetchSuggestions(1, true); // Fetch suggestions after friend requests are loaded
        }
    }, [isInitialDataLoaded]);

    const renderUserItem = ({ item }) => (
        <View style={[
            styles.userCard,
            { backgroundColor: isLightTheme ? '#fff' : '#2A2A2A' }
        ]}>
            <View style={[
                styles.avatarContainer,
                { backgroundColor: isLightTheme ? '#f0f0f0' : '#404040' }
            ]}>
                {item.profile_photo ? (
                    <Image
                        source={{ uri: item.profile_photo }}
                        style={styles.avatar}
                    />
                ) : (
                    <Icon 
                        name="account" 
                        size={Sizing.deviceWidth * 0.06} 
                        color={isLightTheme ? '#666' : '#aaa'} 
                    />
                )}
            </View>
            <View style={styles.userInfo}>
                <Text style={[
                    styles.userName,
                    { color: isLightTheme ? '#000' : '#fff' }
                ]}>
                    {item.name}
                </Text>
                <View style={styles.userMetaInfo}>
                    <Icon 
                        name="account-circle" 
                        size={Sizing.deviceWidth * 0.035} 
                        color={isLightTheme ? '#666' : '#aaa'} 
                        style={styles.metaIcon}
                    />
                    <Text style={[
                        styles.userMeta,
                        { color: isLightTheme ? '#666' : '#aaa' }
                    ]}>
                        {`User #${item.id}`}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={[
                    styles.addButton,
                    { 
                        backgroundColor: friendRequests[item.id] 
                            ? (isLightTheme ? '#dc2626' : '#ef4444')  // Red for cancel
                            : (isLightTheme ? '#1a73e8' : '#64B5F6')  // Blue for add
                    },
                    sendingRequests[item.id] && styles.addButtonDisabled
                ]}
                onPress={() => friendRequests[item.id] 
                    ? cancelFriendRequest(item.id)
                    : sendFriendRequest(item.id)
                }
                disabled={sendingRequests[item.id]}
            >
                {sendingRequests[item.id] ? (
                    <ActivityIndicator size={Sizing.deviceWidth * 0.04} color="#fff" />
                ) : (
                    <View style={styles.buttonContent}>
                        <Icon 
                            name={friendRequests[item.id] ? "close" : "account-plus"} 
                            size={Sizing.deviceWidth * 0.04} 
                            color="#fff" 
                            style={styles.buttonIcon}
                        />
                        <Text style={styles.addButtonText}>
                            {friendRequests[item.id] ? 'Cancel' : 'Add Friend'}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    const renderRequestItem = ({ item }) => (
        <View style={[
            styles.userCard,
            { backgroundColor: isLightTheme ? '#fff' : '#2A2A2A' }
        ]}>
            <View style={[
                styles.avatarContainer,
                { backgroundColor: isLightTheme ? '#f0f0f0' : '#404040' }
            ]}>
                {item.recipient.profile_photo ? (
                    <Image
                        source={{ uri: item.recipient.profile_photo }}
                        style={styles.avatar}
                    />
                ) : (
                    <Icon 
                        name="account" 
                        size={Sizing.deviceWidth * 0.06} 
                        color={isLightTheme ? '#666' : '#aaa'} 
                    />
                )}
            </View>
            <View style={styles.userInfo}>
                <Text style={[
                    styles.userName,
                    { color: isLightTheme ? '#000' : '#fff' }
                ]}>
                    {item.recipient.name}
                </Text>
                <View style={styles.userMetaInfo}>
                    <Icon 
                        name="clock-outline" 
                        size={Sizing.deviceWidth * 0.035} 
                        color={isLightTheme ? '#666' : '#aaa'} 
                        style={styles.metaIcon}
                    />
                    <Text style={[
                        styles.userMeta,
                        { color: isLightTheme ? '#666' : '#aaa' }
                    ]}>
                        {`Sent ${new Date(item.created_at).toLocaleDateString()}`}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={[
                    styles.addButton,
                    { backgroundColor: isLightTheme ? '#dc2626' : '#ef4444' },
                    sendingRequests[item.recipient.id] && styles.addButtonDisabled
                ]}
                onPress={() => cancelFriendRequest(item.recipient.id)}
                disabled={sendingRequests[item.recipient.id]}
            >
                {sendingRequests[item.recipient.id] ? (
                    <ActivityIndicator size={Sizing.deviceWidth * 0.04} color="#fff" />
                ) : (
                    <View style={styles.buttonContent}>
                        <Icon 
                            name="close" 
                            size={Sizing.deviceWidth * 0.04} 
                            color="#fff" 
                            style={styles.buttonIcon}
                        />
                        <Text style={styles.addButtonText}>Cancel</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[
            styles.container,
            { backgroundColor: isLightTheme ? '#f8f9fa' : '#121212' }
        ]}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon 
                        name="arrow-left" 
                        size={Sizing.deviceWidth * 0.06} 
                        color={isLightTheme ? '#000' : '#fff'} 
                    />
                </TouchableOpacity>
                <Text style={[
                    styles.headerTitle,
                    { color: isLightTheme ? '#000' : '#fff' }
                ]}>
                    Add Friend
                </Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[
                        styles.tab,
                        activeTab === 'suggestions' && styles.activeTab,
                        { borderColor: isLightTheme ? '#1a73e8' : '#64B5F6' }
                    ]}
                    onPress={() => setActiveTab('suggestions')}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'suggestions' && styles.activeTabText,
                        { color: activeTab === 'suggestions' 
                            ? (isLightTheme ? '#1a73e8' : '#64B5F6')
                            : (isLightTheme ? '#666' : '#aaa')
                        }
                    ]}>
                        Suggestions
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[
                        styles.tab,
                        activeTab === 'requests' && styles.activeTab,
                        { borderColor: isLightTheme ? '#1a73e8' : '#64B5F6' }
                    ]}
                    onPress={() => setActiveTab('requests')}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'requests' && styles.activeTabText,
                        { color: activeTab === 'requests' 
                            ? (isLightTheme ? '#1a73e8' : '#64B5F6')
                            : (isLightTheme ? '#666' : '#aaa')
                        }
                    ]}>
                        Sent Requests {outgoingRequests.length > 0 && `(${outgoingRequests.length})`}
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size={Sizing.deviceWidth * 0.08} color={isLightTheme ? '#1a73e8' : '#64B5F6'} />
                    <Text style={[styles.loadingText, { color: isLightTheme ? '#666' : '#aaa' }]}>
                        Loading...
                    </Text>
                </View>
            ) : (
                <>
                    {activeTab === 'suggestions' ? (
                        <>
                            <View style={styles.searchContainer}>
                                <View style={[
                                    styles.searchBox,
                                    { 
                                        backgroundColor: isLightTheme ? '#fff' : '#2A2A2A',
                                        borderColor: isLightTheme ? '#ddd' : '#444'
                                    }
                                ]}>
                                    <Icon 
                                        name="magnify" 
                                        size={Sizing.deviceWidth * 0.06} 
                                        color={isLightTheme ? '#666' : '#aaa'} 
                                        style={styles.searchIcon}
                                    />
                                    <TextInput
                                        style={[
                                            styles.searchInput,
                                            { color: isLightTheme ? '#000' : '#fff' }
                                        ]}
                                        placeholder="Search by username or email"
                                        placeholderTextColor={isLightTheme ? '#666' : '#aaa'}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        onSubmitEditing={handleSearch}
                                        returnKeyType="search"
                                    />
                                    {searchQuery.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSearchQuery('');
                                                handleSearch();
                                            }}
                                            style={styles.clearButton}
                                        >
                                            <Icon 
                                                name="close-circle" 
                                                size={Sizing.deviceWidth * 0.05} 
                                                color={isLightTheme ? '#666' : '#aaa'} 
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Icon 
                                        name="alert-circle-outline" 
                                        size={Sizing.deviceWidth * 0.12} 
                                        color={isLightTheme ? '#dc2626' : '#ef4444'} 
                                    />
                                    <Text style={[styles.errorText, { color: isLightTheme ? '#dc2626' : '#ef4444' }]}>
                                        {error}
                                    </Text>
                                    <TouchableOpacity
                                        style={[styles.retryButton, { backgroundColor: isLightTheme ? '#1a73e8' : '#64B5F6' }]}
                                        onPress={() => fetchSuggestions(1, true)}
                                    >
                                        <Text style={styles.retryButtonText}>Retry</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <FlatList
                                    data={suggestions}
                                    renderItem={renderUserItem}
                                    keyExtractor={(item) => item.id.toString()}
                                    contentContainerStyle={styles.listContainer}
                                    showsVerticalScrollIndicator={false}
                                    onEndReached={handleLoadMore}
                                    onEndReachedThreshold={0.5}
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    ListFooterComponent={() => (
                                        loadingMore ? (
                                            <View style={styles.footerLoader}>
                                                <ActivityIndicator 
                                                    size={Sizing.deviceWidth * 0.06} 
                                                    color={isLightTheme ? '#1a73e8' : '#64B5F6'} 
                                                />
                                            </View>
                                        ) : null
                                    )}
                                    ListEmptyComponent={
                                        <View style={styles.emptyContainer}>
                                            <Icon 
                                                name={searchQuery ? "account-search-outline" : "account-group-outline"} 
                                                size={Sizing.deviceWidth * 0.12} 
                                                color={isLightTheme ? '#666' : '#aaa'} 
                                            />
                                            <Text style={[styles.emptyText, { color: isLightTheme ? '#666' : '#aaa' }]}>
                                                {searchQuery 
                                                    ? 'No users found matching your search'
                                                    : 'No suggestions available'}
                                            </Text>
                                        </View>
                                    }
                                />
                            )}
                        </>
                    ) : (
                        <FlatList
                            data={outgoingRequests}
                            renderItem={renderRequestItem}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                            refreshing={refreshing}
                            onRefresh={fetchFriendRequests}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Icon 
                                        name="send-clock-outline" 
                                        size={Sizing.deviceWidth * 0.12} 
                                        color={isLightTheme ? '#666' : '#aaa'} 
                                    />
                                    <Text style={[styles.emptyText, { color: isLightTheme ? '#666' : '#aaa' }]}>
                                        No pending friend requests
                                    </Text>
                                </View>
                            }
                        />
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? (StatusBar.currentHeight + Sizing.deviceHeight * 0.02) : Sizing.deviceHeight * 0.02,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Sizing.deviceWidth * 0.04,
        paddingVertical: Sizing.deviceHeight * 0.015,
    },
    backButton: {
        padding: Sizing.deviceWidth * 0.02,
    },
    headerTitle: {
        fontSize: Sizing.deviceWidth * 0.045,
        fontWeight: 'bold',
        marginLeft: Sizing.deviceWidth * 0.03,
    },
    searchContainer: {
        padding: Sizing.deviceWidth * 0.04,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: Sizing.deviceWidth * 0.03,
        paddingHorizontal: Sizing.deviceWidth * 0.03,
    },
    searchIcon: {
        marginRight: Sizing.deviceWidth * 0.02,
    },
    searchInput: {
        flex: 1,
        height: Sizing.deviceHeight * 0.055,
        fontSize: Sizing.deviceWidth * 0.035,
    },
    listContainer: {
        padding: Sizing.deviceWidth * 0.04,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Sizing.deviceWidth * 0.035,
        borderRadius: Sizing.deviceWidth * 0.03,
        marginBottom: Sizing.deviceHeight * 0.012,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: Sizing.deviceWidth * 0.038,
        fontWeight: '600',
        marginBottom: Sizing.deviceHeight * 0.004,
    },
    userMetaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaIcon: {
        marginRight: Sizing.deviceWidth * 0.01,
    },
    userMeta: {
        fontSize: Sizing.deviceWidth * 0.032,
        fontWeight: '500',
    },
    statusIndicator: {
        paddingHorizontal: Sizing.deviceWidth * 0.03,
        paddingVertical: Sizing.deviceHeight * 0.006,
        borderRadius: Sizing.deviceWidth * 0.04,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        fontSize: Sizing.deviceWidth * 0.03,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Sizing.deviceHeight * 0.012,
        fontSize: Sizing.deviceWidth * 0.035,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Sizing.deviceWidth * 0.08,
    },
    errorText: {
        marginTop: Sizing.deviceHeight * 0.012,
        fontSize: Sizing.deviceWidth * 0.035,
        textAlign: 'center',
        marginBottom: Sizing.deviceHeight * 0.016,
    },
    retryButton: {
        paddingHorizontal: Sizing.deviceWidth * 0.06,
        paddingVertical: Sizing.deviceHeight * 0.012,
        borderRadius: Sizing.deviceWidth * 0.02,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: Sizing.deviceWidth * 0.035,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Sizing.deviceHeight * 0.06,
    },
    emptyText: {
        marginTop: Sizing.deviceHeight * 0.012,
        fontSize: Sizing.deviceWidth * 0.035,
    },
    addButton: {
        paddingHorizontal: Sizing.deviceWidth * 0.04,
        paddingVertical: Sizing.deviceHeight * 0.008,
        borderRadius: Sizing.deviceWidth * 0.05,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: Sizing.deviceWidth * 0.25,
    },
    addButtonDisabled: {
        opacity: 0.7,
    },
    addButtonText: {
        color: '#fff',
        fontSize: Sizing.deviceWidth * 0.032,
        fontWeight: '600',
    },
    footerLoader: {
        paddingVertical: Sizing.deviceHeight * 0.016,
        alignItems: 'center',
    },
    clearButton: {
        padding: Sizing.deviceWidth * 0.02,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: Sizing.deviceWidth * 0.01,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: Sizing.deviceWidth * 0.04,
        marginBottom: Sizing.deviceHeight * 0.008,
    },
    tab: {
        flex: 1,
        paddingVertical: Sizing.deviceHeight * 0.012,
        marginHorizontal: Sizing.deviceWidth * 0.01,
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
    requestStatus: {
        fontSize: Sizing.deviceWidth * 0.028,
        marginTop: Sizing.deviceHeight * 0.004,
    },
    avatarContainer: {
        width: Sizing.deviceWidth * 0.12,
        height: Sizing.deviceWidth * 0.12,
        borderRadius: Sizing.deviceWidth * 0.06,
        marginRight: Sizing.deviceWidth * 0.03,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: Sizing.deviceWidth * 0.06,
    },
}); 