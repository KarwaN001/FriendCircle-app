import { View, Text, Switch, StyleSheet, ScrollView, Image, Pressable, Platform } from 'react-native';
import { useTheme } from '../DarkMode/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export const ProfileScreen = () => {
    const { theme, toggleTheme } = useTheme();
    const isLightTheme = theme === 'light';
    const navigation = useNavigation();

    const menuItems = [
        { icon: 'account-edit', title: 'Edit Profile', subtitle: 'Update your information' },
        { icon: 'bell-outline', title: 'Notifications', subtitle: 'Manage your alerts' },
        { icon: 'shield-lock-outline', title: 'Privacy Settings', subtitle: 'Control your privacy settings' },
        { icon: 'map-marker-outline', title: 'Location History', subtitle: 'View your location history' },
        { icon: 'help-circle-outline', title: 'Help & Support', subtitle: 'Get assistance' },
        { icon: 'cog-outline', title: 'Settings', subtitle: 'App preferences' },
    ];

    const MenuItem = ({ icon, title, subtitle }) => (
        <Pressable
            style={styles.menuItem}
            android_ripple={{ color: isLightTheme ? '#eee' : '#333' }}
            onPress={() => {
                if (title === 'Edit Profile') {
                    navigation.navigate('EditProfile');
                }
            }}
        >
            <Icon
                name={icon}
                size={24}
                color={isLightTheme ? '#1a73e8' : '#64B5F6'}
                style={styles.menuIcon}
            />
            <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: isLightTheme ? '#000' : '#fff' }]}>
                    {title}
                </Text>
                <Text style={[styles.menuSubtitle, { color: isLightTheme ? '#666' : '#aaa' }]}>
                    {subtitle}
                </Text>
            </View>
            <Icon
                name="chevron-right"
                size={24}
                color={isLightTheme ? '#666' : '#aaa'}
            />
        </Pressable>
    );

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: isLightTheme ? '#f5f5f5' : '#1A1A1A' }
            ]}
            showsVerticalScrollIndicator={false}
        >

            {/* Profile Section */}
            <View style={styles.profileSection}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={require('../assets/images/4.jpg')}
                        style={[
                            styles.profileImage,
                            { borderColor: isLightTheme ? '#fff' : '#2A2A2A' }
                        ]}
                    />
                    <Pressable style={styles.editImageButton}>
                        <Icon name="pencil" size={16} color="#fff" />
                    </Pressable>
                </View>
                <Text style={[styles.name, { color: isLightTheme ? '#000' : '#fff' }]}>
                    Test Test
                </Text>
                <Text style={[styles.username, { color: isLightTheme ? '#666' : '#aaa' }]}>
                    @qwerty
                </Text>
            </View>

            {/* Stats Card */}
            <View style={[styles.card, styles.statsCard, { backgroundColor: isLightTheme ? '#fff' : '#2A2A2A' }]}>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: isLightTheme ? '#000' : '#fff' }]}>5</Text>
                        <Text style={[styles.statLabel, { color: isLightTheme ? '#666' : '#aaa' }]}>Groups</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: isLightTheme ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: isLightTheme ? '#000' : '#fff' }]}>12</Text>
                        <Text style={[styles.statLabel, { color: isLightTheme ? '#666' : '#aaa' }]}>Check-ins</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: isLightTheme ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: isLightTheme ? '#000' : '#fff' }]}>8</Text>
                        <Text style={[styles.statLabel, { color: isLightTheme ? '#666' : '#aaa' }]}>Friends</Text>
                    </View>
                </View>
            </View>

            {/* Theme Switch Card */}
            <View style={[styles.card, { backgroundColor: isLightTheme ? '#fff' : '#2A2A2A' }]}>
                <Pressable 
                    style={styles.themeRow}
                    android_ripple={{ color: isLightTheme ? '#eee' : '#333' }}
                >
                    <Icon
                        name={isLightTheme ? 'weather-sunny' : 'weather-night'}
                        size={24}
                        color={isLightTheme ? '#1a73e8' : '#64B5F6'}
                    />
                    <Text style={[styles.themeText, { color: isLightTheme ? '#000' : '#fff' }]}>
                             {!isLightTheme ? 'Dark Mode' : 'Light Mode'} 
                    </Text>
                    <Switch
                        value={!isLightTheme}
                        onValueChange={toggleTheme}
                        thumbColor={isLightTheme ? '#fff' : '#64B5F6'}
                        trackColor={{
                            false: '#767577',
                            true: Platform.select({
                                ios: '#64B5F6',
                                android: '#1a73e8'
                            })
                        }}
                        ios_backgroundColor="#767577"
                    />
                </Pressable>
            </View>

            {/* Menu Card */}
            <View style={[styles.card, { backgroundColor: isLightTheme ? '#fff' : '#2A2A2A' }]}>
                {menuItems.map((item, index) => (
                    <MenuItem key={index} {...item} />
                ))}
            </View>

            <Text style={[styles.version, { color: isLightTheme ? '#666' : '#aaa' }]}>
                Version 1.0.0
            </Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    timeText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '500',
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    profileImageContainer: {
        marginBottom: 12,
        position: 'relative',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
    },
    editImageButton: {
        position: 'absolute',
        right: -4,
        bottom: -4,
        backgroundColor: '#1a73e8',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    name: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 4,
    },
    username: {
        fontSize: 16,
        marginBottom: 8,
        opacity: 0.8,
    },
    card: {
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    statsCard: {
        padding: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 12,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 24,
        marginHorizontal: 8,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        opacity: 0.8,
    },
    themeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    themeText: {
        flex: 1,
        marginLeft: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginVertical: 2,
    },
    menuIcon: {
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    menuSubtitle: {
        fontSize: 14,
        marginTop: 2,
        opacity: 0.7,
    },
    version: {
        textAlign: 'center',
        padding: 16,
        fontSize: 12,
        opacity: 0.6,
        fontWeight: '500',
    },
});