import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useTheme } from '../DarkMode/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../apis/api';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { theme } = useTheme();
    const { login } = useAuth();
    const isDarkMode = theme === 'dark';

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
            paddingTop: StatusBar.currentHeight || 0,
        },
        content: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        logo: {
            fontSize: 40,
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : '#000000',
            marginBottom: 40,
        },
        input: {
            width: width * 0.8,
            height: 50,
            backgroundColor: isDarkMode ? '#333333' : '#ffffff',
            borderRadius: 10,
            paddingHorizontal: 15,
            fontSize: 16,
            color: isDarkMode ? '#ffffff' : '#000000',
            marginBottom: 15,
        },
        passwordContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            width: width * 0.8,
            height: 50,
            backgroundColor: isDarkMode ? '#333333' : '#ffffff',
            borderRadius: 10,
            paddingHorizontal: 15,
            marginBottom: 15,
        },
        passwordInput: {
            flex: 1,
            fontSize: 16,
            color: isDarkMode ? '#ffffff' : '#000000',
        },
        button: {
            width: width * 0.8,
            height: 50,
            backgroundColor: '#007AFF',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
        },
        buttonText: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 'bold',
        },
        forgotPassword: {
            marginTop: 15,
        },
        forgotPasswordText: {
            color: '#007AFF',
            fontSize: 14,
        },
        signUpContainer: {
            flexDirection: 'row',
            marginTop: 20,
        },
        signUpText: {
            color: isDarkMode ? '#cccccc' : '#666666',
            fontSize: 14,
        },
        signUpLink: {
            color: '#007AFF',
            fontSize: 14,
            fontWeight: 'bold',
            marginLeft: 5,
        },
        buttonDisabled: {
            backgroundColor: '#cccccc',
        },
    });

    const handleLogin = async () => {
        // Basic validation
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const credentials = {
                email,
                password
            };

            await login(credentials);
            // No need for Alert here as the navigation will happen automatically
            // through the AuthContext state change
        } catch (error) {
            Alert.alert('Error', error.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.logo}>Friend circle</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        editable={!isLoading}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={24}
                            color={isDarkMode ? '#cccccc' : '#999999'}
                        />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity 
                    style={[styles.button, isLoading && styles.buttonDisabled]} 
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
                <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.signUpLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;