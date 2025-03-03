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
import Sizing from '../../utils/Sizing';

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
            const createGroupResponse = await axiosInstance.post('/groups', {
                name: groupName.trim(),
                members: selectedFriends
            });

            // Navigate back to the chat screen with the new group
            navigation.navigate('GroupChat', {
                groupId: createGroupResponse.data.id,
                groupName: createGroupResponse.data.name
            });
        } catch (error) {
            console.error('API error:', error.response?.data);
            console.error('Error creating group:', error);
            
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
            paddingHorizontal: Sizing.deviceWidth * 0.04,
            paddingVertical: Sizing.deviceHeight * 0.015,
            paddingTop: Platform.OS === 'ios' ? Sizing.deviceHeight * 0.05 : Sizing.deviceHeight * 0.015,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333333' : '#F0F0F0',
        },
        backButton: {
            padding: Sizing.deviceWidth * 0.02,
            borderRadius: Sizing.deviceWidth * 0.01,
        },
        headerTitle: {
            fontSize: Sizing.deviceWidth * 0.042,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginLeft: Sizing.deviceWidth * 0.03,
        },
        content: {
            padding: Sizing.deviceWidth * 0.04,
        },
        inputContainer: {
            marginBottom: Sizing.deviceHeight * 0.02,
        },
        label: {
            fontSize: Sizing.deviceWidth * 0.034,
            fontWeight: '500',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginBottom: Sizing.deviceHeight * 0.008,
            marginLeft: Sizing.deviceWidth * 0.01,
        },
        input: {
            backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
            borderRadius: Sizing.deviceWidth * 0.02,
            paddingHorizontal: Sizing.deviceWidth * 0.035,
            paddingVertical: Sizing.deviceHeight * 0.015,
            fontSize: Sizing.deviceWidth * 0.032,
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            borderWidth: 1,
            borderColor: isDarkMode ? '#444444' : '#E0E0E0',
            height: Sizing.deviceHeight * 0.052,
        },
        descriptionInput: {
            height: Sizing.deviceHeight * 0.12,
            textAlignVertical: 'top',
        },
        createButton: {
            backgroundColor: '#007AFF',
            borderRadius: Sizing.deviceWidth * 0.02,
            paddingVertical: Sizing.deviceHeight * 0.015,
            alignItems: 'center',
            marginTop: Sizing.deviceHeight * 0.02,
            marginBottom: Sizing.deviceHeight * 0.02,
            marginHorizontal: Sizing.deviceWidth * 0.04,
        },
        createButtonText: {
            color: '#FFFFFF',
            fontSize: Sizing.deviceWidth * 0.034,
            fontWeight: '600',
        },
        friendsList: {
            flex: 1,
            marginBottom: Sizing.deviceHeight * 0.02,
        },
        friendCard: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: Sizing.deviceWidth * 0.02,
            marginBottom: Sizing.deviceHeight * 0.008,
            borderRadius: Sizing.deviceWidth * 0.015,
            backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { 
                width: 0, 
                height: Sizing.deviceHeight * 0.001 
            },
            shadowOpacity: 0.2,
            shadowRadius: Sizing.deviceWidth * 0.01,
            elevation: 2,
        },
        friendImage: {
            width: Sizing.deviceWidth * 0.085,
            height: Sizing.deviceWidth * 0.085,
            borderRadius: Sizing.deviceWidth * 0.0425,
            marginRight: Sizing.deviceWidth * 0.02,
        },
        friendName: {
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            fontSize: Sizing.deviceWidth * 0.032,
            flex: 1,
        },
        friendCardContent: {
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            width: '100%'
        },
        friendInfo: {
            flexDirection: 'row', 
            alignItems: 'center'
        },
        friendInitial: {
            color: '#FFFFFF', 
            fontSize: Sizing.deviceWidth * 0.034
        },
        loadingText: {
            textAlign: 'center', 
            padding: Sizing.deviceWidth * 0.04,
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            fontSize: Sizing.deviceWidth * 0.032,
        },
        checkIcon: {
            fontSize: Sizing.deviceWidth * 0.055,
            color: '#007AFF',
            marginLeft: -Sizing.deviceWidth * 0.07,
        }
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
                        size={Sizing.deviceWidth * 0.055} 
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
                        <Text style={styles.loadingText}>Loading friends...</Text>
                    ) : friends.length === 0 ? (
                        <Text style={styles.loadingText}>No friends found. Add some friends first!</Text>
                    ) : (
                        <View style={styles.friendsList}>
                            {friends.map((friend) => (
                                <TouchableOpacity 
                                    key={friend.id} 
                                    style={[
                                        styles.friendCard,
                                        selectedFriends.includes(friend.id) && {
                                            borderColor: '#007AFF',
                                            borderWidth: 1.5
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
                                    <View style={styles.friendCardContent}>
                                        <View style={styles.friendInfo}>
                                            {friend.profile_picture ? (
                                                <Image 
                                                    source={{ uri: friend.profile_picture }} 
                                                    style={styles.friendImage} 
                                                />
                                            ) : (
                                                <View style={[styles.friendImage, { backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' }]}>
                                                    <Text style={styles.friendInitial}>
                                                        {friend.name.charAt(0)}
                                                    </Text>
                                                </View>
                                            )}
                                            <Text style={styles.friendName}>{friend.name}</Text>
                                        </View>
                                        {selectedFriends.includes(friend.id) && (
                                            <Ionicons name="checkmark-circle" style={styles.checkIcon} />
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