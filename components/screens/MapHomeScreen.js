import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 70; 

const MapHomeScreen = ({ navigation }) => {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [region, setRegion] = useState({
    lat: 14.5995,
    lng: 120.9842,
    zoom: 13
  });
  const webViewRef = useRef(null);

  const vendors = [
    {
      id: 1,
      name: "Green Valley Farm",
      lat: 14.5995,
      lng: 120.9842,
      rating: 4.8,
      distance: "2.3 km",
      produce: ["Tomatoes", "Lettuce", "Cucumbers"],
      address: "Brgy. San Jose, Batangas",
      hours: "6:00 AM - 6:00 PM",
      contact: "0917 123 4567"
    },
    {
      id: 2,
      name: "Sunrise Organics",
      lat: 14.6095,
      lng: 120.9742,
      rating: 4.9,
      distance: "3.1 km",
      produce: ["Eggs", "Honey", "Berries"],
      address: "Brgy. Sta. Rosa, Laguna",
      hours: "5:30 AM - 5:30 PM",
      contact: "0918 234 5678"
    },
    {
      id: 3,
      name: "Mountain Fresh",
      lat: 14.5895,
      lng: 120.9942,
      rating: 4.7,
      distance: "1.8 km",
      produce: ["Potatoes", "Carrots", "Apples"],
      address: "Brgy. Tagaytay, Cavite",
      hours: "7:00 AM - 7:00 PM",
      contact: "0919 345 6789"
    },
    {
      id: 4,
      name: "Banaue Rice Terraces Farm",
      lat: 16.9239,
      lng: 121.0597,
      rating: 4.9,
      distance: "250 km",
      produce: ["Organic Rice", "Vegetables", "Herbs"],
      address: "Banaue, Ifugao",
      hours: "8:00 AM - 5:00 PM",
      contact: "0920 456 7890"
    },
    {
      id: 5,
      name: "Davao Fruit Farm",
      lat: 7.1907,
      lng: 125.4553,
      rating: 4.8,
      distance: "975 km",
      produce: ["Bananas", "Durian", "Mangoes"],
      address: "Davao City",
      hours: "6:00 AM - 6:00 PM",
      contact: "0921 567 8901"
    },
  ];

  useEffect(() => {
    getLocationPermission();
  }, []);

  const getLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        getUserLocation();
      } else {
        Alert.alert(
          'Location Permission',
          'Please enable location services to see farms near you.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('Error getting location permission:', error);
    }
  };

  const getUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const { latitude, longitude } = location.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      
      // Update map region to user location
      setRegion({
        lat: latitude,
        lng: longitude,
        zoom: 13
      });

      // Send location to WebView
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          map.setView([${latitude}, ${longitude}], 13);
          true;
        `);
      }
    } catch (error) {
      console.log('Error getting user location:', error);
      Alert.alert('Error', 'Unable to get your current location.');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const getDistanceFromUser = (vendorLat, vendorLng) => {
    if (!userLocation) return null;
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      vendorLat,
      vendorLng
    );
    return `${distance} km`;
  };

  const handleMarkerPress = (vendor) => {
    setSelectedVendor(vendor);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        map.setView([${vendor.lat}, ${vendor.lng}], 15);
        true;
      `);
    }
  };

  const handleCenterUser = () => {
    if (userLocation && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        map.setView([${userLocation.lat}, ${userLocation.lng}], 13);
        true;
      `);
    }
  };

  const getMapHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; }
          body, html { height: 100%; width: 100%; }
          #map { height: 100%; width: 100%; }
          .custom-marker {
            background: white;
            border: 2px solid #3BB77E;
            border-radius: 20px;
            padding: 5px 10px;
            font-size: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            text-align: center;
            white-space: nowrap;
          }
          .leaflet-popup-content {
            font-family: 'Poppins', sans-serif;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Initialize map
          var map = L.map('map').setView([${region.lat}, ${region.lng}], ${region.zoom});
          
          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Add vendors markers
          ${vendors.map(vendor => `
            var marker = L.marker([${vendor.lat}, ${vendor.lng}], {
              icon: L.divIcon({
                className: 'custom-marker',
                html: '${vendor.image}',
                iconSize: [40, 40],
                popupAnchor: [0, -20]
              })
            }).addTo(map);
            
            marker.bindPopup(
              '<b>${vendor.name}</b><br/>' +
              '${vendor.produce.slice(0, 2).join(", ")}<br/>' +
              '⭐ ${vendor.rating}'
            );
            
            marker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'markerClick',
                vendorId: ${vendor.id}
              }));
            });
          `).join('')}

          // Handle map clicks
          map.on('click', function(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapClick',
              lat: e.latlng.lat,
              lng: e.latlng.lng
            }));
          });
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapClick') {
        setSelectedVendor(null);
      } else if (data.type === 'markerClick') {
        const vendor = vendors.find(v => v.id === data.vendorId);
        if (vendor) {
          setSelectedVendor(vendor);
        }
      }
    } catch (error) {
      console.log('Error parsing WebView message:', error);
    }
  };

  const FilterBar = () => (
  <ScrollView 
    horizontal 
    showsHorizontalScrollIndicator={false}
    style={styles.filterBar}
    contentContainerStyle={styles.filterBarContent}
  >
    <TouchableOpacity style={styles.filterChip} onPress={() => navigation.navigate('BrowseVendors')}>
      <Ionicons name="options" size={18} color="#3BB77E" />
      <Text style={styles.filterChipText}>Filter</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.filterChipActive} onPress={() => setFilterType('all')}>
      <Text style={styles.filterChipTextActive}>All</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.filterChip} onPress={() => setFilterType('vegetables')}>
      <Text style={styles.filterChipText}>Vegetables</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.filterChip} onPress={() => setFilterType('fruits')}>
      <Text style={styles.filterChipText}>Fruits</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.filterChip} onPress={() => setFilterType('organic')}>
      <Text style={styles.filterChipText}>Organic</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.filterChip} onPress={() => setFilterType('nearby')}>
      <Text style={styles.filterChipText}>Nearby</Text>
    </TouchableOpacity>
  </ScrollView>
);

  const VendorCard = ({ vendor }) => {
    const distance = userLocation ? getDistanceFromUser(vendor.lat, vendor.lng) : vendor.distance;

    return (
      <TouchableOpacity 
        style={styles.vendorCard}
        onPress={() => handleMarkerPress(vendor)}
        activeOpacity={0.7}
      >
        <View style={styles.vendorCardContent}>
          <Text style={styles.vendorEmoji}>{vendor.image}</Text>
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName} numberOfLines={1}>{vendor.name}</Text>
            <View style={styles.vendorMeta}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.ratingText}>{vendor.rating}</Text>
              </View>
              <View style={styles.distanceContainer}>
                <Ionicons name="location" size={14} color="#666" />
                <Text style={styles.distanceText}>{distance || vendor.distance}</Text>
              </View>
            </View>
            <Text style={styles.produceText} numberOfLines={1}>
              {vendor.produce.join(" • ")}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* WebView Map */}
      <WebView
        ref={webViewRef}
        source={{ html: getMapHTML() }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />

      {/* My Location Button */}
      {userLocation && (
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={handleCenterUser}
        >
          <Ionicons name="locate" size={24} color="#3BB77E" />
        </TouchableOpacity>
      )}

      <FilterBar />

      {/* Bottom Sheet for Nearby Vendors */}
      <View style={[styles.bottomSheet, { bottom: TAB_BAR_HEIGHT }]}>
        <View style={styles.bottomSheetHeader}>
          <View style={styles.handle} />
          <View style={styles.headerTitle}>
            <Text style={styles.nearbyTitle}>Nearby Vendors</Text>
              <TouchableOpacity onPress={() => { 
                console.log("Navigating to BrowseVendors");
                navigation.navigate('BrowseVendors'); }}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.vendorsScroll}
          contentContainerStyle={styles.vendorsScrollContent}
        >
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </ScrollView>

        {selectedVendor && (
          <ScrollView 
            style={styles.selectedVendorScroll}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            <View style={styles.selectedVendorPanel}>
              <View style={styles.selectedVendorHeader}>
                <Text style={styles.selectedVendorName}>{selectedVendor.name}</Text>
                <TouchableOpacity onPress={() => setSelectedVendor(null)}>
                  <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.selectedVendorDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="star" size={16} color="#FFB800" />
                  <Text style={styles.detailText}>{selectedVendor.rating} · </Text>
                  <Ionicons name="location" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {userLocation ? getDistanceFromUser(selectedVendor.lat, selectedVendor.lng) : selectedVendor.distance}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{selectedVendor.address}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{selectedVendor.hours}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{selectedVendor.contact}</Text>
                </View>
                
                <Text style={styles.detailProduce}>
                  {selectedVendor.produce.join(" • ")}
                </Text>
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={styles.directionsButton}
                    onPress={() => {
                      const url = Platform.select({
                        ios: `maps://?q=${selectedVendor.lat},${selectedVendor.lng}`,
                        android: `geo:${selectedVendor.lat},${selectedVendor.lng}?q=${selectedVendor.lat},${selectedVendor.lng}(${selectedVendor.name})`
                      });
                      // You can add Linking.openURL(url) here
                    }}
                  >
                    <Ionicons name="navigate-outline" size={18} color="#FFF" />
                    <Text style={styles.directionsText}>Directions</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.viewStoreButton}
                    onPress={() => navigation.navigate('VendorDetails', { vendor: selectedVendor })}
                  >
                    <Text style={styles.viewStoreText}>View Store</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  map: {
    width: width,
    height: height,
  },
  locationButton: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: '#FFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  filterBar: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    maxHeight: 50,
    zIndex: 10,
  },
  filterBarContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipActive: {
    backgroundColor: '#3BB77E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipText: {
    marginLeft: 4,
    color: '#333',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  filterChipTextActive: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: height * 0.5, // Limit maximum height to half screen
  },
  bottomSheetHeader: {
    marginBottom: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  nearbyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins-Bold',
  },
  seeAllText: {
    color: '#3BB77E',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  vendorsScroll: {
    maxHeight: 140,
  },
  vendorsScrollContent: {
    paddingRight: 16,
  },
  vendorCard: {
    width: 200,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
  },
  vendorCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorEmoji: {
    fontSize: 30,
    marginRight: 12,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  vendorMeta: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingText: {
    marginLeft: 2,
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    marginLeft: 2,
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  produceText: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },
  selectedVendorScroll: {
    maxHeight: height * 0.3, // Limit height of vendor details
    marginTop: 16,
  },
  selectedVendorPanel: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
  },
  selectedVendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedVendorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins-Bold',
  },
  selectedVendorDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  detailProduce: {
    fontSize: 14,
    color: '#3BB77E',
    fontWeight: '500',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  directionsButton: {
    flex: 1,
    backgroundColor: '#010F1C',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  directionsText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  viewStoreButton: {
    flex: 1,
    backgroundColor: '#3BB77E',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewStoreText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default MapHomeScreen;