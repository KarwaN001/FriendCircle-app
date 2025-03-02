import { View, Text, StyleSheet, ScrollView, Linking, Platform } from 'react-native';
import { useTheme } from '../../DarkMode/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React from 'react';

export const AppInfoScreen = () => {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';

    const handleEmailPress = (email) => {
        Linking.openURL(`mailto:${email}`);
    };

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: isLightTheme ? '#f8f9fa' : '#121212' }
            ]}
            showsVerticalScrollIndicator={false}
        >
            <View style={[styles.header, { 
                backgroundColor: isLightTheme ? '#1a73e8' : '#1a1a1a',
            }]}>
                <Icon 
                    name="account-group-outline" 
                    size={60} 
                    color="#fff" 
                    style={styles.headerIcon}
                />
                <Text style={styles.headerTitle}>FriendCircle</Text>
                <Text style={styles.headerSubtitle}>Group-Based Location Sharing & Chat App</Text>
            </View>

            <View style={styles.content}>
                {/* Key Features Section */}
                <View style={[styles.section, { backgroundColor: isLightTheme ? '#fff' : '#2A2A2A' }]}>
                    <Text style={[styles.sectionTitle, { color: isLightTheme ? '#1a73e8' : '#64B5F6' }]}>
                        Key Features
                    </Text>
                    <View style={styles.featureList}>
                        <FeatureItem 
                            icon="account-group" 
                            title="Group Management"
                            description="Create and join multiple groups, invite members, and manage settings"
                            isLightTheme={isLightTheme}
                        />
                        <FeatureItem 
                            icon="map-marker" 
                            title="Location Sharing"
                            description="Real-time location tracking with privacy controls"
                            isLightTheme={isLightTheme}
                        />
                        <FeatureItem 
                            icon="chat" 
                            title="Group Chat"
                            description="Real-time messaging with media sharing support"
                            isLightTheme={isLightTheme}
                        />
                        <FeatureItem 
                            icon="shield-check" 
                            title="Privacy & Security"
                            description="Secure authentication and granular privacy controls"
                            isLightTheme={isLightTheme}
                        />
                    </View>
                </View>

                {/* Team Section */}
                <View style={[styles.section, { backgroundColor: isLightTheme ? '#fff' : '#2A2A2A' }]}>
                    <Text style={[styles.sectionTitle, { color: isLightTheme ? '#1a73e8' : '#64B5F6' }]}>
                        Development Team
                    </Text>
                    <View style={styles.teamList}>
                        <TeamMember
                            name="Karwan"
                            role="Frontend Developer"
                            email="karwan@friendcircle.com"
                            isLightTheme={isLightTheme}
                            onEmailPress={handleEmailPress}
                        />
                        <TeamMember
                            name="Rezdar"
                            role="Backend Developer"
                            email="rezdar@friendcircle.com"
                            isLightTheme={isLightTheme}
                            onEmailPress={handleEmailPress}
                        />
                    </View>
                </View>

                {/* Technical Info */}
                <View style={[styles.section, { backgroundColor: isLightTheme ? '#fff' : '#2A2A2A' }]}>
                    <Text style={[styles.sectionTitle, { color: isLightTheme ? '#1a73e8' : '#64B5F6' }]}>
                        Technical Stack
                    </Text>
                    <View style={styles.techList}>
                        <TechItem 
                            title="Frontend" 
                            description="React Native"
                            isLightTheme={isLightTheme}
                        />
                        <TechItem 
                            title="Backend" 
                            description="Laravel PHP Framework"
                            isLightTheme={isLightTheme}
                        />
                        <TechItem 
                            title="Database" 
                            description="MySQL"
                            isLightTheme={isLightTheme}
                        />
                        <TechItem 
                            title="Real-time" 
                            description="WebSocket"
                            isLightTheme={isLightTheme}
                        />
                    </View>
                </View>

                <Text style={[styles.version, { color: isLightTheme ? '#666' : '#aaa' }]}>
                    Version 1.0.0
                </Text>
            </View>
        </ScrollView>
    );
};

const FeatureItem = ({ icon, title, description, isLightTheme }) => (
    <View style={styles.featureItem}>
        <Icon name={icon} size={24} color={isLightTheme ? '#1a73e8' : '#64B5F6'} style={styles.featureIcon} />
        <View>
            <Text style={[styles.featureTitle, { color: isLightTheme ? '#000' : '#fff' }]}>{title}</Text>
            <Text style={[styles.featureDescription, { color: isLightTheme ? '#666' : '#aaa' }]}>{description}</Text>
        </View>
    </View>
);

const TeamMember = ({ name, role, email, isLightTheme, onEmailPress }) => (
    <View style={styles.teamMember}>
        <View style={[styles.teamIconContainer, { backgroundColor: isLightTheme ? '#e3f2fd' : '#333' }]}>
            <Icon name="account" size={32} color={isLightTheme ? '#1a73e8' : '#64B5F6'} />
        </View>
        <Text style={[styles.teamName, { color: isLightTheme ? '#000' : '#fff' }]}>{name}</Text>
        <Text style={[styles.teamRole, { color: isLightTheme ? '#666' : '#aaa' }]}>{role}</Text>
        <Text 
            style={[styles.teamEmail, { color: isLightTheme ? '#1a73e8' : '#64B5F6' }]}
            onPress={() => onEmailPress(email)}
        >
            {email}
        </Text>
    </View>
);

const TechItem = ({ title, description, isLightTheme }) => (
    <View style={styles.techItem}>
        <Text style={[styles.techTitle, { color: isLightTheme ? '#000' : '#fff' }]}>{title}</Text>
        <Text style={[styles.techDescription, { color: isLightTheme ? '#666' : '#aaa' }]}>{description}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 32,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
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
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    content: {
        padding: 16,
    },
    section: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    featureList: {
        gap: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureIcon: {
        marginRight: 12,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
    },
    teamList: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 20,
    },
    teamMember: {
        alignItems: 'center',
        minWidth: 150,
    },
    teamIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    teamName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    teamRole: {
        fontSize: 14,
        marginBottom: 4,
    },
    teamEmail: {
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    techList: {
        gap: 12,
    },
    techItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    techTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    techDescription: {
        fontSize: 14,
    },
    version: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
    },
}); 