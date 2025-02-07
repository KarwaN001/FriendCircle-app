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

const { width, height } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male'); // default to male
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
        genderContainer: {
            flexDirection: 'row',
            width: width * 0.8,
            marginBottom: 15,
            justifyContent: 'space-between',
        },
        genderButton: {
            width: width * 0.38,
            height: 50,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
            borderWidth: 1,
            borderColor: '#ddd',
        },
        genderButtonActive: {
            backgroundColor: '#007AFF',
            borderColor: '#007AFF',
        },
        genderButtonText: {
            fontSize: 16,
            color: '#666',
        },
        genderButtonTextActive: {
            color: '#fff',
        },
    });

    const handleSignUp = async () => {
        // Basic validation
        if (!name || !email || !phoneNumber || !password || !confirmPassword || !age) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (parseInt(age) < 6) {
            Alert.alert('Error', 'You must be at least 6 years old to register');
            return;
        }

        try {
            const response = await axiosInstance.post('/register', {
                name,
                email,
                password,
                password_confirmation: confirmPassword,
                phone_number: `+964${phoneNumber}`,
                age: parseInt(age),
                gender,
                device_name: `${Platform.OS}-${Platform.Version}`,
            });

            console.log('Registration response:', response.data);
            Alert.alert(
                'Success',
                'Registration successful! Please check your email for verification code.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('OTPVerification', { 
                            verification_id: response.data.verification_id 
                        })
                    }
                ]
            );
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.response?.data?.error || 'An error occurred during registration';
            Alert.alert('Registration Failed', errorMessage);
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
                <TextInput
                    style={styles.input}
                    placeholder="Age"
                    placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    maxLength={2}
                />
                <View style={styles.genderContainer}>
                    <TouchableOpacity 
                        style={[
                            styles.genderButton, 
                            gender === 'male' && styles.genderButtonActive
                        ]}
                        onPress={() => setGender('male')}
                    >
                        <Text style={[
                            styles.genderButtonText,
                            gender === 'male' && styles.genderButtonTextActive
                        ]}>Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.genderButton, 
                            gender === 'female' && styles.genderButtonActive
                        ]}
                        onPress={() => setGender('female')}
                    >
                        <Text style={[
                            styles.genderButtonText,
                            gender === 'female' && styles.genderButtonTextActive
                        ]}>Female</Text>
                    </TouchableOpacity>
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