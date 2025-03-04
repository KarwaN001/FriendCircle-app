// ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();
const THEME_STORAGE_KEY = '@theme';

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(Appearance.getColorScheme() || 'light');

    // Load saved theme on initial mount
    useEffect(() => {
        const loadSavedTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme) {
                    setTheme(savedTheme);
                }
            } catch (error) {
                console.error('Error loading saved theme:', error);
            }
        };
        loadSavedTheme();
    }, []);

    // Save theme whenever it changes
    useEffect(() => {
        const saveTheme = async () => {
            try {
                await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
            } catch (error) {
                console.error('Error saving theme:', error);
            }
        };
        saveTheme();
    }, [theme]);

    // Listen to system theme changes
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });

        return () => subscription.remove();
    }, []);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
