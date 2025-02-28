import React, { useState, useEffect } from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from './DarkMode/ThemeContext';
import LoginScreen from './Pages/LoginScreen';
import SignUpScreen from './Pages/SignUpScreen';
import OTPVerification from './Pages/OTPVerification';
import ForgotPasswordScreen from './Pages/ForgotPasswordScreen';
import Navigations from './Pages/Navigations';
import { getToken } from './services/storage';
import { ActivityIndicator, View } from 'react-native';

const Stack = createStackNavigator();

const App = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);

    useEffect(() => {
        // Check for token when app starts
        const checkToken = async () => {
            try {
                const token = await getToken();
                setUserToken(token);
            } catch (error) {
                console.error('Error checking token:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkToken();
    }, []);

    const handleLogout = (navigation) => {
        setUserToken(null); // Clear the user token
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
    };

    const handleLogin = (token) => {
        setUserToken(token); // Set the user token on successful login
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <ThemeProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={userToken ? "Main" : "Login"}>
                    {userToken ? (
                        // Authenticated stack
                        <Stack.Screen
                            name="Main"
                            component={Navigations}
                            options={{ headerShown: false }}
                            initialParams={{ handleLogout }}
                        />
                    ) : (
                        // Non-authenticated stack
                        <>
                            <Stack.Screen
                                name="Login"
                                component={LoginScreen}
                                options={{ headerShown: false }}
                                initialParams={{ handleLogin }}
                            />
                            <Stack.Screen
                                name="SignUp"
                                component={SignUpScreen}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="OTPVerification"
                                component={OTPVerification}
                                options={{ headerShown: true }}
                            />
                            <Stack.Screen
                                name="ForgotPassword"
                                component={ForgotPasswordScreen}
                                options={{ headerShown: true }}
                            />
                            <Stack.Screen
                                name="Main"
                                component={Navigations}
                                options={{ headerShown: false }}
                            />
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </ThemeProvider>
    );
};

export default App;