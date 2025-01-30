import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from './DarkMode/ThemeContext';
import { useTheme } from './DarkMode/ThemeContext';
import LoginScreen from './Pages/LoginScreen';
import SignUpScreen from './Pages/SignUpScreen';
import Navigations from './Pages/Navigations';

const Stack = createStackNavigator();

const App = () => {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
};

const AppContent = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                    },
                    headerTintColor: isDarkMode ? '#ffffff' : '#000000',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
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
                <Stack.Screen
                    name="Main"
                    component={Navigations}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;