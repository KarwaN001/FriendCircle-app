import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from './DarkMode/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './Pages/LoginScreen';
import SignUpScreen from './Pages/SignUpScreen';
import Navigations from './Pages/Navigations';
import { ActivityIndicator, View } from 'react-native';

const Stack = createStackNavigator();

const Navigation = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <Stack.Navigator>
            {user ? (
                // User is signed in
                <Stack.Screen
                    name="Main"
                    component={Navigations}
                    options={{ headerShown: false }}
                />
            ) : (
                // No user signed in
                <>
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="SignUp"
                        component={SignUpScreen}
                        options={{ headerShown: false }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <NavigationContainer>
                    <Navigation />
                </NavigationContainer>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;