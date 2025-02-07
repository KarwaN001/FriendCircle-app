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
    Alert,
} from 'react-native';
import { useTheme } from '../DarkMode/ThemeContext';
import axiosInstance from '../services/api.config';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        try {
            console.log('Attempting password reset for email:', email);
            
            const response = await axiosInstance.post('/forgot-password', {
                email: email,
            });

            console.log('Password reset response:', {
                status: response.status,
                data: response.data,
                headers: response.headers
            });

            Alert.alert(
                'Success',
                'Password reset instructions have been sent to your email.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login')
                    }
                ]
            );
        } catch (error) {
            console.error('Reset password error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                url: error.config?.url,
                method: error.config?.method,
                requestData: error.config?.data
            });

            const errorMessage = error.response?.data?.error || 'An error occurred while requesting password reset';
            Alert.alert('Error', errorMessage);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
        },
        content: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : '#000000',
            marginBottom: 20,
        },
        subtitle: {
            fontSize: 16,
            color: isDarkMode ? '#cccccc' : '#666666',
            marginBottom: 30,
            textAlign: 'center',
            paddingHorizontal: 20,
        },
        input: {
            width: width * 0.8,
            height: 50,
            backgroundColor: isDarkMode ? '#333333' : '#ffffff',
            borderRadius: 10,
            paddingHorizontal: 15,
            fontSize: 16,
            color: isDarkMode ? '#ffffff' : '#000000',
            marginBottom: 20,
        },
        button: {
            width: width * 0.8,
            height: 50,
            backgroundColor: '#007AFF',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 15,
        },
        buttonText: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 'bold',
        },
        backButton: {
            marginTop: 20,
        },
        backButtonText: {
            color: '#007AFF',
            fontSize: 16,
        },
    });

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                    Enter your email address and we'll send you instructions to reset your password.
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Back to Login</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ForgotPasswordScreen; 