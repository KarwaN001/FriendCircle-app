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
import {CreateGroupScreen} from './HomeSubScreen/CreateGroupScreen';
import {GroupChatScreen} from './HomeSubScreen/GroupChatScreen';
import GroupInfoScreen from './HomeSubScreen/GroupInfoScreen';

import {SafeAreaView, StatusBar} from "react-native";
import {useTheme} from "../DarkMode/ThemeContext";
import React from "react";

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

    return <Ionicons name={iconName} size={24} color={focused ? 'blue' : 'gray'} />;
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
                tabBarActiveTintColor: isLightTheme ? 'blue' : 'lightblue',
                tabBarInactiveTintColor: isLightTheme ? 'red' : 'darkgray',
                tabBarStyle: {
                    backgroundColor: isLightTheme ? '#f3f3f3' : '#333',
                    borderTopWidth: 0,
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    height: 70,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    paddingBottom: 7,
                    color: isLightTheme ? 'black' : 'white',
                },
                tabBarItemStyle: {
                    padding: 5,
                },
            })}
        >
            <Tab.Screen 
                name="Chats" 
                component={ChatStack}
                options={({ route }) => ({
                    tabBarStyle: {
                        display: getTabBarVisibility(route),
                        backgroundColor: isLightTheme ? '#f3f3f3' : '#333',
                        borderTopWidth: 0,
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        height: 70,
                    }
                })}
            />
            <Tab.Screen 
                name="Map" 
                component={MapScreen}
                options={({ route }) => ({
                    tabBarStyle: {
                        display: getTabBarVisibility(route),
                        backgroundColor: isLightTheme ? '#f3f3f3' : '#333',
                        borderTopWidth: 0,
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        height: 70,
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
                        backgroundColor: isLightTheme ? '#f3f3f3' : '#333',
                        borderTopWidth: 0,
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        height: 70,
                    }
                })}
            />
        </Tab.Navigator>
    );
};

// Function to handle tab bar visibility
const getTabBarVisibility = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? '';
    const hideOnScreens = ['EditProfile', 'AddFriend', 'Friends', 'CreateGroup', 'GroupChat', 'GroupInfo'];
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