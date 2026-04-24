import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../context/FavoritesContext';
const BrowseVendorsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const { favoriteVendors, addFavoriteVendor, removeFavoriteVendor, isFavoriteVendor } = useFavorites();

  const allVendors = [
    {
      id: 1,
      name: 'Green Valley Farm',
      rating: 4.8,
      distance: '2.3 km',
      produce: ['Tomatoes', 'Lettuce', 'Cucumbers'],
      address: 'Brgy. San Jose, Batangas',
      hours: '6:00 AM - 6:00 PM',
      contact: '0917 123 4567',
      lat: 14.5995,
      lng: 120.9842,
      isOpen: true,
      followers: 1234
    },
    {
      id: 2,
      name: 'Sunrise Organics',
      rating: 4.9,
      distance: '3.1 km',
      produce: ['Eggs', 'Honey', 'Berries'],
      address: 'Brgy. Sta. Rosa, Laguna',
      hours: '5:30 AM - 5:30 PM',
      contact: '0918 234 5678',
      lat: 14.6095,
      lng: 120.9742,
      isOpen: true,
      followers: 2345
    },
    {
      id: 3,
      name: 'Mountain Fresh',
      rating: 4.7,
      distance: '1.8 km',
      produce: ['Potatoes', 'Carrots', 'Apples'],
      address: 'Brgy. Tagaytay, Cavite',
      hours: '7:00 AM - 7:00 PM',
      contact: '0919 345 6789',
      lat: 14.5895,
      lng: 120.9942,
      isOpen: true,
      followers: 987
    },
    {
      id: 4,
      name: 'Banaue Rice Terraces Farm',
      rating: 4.9,
      distance: '250 km',
      produce: ['Organic Rice', 'Vegetables', 'Herbs'],
      address: 'Banaue, Ifugao',
      hours: '8:00 AM - 5:00 PM',
      contact: '0920 456 7890',
      lat: 16.9239,
      lng: 121.0597,
      isOpen: false,
      followers: 3456
    },
    {
      id: 5,
      name: 'Davao Fruit Farm',
      rating: 4.8,
      distance: '975 km',
      produce: ['Bananas', 'Durian', 'Mangoes'],
      address: 'Davao City',
      hours: '6:00 AM - 6:00 PM',
      contact: '0921 567 8901',
      lat: 7.1907,
      lng: 125.4553,
      isOpen: true,
      followers: 5678
    },
    {
      id: 6,
      name: 'Bicol Chili Farm',
      rating: 4.6,
      distance: '350 km',
      produce: ['Siling Labuyo', 'Ginger', 'Turmeric'],
      address: 'Bicol Region',
      hours: '7:00 AM - 6:00 PM',
      contact: '0922 678 9012',
      lat: 13.4209,
      lng: 123.4138,
      isOpen: true,
      followers: 876
    }
  ];

  const toggleFavorite = (vendor) => {
    if (isFavoriteVendor(vendor.id)) {
      removeFavoriteVendor(vendor.id);
    } else {
      addFavoriteVendor(vendor);
    }
  };

  const filters = ['All', 'Nearby', 'Top Rated', 'Open Now'];

  const getFilteredVendors = () => {
    let filtered = allVendors;

    if (searchQuery) {
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.produce.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filterType === 'Nearby') {
      filtered = [...filtered].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    } else if (filterType === 'Top Rated') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (filterType === 'Open Now') {
      filtered = filtered.filter(v => v.isOpen);
    }

    return filtered;
  };

  const renderVendorCard = ({ item }) => {
    const isFavorite = isFavoriteVendor(item.id);
    
    return (
      <TouchableOpacity 
        style={styles.vendorCard}
        onPress={() => navigation.navigate('VendorDetails', { vendor: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardIconContainer}>
          <Icon name="store" size={50} color="#3BB77E" />
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item)}
          >
            <Icon 
              name={isFavorite ? "favorite" : "favorite-border"} 
              size={22} 
              color={isFavorite ? "#FF5252" : "#FFF"} 
            />
          </TouchableOpacity>
          {item.isOpen && (
            <View style={styles.openBadge}>
              <Text style={styles.openBadgeText}>Open</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.vendorName}>{item.name}</Text>
          
          <View style={styles.ratingRow}>
            <Icon name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.dot}>•</Text>
            <Icon name="location-on" size={14} color="#999" />
            <Text style={styles.distanceText}>{item.distance}</Text>
            <Text style={styles.dot}>•</Text>
            <Icon name="people" size={14} color="#999" />
            <Text style={styles.followerText}>{item.followers} followers</Text>
          </View>
          
          <Text style={styles.produceText} numberOfLines={1}>
            {item.produce.join(' • ')}
          </Text>
          
          <TouchableOpacity
            style={styles.viewStoreButton}
            onPress={() => navigation.navigate('VendorDetails', { vendor: item })}
          >
            <Text style={styles.viewStoreButtonText}>View Store</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#010F1C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Vendors</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
          <Icon name="favorite-border" size={24} color="#010F1C" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Icon name="search" size={22} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vendors or products..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.categoryChip,
                filterType === filter && styles.categoryChipActive
              ]}
              onPress={() => setFilterType(filter)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.categoryText,
                filterType === filter && styles.categoryTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {getFilteredVendors().length} vendors found
        </Text>
      </View>
      
      <FlatList
        data={getFilteredVendors()}
        renderItem={renderVendorCard}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="store" size={60} color="#E0E0E0" />
            <Text style={styles.emptyStateText}>No vendors found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your search</Text>
          </View>
        }
      />

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { name: 'Map',       icon: 'map-outline',    iconActive: 'map',    route: 'Map'       },
          { name: 'Search',    icon: 'search-outline', iconActive: 'search', route: 'Search'    },
          { name: 'Cart',      icon: 'cart-outline',   iconActive: 'cart',   route: 'Cart',     isCart: true },
          { name: 'Favorites', icon: 'heart-outline',  iconActive: 'heart',  route: 'Favorites' },
          { name: 'Profile',   icon: 'person-outline', iconActive: 'person', route: 'Profile'   },
        ].map((tab) => {
          const isActive = tab.route === 'Map';
          if (tab.isCart) {
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tabItem}
                onPress={() => navigation.navigate('MainTabs', { screen: tab.route })}
                activeOpacity={0.7}
              >
                <View style={[styles.cartBubble, styles.cartBubbleInactive]}>
                  <Ionicons name={tab.icon} size={26} color="#FFF" />
                </View>
                <Text style={styles.tabLabel}>{tab.name}</Text>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => navigation.navigate('MainTabs', { screen: tab.route })}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={24}
                color={isActive ? '#3BB77E' : '#999999'}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderWidth: 1,
    borderColor: '#EDE9E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#010F1C',
    padding: 0,
  },
  categoriesWrapper: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9E0',
    marginBottom: 4,
  },
  categoriesContainer: {
    flexGrow: 0,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EDE9E0',
    gap: 6,
    minWidth: 90,
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#3BB77E',
    borderColor: '#3BB77E',
  },
  categoryText: {
    color: '#666',
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  categoryTextActive: {
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 90,
  },
  vendorCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EDE9E0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIconContainer: {
    width: 100,
    height: 120,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 6,
    zIndex: 1,
  },
  openBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  openBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  vendorName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    color: '#010F1C',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  ratingText: {
    fontSize: 12,
    color: '#FFB800',
    marginLeft: 2,
    fontFamily: 'Poppins-SemiBold',
  },
  dot: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 4,
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
    fontFamily: 'Poppins-Regular',
  },
  followerText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
    fontFamily: 'Poppins-Regular',
  },
  produceText: {
    fontSize: 12,
    color: '#3BB77E',
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },
  viewStoreButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
  },
  viewStoreButtonText: {
    color: '#2E7D32',
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    color: '#010F1C',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    marginTop: 4,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#999999',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#3BB77E',
  },
  cartBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  cartBubbleInactive: {
    backgroundColor: '#3BB77E',
  },
  cartBubbleActive: {
    backgroundColor: '#3BB77E',
  },
});

export default BrowseVendorsScreen;