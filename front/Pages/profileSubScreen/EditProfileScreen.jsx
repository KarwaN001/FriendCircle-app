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
import Sizing from '../../utils/Sizing';

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
                        size={Sizing.deviceWidth * 0.05}
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
                        <ActivityIndicator color="#fff" size={Sizing.deviceWidth * 0.035} />
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
                            <Icon 
                                name="camera" 
                                size={Sizing.deviceWidth * 0.04} 
                                color="#fff" 
                            />
                        </View>
                    </Pressable>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: isLightTheme ? '#333' : '#fff' }]}>
                            Full Name
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isLightTheme ? '#fff' : '#2A2A2A',
                                    color: isLightTheme ? '#000' : '#fff',
                                    borderColor: isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                                },
                            ]}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholderTextColor={isLightTheme ? '#666' : '#aaa'}
                        />
                    </View>
                    
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

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: isLightTheme ? '#333' : '#fff' }]}>
                            Phone Number
                        </Text>
                        <View style={[
                            styles.phoneInputContainer,
                            {
                                backgroundColor: isLightTheme ? '#fff' : '#2A2A2A',
                                borderColor: isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                            }
                        ]}>
                            <Text style={[
                                styles.phonePrefix,
                                { color: isLightTheme ? '#000' : '#fff' }
                            ]}>+964</Text>
                            <TextInput
                                style={[
                                    styles.phoneInput,
                                    {
                                        color: isLightTheme ? '#000' : '#fff',
                                    },
                                ]}
                                value={formData.phone_number}
                                onChangeText={(text) => {
                                    const numericValue = text.replace(/[^0-9]/g, '');
                                    if (numericValue.length <= 10) {
                                        setFormData({ ...formData, phone_number: numericValue });
                                    }
                                }}
                                maxLength={10}
                                keyboardType="numeric"
                                placeholderTextColor={isLightTheme ? '#666' : '#aaa'}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: isLightTheme ? '#333' : '#fff' }]}>
                            Age
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isLightTheme ? '#fff' : '#2A2A2A',
                                    color: isLightTheme ? '#000' : '#fff',
                                    borderColor: isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                                },
                            ]}
                            value={formData.age}
                            onChangeText={(text) => {
                                const numericValue = text.replace(/[^0-9]/g, '');
                                if (numericValue.length <= 2) {
                                    setFormData({ ...formData, age: numericValue });
                                }
                            }}
                            maxLength={2}
                            keyboardType="numeric"
                            placeholderTextColor={isLightTheme ? '#666' : '#aaa'}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: isLightTheme ? '#333' : '#fff' }]}>
                            Gender
                        </Text>
                        <View style={styles.genderContainer}>
                            <Pressable
                                style={[
                                    styles.genderOption,
                                    formData.gender === 'male' && styles.genderOptionActive,
                                    {
                                        backgroundColor: isLightTheme 
                                            ? formData.gender === 'male' 
                                                ? 'rgba(33, 150, 243, 0.1)' 
                                                : '#fff' 
                                            : formData.gender === 'male'
                                                ? 'rgba(33, 150, 243, 0.2)'
                                                : '#2A2A2A'
                                    }
                                ]}
                                onPress={() => setFormData({ ...formData, gender: 'male' })}
                            >
                                <View style={[
                                    styles.radioOuter,
                                    formData.gender === 'male' && styles.radioOuterActive,
                                    { borderColor: isLightTheme ? '#2196F3' : '#fff' }
                                ]}>
                                    {formData.gender === 'male' && (
                                        <View style={styles.radioInner} />
                                    )}
                                </View>
                                <Icon 
                                    name="gender-male" 
                                    size={Sizing.deviceWidth * 0.055} 
                                    color={formData.gender === 'male' ? '#2196F3' : isLightTheme ? '#666' : '#999'} 
                                    style={styles.genderIcon}
                                />
                                <Text
                                    style={[
                                        styles.genderText,
                                        formData.gender === 'male' && styles.genderTextActive,
                                        { color: isLightTheme ? formData.gender === 'male' ? '#2196F3' : '#666' : '#fff' }
                                    ]}
                                >
                                    Male
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.genderOption,
                                    formData.gender === 'female' && styles.genderOptionActive,
                                    {
                                        backgroundColor: isLightTheme 
                                            ? formData.gender === 'female' 
                                                ? 'rgba(33, 150, 243, 0.1)' 
                                                : '#fff' 
                                            : formData.gender === 'female'
                                                ? 'rgba(33, 150, 243, 0.2)'
                                                : '#2A2A2A'
                                    }
                                ]}
                                onPress={() => setFormData({ ...formData, gender: 'female' })}
                            >
                                <View style={[
                                    styles.radioOuter,
                                    formData.gender === 'female' && styles.radioOuterActive,
                                    { borderColor: isLightTheme ? '#2196F3' : '#fff' }
                                ]}>
                                    {formData.gender === 'female' && (
                                        <View style={styles.radioInner} />
                                    )}
                                </View>
                                <Icon 
                                    name="gender-female" 
                                    size={Sizing.deviceWidth * 0.055} 
                                    color={formData.gender === 'female' ? '#2196F3' : isLightTheme ? '#666' : '#999'} 
                                    style={styles.genderIcon}
                                />
                                <Text
                                    style={[
                                        styles.genderText,
                                        formData.gender === 'female' && styles.genderTextActive,
                                        { color: isLightTheme ? formData.gender === 'female' ? '#2196F3' : '#666' : '#fff' }
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
        paddingTop: Platform.OS === 'ios' ? Sizing.deviceHeight * 0.04 : Sizing.deviceHeight * 0.02,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: Sizing.deviceWidth * 0.04,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Sizing.deviceWidth * 0.04,
        paddingVertical: Sizing.deviceHeight * 0.015,
        marginBottom: Sizing.deviceHeight * 0.015,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: {
        padding: Sizing.deviceWidth * 0.015,
        borderRadius: Sizing.deviceWidth * 0.01,
        backgroundColor: 'rgba(33, 150, 243, 0.08)',
    },
    headerTitle: {
        fontSize: Sizing.deviceWidth * 0.042,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    saveButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: Sizing.deviceWidth * 0.035,
        paddingVertical: Sizing.deviceHeight * 0.01,
        borderRadius: Sizing.deviceWidth * 0.02,
        minWidth: Sizing.deviceWidth * 0.18,
        alignItems: 'center',
        shadowColor: '#2196F3',
        shadowOffset: {
            width: 0,
            height: Sizing.deviceHeight * 0.001,
        },
        shadowOpacity: 0.25,
        shadowRadius: Sizing.deviceWidth * 0.015,
        elevation: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: Sizing.deviceWidth * 0.032,
    },
    photoSection: {
        alignItems: 'center',
        marginVertical: Sizing.deviceHeight * 0.025,
    },
    photoContainer: {
        position: 'relative',
        padding: Sizing.deviceWidth * 0.008,
        backgroundColor: '#fff',
        borderRadius: Sizing.deviceWidth * 0.12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: Sizing.deviceHeight * 0.002,
        },
        shadowOpacity: 0.2,
        shadowRadius: Sizing.deviceWidth * 0.015,
        elevation: 6,
    },
    profilePhoto: {
        width: Sizing.deviceWidth * 0.24,
        height: Sizing.deviceWidth * 0.24,
        borderRadius: Sizing.deviceWidth * 0.12,
        borderWidth: Sizing.deviceWidth * 0.003,
        borderColor: '#2196F3',
    },
    editIconContainer: {
        position: 'absolute',
        right: -Sizing.deviceWidth * 0.008,
        bottom: -Sizing.deviceWidth * 0.008,
        backgroundColor: '#2196F3',
        width: Sizing.deviceWidth * 0.07,
        height: Sizing.deviceWidth * 0.07,
        borderRadius: Sizing.deviceWidth * 0.035,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: Sizing.deviceWidth * 0.003,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    form: {
        marginTop: Sizing.deviceHeight * 0.01,
    },
    inputContainer: {
        marginBottom: Sizing.deviceHeight * 0.018,
    },
    label: {
        fontSize: Sizing.deviceWidth * 0.032,
        fontWeight: '600',
        marginBottom: Sizing.deviceHeight * 0.008,
        marginLeft: Sizing.deviceWidth * 0.01,
        letterSpacing: 0.3,
    },
    input: {
        borderWidth: 1,
        borderRadius: Sizing.deviceWidth * 0.02,
        height: Sizing.deviceHeight * 0.052,
        paddingHorizontal: Sizing.deviceWidth * 0.035,
        fontSize: Sizing.deviceWidth * 0.032,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    multilineInput: {
        height: Sizing.deviceHeight * 0.1,
        textAlignVertical: 'top',
        paddingTop: Sizing.deviceHeight * 0.012,
    },
    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Sizing.deviceWidth * 0.03,
        height: Sizing.deviceHeight * 0.052,
    },
    genderOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Sizing.deviceWidth * 0.03,
        borderRadius: Sizing.deviceWidth * 0.02,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    genderOptionActive: {
        borderColor: '#2196F3',
    },
    radioOuter: {
        width: Sizing.deviceWidth * 0.042,
        height: Sizing.deviceWidth * 0.042,
        borderRadius: Sizing.deviceWidth * 0.021,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Sizing.deviceWidth * 0.015,
    },
    radioOuterActive: {
        borderColor: '#2196F3',
    },
    radioInner: {
        width: Sizing.deviceWidth * 0.021,
        height: Sizing.deviceWidth * 0.021,
        borderRadius: Sizing.deviceWidth * 0.0105,
        backgroundColor: '#2196F3',
    },
    genderIcon: {
        marginRight: Sizing.deviceWidth * 0.015,
    },
    genderText: {
        fontSize: Sizing.deviceWidth * 0.032,
        fontWeight: '500',
    },
    genderTextActive: {
        color: '#2196F3',
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: Sizing.deviceWidth * 0.02,
        height: Sizing.deviceHeight * 0.052,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    phonePrefix: {
        paddingHorizontal: Sizing.deviceWidth * 0.03,
        fontSize: Sizing.deviceWidth * 0.032,
        fontWeight: '500',
        borderRightWidth: 1,
        borderRightColor: 'rgba(0,0,0,0.1)',
        height: '100%',
        textAlignVertical: 'center',
    },
    phoneInput: {
        flex: 1,
        paddingHorizontal: Sizing.deviceWidth * 0.03,
        fontSize: Sizing.deviceWidth * 0.032,
    },
}); 