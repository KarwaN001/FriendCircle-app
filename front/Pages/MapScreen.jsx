import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { useTheme } from "../DarkMode/ThemeContext";
import { darkMapStyle } from '../styles/mapStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';

const filterOptions = [
    { id: 'all', label: 'All', icon: 'people' },
    { id: 'family', label: 'Family', icon: 'home' },
    { id: 'friends', label: 'Friends', icon: 'heart' },
    { id: 'work', label: 'Work', icon: 'briefcase' },
    { id: 'school', label: 'School', icon: 'school' },
];

export const MapScreen = () => {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';
    const [activeFilter, setActiveFilter] = useState('all');
    const [initialRegion, setInitialRegion] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);

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

    if (!initialRegion) {
        return (
            <View style={[styles.container, { backgroundColor: isLightTheme ? '#fff' : '#121212' }]}>
                <Text style={{ color: isLightTheme ? '#000' : '#fff' }}>Loading map...</Text>
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
            />
            
            <View style={[
                styles.filterContainer,
                { backgroundColor: 'transparent' }
            ]}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    {filterOptions.map((filter) => (
                        <TouchableOpacity
                            key={filter.id}
                            style={[
                                styles.filterButton,
                                activeFilter === filter.id && styles.filterButtonActive,
                                { 
                                    borderColor: isLightTheme ? '#007AFF' : '#0A84FF',
                                    backgroundColor: activeFilter === filter.id 
                                        ? (isLightTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(40, 40, 40, 0.9)')
                                        : (isLightTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(40, 40, 40, 0.7)')
                                }
                            ]}
                            onPress={() => setActiveFilter(filter.id)}
                        >
                            <Ionicons 
                                name={filter.icon} 
                                size={18} 
                                color={activeFilter === filter.id 
                                    ? (isLightTheme ? '#007AFF' : '#0A84FF')
                                    : (isLightTheme ? '#666' : '#fff')
                                } 
                            />
                            <Text style={[
                                styles.filterText,
                                activeFilter === filter.id && styles.filterTextActive,
                                { color: isLightTheme ? '#333' : '#fff' }
                            ]}>
                                {filter.label}
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
    locationButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
    },
}); 