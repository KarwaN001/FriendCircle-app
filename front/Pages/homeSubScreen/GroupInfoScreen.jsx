import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    Alert,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from "../../DarkMode/ThemeContext";
import axiosInstance from '../../services/api.config';

const GroupInfoScreen = ({ route, navigation }) => {
    const { groupId, groupName } = route.params;
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [groupInfo, setGroupInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        fetchGroupInfo();
    }, [groupId]);

    const fetchGroupInfo = async () => {
        try {
            // First get current user to check admin status
            const userResponse = await axiosInstance.get('/profile');
            setCurrentUserId(userResponse.data.id);

            // Fetch members using the listMembers endpoint
            const membersResponse = await axiosInstance.get(`/groups/${groupId}/members`);
            
            if (membersResponse.data) {
                const members = Array.isArray(membersResponse.data) ? membersResponse.data : 
                              Array.isArray(membersResponse.data.data) ? membersResponse.data.data : [];
                
                setGroupInfo({
                    members: members,
                });
                
                // Check if current user is admin
                const currentUserMember = members.find(
                    member => member.user_id === userResponse.data.id || member.id === userResponse.data.id
                );
                setIsAdmin(currentUserMember?.role === 'admin');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching group info:', error);
            setLoading(false);
            Alert.alert(
                'Error',
                'Failed to load group information. Please try again later.'
            );
        }
    };

    const handleLeaveGroup = () => {
        Alert.alert(
            "Leave Group",
            "Are you sure you want to leave this group?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Leave",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axiosInstance.delete(`/groups/${groupId}/leave`);
                            navigation.navigate('ChatsList');
                        } catch (error) {
                            console.error('Error leaving group:', error);
                            Alert.alert('Error', 'Failed to leave the group');
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteGroup = () => {
        Alert.alert(
            "Delete Group",
            "Are you sure you want to delete this group? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axiosInstance.delete(`/groups/${groupId}`);
                            navigation.navigate('ChatsList');
                        } catch (error) {
                            console.error('Error deleting group:', error);
                            Alert.alert('Error', 'Failed to delete the group');
                        }
                    }
                }
            ]
        );
    };

    const renderMember = ({ item }) => (
        <View style={styles.memberItem}>
            {item.avatar || (item.user && item.user.avatar) ? (
                <Image
                    source={{ uri: item.avatar || item.user.avatar }}
                    style={styles.memberAvatar}
                />
            ) : (
                <View style={[styles.memberAvatar, { backgroundColor: isDarkMode ? '#333333' : '#E9ECEF', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons 
                        name="person" 
                        size={20} 
                        color={isDarkMode ? '#FFFFFF' : '#666666'} 
                    />
                </View>
            )}
            <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    {item.name || (item.user && item.user.name) || 'Unknown User'}
                </Text>
                <Text style={styles.memberRole}>
                    {item.role === 'admin' ? 'Admin' : 'Member'}
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#000000'} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons 
                        name="chevron-back" 
                        size={24} 
                        color={isDarkMode ? '#FFFFFF' : '#000000'} 
                    />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    Group Info
                </Text>
            </View>

            <View style={styles.groupInfoContainer}>
                {groupInfo?.image ? (
                    <Image
                        source={{ uri: groupInfo.image }}
                        style={styles.groupImage}
                    />
                ) : (
                    <View style={[styles.groupImage, { backgroundColor: isDarkMode ? '#333333' : '#E9ECEF', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons 
                            name="people" 
                            size={50} 
                            color={isDarkMode ? '#FFFFFF' : '#666666'} 
                        />
                    </View>
                )}
                <Text style={[styles.groupName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    {groupName}
                </Text>
                <Text style={styles.memberCount}>
                    {groupInfo?.members?.length || 0} members
                </Text>
            </View>

            <View style={styles.membersSection}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    Members
                </Text>
                <FlatList
                    data={groupInfo?.members || []}
                    renderItem={renderMember}
                    keyExtractor={(item) => item.id?.toString() || item.user_id?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.membersList}
                />
            </View>

            <View style={styles.actionButtonsContainer}>
                {isAdmin ? (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={handleDeleteGroup}
                    >
                        <Text style={styles.actionButtonText}>Delete Group</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.leaveButton]}
                        onPress={handleLeaveGroup}
                    >
                        <Text style={styles.actionButtonText}>Leave Group</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme => theme === 'dark' ? '#121212' : '#F8F9FA',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme => theme === 'dark' ? '#333333' : '#E5E5E5',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 16,
    },
    groupInfoContainer: {
        alignItems: 'center',
        padding: 20,
    },
    groupImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    groupName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    memberCount: {
        fontSize: 16,
        color: '#666666',
    },
    membersSection: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    membersList: {
        paddingBottom: 16,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme => theme === 'dark' ? '#333333' : '#E5E5E5',
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    memberInfo: {
        marginLeft: 12,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '500',
    },
    memberRole: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    },
    actionButtonsContainer: {
        padding: 16,
    },
    actionButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#DC3545',
    },
    leaveButton: {
        backgroundColor: '#FFC107',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default GroupInfoScreen; 