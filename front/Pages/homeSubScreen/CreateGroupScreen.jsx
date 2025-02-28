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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from "../../DarkMode/ThemeContext";
import axiosInstance from '../../services/api.config';

export const CreateGroupScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await axiosInstance.get('/friends');
                if (Array.isArray(response.data.data)) {
                    setFriends(response.data.data);
                } else {
                    console.error('Expected an array but got:', response.data.data);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching friends:', error);
                setLoading(false);
            }
        };
        fetchFriends();
    }, []);

    const [selectedFriends, setSelectedFriends] = useState([]);

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
                    <Text style={styles.label}>Friends</Text>
                    {loading ? <Text>Loading friends...</Text> : (
                        <View style={styles.friendsList}>
                            {friends.map((friend, index) => (
                                <TouchableOpacity key={index} style={styles.friendCard} onPress={() => {
                                    if (selectedFriends.includes(friend.name)) {
                                        setSelectedFriends(selectedFriends.filter(name => name !== friend.name));
                                    } else {
                                        setSelectedFriends([...selectedFriends, friend.name]);
                                    }
                                }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image source={friend.profilePicture} style={styles.friendImage} />
                                            <Text style={styles.friendName}>{friend.name}</Text>
                                        </View>
                                        {selectedFriends.includes(friend.name) && <Ionicons name="checkmark-circle" size={24} color="green" />}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
            <TouchableOpacity 
                style={styles.createButton}
                onPress={() => {
                    // Handle group creation logic here
                    navigation.goBack();
                }}
            >
                <Text style={styles.createButtonText}>Create Group</Text>
            </TouchableOpacity>
        </View>
    );
}; 