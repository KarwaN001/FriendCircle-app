import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../DarkMode/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance from '../../services/api.config';
import { Platform } from 'react-native';

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
            <View style={styles.userInfo}>
                <Text style={[
                    styles.userName,
                    { color: isLightTheme ? '#000' : '#fff' }
                ]}>
                    {item.name}
                </Text>
                <Text style={[
                    styles.userEmail,
                    { color: isLightTheme ? '#666' : '#aaa' }
                ]}>
                    {item.email}
                </Text>
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
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <View style={styles.buttonContent}>
                        <Icon 
                            name={friendRequests[item.id] ? "close" : "account-plus"} 
                            size={16} 
                            color="#fff" 
                            style={styles.buttonIcon}
                        />
                        <Text style={styles.addButtonText}>
                            {friendRequests[item.id] ? 'Cancel Request' : 'Add Friend'}
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
            <View style={styles.userInfo}>
                <Text style={[
                    styles.userName,
                    { color: isLightTheme ? '#000' : '#fff' }
                ]}>
                    {item.recipient.name}
                </Text>
                <Text style={[
                    styles.userEmail,
                    { color: isLightTheme ? '#666' : '#aaa' }
                ]}>
                    {item.recipient.email}
                </Text>
                <Text style={[
                    styles.requestStatus,
                    { color: isLightTheme ? '#666' : '#aaa' }
                ]}>
                    Pending since {new Date(item.created_at).toLocaleDateString()}
                </Text>
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
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <View style={styles.buttonContent}>
                        <Icon 
                            name="close" 
                            size={16} 
                            color="#fff" 
                            style={styles.buttonIcon}
                        />
                        <Text style={styles.addButtonText}>Cancel Request</Text>
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
                        size={24} 
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
                    <ActivityIndicator size="large" color={isLightTheme ? '#1a73e8' : '#64B5F6'} />
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
                                        size={24} 
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
                                                size={20} 
                                                color={isLightTheme ? '#666' : '#aaa'} 
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Icon name="alert-circle-outline" size={48} color={isLightTheme ? '#dc2626' : '#ef4444'} />
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
                                                <ActivityIndicator size="small" color={isLightTheme ? '#1a73e8' : '#64B5F6'} />
                                            </View>
                                        ) : null
                                    )}
                                    ListEmptyComponent={
                                        <View style={styles.emptyContainer}>
                                            <Icon 
                                                name={searchQuery ? "account-search-outline" : "account-group-outline"} 
                                                size={48} 
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
                                        size={48} 
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
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    searchContainer: {
        padding: 16,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: 16,
    },
    listContainer: {
        padding: 16,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
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
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    statusIndicator: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 48,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
    },
    addButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 130,
    },
    addButtonDisabled: {
        opacity: 0.7,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    footerLoader: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    clearButton: {
        padding: 8,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        marginHorizontal: 4,
        borderBottomWidth: 2,
        borderColor: 'transparent',
    },
    activeTab: {
        borderBottomWidth: 2,
    },
    tabText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },
    activeTabText: {
        fontWeight: '600',
    },
    requestStatus: {
        fontSize: 12,
        marginTop: 4,
    },
}); 