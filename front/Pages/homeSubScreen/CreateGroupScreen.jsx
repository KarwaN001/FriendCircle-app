import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ScrollView,
    Image,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from "../../DarkMode/ThemeContext";
import axiosInstance from '../../services/api.config';

export const CreateGroupScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [groupName, setGroupName] = useState('');
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const response = await axiosInstance.get('/friends');
            if (Array.isArray(response.data.data)) {
                setFriends(response.data.data);
            } else {
                console.error('Expected an array but got:', response.data.data);
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
            Alert.alert('Error', 'Failed to load friends list');
        } finally {
            setLoading(false);
        }
    };

    const [selectedFriends, setSelectedFriends] = useState([]);

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            Alert.alert('Error', 'Please enter a group name');
            return;
        }

        if (selectedFriends.length === 0) {
            Alert.alert('Error', 'Please select at least one friend');
            return;
        }

        setIsCreating(true);
        try {
            // Send group creation request with members in a single request
            const createGroupResponse = await axiosInstance.post('/groups', {
                name: groupName.trim(),
                members: selectedFriends // Send selected friend IDs as members
            });

            console.log('Group creation response:', createGroupResponse.data);

            Alert.alert('Success', 'Group created successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('API error:', error.response?.data);
            console.error('Error creating group:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            // Show the specific error message from the API if available
            const errorMessage = error.response?.data?.message 
                || error.response?.data?.errors?.members?.[0]
                || error.message 
                || 'Failed to create group';
            
            Alert.alert('Error', errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#121212' : '#F8F9FA',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            paddingTop: Platform.OS === 'ios' ? 50 : 16,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333333' : '#F0F0F0',
        },
        backButton: {
            padding: 8,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginLeft: 16,
        },
        content: {
            padding: 20,
        },
        inputContainer: {
            marginBottom: 20,
        },
        label: {
            fontSize: 16,
            fontWeight: '500',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginBottom: 8,
        },
        input: {
            backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            borderWidth: 1,
            borderColor: isDarkMode ? '#444444' : '#E0E0E0',
        },
        descriptionInput: {
            height: 120,
            textAlignVertical: 'top',
        },
        createButton: {
            backgroundColor: '#007AFF',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            marginTop: 20,
            marginBottom: 20,
            marginHorizontal: 20,
        },
        createButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
        },
        friendsList: {
            flex: 1,
            marginBottom: 20,
        },
        friendCard: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            marginBottom: 10,
            borderRadius: 10,
            backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1,
            elevation: 2,
        },
        friendImage: {
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 10,
        },
        friendName: {
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            fontSize: 16,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons 
                        name="arrow-back" 
                        size={24} 
                        color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} 
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create New Group</Text>
            </View>
            
            <ScrollView style={styles.content} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Group Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter group name"
                        placeholderTextColor={isDarkMode ? '#888888' : '#999999'}
                        value={groupName}
                        onChangeText={setGroupName}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Select Friends</Text>
                    {loading ? (
                        <Text style={[styles.friendName, { textAlign: 'center', padding: 20 }]}>
                            Loading friends...
                        </Text>
                    ) : friends.length === 0 ? (
                        <Text style={[styles.friendName, { textAlign: 'center', padding: 20 }]}>
                            No friends found. Add some friends first!
                        </Text>
                    ) : (
                        <View style={styles.friendsList}>
                            {friends.map((friend) => (
                                <TouchableOpacity 
                                    key={friend.id} 
                                    style={[
                                        styles.friendCard,
                                        selectedFriends.includes(friend.id) && {
                                            borderColor: '#007AFF',
                                            borderWidth: 2
                                        }
                                    ]} 
                                    onPress={() => {
                                        if (selectedFriends.includes(friend.id)) {
                                            setSelectedFriends(selectedFriends.filter(id => id !== friend.id));
                                        } else {
                                            setSelectedFriends([...selectedFriends, friend.id]);
                                        }
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            {friend.profile_picture ? (
                                                <Image 
                                                    source={{ uri: friend.profile_picture }} 
                                                    style={styles.friendImage} 
                                                />
                                            ) : (
                                                <View style={[styles.friendImage, { backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' }]}>
                                                    <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
                                                        {friend.name.charAt(0)}
                                                    </Text>
                                                </View>
                                            )}
                                            <Text style={styles.friendName}>{friend.name}</Text>
                                        </View>
                                        {selectedFriends.includes(friend.id) && (
                                            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
            
            <TouchableOpacity 
                style={[
                    styles.createButton,
                    (isCreating || !groupName.trim() || selectedFriends.length === 0) && {
                        opacity: 0.6
                    }
                ]}
                onPress={handleCreateGroup}
                disabled={isCreating || !groupName.trim() || selectedFriends.length === 0}
            >
                <Text style={styles.createButtonText}>
                    {isCreating ? 'Creating Group...' : 'Create Group'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}; 