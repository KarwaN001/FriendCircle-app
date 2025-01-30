import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    SectionList,
} from 'react-native';
import { useTheme } from "../DarkMode/ThemeContext";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LogoDetailPopup } from './Popups/LogoDetailPopupProps';

const { width } = Dimensions.get('window');

const logoData = [
    {
        title: "Business Cards",
        data: [
            { id: '1', name: 'Modern Business Card', creator: 'John Doe', image: require('../assets/images/1.png'), description: 'A sleek and modern business card design for professionals.', price: 25 },
            { id: '2', name: 'Minimalist Business Card', creator: 'Jane Smith', image: require('../assets/images/2.jpg'), description: 'Clean and minimalist business card design.', price: 20 },
            { id: '3', name: 'Creative Business Card', creator: 'Mike Johnson', image: require('../assets/images/3.jpg'), description: 'Unique and creative business card design to stand out.', price: 30 },
            { id: '4', name: 'Creative Business Card', creator: 'Mike Johnson', image: require('../assets/images/4.jpg'), description: 'Unique and creative business card design to stand out.', price: 30 },
        ]
    },
    {
        title: "T-Shirts",
        data: [
            { id: '1', name: 'Cool T-Shirt Design', creator: 'Emily Brown', image: require('../assets/images/1.png'), description: 'Eye-catching t-shirt design for casual wear.', price: 15 },
            { id: '2', name: 'Vintage T-Shirt Logo', creator: 'Alex Lee', image: require('../assets/images/1.png'), description: 'Retro-inspired t-shirt logo design.', price: 18 },
            { id: '3', name: 'Modern T-Shirt Print', creator: 'Sarah Wilson', image: require('../assets/images/1.png'), description: 'Contemporary t-shirt print design for the fashion-forward.', price: 22 },
        ]
    },
    {
        title: "Social Media",
        data: [
            { id: '7', name: 'Instagram Profile Pic', creator: 'Tom Baker', image: require('../assets/images/2.jpg'), description: 'Eye-catching profile picture for Instagram.', price: 10 },
            { id: '8', name: 'Facebook Cover', creator: 'Lisa Chen', image: require('../assets/images/2.jpg'), description: 'Engaging Facebook cover design.', price: 12 },

        ]
    },
    {
        title: "Other",
        data: [
            { id: '10', name: 'App Icon', creator: 'Emma Watson', image: require('../assets/images/3.jpg'), description: 'Modern and recognizable app icon design.', price: 35 },
            { id: '11', name: 'Website Header', creator: 'Chris Evans', image:require('../assets/images/3.jpg'), description: 'Impressive website header design.', price: 40 },
            { id: '12', name: 'Podcast Cover', creator: 'Olivia Wilde', image: require('../assets/images/3.jpg'), description: 'Attractive podcast cover art design.', price: 25 },
        ]
    },
];

export const SearchScreen = () => {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLogo, setSelectedLogo] = useState(null);

    const filteredLogoData = logoData.map(section => ({
        ...section,
        data: section.data.filter(logo =>
            logo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            logo.creator.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(section => section.data.length > 0);

    const renderLogoItem = (item) => (
        <TouchableOpacity style={styles.logoItem} onPress={() => setSelectedLogo(item)}>
            <Image source={item.image } style={styles.logoImage} />
            <Text style={[styles.logoName, { color: isLightTheme ? '#333' : '#fff' }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.logoCreator, { color: isLightTheme ? '#666' : '#ccc' }]} numberOfLines={1}>{item.creator}</Text>
        </TouchableOpacity>
    );

    const renderSectionHeader = ({ section: { title } }) => (
        <Text style={[styles.sectionHeader, { color: isLightTheme ? '#333' : '#fff', backgroundColor: isLightTheme ? '#f5f5f5' : '#1a1a1a' }]}>
            {title}
        </Text>
    );

    const renderSectionContent = ({ section }) => (
        <View style={styles.sectionContent}>
            {section.data.map((item, index) => (
                <View key={item.id} style={[styles.logoItem, index % 2 === 1 && styles.logoItemRight]}>
                    {renderLogoItem(item)}
                </View>
            ))}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: isLightTheme ? '#f5f5f5' : '#1a1a1a' }]}>
            <View style={[styles.searchContainer, { backgroundColor: isLightTheme ? '#fff' : '#333' }]}>
                <Ionicons name="search-outline" size={24} color={isLightTheme ? '#666' : '#ccc'} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: isLightTheme ? '#333' : '#fff' }]}
                    placeholder="Search logos..."
                    placeholderTextColor={isLightTheme ? '#999' : '#666'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={24} color={isLightTheme ? '#666' : '#ccc'} />
                    </TouchableOpacity>
                )}
            </View>

            <Text style={[styles.resultsText, { color: isLightTheme ? '#333' : '#fff' }]}>
                {filteredLogoData.reduce((acc, section) => acc + section.data.length, 0)} results found
            </Text>

            <SectionList
                sections={filteredLogoData}
                renderSectionHeader={renderSectionHeader}
                renderItem={() => null}
                renderSectionFooter={renderSectionContent}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.logoList}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: isLightTheme ? '#666' : '#ccc' }]}>
                        No logos found. Try a different search term.
                    </Text>
                }
            />

            <LogoDetailPopup
                logo={selectedLogo}
                isVisible={!!selectedLogo}
                onClose={() => setSelectedLogo(null)}
                isLightTheme={isLightTheme}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 25,
        marginBottom: 16,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    clearButton: {
        padding: 5,
    },
    resultsText: {
        fontSize: 14,
        marginBottom: 16,
    },
    logoList: {
        paddingBottom: 16,
    },
    sectionHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingVertical: 8,
        marginBottom: 14,
    },
    sectionContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    logoItem: {
        width: (width - 48) / 2,
        marginBottom: 16,
    },
    logoItemRight: {
        marginLeft: 16,
    },
    logoImage: {
        width: '100%',
        height: (width - 48) / 2,
        borderRadius: 8,
        marginBottom: 8,
    },
    logoName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    logoCreator: {
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 32,
        fontSize: 16,
    },
});