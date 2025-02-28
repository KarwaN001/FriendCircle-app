import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from "../../DarkMode/ThemeContext";

export const CreateGroupScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#121212' : '#F8F9FA',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            paddingTop: Platform.OS === 'ios' ? 50 : 16,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333333' : '#F0F0F0',
        },
        backButton: {
            padding: 8,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginLeft: 16,
        },
        content: {
            padding: 20,
        },
        inputContainer: {
            marginBottom: 20,
        },
        label: {
            fontSize: 16,
            fontWeight: '500',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginBottom: 8,
        },
        input: {
            backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            borderWidth: 1,
            borderColor: isDarkMode ? '#444444' : '#E0E0E0',
        },
        descriptionInput: {
            height: 120,
            textAlignVertical: 'top',
        },
        createButton: {
            backgroundColor: '#007AFF',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            marginTop: 20,
        },
        createButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons 
                        name="arrow-back" 
                        size={24} 
                        color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} 
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create New Group</Text>
            </View>
            
            <ScrollView style={styles.content}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Group Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter group name"
                        placeholderTextColor={isDarkMode ? '#888888' : '#999999'}
                        value={groupName}
                        onChangeText={setGroupName}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.descriptionInput]}
                        placeholder="Enter group description"
                        placeholderTextColor={isDarkMode ? '#888888' : '#999999'}
                        value={groupDescription}
                        onChangeText={setGroupDescription}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <TouchableOpacity 
                    style={styles.createButton}
                    onPress={() => {
                        // Handle group creation logic here
                        navigation.goBack();
                    }}
                >
                    <Text style={styles.createButtonText}>Create Group</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}; 