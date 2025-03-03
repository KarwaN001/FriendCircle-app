import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity, ScrollView, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { useTheme } from "../DarkMode/ThemeContext";
import { darkMapStyle } from '../styles/mapStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import axiosInstance from '../services/api.config';
import Sizing from '../utils/Sizing';

export const MapScreen = () => {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';
    const [activeFilter, setActiveFilter] = useState('all');
    const [initialRegion, setInitialRegion] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
    const [friends, setFriends] = useState([]);
    const [groups, setGroups] = useState([]);
    const [isLoadingFriends, setIsLoadingFriends] = useState(true);
    const [isLoadingGroups, setIsLoadingGroups] = useState(true);
    const [isFirstTimeSharing, setIsFirstTimeSharing] = useState(true);

    // Fetch groups data
    const fetchGroups = async () => {
        try {
            setIsLoadingGroups(true);
            const response = await axiosInstance.get('/groups');
            if (response.data && Array.isArray(response.data.data)) {
                setGroups(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setIsLoadingGroups(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    // Fetch friends data
    const fetchFriends = async () => {
        try {
            setIsLoadingFriends(true);
            const response = await axiosInstance.get('/friends');
            if (response.data && Array.isArray(response.data.data)) {
                setFriends(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
        } finally {
            setIsLoadingFriends(false);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    // Check if user has previously shared location
    useEffect(() => {
        const checkLocationHistory = async () => {
            try {
                const response = await axiosInstance.get('/profile');
                const userData = response.data;
                setIsFirstTimeSharing(!userData.latitude && !userData.longitude);
            } catch (error) {
                console.error('Error checking location history:', error);
            }
        };
        checkLocationHistory();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                // Request location permission
                const { status } = await Location.requestForegroundPermissionsAsync();
                setHasPermission(status === 'granted');

                if (status === 'granted') {
                    // Get current location
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High
                    });

                    // Set initial region to user's location
                    const newRegion = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.01, // More zoomed in
                        longitudeDelta: 0.01,
                    };
                    setInitialRegion(newRegion);
                } else {
                    // Default to a fallback location if permission denied
                    setInitialRegion({
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    });
                }
            } catch (error) {
                console.log('Error getting location:', error);
                Alert.alert(
                    "Location Error",
                    "Unable to get your location. Please check your location settings.",
                    [{ text: "OK" }]
                );
                // Set fallback location
                setInitialRegion({
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
            }
        })();
    }, []);

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setHasPermission(status === 'granted');

            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High
                });
                
                const newRegion = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };
                setInitialRegion(newRegion);
            } else {
                Alert.alert(
                    "Permission Denied",
                    "Please enable location permissions to see your location on the map.",
                    [{ text: "OK" }]
                );
            }
        } catch (error) {
            console.log('Error requesting permission:', error);
        }
    };

    const updateMyLocation = async () => {
        if (!hasPermission) {
            Alert.alert(
                "Permission Required",
                "Location permission is required to update your location.",
                [{ text: "OK" }]
            );
            return;
        }

        try {
            setIsUpdatingLocation(true);
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });

            // Update location on the server
            await axiosInstance.patch('/profile', {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            Alert.alert(
                "Success",
                "Your location has been updated successfully!",
                [{ text: "OK" }]
            );

            // Update the map view
            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            setInitialRegion(newRegion);
        } catch (error) {
            console.error('Error updating location:', error);
            Alert.alert(
                "Error",
                "Failed to update your location. Please try again.",
                [{ text: "OK" }]
            );
        } finally {
            setIsUpdatingLocation(false);
        }
    };

    if (!initialRegion) {
        return (
            <View style={[
                styles.container, 
                styles.loadingContainer,
                { backgroundColor: isLightTheme ? '#fff' : '#121212' }
            ]}>
                <Ionicons 
                    name="map-outline" 
                    size={50} 
                    color={isLightTheme ? '#007AFF' : '#0A84FF'} 
                />
                <Text style={[
                    styles.loadingText,
                    { color: isLightTheme ? '#000' : '#fff' }
                ]}>
                    Loading map...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isLightTheme ? '#fff' : '#121212' }]}>
            <StatusBar 
                translucent 
                backgroundColor="transparent" 
                barStyle={isLightTheme ? 'dark-content' : 'light-content'} 
            />
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                customMapStyle={isLightTheme ? [] : darkMapStyle}
                initialRegion={initialRegion}
                showsUserLocation={true}
                followsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                rotateEnabled={true}
                compassOffset={{ x: -10, y: 100 }}
                mapPadding={{ top: 15, right: 15, bottom: 0, left: 15 }}
            >
                {!isLoadingFriends && Array.isArray(friends) && friends.map((friend) => {
                    // Skip friends without location data
                    if (!friend || !friend.latitude || !friend.longitude) return null;

                    // For 'all' filter, show all friends
                    if (activeFilter === 'all') {
                        return (
                            <Marker
                                key={friend.id}
                                coordinate={{
                                    latitude: parseFloat(friend.latitude),
                                    longitude: parseFloat(friend.longitude),
                                }}
                                title={friend.name}
                                description={`Last updated: ${new Date(friend.updated_at).toLocaleString()}`}
                            >
                                <View style={styles.markerContainer}>
                                    {friend.profile_photo ? (
                                        <Image
                                            source={{ uri: friend.profile_photo }}
                                            style={styles.markerImage}
                                        />
                                    ) : (
                                        <View style={[styles.markerFallback, { backgroundColor: isLightTheme ? '#007AFF' : '#0A84FF' }]}>
                                            <Text style={styles.markerFallbackText}>
                                                {friend.name.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </Marker>
                        );
                    }

                    // For group filter, check if friend is in the selected group
                    const selectedGroup = groups.find(g => g.id === activeFilter);
                    if (selectedGroup && selectedGroup.members && selectedGroup.members.some(member => member.id === friend.id)) {
                        return (
                            <Marker
                                key={friend.id}
                                coordinate={{
                                    latitude: parseFloat(friend.latitude),
                                    longitude: parseFloat(friend.longitude),
                                }}
                                title={friend.name}
                                description={`Last updated: ${new Date(friend.updated_at).toLocaleString()}`}
                            >
                                <View style={styles.markerContainer}>
                                    {friend.profile_photo ? (
                                        <Image
                                            source={{ uri: friend.profile_photo }}
                                            style={styles.markerImage}
                                        />
                                    ) : (
                                        <View style={[styles.markerFallback, { backgroundColor: isLightTheme ? '#007AFF' : '#0A84FF' }]}>
                                            <Text style={styles.markerFallbackText}>
                                                {friend.name.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </Marker>
                        );
                    }

                    return null;
                })}
            </MapView>
            
            <View style={[
                styles.filterContainer,
                { backgroundColor: 'transparent' }
            ]}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    <TouchableOpacity
                        key="all"
                        style={[
                            styles.filterButton,
                            activeFilter === 'all' && styles.filterButtonActive,
                            { 
                                borderColor: isLightTheme ? '#007AFF' : '#0A84FF',
                                backgroundColor: activeFilter === 'all' 
                                    ? (isLightTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(40, 40, 40, 0.9)')
                                    : (isLightTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(40, 40, 40, 0.7)')
                            }
                        ]}
                        onPress={() => setActiveFilter('all')}
                    >
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>A</Text>
                        </View>
                        <Text style={[
                            styles.filterText,
                            activeFilter === 'all' && styles.filterTextActive,
                            { color: isLightTheme ? '#333' : '#fff' }
                        ]}>
                            All Friends
                        </Text>
                    </TouchableOpacity>

                    {groups.map((group) => (
                        <TouchableOpacity
                            key={group.id}
                            style={[
                                styles.filterButton,
                                activeFilter === group.id && styles.filterButtonActive,
                                { 
                                    borderColor: isLightTheme ? '#007AFF' : '#0A84FF',
                                    backgroundColor: activeFilter === group.id 
                                        ? (isLightTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(40, 40, 40, 0.9)')
                                        : (isLightTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(40, 40, 40, 0.7)')
                                }
                            ]}
                            onPress={() => setActiveFilter(group.id)}
                        >
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{group.name.charAt(0)}</Text>
                            </View>
                            <Text style={[
                                styles.filterText,
                                activeFilter === group.id && styles.filterTextActive,
                                { color: isLightTheme ? '#333' : '#fff' }
                            ]}>
                                {group.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {!hasPermission && (
                <TouchableOpacity
                    style={[
                        styles.locationButton,
                        { backgroundColor: isLightTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(40, 40, 40, 0.9)' }
                    ]}
                    onPress={requestLocationPermission}
                >
                    <Ionicons 
                        name="location" 
                        size={24} 
                        color={isLightTheme ? '#007AFF' : '#0A84FF'} 
                    />
                    <Text style={[
                        styles.locationButtonText,
                        { color: isLightTheme ? '#333' : '#fff' }
                    ]}>
                        Enable Location
                    </Text>
                </TouchableOpacity>
            )}

            {hasPermission && (
                <TouchableOpacity
                    style={[
                        styles.updateLocationButton,
                        { backgroundColor: isLightTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(40, 40, 40, 0.9)' }
                    ]}
                    onPress={updateMyLocation}
                    disabled={isUpdatingLocation}
                >
                    <Ionicons 
                        name={isFirstTimeSharing ? "location" : "refresh"} 
                        size={24} 
                        color={isLightTheme ? '#007AFF' : '#0A84FF'} 
                    />
                    <Text style={[
                        styles.locationButtonText,
                        { color: isLightTheme ? '#333' : '#fff' }
                    ]}>
                        {isUpdatingLocation ? 'Updating...' : (isFirstTimeSharing ? 'Share My Location' : 'Update My Location')}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        paddingTop: StatusBar.currentHeight || 0,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    filterContainer: {
        position: 'absolute',
        top: Sizing.deviceHeight * 0.07,
        left: Sizing.deviceWidth * 0.01,
        right: Sizing.deviceWidth * 0.01,
        padding: Sizing.deviceWidth * 0.008,
        borderRadius: 12,
    },
    filterScroll: {
        paddingHorizontal: Sizing.deviceWidth * 0.003,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Sizing.deviceWidth * 0.02,
        paddingVertical: Sizing.deviceHeight * 0.008,
        marginHorizontal: Sizing.deviceWidth * 0.005,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    filterButtonActive: {
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
    },
    filterText: {
        marginLeft: Sizing.deviceWidth * 0.008,
        fontSize: Sizing.deviceWidth * 0.028,
        fontWeight: '500',
    },
    filterTextActive: {
        fontWeight: '600',
    },
    locationButton: {
        position: 'absolute',
        bottom: Sizing.deviceHeight * 0.03,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Sizing.deviceWidth * 0.035,
        paddingVertical: Sizing.deviceHeight * 0.012,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    updateLocationButton: {
        position: 'absolute',
        bottom: Sizing.deviceHeight * 0.03,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Sizing.deviceWidth * 0.035,
        paddingVertical: Sizing.deviceHeight * 0.012,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    locationButtonText: {
        marginLeft: Sizing.deviceWidth * 0.015,
        fontSize: Sizing.deviceWidth * 0.032,
        fontWeight: '600',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: Sizing.deviceHeight * 0.015,
    },
    loadingText: {
        fontSize: Sizing.deviceWidth * 0.035,
        fontWeight: '600',
        textAlign: 'center',
    },
    markerContainer: {
        width: Sizing.deviceWidth * 0.08,
        height: Sizing.deviceWidth * 0.08,
        borderRadius: Sizing.deviceWidth * 0.04,
        overflow: 'hidden',
        borderWidth: 2,
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
    markerImage: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    markerFallback: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerFallbackText: {
        color: '#fff',
        fontSize: Sizing.deviceWidth * 0.035,
        fontWeight: 'bold',
    },
    avatar: {
        width: Sizing.deviceWidth * 0.045,
        height: Sizing.deviceWidth * 0.045,
        borderRadius: Sizing.deviceWidth * 0.0225,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Sizing.deviceWidth * 0.015,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: Sizing.deviceWidth * 0.025,
        fontWeight: '600',
    },
}); 