import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from "../DarkMode/ThemeContext";
import { darkMapStyle } from '../styles/mapStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';

const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

const filterOptions = [
    { id: 'all', label: 'All', icon: 'earth' },
    { id: 'restaurants', label: 'Food', icon: 'restaurant' },
    { id: 'shopping', label: 'Shopping', icon: 'cart' },
    { id: 'entertainment', label: 'Fun', icon: 'game-controller' },
    { id: 'sports', label: 'Sports', icon: 'football' },
];

export const MapScreen = () => {
    const { theme } = useTheme();
    const isLightTheme = theme === 'light';
    const [activeFilter, setActiveFilter] = useState('all');

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
            />
            
            <View style={[
                styles.filterContainer,
                { backgroundColor: isLightTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(40, 40, 40, 0.9)' }
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
                                { borderColor: isLightTheme ? '#007AFF' : '#0A84FF' }
                            ]}
                            onPress={() => setActiveFilter(filter.id)}
                        >
                            <Ionicons 
                                name={filter.icon} 
                                size={18} 
                                color={activeFilter === filter.id 
                                    ? (isLightTheme ? '#007AFF' : '#0A84FF')
                                    : (isLightTheme ? '#666' : '#999')
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    filterContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        padding: 10,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    filterScroll: {
        paddingHorizontal: 5,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
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
}); 