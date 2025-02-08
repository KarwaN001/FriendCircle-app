import { View, Text, Switch, StyleSheet, ScrollView, Image, Pressable, Platform, StatusBar, Alert } from 'react-native';
import { useTheme } from '../DarkMode/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { clearAuthData, getUser, setUser } from '../services/storage';
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/api.config';

export const ProfileScreen = () => {
    const { theme, toggleTheme } = useTheme();
    const isLightTheme = theme === 'light';
    const navigation = useNavigation();
    const [userData, setUserData] = useState(null);

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
                            await clearAuthData();
                            navigation.getParent()?.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const menuItems = [
        { icon: 'account-edit', title: 'Edit Profile', subtitle: 'Update your information' },
        { icon: 'account-plus', title: 'Add Friend', subtitle: 'Find and add new friends' },
        { icon: 'account-group', title: 'Friends', subtitle: 'View and manage your friends' },
        { icon: 'bell-outline', title: 'Notifications', subtitle: 'Manage your alerts' },
        { icon: 'shield-lock-outline', title: 'Privacy Settings', subtitle: 'Control your privacy settings' },
        { icon: 'map-marker-outline', title: 'Location History', subtitle: 'View your location history' },
        { icon: 'help-circle-outline', title: 'Help & Support', subtitle: 'Get assistance' },
        { icon: 'cog-outline', title: 'Settings', subtitle: 'App preferences' },
    ];

    const MenuItem = ({ icon, title, subtitle, onPress }) => (
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
                } else if (title === 'Friends') {
                    navigation.navigate('Friends');
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
            <Icon
                name="chevron-right"
                size={24}
                color={isLightTheme ? '#666' : '#aaa'}
            />
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
                marginTop: -30,
                marginHorizontal: 24,
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
        height: 280,
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
        paddingTop: 45,
        paddingBottom: 60,
    },
    profileImageContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    profileImage: {
        width: 125,
        height: 125,
        borderRadius: 100,
        borderWidth: 3,
    },
  
    profileInfo: {
        alignItems: 'center',
        marginTop: 4,
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    emailContainer: {
        marginBottom: 25,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    emailIcon: {
        marginRight: 6,
    },
    username: {
        fontSize: 14,
        letterSpacing: 0.3,
        fontWeight: '500',
    },
    menuSection: {
        paddingHorizontal: 20,
    },
    card: {
        borderRadius: 24,
        marginBottom: 16,
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
        padding: 16,
        elevation: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: 8,
    },
    statDivider: {
        width: 1,
        height: 36,
        marginHorizontal: 16,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    themeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    themeText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    menuIcon: {
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    menuSubtitle: {
        fontSize: 14,
        marginTop: 2,
        opacity: 0.7,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 24,
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    logoutIcon: {
        marginRight: 8,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    version: {
        textAlign: 'center',
        padding: 16,
        fontSize: 12,
        opacity: 0.6,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
});