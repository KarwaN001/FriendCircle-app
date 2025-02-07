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
        phone: '',
        bio: '',
        profile_photo: null,
    });

    const [newPhoto, setNewPhoto] = useState(null);

    useEffect(() => {
        loadUserData();
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload photos.');
            }
        }
    };

    const loadUserData = async () => {
        try {
            const userData = await getUser();
            if (userData) {
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    bio: userData.bio || '',
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
            // Request permission
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(
                        'Permission Needed',
                        'Sorry, we need camera roll permissions to upload photos.',
                        [{ text: 'OK' }]
                    );
                    return;
                }
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setNewPhoto(result.assets[0].uri);
            }
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
            const formDataToSend = new FormData();
            
            // Append text fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('bio', formData.bio);

            // Append photo if new one selected
            if (newPhoto) {
                const filename = newPhoto.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image';
                
                formDataToSend.append('profile_photo', {
                    uri: newPhoto,
                    name: filename,
                    type,
                });
            }

            const response = await axiosInstance.post('/profile/update', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data) {
                await setUser(response.data);
                Alert.alert('Success', 'Profile updated successfully');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, value, onChangeText, multiline = false }) => (
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
                onChangeText={onChangeText}
                multiline={multiline}
                placeholderTextColor={isLightTheme ? '#666' : '#aaa'}
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
                    
                    <InputField
                        label="Email"
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                    />

                    <InputField
                        label="Phone Number"
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    />

                    <InputField
                        label="Bio"
                        value={formData.bio}
                        onChangeText={(text) => setFormData({ ...formData, bio: text })}
                        multiline={true}
                    />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 40 : 20,
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
        borderWidth: 3,
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
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
}); 