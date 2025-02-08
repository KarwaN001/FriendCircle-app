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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching friend suggestions...');
            const response = await axiosInstance.get('/friend-suggestions');
            console.log('Friend suggestions response:', response.data);
            setSuggestions(response.data.data || []); // Access the paginated data
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setError('Failed to load friend suggestions. Please check your connection and try again.');
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log('Error response data:', error.response.data);
                console.log('Error response status:', error.response.status);
                console.log('Error response headers:', error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.log('Error request:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error message:', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

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
            <View style={[styles.statusIndicator, { backgroundColor: isLightTheme ? '#e5e7eb' : '#374151' }]}>
                <Text style={[styles.statusText, { color: isLightTheme ? '#4b5563' : '#9ca3af' }]}>
                    Coming soon
                </Text>
            </View>
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
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isLightTheme ? '#1a73e8' : '#64B5F6'} />
                    <Text style={[styles.loadingText, { color: isLightTheme ? '#666' : '#aaa' }]}>
                        Loading suggestions...
                    </Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={48} color={isLightTheme ? '#dc2626' : '#ef4444'} />
                    <Text style={[styles.errorText, { color: isLightTheme ? '#dc2626' : '#ef4444' }]}>
                        {error}
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: isLightTheme ? '#1a73e8' : '#64B5F6' }]}
                        onPress={fetchSuggestions}
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
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="account-search" size={48} color={isLightTheme ? '#666' : '#aaa'} />
                            <Text style={[styles.emptyText, { color: isLightTheme ? '#666' : '#aaa' }]}>
                                No suggestions found
                            </Text>
                        </View>
                    }
                />
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
}); 