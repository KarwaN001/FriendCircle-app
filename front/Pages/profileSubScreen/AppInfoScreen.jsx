import { View, Text, StyleSheet, ScrollView, Linking, Platform, TouchableOpacity, StatusBar } from 'react-native';
import { useTheme } from '../../DarkMode/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

export const AppInfoScreen = () => {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';
    const navigation = useNavigation();

    const handleEmailPress = (email) => {
        Linking.openURL(`mailto:${email}`);
    };

    const primaryColor = isLightTheme ? '#4361EE' : '#4CC9F0';
    const backgroundColor = isLightTheme ? '#F7F7FC' : '#121212';
    const cardBackground = isLightTheme ? '#FFFFFF' : '#1E1E1E';
    const textPrimary = isLightTheme ? '#333333' : '#FFFFFF';
    const textSecondary = isLightTheme ? '#666666' : '#BBBBBB';

    return (
        <View style={{ flex: 1, backgroundColor }}>
            <StatusBar
                barStyle={isLightTheme ? 'dark-content' : 'light-content'}
                backgroundColor="transparent"
                translucent
            />
            <View style={[styles.header, { 
                backgroundColor: primaryColor,
                paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
            }]}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                
                <View style={styles.headerContent}>
                    <Icon 
                        name="account-group-outline" 
                        size={60} 
                        color="#fff" 
                        style={styles.headerIcon}
                    />
                    <Text style={styles.headerTitle}>FriendCircle</Text>
                    <Text style={styles.headerSubtitle}>Group-Based Location Sharing & Chat App</Text>
                </View>
            </View>

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Key Features Section */}
                <View style={[styles.section, { backgroundColor: cardBackground }]}>
                    <Text style={[styles.sectionTitle, { color: primaryColor }]}>
                        Key Features
                    </Text>
                    <View style={styles.featureList}>
                        <FeatureItem 
                            icon="account-group" 
                            title="Group Management"
                            description="Create and join multiple groups, invite members, and manage settings"
                            primaryColor={primaryColor}
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                        />
                        <FeatureItem 
                            icon="map-marker" 
                            title="Location Sharing"
                            description="Real-time location tracking with privacy controls"
                            primaryColor={primaryColor}
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                        />
                        <FeatureItem 
                            icon="chat" 
                            title="Group Chat"
                            description="Real-time messaging with media sharing support"
                            primaryColor={primaryColor}
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                        />
                        <FeatureItem 
                            icon="shield-check" 
                            title="Privacy & Security"
                            description="Secure authentication and granular privacy controls"
                            primaryColor={primaryColor}
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                        />
                    </View>
                </View>

                {/* Team Section */}
                <View style={[styles.section, { backgroundColor: cardBackground }]}>
                    <Text style={[styles.sectionTitle, { color: primaryColor }]}>
                        Development Team
                    </Text>
                    <View style={styles.teamList}>
                        <TeamMember
                            name="Karwan"
                            role="Frontend Developer"
                            email="karwanusf1@gmail.com"
                            primaryColor={primaryColor}
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                            onEmailPress={handleEmailPress}
                        />
                        <TeamMember
                            name="Rezdar"
                            role="Backend Developer"
                            email="rezdar.00166214@gmail.com"
                            primaryColor={primaryColor}
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                            onEmailPress={handleEmailPress}
                        />
                    </View>
                </View>

                {/* Technical Info */}
                <View style={[styles.section, { backgroundColor: cardBackground }]}>
                    <Text style={[styles.sectionTitle, { color: primaryColor }]}>
                        Technical Stack
                    </Text>
                    <View style={styles.techList}>
                        <TechItem 
                            title="Frontend" 
                            description="React Native"
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                            primaryColor={primaryColor}
                        />
                        <TechItem 
                            title="Backend" 
                            description="Laravel PHP Framework"
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                            primaryColor={primaryColor}
                        />
                        <TechItem 
                            title="Database" 
                            description="MySQL"
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                            primaryColor={primaryColor}
                        />
                        <TechItem 
                            title="Real-time" 
                            description="WebSocket"
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                            primaryColor={primaryColor}
                        />
                    </View>
                </View>

                <Text style={[styles.version, { color: textSecondary }]}>
                    Version 1.0.0
                </Text>
            </ScrollView>
        </View>
    );
};

const FeatureItem = ({ icon, title, description, primaryColor, textPrimary, textSecondary }) => (
    <View style={styles.featureItem}>
        <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}15` }]}>
            <Icon name={icon} size={24} color={primaryColor} />
        </View>
        <View style={styles.featureTextContainer}>
            <Text style={[styles.featureTitle, { color: textPrimary }]}>{title}</Text>
            <Text style={[styles.featureDescription, { color: textSecondary }]}>{description}</Text>
        </View>
    </View>
);

const TeamMember = ({ name, role, email, primaryColor, textPrimary, textSecondary, onEmailPress }) => (
    <View style={styles.teamMember}>
        <View style={[styles.teamIconContainer, { backgroundColor: `${primaryColor}15` }]}>
            <Icon name="account" size={32} color={primaryColor} />
        </View>
        <Text style={[styles.teamName, { color: textPrimary }]}>{name}</Text>
        <Text style={[styles.teamRole, { color: textSecondary }]}>{role}</Text>
        <TouchableOpacity onPress={() => onEmailPress(email)}>
            <Text style={[styles.teamEmail, { color: primaryColor }]}>
                {email}
            </Text>
        </TouchableOpacity>
    </View>
);

const TechItem = ({ title, description, textPrimary, textSecondary, primaryColor }) => (
    <View style={styles.techItem}>
        <View style={styles.techContent}>
            <View style={[styles.techDot, { backgroundColor: primaryColor }]} />
            <Text style={[styles.techTitle, { color: textPrimary }]}>{title}</Text>
        </View>
        <Text style={[styles.techDescription, { color: textSecondary }]}>{description}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    header: {
        paddingBottom: 32,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        zIndex: 10,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerIcon: {
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        maxWidth: '80%',
    },
    content: {
        padding: 16,
    },
    section: {
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 16,
        marginTop: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    featureList: {
        gap: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 6,
    },
    featureDescription: {
        fontSize: 15,
        lineHeight: 22,
    },
    teamList: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 24,
    },
    teamMember: {
        alignItems: 'center',
        minWidth: 150,
    },
    teamIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    teamName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    teamRole: {
        fontSize: 15,
        marginBottom: 6,
    },
    teamEmail: {
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    techList: {
        gap: 16,
    },
    techItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(150, 150, 150, 0.1)',
    },
    techContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    techDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 10,
    },
    techTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    techDescription: {
        fontSize: 15,
    },
    version: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 14,
    },
}); 