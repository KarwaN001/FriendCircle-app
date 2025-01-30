import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Animated,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { useTheme } from "../DarkMode/ThemeContext";
import Ionicons from 'react-native-vector-icons/Ionicons';

const CategoryDetailScreen = ({ route, navigation }) => {
    const { category } = route.params;
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [colors, setColors] = useState('');
    const [image, setImage] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const popupAnimation = new Animated.Value(0);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
            padding: 16,
        },
        label: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : '#333333',
            marginBottom: 8,
        },
        input: {
            backgroundColor: isDarkMode ? '#333333' : '#ffffff',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            color: isDarkMode ? '#ffffff' : '#333333',
        },
        button: {
            backgroundColor: '#007AFF',
            borderRadius: 8,
            padding: 16,
            alignItems: 'center',
        },
        buttonText: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 'bold',
        },
        imageButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#333333' : '#ffffff',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
        },
        imageButtonText: {
            marginLeft: 8,
            color: isDarkMode ? '#ffffff' : '#333333',
        },
        selectedImage: {
            width: '100%',
            height: 200,
            borderRadius: 8,
            marginBottom: 16,
        },
        infoText: {
            color: isDarkMode ? '#cccccc' : '#666666',
            marginTop: 16,
            textAlign: 'center',
        },
        popup: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: isDarkMode ? '#333333' : '#ffffff',
            padding: 16,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
        },
        popupText: {
            color: isDarkMode ? '#ffffff' : '#333333',
            fontSize: 16,
            marginBottom: 8,
        },
        safeArea: {
            flex: 1,
            backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
        }
    });

    const handleCreate = () => {
        // Here you would typically send the data to your backend
        // For now, we'll just show a popup
        setShowPopup(true);
        Animated.timing(popupAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Add the new project to the current projects list
        // This is where you'd update your app's state or make an API call
        const newProject = {
            id: Math.random().toString(),
            name: name,
            progress: 0,
            dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days from now
        };

        // Navigate back to the home screen after a delay
        setTimeout(() => {
            navigation.navigate('Home', { newProject });
        }, 2000);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar 
                backgroundColor={isDarkMode ? '#1a1a1a' : '#f5f5f5'}
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            />
            <ScrollView style={styles.container}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter design Title"
                    placeholderTextColor={isDarkMode ? '#999999' : '#666666'}
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, { height: 100 }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe how you want your design to look"
                    placeholderTextColor={isDarkMode ? '#999999' : '#666666'}
                    multiline
                />

                <Text style={styles.label}>Colors (Optional)</Text>
                <TextInput
                    style={styles.input}
                    value={colors}
                    onChangeText={setColors}
                    placeholder="Enter preferred colors"
                    placeholderTextColor={isDarkMode ? '#999999' : '#666666'}
                />

                <TouchableOpacity style={styles.imageButton} onPress={() => {/* Image selection logic */}}>
                    <Ionicons name="image-outline" size={24} color={isDarkMode ? '#ffffff' : '#333333'} />
                    <Text style={styles.imageButtonText}>Upload Image (Optional)</Text>
                </TouchableOpacity>

                {image && <Image source={{ uri: image }} style={styles.selectedImage} />}

                <TouchableOpacity style={styles.button} onPress={handleCreate}>
                    <Text style={styles.buttonText}>Create - $15</Text>
                </TouchableOpacity>

                <Text style={styles.infoText}>
                    Your logo will be designed in approximately 4 days.
                    We will provide 3 samples of your logo for you to choose from.
                </Text>

                {showPopup && (
                    <Animated.View style={[styles.popup, { transform: [{ translateY: popupAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [300, 0]
                            }) }] }]}>
                        <Text style={styles.popupText}>Your design request has been submitted!</Text>
                        <Text style={styles.popupText}>Check your current projects for updates.</Text>
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default CategoryDetailScreen;