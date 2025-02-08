import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ChatsScreen from './ChatsScreen';
import {MapScreen} from './MapScreen';
import {ProfileScreen} from './ProfileScreen';
import {EditProfileScreen} from './profileSubScreen/EditProfileScreen';
import {AddFriendScreen} from './profileSubScreen/AddFriendScreen';

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
            <Tab.Screen name="Chats" component={ChatsScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen 
                name="ProfileTab" 
                component={ProfileStack}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
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