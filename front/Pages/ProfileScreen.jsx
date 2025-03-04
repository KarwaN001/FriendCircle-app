import { View, Text, Switch, StyleSheet, ScrollView, Image, Pressable, Platform, StatusBar, Alert } from 'react-native';
import { useTheme } from '../DarkMode/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { clearAuthData, getUser, setUser } from '../services/storage';
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/api.config';
import Sizing from '../utils/Sizing';

export const ProfileScreen = () => {
    const { theme, toggleTheme } = useTheme();
    const isLightTheme = theme === 'light';
    const navigation = useNavigation();
    const [userData, setUserData] = useState(null);
    const [friendRequests, setFriendRequests] = useState({ incoming: [], outgoing: [] });

    const fetchFriendRequests = async () => {
        try {
            const response = await axiosInstance.get('/friend-requests');
            setFriendRequests({
                incoming: response.data.incoming?.data || [],
                outgoing: response.data.outgoing?.data || []
            });
        } catch (error) {
            console.error('Error fetching friend requests:', error);
            setFriendRequests({ incoming: [], outgoing: [] });
        }
    };

    const fetchUserData = async () => {
        try {
            // First try to get from storage
            const storedUser = await getUser();
            if (storedUser) {
                setUserData(storedUser);
            }
            
            // Then fetch fresh data from API
            const response = await axiosInstance.get('/profile');
            const freshUserData = response.data;
            setUserData(freshUserData);
            console.log('Logged in User Information:', freshUserData);
            
            // Update storage with fresh data
            await setUser(freshUserData);
        } catch (error) {
            console.error('Error fetching user data:', error);
            Alert.alert('Error', 'Failed to load profile data. Please try again.');
        }
    };

    // Use useFocusEffect to refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchUserData();
            fetchFriendRequests();
        }, [])
    );
    // useEffect(() => {
    //     console.log("test test :",userData?.friends_count);
    // }, [userData]);

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Logout',
                    onPress: async () => {
                        try {
                            // First try to logout from the server
                            try {
                                await axiosInstance.post('/logout', {
                                    device_name: `${Platform.OS}-${Platform.Version}`
                                });
                            } catch (error) {
                                console.warn('Server logout failed:', error);
                                // Continue with local logout even if server logout fails
                            }

                            // Clear all local data
                            await clearAuthData();
                            setUserData(null);

                            // Reset navigation state to Login screen
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });

                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert(
                                'Error',
                                'Failed to logout. Please force close the app and try again.',
                                [{ text: 'OK' }]
                            );
                        }
                    }
                }
            ]
        );
    };
    //menu items
    const menuItems = [
        { icon: 'account-edit', title: 'Edit Profile', subtitle: 'Update your information' },
        { icon: 'account-plus', title: 'Add Friend', subtitle: 'Find and add new friends' },
        { 
            icon: 'account-group', 
            title: 'Friends', 
            subtitle: 'View and manage your friends',
            badge: friendRequests.incoming.length || 0
        },
        { icon: 'bell-outline', title: 'Notifications', subtitle: 'Manage your alerts' },
        { icon: 'information', title: 'About App', subtitle: 'Learn more about FriendCircle' },
    ];

    const MenuItem = ({ icon, title, subtitle, onPress, badge }) => (
        <Pressable
            style={styles.menuItem}
            android_ripple={{ color: isLightTheme ? '#eee' : '#333' }}
            onPress={() => {
                if (onPress) {
                    onPress();
                } else if (title === 'Edit Profile') {
                    navigation.navigate('EditProfile');
                } else if (title === 'Add Friend') {
                    navigation.navigate('AddFriend');
                } else if (title.startsWith('Friends')) {
                    navigation.navigate('Friends');
                } else if (title === 'About App') {
                    navigation.navigate('AppInfo');
                }
            }}
        >
            <Icon
                name={icon}
                size={24}
                color={isLightTheme ? '#1a73e8' : '#64B5F6'}
                style={styles.menuIcon}
            />
            <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: isLightTheme ? '#000' : '#fff' }]}>
                    {title}
                </Text>
                <Text style={[styles.menuSubtitle, { color: isLightTheme ? '#666' : '#aaa' }]}>
                    {subtitle}
                </Text>
            </View>
            <View style={styles.rightContainer}>
                {badge > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                )}
                <Icon
                    name="chevron-right"
                    size={24}
                    color={isLightTheme ? '#666' : '#aaa'}
                />
            </View>
        </Pressable>
    );

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: isLightTheme ? '#f8f9fa' : '#121212' }
            ]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header Background */}
            <View style={[
                styles.headerBackground,
                { 
                    backgroundColor: isLightTheme ? '#1a73e8' : '#1a1a1a',
                    borderBottomLeftRadius: 30,
                    borderBottomRightRadius: 30,
                }
            ]}>
                <View style={[styles.headerOverlay, {
                    backgroundColor: isLightTheme ? 
                        'rgba(255, 255, 255, 0.1)' : 
                        'rgba(0, 0, 0, 0.2)'
                }]} />
            </View>

            {/* Profile Section */}
            <View style={styles.profileSection}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={userData?.profile_photo ? { uri: userData.profile_photo } : require('../assets/images/4.jpg')}
                        style={[
                            styles.profileImage,
                        ]}
                    />
                    
                </View>
                <View style={styles.profileInfo}>
                    <Text style={[styles.name, { 
                        color: '#fff',
                        textShadowColor: 'rgba(0, 0, 0, 0.2)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2
                    }]}>
                        {userData?.name || 'Loading...'}
                    </Text>
                    <View style={styles.emailContainer}>
                        <Icon name="email" size={16} color="rgba(255, 255, 255, 0.9)" style={styles.emailIcon} />
                        <Text style={[styles.username, { color: 'rgba(255, 255, 255, 0.9)' }]}>
                            {userData?.email || 'loading'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Stats Card */}
            <View style={[styles.card, styles.statsCard, { 
                backgroundColor: isLightTheme ? '#fff' : '#2A2A2A',
                marginTop: -Sizing.deviceHeight * 0.03,
                marginHorizontal: Sizing.deviceWidth * 0.04,
                marginBottom: Sizing.deviceHeight * 0.015,
            }]}>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: isLightTheme ? '#1a73e8' : '#64B5F6' }]}>
                            {userData?.groups_count || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: isLightTheme ? '#666' : '#aaa' }]}>Groups</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: isLightTheme ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: isLightTheme ? '#1a73e8' : '#64B5F6' }]}>
                            {userData?.friends_count || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: isLightTheme ? '#666' : '#aaa' }]}>Friends</Text>
                    </View>
                </View>
            </View>

            {/* Menu Section */}
            <View style={styles.menuSection}>
                {/* Theme Switch Card */}
                <View style={[styles.card, { backgroundColor: isLightTheme ? '#fff' : '#2A2A2A' }]}>
                    <Pressable 
                        style={styles.themeRow}
                        android_ripple={{ color: isLightTheme ? '#eee' : '#333' }}
                    >
                        <View style={[styles.iconContainer, { 
                            backgroundColor: isLightTheme ? '#e3f2fd' : '#333',
                            borderWidth: 1,
                            borderColor: isLightTheme ? 'rgba(26, 115, 232, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                        }]}>
                            <Icon
                                name={isLightTheme ? 'weather-sunny' : 'weather-night'}
                                size={24}
                                color={isLightTheme ? '#1a73e8' : '#64B5F6'}
                            />
                        </View>
                        <Text style={[styles.themeText, { color: isLightTheme ? '#000' : '#fff' }]}>
                            {!isLightTheme ? 'Dark Mode' : 'Light Mode'}
                        </Text>
                        <Switch
                            value={!isLightTheme}
                            onValueChange={toggleTheme}
                            thumbColor={isLightTheme ? '#fff' : '#64B5F6'}
                            trackColor={{
                                false: '#767577',
                                true: Platform.select({
                                    ios: '#64B5F6',
                                    android: '#1a73e8'
                                })
                            }}
                            ios_backgroundColor="#767577"
                        />
                    </Pressable>
                </View>

                {/* Menu Items */}
                <View style={[styles.card, { backgroundColor: isLightTheme ? '#fff' : '#2A2A2A' }]}>
                    {menuItems.map((item, index) => (
                        <MenuItem key={index} {...item} />
                    ))}
                </View>

                {/* Logout Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.logoutButton,
                        {
                            backgroundColor: pressed ? 'rgba(220, 38, 38, 0.9)' : '#dc2626',
                            transform: [{ scale: pressed ? 0.98 : 1 }],
                        }
                    ]}
                    onPress={handleLogout}
                >
                    <Icon name="logout" size={24} color="#fff" style={styles.logoutIcon} />
                    <Text style={styles.logoutText}>Logout</Text>
                </Pressable>

                <Text style={[styles.version, { color: isLightTheme ? '#666' : '#aaa' }]}>
                    Version 1.0.0
                </Text>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: Sizing.deviceHeight * 0.27,
        zIndex: -1,
        overflow: 'hidden',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.5,
    },
    profileSection: {
        alignItems: 'center',
        paddingTop: Sizing.deviceHeight * 0.06,
        paddingBottom: Sizing.deviceHeight * 0.08,
    },
    profileImageContainer: {
        marginBottom: Sizing.deviceHeight * 0.01,
        position: 'relative',
    },
    profileImage: {
        width: Sizing.deviceWidth * 0.25,
        height: Sizing.deviceWidth * 0.25,
        borderRadius: 100,
        borderWidth: 2,
    },
    profileInfo: {
        alignItems: 'center',
        marginTop: Sizing.deviceHeight * 0.003,
    },
    name: {
        fontSize: Sizing.deviceWidth * 0.04,
        fontWeight: '700',
        marginBottom: Sizing.deviceHeight * 0.004,
        letterSpacing: 0.3,
    },
    emailContainer: {
        marginBottom: Sizing.deviceHeight * 0.015,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        paddingHorizontal: Sizing.deviceWidth * 0.02,
        paddingVertical: Sizing.deviceHeight * 0.004,
        borderRadius: 12,
    },
    emailIcon: {
        marginRight: Sizing.deviceWidth * 0.01,
    },
    username: {
        fontSize: Sizing.deviceWidth * 0.025,
        letterSpacing: 0.3,
        fontWeight: '500',
    },
    menuSection: {
        paddingHorizontal: Sizing.deviceWidth * 0.04,
    },
    card: {
        borderRadius: 16,
        marginBottom: Sizing.deviceHeight * 0.015,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    statsCard: {
        padding: Sizing.deviceWidth * 0.035,
        elevation: 4,
        marginHorizontal: Sizing.deviceWidth * 0.04,
        marginTop: -Sizing.deviceHeight * 0.03,
        marginBottom: Sizing.deviceHeight * 0.015,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Sizing.deviceWidth * 0.02,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: Sizing.deviceHeight * 0.008,
    },
    statDivider: {
        width: 1,
        height: Sizing.deviceHeight * 0.03,
        marginHorizontal: Sizing.deviceWidth * 0.02,
    },
    statNumber: {
        fontSize: Sizing.deviceWidth * 0.035,
        fontWeight: '600',
        marginBottom: Sizing.deviceHeight * 0.002,
    },
    statLabel: {
        fontSize: Sizing.deviceWidth * 0.03,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    iconContainer: {
        width: Sizing.deviceWidth * 0.07,
        height: Sizing.deviceWidth * 0.07,
        borderRadius: Sizing.deviceWidth * 0.035,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Sizing.deviceWidth * 0.03,
    },
    themeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Sizing.deviceWidth * 0.035,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    themeText: {
        flex: 1,
        fontSize: Sizing.deviceWidth * 0.035,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Sizing.deviceWidth * 0.035,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    menuIcon: {
        marginRight: Sizing.deviceWidth * 0.03,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: Sizing.deviceWidth * 0.035,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    menuSubtitle: {
        fontSize: Sizing.deviceWidth * 0.03,
        marginTop: Sizing.deviceHeight * 0.002,
        opacity: 0.7,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Sizing.deviceWidth * 0.035,
        borderRadius: 16,
        marginBottom: Sizing.deviceHeight * 0.015,
    },
    logoutIcon: {
        marginRight: Sizing.deviceWidth * 0.015,
    },
    logoutText: {
        color: '#fff',
        fontSize: Sizing.deviceWidth * 0.04,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    version: {
        textAlign: 'center',
        padding: Sizing.deviceWidth * 0.04,
        fontSize: Sizing.deviceWidth * 0.03,
        opacity: 0.6,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: '#dc2626',
        borderRadius: 1000,
        minWidth: Sizing.deviceWidth * 0.05,
        height: Sizing.deviceWidth * 0.05,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Sizing.deviceWidth * 0.04,
        paddingHorizontal: Sizing.deviceWidth * 0.015,
    },
    badgeText: {
        color: '#fff',
        fontSize: Sizing.deviceWidth * 0.03,
        fontWeight: 'bold',
    },
});