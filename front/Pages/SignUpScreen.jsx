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
} from 'react-native';
import { useTheme } from '../DarkMode/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../apis/api';

const { width, height } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { theme } = useTheme();
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
        phoneInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            width: width * 0.8,
            height: 50,
            backgroundColor: isDarkMode ? '#333333' : '#ffffff',
            borderRadius: 10,
            marginBottom: 15,
        },
        phonePrefix: {
            paddingLeft: 15,
            paddingRight: 5,
            fontSize: 16,
            color: isDarkMode ? '#ffffff' : '#000000',
        },
        phoneInput: {
            flex: 1,
            height: '100%',
            fontSize: 16,
            color: isDarkMode ? '#ffffff' : '#000000',
            paddingRight: 15,
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
        loginContainer: {
            flexDirection: 'row',
            marginTop: 20,
        },
        loginText: {
            color: isDarkMode ? '#cccccc' : '#666666',
            fontSize: 14,
        },
        loginLink: {
            color: '#007AFF',
            fontSize: 14,
            fontWeight: 'bold',
            marginLeft: 5,
        },
    });

    const handleSignUp = async () => {
        // Basic validation
        if (!name || !email || !phoneNumber || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            const userData = {
                name,
                email,
                phone_number: `+964${phoneNumber}`,
                password,
                password_confirmation: confirmPassword,
                age: 18,
                gender: 'male'
            };

            const response = await api.register(userData);
            Alert.alert('Success', 'Registration successful!', [
                { text: 'OK', onPress: () => navigation.navigate('Main') }
            ]);
        } catch (error) {
            Alert.alert('Error', error.message || 'Registration failed. Please try again.');
        }
    };

    const handlePhoneChange = (text) => {
        // Remove any non-digit characters
        const cleaned = text.replace(/\D/g, '');

        // Limit to 10 digits
        const truncated = cleaned.slice(0, 10);

        setPhoneNumber(truncated);
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
                    placeholder="Full Name"
                    placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <View style={styles.phoneInputContainer}>
                    <Text style={styles.phonePrefix}>+964</Text>
                    <TextInput
                        style={styles.phoneInput}
                        placeholder="Mobile Number"
                        placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
                        value={phoneNumber}
                        onChangeText={handlePhoneChange}
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                </View>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={24}
                            color={isDarkMode ? '#cccccc' : '#999999'}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Confirm Password"
                        placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons
                            name={showConfirmPassword ? 'eye-off' : 'eye'}
                            size={24}
                            color={isDarkMode ? '#cccccc' : '#999999'}
                        />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginLink}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default SignUpScreen;