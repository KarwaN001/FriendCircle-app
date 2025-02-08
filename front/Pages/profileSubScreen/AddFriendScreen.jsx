import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '../../DarkMode/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance from '../../services/api.config';

export const AddFriendScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = async () => {
        try {
            // Here you would implement the API call to search for users
            Alert.alert('Search', `Searching for user: ${searchQuery}`);
            // Example API call (implement according to your backend):
            // const response = await axiosInstance.get(`/search-users?query=${searchQuery}`);
        } catch (error) {
            console.error('Search error:', error);
            Alert.alert('Error', 'Failed to search for users. Please try again.');
        }
    };

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
                <TouchableOpacity
                    style={[
                        styles.searchButton,
                        { backgroundColor: '#1a73e8' }
                    ]}
                    onPress={handleSearch}
                >
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>
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
        marginBottom: 16,
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
    searchButton: {
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 