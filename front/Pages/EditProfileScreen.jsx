import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, Pressable, ScrollView, Platform } from 'react-native';
import { useTheme } from '../DarkMode/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';

export const EditProfileScreen = () => {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';
    
    const [profileData, setProfileData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 234 567 890',
        profileImage: require('../assets/images/4.jpg'),
    });

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
            setProfileData(prev => ({
                ...prev,
                profileImage: { uri: result.assets[0].uri }
            }));
        }
    };

    const handleSave = () => {
        // Implement save functionality
        console.log('Save profile:', profileData);
    };

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: isLightTheme ? '#f5f5f5' : '#1A1A1A' }
            ]}
        >
            <View style={[
                styles.header,
                { backgroundColor: isLightTheme ? '#fff' : '#2A2A2A' }
            ]}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={profileData.profileImage}
                        style={styles.profileImage}
                    />
                    <Pressable
                        style={styles.editImageButton}
                        onPress={pickImage}
                    >
                        <Icon name="camera" size={18} color="#fff" />
                    </Pressable>
                </View>
            </View>

            <View style={[
                styles.formContainer,
                { backgroundColor: isLightTheme ? '#fff' : '#2A2A2A' }
            ]}>
                <View style={styles.inputGroup}>
                    <Text style={[
                        styles.label,
                        { color: isLightTheme ? '#666' : '#aaa' }
                    ]}>First Name</Text>
                    <TextInput
                        style={[
                            styles.input,
                            { 
                                color: isLightTheme ? '#000' : '#fff',
                                backgroundColor: isLightTheme ? '#f5f5f5' : '#333'
                            }
                        ]}
                        value={profileData.firstName}
                        onChangeText={(text) => setProfileData(prev => ({ ...prev, firstName: text }))}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[
                        styles.label,
                        { color: isLightTheme ? '#666' : '#aaa' }
                    ]}>Last Name</Text>
                    <TextInput
                        style={[
                            styles.input,
                            { 
                                color: isLightTheme ? '#000' : '#fff',
                                backgroundColor: isLightTheme ? '#f5f5f5' : '#333'
                            }
                        ]}
                        value={profileData.lastName}
                        onChangeText={(text) => setProfileData(prev => ({ ...prev, lastName: text }))}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[
                        styles.label,
                        { color: isLightTheme ? '#666' : '#aaa' }
                    ]}>Email</Text>
                    <TextInput
                        style={[
                            styles.input,
                            { 
                                color: isLightTheme ? '#666' : '#aaa',
                                backgroundColor: isLightTheme ? '#f5f5f5' : '#333'
                            }
                        ]}
                        value={profileData.email}
                        editable={false}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[
                        styles.label,
                        { color: isLightTheme ? '#666' : '#aaa' }
                    ]}>Phone</Text>
                    <TextInput
                        style={[
                            styles.input,
                            { 
                                color: isLightTheme ? '#666' : '#aaa',
                                backgroundColor: isLightTheme ? '#f5f5f5' : '#333'
                            }
                        ]}
                        value={profileData.phone}
                        editable={false}
                    />
                </View>

                <Pressable
                    style={[
                        styles.saveButton,
                        { backgroundColor: isLightTheme ? '#1a73e8' : '#64B5F6' }
                    ]}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        padding: 20,
        marginBottom: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 130,
        height: 130,
        borderRadius: 65,
    },
    editImageButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#1a73e8',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        padding: 16,
        margin: 8,
        borderRadius: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        height: 48,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    saveButton: {
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 