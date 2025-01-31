import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform, StatusBar,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from "../DarkMode/ThemeContext";
import { LogoDetailPopup } from './Popups/LogoDetailPopupProps';
import { NotificationPopup } from './Popups/NotificationPopup';
import CategoryDetailScreen from './CategoryDetailScreen';

const { width } = Dimensions.get('window');

const Stack = createStackNavigator();

const categories = [
    { id: 1, name: 'Logo', icon: 'star-outline' },
    { id: 2, name: 'T-Shirt', icon: 'shirt-outline' },
    { id: 3, name: 'Social Media', icon: 'share-social-outline' },
    { id: 4, name: 'Poster', icon: 'image-outline' },
    { id: 5, name: 'Business Card', icon: 'card-outline' },
    { id: 6, name: 'Logo', icon: 'star-outline' },
    { id: 7, name: 'T-Shirt', icon: 'shirt-outline' },
    { id: 8, name: 'Social Media', icon: 'share-social-outline' },
    { id: 9, name: 'Poster', icon: 'image-outline' },
    { id: 10, name: 'Business Card', icon: 'card-outline' },
];

const projects = [
    { id: 1, name: 'Cafe Logo', progress: 60, dueDate: '2023-05-15' },
    { id: 2, name: 'Festival Poster', progress: 40, dueDate: '2023-05-20' },
    { id: 3, name: 'Company Brochure', progress: 75, dueDate: '2023-05-18' },
];

const designExamples = [
    { id: 1, name: 'Modern Logo', price: 25, rating: 4.5, downloads: 1200, image: require('../assets/images/1.png'), description: 'A sleek and modern logo design for contemporary businesses.' },
    { id: 2, name: 'Festival Poster', price: 20, rating: 4.2, downloads: 800, image: require('../assets/images/2.jpg'), description: 'Vibrant festival poster design to attract attendees.' },
    { id: 3, name: 'Business Card', price: 15, rating: 4.8, downloads: 1500, image: require('../assets/images/3.jpg'), description: 'Professional business card design for networking.' },
    { id: 4, name: 'Modern Logo 2', price: 25, rating: 4.5, downloads: 1200, image: require('../assets/images/1.png'), description: 'Another modern logo design for versatile use.' },
    { id: 5, name: 'Festival Poster 2', price: 20, rating: 4.2, downloads: 800, image: require('../assets/images/2.jpg'), description: 'Eye-catching festival poster for music events.' },
    { id: 6, name: 'Business Card 2', price: 15, rating: 4.8, downloads: 1500, image: require('../assets/images/3.jpg'), description: 'Elegant business card design for professionals.' },
    { id: 7, name: 'Modern Logo 3', price: 25, rating: 4.5, downloads: 1200, image: require('../assets/images/1.png'), description: 'Minimalist modern logo for tech startups.' },
    { id: 8, name: 'Festival Poster 3', price: 20, rating: 4.2, downloads: 800, image: require('../assets/images/2.jpg'), description: 'Bold and colorful festival poster design.' },
    { id: 9, name: 'Business Card 3', price: 15, rating: 4.8, downloads: 1500, image: require('../assets/images/3.jpg'), description: 'Creative business card for artists and designers.' },
];

const notifications = [
    { id: '1', title: 'New Design Added', message: 'Check out the latest logo design!', time: '2 hours ago', isRead: false },
    { id: '2', title: 'Project Update', message: 'Your project "Cafe Logo" has been updated.', time: '1 day ago', isRead: true },
    { id: '3', title: 'Limited Time Offer', message: 'Get 20% off on all designs this week!', time: '2 days ago', isRead: false },
    { id: '4', title: 'New Design Added', message: 'Check out the latest logo design!', time: '2 hours ago', isRead: false },
    { id: '5', title: 'Project Update', message: 'Your project "Cafe Logo" has been updated.', time: '1 day ago', isRead: true },
    { id: '6', title: 'Limited Time Offer', message: 'Get 20% off on all designs this week!', time: '2 days ago', isRead: false },
    { id: '7', title: 'New Design Added', message: 'Check out the latest logo design!', time: '2 hours ago', isRead: false },
    { id: '8', title: 'Project Update', message: 'Your project "Cafe Logo" has been updated.', time: '1 day ago', isRead: true },
    { id: '9', title: 'Limited Time Offer', message: 'Get 20% off on all designs this week!', time: '2 days ago', isRead: false },
];

const HomeScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [activeCategory, setActiveCategory] = useState(1);
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNotificationPopupVisible, setIsNotificationPopupVisible] = useState(false);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
            paddingTop: StatusBar.currentHeight || 0,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333333' : '#e0e0e0',
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : '#333333',
        },
        searchBar: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#333333' : '#ffffff',
            borderRadius: 12,
            padding: 12,
            margin: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        searchInput: {
            flex: 1,
            marginLeft: 8,
            color: isDarkMode ? '#ffffff' : '#333333',
            fontSize: 16,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            margin: 16,
            color: isDarkMode ? '#ffffff' : '#333333',
        },
        categoryContainer: {
            flexDirection: 'row',
            paddingHorizontal: 16,
            marginBottom: 16,
        },
        categoryItem: {
            alignItems: 'center',
            marginRight: 16,
        },
        categoryIcon: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: isDarkMode ? '#444444' : '#e0e0e0',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8,
        },
        activeCategoryIcon: {
            backgroundColor: isDarkMode ? '#007AFF' : '#0066CC',
        },
        categoryText: {
            color: isDarkMode ? '#ffffff' : '#333333',
            fontSize: 12,
        },
        projectItem: {
            backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
            borderRadius: 12,
            padding: 16,
            marginHorizontal: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        projectHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        projectTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : '#333333',
        },
        projectDueDate: {
            fontSize: 12,
            color: isDarkMode ? '#999999' : '#666666',
        },
        progressBar: {
            height: 6,
            borderRadius: 3,
            backgroundColor: isDarkMode ? '#444444' : '#e0e0e0',
            marginTop: 8,
        },
        progressFill: {
            height: 6,
            borderRadius: 3,
        },
        designExamplesContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
        },
        designExampleItem: {
            backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
            borderRadius: 12,
            padding: 16,
            width: (width - 48) / 2,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        designExampleImage: {
            width: '100%',
            height: 120,
            borderRadius: 8,
            marginBottom: 8,
        },
        designExampleName: {
            fontSize: 14,
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : '#333333',
            marginBottom: 4,
        },
        designExamplePrice: {
            fontSize: 14,
            color: isDarkMode ? '#00BFFF' : '#007AFF',
            marginBottom: 4,
        },
        designExampleMeta: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        designExampleRating: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        designExampleDownloads: {
            fontSize: 12,
            color: isDarkMode ? '#999999' : '#666666',
        },
    });

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setIsNotificationPopupVisible(true)}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Ionicons name="notifications-outline" size={24} color={isDarkMode ? '#ffffff' : '#333333'} />
                        {notifications?.filter(n => !n.isRead).length > 0 && (
                            <View style={{
                                position: 'absolute',
                                right: -6,
                                top: -6,
                                backgroundColor: '#007AFF',
                                borderRadius: 10,
                                minWidth: 20,
                                height: 20,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Text style={{color: '#fff', fontSize: 12, fontWeight: 'bold'}}>
                                    {notifications?.filter(n => !n.isRead).length}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Welcome</Text>
                <View style={{ width: 24 }}></View>
            </View>

            {/* Scrollable Content */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                    {/* Search Bar */}
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color={isDarkMode ? '#999999' : '#666666'} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for designs..."
                            placeholderTextColor={isDarkMode ? '#999999' : '#666666'}
                        />
                    </View>

                    {/* Design Categories */}
                    <Text style={styles.sectionTitle}>Design Categories</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.categoryContainer}>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={styles.categoryItem}
                                    onPress={() => navigation.navigate('CategoryDetail', { category })}
                                >
                                    <View
                                        style={[
                                            styles.categoryIcon,
                                            activeCategory === category.id && styles.activeCategoryIcon,
                                        ]}
                                    >
                                        <Ionicons
                                            name={category.icon}
                                            size={24}
                                            color={
                                                activeCategory === category.id
                                                    ? (isDarkMode ? '#ffffff' : '#333333')
                                                    : (isDarkMode ? '#999999' : '#666666')
                                            }
                                        />
                                    </View>
                                    <Text style={styles.categoryText}>{category.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Current Projects */}
                    <Text style={styles.sectionTitle}>Current Projects</Text>
                    {projects.map((project) => (
                        <TouchableOpacity
                            key={project.id}
                            style={styles.projectItem}
                            onPress={() => {
                                // Show project details in a popup
                            }}
                        >
                            <View style={styles.projectHeader}>
                                <Text style={styles.projectTitle}>{project.name}</Text>
                                <Text style={styles.projectDueDate}>Due: {project.dueDate}</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${project.progress}%`,
                                            backgroundColor: isDarkMode ? '#00BFFF' : '#007AFF',
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.projectDueDate, { marginTop: 8 }]}>
                                Progress: {project.progress}%
                            </Text>
                        </TouchableOpacity>

                    ))}

                    {/* Design Examples */}
                    <Text style={styles.sectionTitle}>Design Examples</Text>
                    <View style={styles.designExamplesContainer}>
                        {designExamples.map((design) => (
                            <TouchableOpacity
                                key={design.id}
                                style={styles.designExampleItem}
                                onPress={() => {
                                    setSelectedDesign(design)
                                    setIsModalOpen(true)
                                }}
                            >
                                <Image
                                    source={design.image}
                                    style={styles.designExampleImage}
                                />
                                <Text style={styles.designExampleName}>{design.name}</Text>
                                <Text style={styles.designExamplePrice}>${design.price}</Text>
                                <View style={styles.designExampleMeta}>
                                    <View style={styles.designExampleRating}>
                                        <Ionicons name="star" size={16} color={isDarkMode ? '#FFD700' : '#FFA500'} />
                                        <Text style={[styles.designExampleDownloads, { marginLeft: 4 }]}>
                                            {design.rating}
                                        </Text>
                                    </View>
                                    <Text style={styles.designExampleDownloads}>{design.downloads} downloads</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Logo Detail Popup */}
            <LogoDetailPopup
                logo={selectedDesign}
                isVisible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isLightTheme={!isDarkMode}
            />

            {/* Notification Popup */}
            <NotificationPopup
                isVisible={isNotificationPopupVisible}
                onClose={() => setIsNotificationPopupVisible(false)}
                notifications={notifications}
                isDarkMode={isDarkMode}
            />
        </View>
    );
};

const App = () => {
    const { theme } = useTheme();
    return (

            <Stack.Navigator>
                <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false, }} />
                <Stack.Screen 
                    name="CategoryDetail" 
                    component={CategoryDetailScreen}  
                    options={({ route }) => ({ 
                        title: route.params.category.name,
                        headerStyle: {
                            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                        },
                        headerTintColor: theme === 'dark' ? '#ffffff' : '#333333',
                        headerTitleStyle: {
                            color: theme === 'dark' ? '#ffffff' : '#333333',
                        }
                    })} 
                />
            </Stack.Navigator>

    );
};

export default App;