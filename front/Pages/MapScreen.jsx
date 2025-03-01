import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity, ScrollView, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { useTheme } from "../DarkMode/ThemeContext";
import { darkMapStyle } from '../styles/mapStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import axiosInstance from '../services/api.config';

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
                {Array.isArray(friends) && friends.map((friend) => (
                    friend && friend.latitude && friend.longitude && (
                        activeFilter === 'all' || groups.find(g => g.id === activeFilter)?.members?.includes(friend.id) ? (
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
                                    {friend.profile_photo_url ? (
                                        <Image
                                            source={{ uri: friend.profile_photo_url }}
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
                        ) : null
                    )
                ))}
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
        top: 70,
        left: 5,
        right: 5,
        padding: 5,
        borderRadius: 15,
    },
    filterScroll: {
        paddingHorizontal: 2,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginHorizontal: 3,
        borderRadius: 20,
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
        marginLeft: 5,
        fontSize: 14,
        fontWeight: '500',
    },
    filterTextActive: {
        fontWeight: '600',
    },
    locationButton: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
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
        bottom: 30,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
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
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    markerContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
}); 