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
import axiosInstance from '../services/api.config';
import { setToken, setUser } from '../services/storage';

const { width, height } = Dimensions.get('window');



const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
    });

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        try {
            console.log('Attempting login with:', { email, device_name: `${Platform.OS}-${Platform.Version}` });
            
            const response = await axiosInstance.post('/login', {
                email: email,
                password: password,
                device_name: `${Platform.OS}-${Platform.Version}`,
            });

            console.log('Login response:', response.data);
            
            if (response.data.token) {
                await setToken(response.data.token);
                if (response.data.user) {
                    await setUser(response.data.user);
                }
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                });
            } else {
                Alert.alert('Error', 'No token received from server');
            }
        } catch (error) {
            console.error('Login error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            if (error.response?.status === 401) {
                Alert.alert(
                    'Login Failed',
                    'Invalid email or password. Please check your credentials and try again.',
                    [
                        {
                            text: 'OK',
                            style: 'cancel',
                        },
                        {
                            text: 'Sign Up',
                            onPress: () => navigation.navigate('SignUp'),
                        },
                    ]
                );
            } else if (error.response?.status === 422) {
                Alert.alert('Validation Error', 'Please check your email and password format.');
            } else if (error.response?.status === 429) {
                Alert.alert('Too Many Attempts', 'Please try again later.');
            } else {
                Alert.alert(
                    'Connection Error',
                    'Could not connect to the server. Please check your internet connection.',
                    [{ text: 'OK' }]
                );
            }
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
                />
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
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.forgotPassword}
                    onPress={() => navigation.navigate('ForgotPassword')}
                >
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