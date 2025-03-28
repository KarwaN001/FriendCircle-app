import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ChatsScreen from './ChatsScreen';
import {MapScreen} from './MapScreen';
import {ProfileScreen} from './ProfileScreen';
import {EditProfileScreen} from './profileSubScreen/EditProfileScreen';
import {AddFriendScreen} from './profileSubScreen/AddFriendScreen';
import {FriendsScreen} from './profileSubScreen/FriendsScreen';
import {AppInfoScreen} from './profileSubScreen/AppInfoScreen';
import {CreateGroupScreen} from './homeSubScreen/CreateGroupScreen';
import {GroupChatScreen} from './homeSubScreen/GroupChatScreen';
import GroupInfoScreen from './homeSubScreen/GroupInfoScreen';

import {SafeAreaView, StatusBar} from "react-native";
import {useTheme} from "../DarkMode/ThemeContext";
import React from "react";
import Sizing from '../utils/Sizing';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Function to return icons based on the route name
const getTabBarIcon = (routeName, focused) => {
    let iconName;

    switch (routeName) {
        case 'Chats':
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            break;
        case 'Map':
            iconName = focused ? 'map' : 'map-outline';
            break;
        case 'ProfileTab':
            iconName = focused ? 'person' : 'person-outline';
            break;
        default:
            iconName = 'chatbubbles-outline';
    }

    return <Ionicons name={iconName} size={Sizing.deviceWidth * 0.06} color={focused ? '#4A55A2' : '#8E8E93'} />;
};

// Chat Stack Navigator
const ChatStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="ChatsList"
                component={ChatsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="CreateGroup"
                component={CreateGroupScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="GroupChat"
                component={GroupChatScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="GroupInfo"
                component={GroupInfoScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

// Profile Stack Navigator
const ProfileStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="EditProfile"
                component={EditProfileScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="AddFriend"
                component={AddFriendScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="Friends"
                component={FriendsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="AppInfo"
                component={AppInfoScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

// Tab Navigator Component
const TabNavigator = () => {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused }) => getTabBarIcon(route.name, focused),
                tabBarActiveTintColor: '#4A55A2',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: {
                    backgroundColor: isLightTheme ? '#FFFFFF' : '#1A1A1A',
                    borderTopWidth: 0.5,
                    borderTopColor: isLightTheme ? '#E5E5EA' : '#2C2C2E',
                    height: Sizing.deviceHeight * 0.08,
                },
                tabBarLabelStyle: {
                    fontSize: Sizing.deviceWidth * 0.028,
                    fontWeight: '500',
                    marginTop: -Sizing.deviceHeight * 0.005,
                    marginBottom: Sizing.deviceHeight * 0.008,
                },
                tabBarItemStyle: {
                    paddingTop: Sizing.deviceHeight * 0.01,
                },
            })}
        >
            <Tab.Screen 
                name="Chats" 
                component={ChatStack}
                options={({ route }) => ({
                    tabBarStyle: {
                        display: getTabBarVisibility(route),
                        backgroundColor: isLightTheme ? '#FFFFFF' : '#1A1A1A',
                        borderTopWidth: 0.5,
                        borderTopColor: isLightTheme ? '#E5E5EA' : '#2C2C2E',
                        height: Sizing.deviceHeight * 0.08,
                    }
                })}
            />
            <Tab.Screen 
                name="Map" 
                component={MapScreen}
                options={({ route }) => ({
                    tabBarStyle: {
                        display: getTabBarVisibility(route),
                        backgroundColor: isLightTheme ? '#FFFFFF' : '#1A1A1A',
                        borderTopWidth: 0.5,
                        borderTopColor: isLightTheme ? '#E5E5EA' : '#2C2C2E',
                        height: Sizing.deviceHeight * 0.08,
                    }
                })}
            />
            <Tab.Screen 
                name="ProfileTab" 
                component={ProfileStack}
                options={({ route }) => ({
                    tabBarLabel: 'Profile',
                    tabBarStyle: {
                        display: getTabBarVisibility(route),
                        backgroundColor: isLightTheme ? '#FFFFFF' : '#1A1A1A',
                        borderTopWidth: 0.5,
                        borderTopColor: isLightTheme ? '#E5E5EA' : '#2C2C2E',
                        height: Sizing.deviceHeight * 0.08,
                    }
                })}
            />
        </Tab.Navigator>
    );
};

// Function to handle tab bar visibility
const getTabBarVisibility = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? '';
    const hideOnScreens = ['EditProfile', 'AddFriend', 'Friends', 'CreateGroup', 'GroupChat', 'GroupInfo', 'AppInfo'];
    return hideOnScreens.includes(routeName) ? 'none' : 'flex';
};

const Navigations = () => {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';

    return (
        <SafeAreaView style={{ flex: 1, paddingTop: 0 }}>
            <StatusBar 
                backgroundColor={isLightTheme ? '#ffffff' : '#1a1a1a'} 
                barStyle={isLightTheme ? 'dark-content' : 'light-content'}
            />
            <TabNavigator />
        </SafeAreaView>
    );
};

export default Navigations;