import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Pressable,
    TextInput,
    Alert,
    ActivityIndicator,
    Platform,
    Dimensions,
} from 'react-native';
import { useTheme } from '../../DarkMode/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axiosInstance from '../../services/api.config';
import { getUser, setUser } from '../../services/storage';

export const EditProfileScreen = () => {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        age: '',
        gender: '',
        profile_photo: null,
    });

    const [newPhoto, setNewPhoto] = useState(null);

    const [userData, setUserData] = useState(null);

    useEffect(() => {
        loadUserData();
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        if (Platform.OS !== 'web') {
            const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            
            if (mediaStatus !== 'granted' && cameraStatus !== 'granted') {
                Alert.alert('Permission needed', 'Sorry, we need camera and gallery permissions to upload photos.');
            }
        }
    };

    const loadUserData = async () => {
        try {
            const userData = await getUser();
            if (userData) {
                setUserData(userData);
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone_number: userData.phone_number || '',
                    age: userData.age ? userData.age.toString() : '',
                    gender: userData.gender || '',
                    profile_photo: userData.profile_photo || null,
                });
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            Alert.alert('Error', 'Failed to load profile data');
        }
    };

    const pickImage = async () => {
        try {
            // Show action sheet for image source selection
            Alert.alert(
                'Select Photo',
                'Choose a photo from gallery or take a new one',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    },
                    {
                        text: 'Take Photo',
                        onPress: async () => {
                            const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ['image'],
                                allowsEditing: true,
                                aspect: [1, 1],
                                quality: 0.8,
                            });

                            if (!result.canceled && result.assets && result.assets.length > 0) {
                                setNewPhoto(result.assets[0].uri);
                            }
                        }
                    },
                    {
                        text: 'Choose from Gallery',
                        onPress: async () => {
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ['image'],
                                allowsEditing: true,
                                aspect: [1, 1],
                                quality: 0.8,
                            });

                            if (!result.canceled && result.assets && result.assets.length > 0) {
                                setNewPhoto(result.assets[0].uri);
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert(
                'Error',
                'Failed to pick image. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Validate required fields
            if (!formData.name?.trim()) {
                Alert.alert('Error', 'Name is required');
                return;
            }

            if (!formData.age || parseInt(formData.age) < 13) {
                Alert.alert('Error', 'Age must be at least 13');
                return;
            }

            if (!formData.gender) {
                Alert.alert('Error', 'Please select your gender');
                return;
            }

            let requestData;
            let headers = {
                'Accept': 'application/json'
            };

            // If we have a new photo, use FormData
            if (newPhoto) {
                const formDataToSend = new FormData();
                formDataToSend.append('name', formData.name.trim());
                formDataToSend.append('phone_number', formData.phone_number?.trim() || '');
                formDataToSend.append('age', formData.age.toString());
                formDataToSend.append('gender', formData.gender);

                const filename = newPhoto.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image';
                
                formDataToSend.append('profile_photo', {
                    uri: newPhoto,
                    name: filename,
                    type,
                });

                requestData = formDataToSend;
                headers['Content-Type'] = 'multipart/form-data';
                console.log('Sending profile update with FormData:', Object.fromEntries(formDataToSend));
            } else {
                // If no new photo, send as JSON
                requestData = {
                    name: formData.name.trim(),
                    age: parseInt(formData.age),
                    gender: formData.gender,
                    phone_number: formData.phone_number?.trim() || '',
                };

                headers['Content-Type'] = 'application/json';
                console.log('Sending profile update with JSON:', requestData);
            }

            console.log('Making PATCH request to /profile...');
            const response = await axiosInstance.patch('/profile', requestData, { headers });

            console.log('Profile update response:', response.data);

            if (response.data) {
                await setUser(response.data);
                Alert.alert('Success', 'Profile updated successfully');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            console.error('Error details:', error.response?.data);
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               'Failed to update profile';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, value, onChangeText, multiline = false, keyboardType }) => (
        <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isLightTheme ? '#333' : '#fff' }]}>
                {label}
            </Text>
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.multilineInput,
                    {
                        backgroundColor: isLightTheme ? '#fff' : '#2A2A2A',
                        color: isLightTheme ? '#000' : '#fff',
                        borderColor: isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                    },
                ]}
                value={value}
                onChangeText={(text) => {
                    // Only allow numbers
                    const numericValue = text.replace(/[^0-9]/g, '');
                    onChangeText(numericValue);
                }}
                multiline={multiline}
                placeholderTextColor={isLightTheme ? '#666' : '#aaa'}
                keyboardType={keyboardType}
            />
        </View>
    );

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: isLightTheme ? '#f8f9fa' : '#121212' }
            ]}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon
                        name="arrow-left"
                        size={24}
                        color={isLightTheme ? '#000' : '#fff'}
                    />
                </Pressable>
                <Text style={[styles.headerTitle, { color: isLightTheme ? '#000' : '#fff' }]}>
                    Edit Profile
                </Text>
                <Pressable
                    style={[styles.saveButton, { opacity: loading ? 0.7 : 1 }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                    )}
                </Pressable>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.photoSection}>
                    <Pressable onPress={pickImage} style={styles.photoContainer}>
                        <Image
                            source={
                                newPhoto
                                    ? { uri: newPhoto }
                                    : formData.profile_photo
                                        ? { uri: formData.profile_photo }
                                        : require('../../assets/images/4.jpg')
                            }
                            style={styles.profilePhoto}
                        />
                        <View style={styles.editIconContainer}>
                            <Icon name="camera" size={20} color="#fff" />
                        </View>
                    </Pressable>
                </View>

                <View style={styles.form}>
                    <InputField
                        label="Full Name"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                    />
                    
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: isLightTheme ? '#333' : '#fff' }]}>
                            Email
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isLightTheme ? '#f5f5f5' : '#1a1a1a',
                                    color: isLightTheme ? '#666' : '#888',
                                    borderColor: isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                                },
                            ]}
                            value={formData.email}
                            editable={false}
                            placeholderTextColor={isLightTheme ? '#666' : '#aaa'}
                        />
                    </View>

                    <InputField
                        label="Phone Number"
                        value={formData.phone_number}
                        onChangeText={(text) => {
                            // Only allow numbers and limit to 10 digits
                            const numericValue = text.replace(/[^0-9]/g, '');
                            if (numericValue.length <= 10) {
                                setFormData({ ...formData, phone_number: numericValue });
                            }
                        }}
                        keyboardType="numeric"
                    />

                    <InputField
                        label="Age"
                        value={formData.age}
                        onChangeText={(text) => {
                            // Only allow numbers
                            const numericValue = text.replace(/[^0-9]/g, '');
                            setFormData({ ...formData, age: numericValue });
                        }}
                        keyboardType="numeric"
                    />

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: isLightTheme ? '#333' : '#fff' }]}>
                            Gender
                        </Text>
                        <View style={styles.genderContainer}>
                            <Pressable
                                style={[
                                    styles.genderButton,
                                    formData.gender === 'male' && styles.genderButtonActive,
                                    {
                                        backgroundColor: isLightTheme ? '#fff' : '#2A2A2A',
                                    }
                                ]}
                                onPress={() => setFormData({ ...formData, gender: 'male' })}
                            >
                                <Text
                                    style={[
                                        styles.genderButtonText,
                                        formData.gender === 'male' && styles.genderButtonTextActive,
                                        { color: isLightTheme ? '#000' : '#fff' }
                                    ]}
                                >
                                    Male
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.genderButton,
                                    formData.gender === 'female' && styles.genderButtonActive,
                                    {
                                        backgroundColor: isLightTheme ? '#fff' : '#2A2A2A',
                                    }
                                ]}
                                onPress={() => setFormData({ ...formData, gender: 'female' })}
                            >
                                <Text
                                    style={[
                                        styles.genderButtonText,
                                        formData.gender === 'female' && styles.genderButtonTextActive,
                                        { color: isLightTheme ? '#000' : '#fff' }
                                    ]}
                                >
                                    Female
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 40 : 20,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 20 : 10,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    saveButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        minWidth: 80,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    photoSection: {
        alignItems: 'center',
        marginVertical: 25,
    },
    photoContainer: {
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    profilePhoto: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    editIconContainer: {
        position: 'absolute',
        right: 5,
        bottom: 5,
        backgroundColor: '#2196F3',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
    },
    form: {
        marginTop: 10,
    },
    inputContainer: {
        marginBottom: 25,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        marginLeft: 5,
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 1,
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 15,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    multilineInput: {
        height: 120,
        textAlignVertical: 'top',
        paddingTop: 15,
    },
    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    genderButton: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: 'center',
        borderColor: 'rgba(0,0,0,0.1)',
    },
    genderButtonActive: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    genderButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    genderButtonTextActive: {
        color: '#fff',
    },
}); 