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
    Alert,
} from 'react-native';
import { useTheme } from '../DarkMode/ThemeContext';
import axiosInstance from '../services/api.config';

const { width } = Dimensions.get('window');

const OTPVerification = ({ route, navigation }) => {
    const [otp, setOtp] = useState('');
    const { verification_id } = route.params;
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    const handleVerification = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        try {
            const response = await axiosInstance.post('/email/verify', {
                verification_id,
                otp
            });

            console.log('Verification response:', response.data);
            Alert.alert(
                'Success',
                'Email verified successfully! You can now login.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login')
                    }
                ]
            );
        } catch (error) {
            console.error('Verification error:', error);
            const errorMessage = error.response?.data?.error || 'An error occurred during verification';
            Alert.alert('Verification Failed', errorMessage);
        }
    };

    const handleResendOTP = async () => {
        try {
            await axiosInstance.post('/email/resend-otp', {
                verification_id
            });
            Alert.alert('Success', 'New OTP has been sent to your email');
        } catch (error) {
            console.error('Resend OTP error:', error);
            const errorMessage = error.response?.data?.error || 'An error occurred while resending OTP';
            Alert.alert('Error', errorMessage);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
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
            textAlign: 'center',
            letterSpacing: 5,
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
        resendButton: {
            padding: 10,
        },
        resendText: {
            color: '#007AFF',
            fontSize: 14,
        },
    });

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <Text style={styles.title}>Email Verification</Text>
            <Text style={styles.subtitle}>
                Please enter the 6-digit code sent to your email
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
            />
            <TouchableOpacity style={styles.button} onPress={handleVerification}>
                <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resendButton} onPress={handleResendOTP}>
                <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

export default OTPVerification; 