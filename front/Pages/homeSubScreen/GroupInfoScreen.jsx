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
    StatusBar,
    Dimensions,
    Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from "../../DarkMode/ThemeContext";
import axiosInstance from '../../services/api.config';

const { width } = Dimensions.get('window');

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

    const renderMember = ({ item, index }) => (
        <Animated.View 
            style={[
                styles.memberItem,
                {
                    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
                    transform: [{ scale: 1 }],
                }
            ]}
        >
            <View style={styles.memberAvatarContainer}>
                {item.avatar || (item.user && item.user.avatar) ? (
                    <Image
                        source={{ uri: item.avatar || item.user.avatar }}
                        style={styles.memberAvatar}
                    />
                ) : (
                    <View style={[styles.memberAvatar, { backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0' }]}>
                        <Ionicons 
                            name="person" 
                            size={20} 
                            color={isDarkMode ? '#FFFFFF' : '#666666'} 
                        />
                    </View>
                )}
                {item.role === 'admin' && (
                    <View style={styles.adminBadge}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                    </View>
                )}
            </View>
            <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    {item.name || (item.user && item.user.name) || 'Unknown User'}
                </Text>
                <Text style={[styles.memberRole, { color: isDarkMode ? '#A0A0A0' : '#666666' }]}>
                    {item.role === 'admin' ? 'Group Admin' : 'Member'}
                </Text>
            </View>
        </Animated.View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#000000'} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F8F9FA' }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            
            {/* Modern Header */}
            <View style={[styles.header, { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }]}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons 
                        name="chevron-back" 
                        size={28} 
                        color={isDarkMode ? '#FFFFFF' : '#000000'} 
                    />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    Group Details
                </Text>
                {isAdmin && (
                    <TouchableOpacity style={styles.editButton}>
                        <Ionicons 
                            name="settings-outline" 
                            size={24} 
                            color={isDarkMode ? '#FFFFFF' : '#000000'} 
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Group Info Section */}
            <View style={[styles.groupInfoContainer, { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }]}>
                {groupInfo?.image ? (
                    <Image
                        source={{ uri: groupInfo.image }}
                        style={styles.groupImage}
                    />
                ) : (
                    <View style={[styles.groupImage, { backgroundColor: isDarkMode ? '#2C2C2C' : '#E9ECEF' }]}>
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
                <View style={styles.memberCountContainer}>
                    <Ionicons 
                        name="people-outline" 
                        size={20} 
                        color={isDarkMode ? '#A0A0A0' : '#666666'} 
                    />
                    <Text style={[styles.memberCount, { color: isDarkMode ? '#A0A0A0' : '#666666' }]}>
                        {groupInfo?.members?.length || 0} members
                    </Text>
                </View>
            </View>

            {/* Members Section */}
            <View style={styles.membersSection}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    Members
                </Text>
                <FlatList
                    data={groupInfo?.members || []}
                    renderItem={renderMember}
                    keyExtractor={(item) => item.id?.toString() || item.user_id?.toString() || Math.random().toString()}
                    contentContainerStyle={[
                        styles.membersList,
                        { backgroundColor: isDarkMode ? '#121212' : '#F8F9FA' }
                    ]}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
                {isAdmin ? (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={handleDeleteGroup}
                    >
                        <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Delete Group</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.leaveButton]}
                        onPress={handleLeaveGroup}
                    >
                        <Ionicons name="exit-outline" size={24} color="#FFFFFF" />
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
        borderBottomColor: theme => theme === 'dark' ? '#333333' : '#F0F0F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        marginLeft: 16,
    },
    editButton: {
        padding: 8,
    },
    groupInfoContainer: {
        alignItems: 'center',
        padding: 24,
        borderRadius: 20,
        margin: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    groupImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
    },
    groupName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    memberCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme => theme === 'dark' ? '#2C2C2C' : '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    memberCount: {
        fontSize: 16,
        marginLeft: 6,
    },
    membersSection: {
        flex: 1,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        marginLeft: 8,
    },
    membersList: {
        paddingHorizontal: 8,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    memberAvatarContainer: {
        position: 'relative',
    },
    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    adminBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: theme => theme === 'dark' ? '#1A1A1A' : '#FFFFFF',
        borderRadius: 10,
        padding: 2,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    memberInfo: {
        marginLeft: 16,
        flex: 1,
    },
    memberName: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
    },
    memberRole: {
        fontSize: 14,
    },
    actionButtonsContainer: {
        padding: 16,
    },
    actionButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    deleteButton: {
        backgroundColor: '#DC3545',
    },
    leaveButton: {
        backgroundColor: '#FF6B6B',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default GroupInfoScreen; 