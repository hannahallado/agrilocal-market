import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Alert,
  Platform,
  StatusBar,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../../context/FavoritesContext';

const VendorDetailsScreen = ({ navigation, route }) => {
  const { vendor } = route.params;
  const { isFavoriteVendor, addFavoriteVendor, removeFavoriteVendor,
          isFavoriteProduct, addFavoriteProduct, removeFavoriteProduct } = useFavorites();
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);

  const vendorProducts = [
    {
      id: 101,
      name: 'Fresh Tomatoes',
      price: 60.00,
      unit: 'kg',
      vendor: vendor.name,
      vendorId: vendor.id,
      category: 'Vegetables',
      rating: 4.8,
      soldCount: 234,
      imageUrl: 'https://images.pexels.com/photos/30893354/pexels-photo-30893354.jpeg',
      description: 'Fresh organic tomatoes from the farm',
      inStock: true
    },
    {
      id: 102,
      name: 'Crispy Lettuce',
      price: 45.00,
      unit: 'pc',
      vendor: vendor.name,
      vendorId: vendor.id,
      category: 'Vegetables',
      rating: 4.7,
      soldCount: 189,
      imageUrl: 'https://images.pexels.com/photos/36486646/pexels-photo-36486646.jpeg',
      description: 'Fresh and crispy lettuce leaves',
      inStock: true
    },
    {
      id: 103,
      name: 'Organic Cucumbers',
      price: 35.00,
      unit: 'kg',
      vendor: vendor.name,
      vendorId: vendor.id,
      category: 'Vegetables',
      rating: 4.6,
      soldCount: 156,
      imageUrl: 'https://images.pexels.com/photos/30893349/pexels-photo-30893349.jpeg',
      description: 'Crunchy organic cucumbers',
      inStock: true
    },
    {
      id: 104,
      name: 'Bell Peppers',
      price: 80.00,
      unit: 'kg',
      vendor: vendor.name,
      vendorId: vendor.id,
      category: 'Vegetables',
      rating: 4.8,
      soldCount: 98,
      imageUrl: 'https://images.pexels.com/photos/29517546/pexels-photo-29517546.jpeg',
      description: 'Sweet bell peppers',
      inStock: true
    },
    {
      id: 105,
      name: 'Eggplants',
      price: 50.00,
      unit: 'kg',
      vendor: vendor.name,
      vendorId: vendor.id,
      category: 'Vegetables',
      rating: 4.5,
      soldCount: 145,
      imageUrl: 'https://images.pexels.com/photos/36836675/pexels-photo-36836675.jpeg',
      description: 'Fresh purple eggplants',
      inStock: false
    }
  ];

  useEffect(() => {
    setProducts(vendorProducts);
    loadCartCount();
  }, []);

  const toggleVendorFavorite = () => {
    if (isFavoriteVendor(vendor.id)) {
      removeFavoriteVendor(vendor.id);
    } else {
      addFavoriteVendor(vendor);
    }
  };

  const toggleProductFavorite = (product) => {
    if (isFavoriteProduct(product.id)) {
      removeFavoriteProduct(product.id);
    } else {
      addFavoriteProduct(product);
    }
  };

  const loadCartCount = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('userCart');
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        const itemCount = cart.reduce((total, vendor) => {
          return total + vendor.items.reduce((sum, item) => sum + item.quantity, 0);
        }, 0);
        setCartCount(itemCount);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const addToCart = async (product) => {
    try {
      const savedCart = await AsyncStorage.getItem('userCart');
      let cart = savedCart ? JSON.parse(savedCart) : [];

      const vendorIndex = cart.findIndex(v => v.id === product.vendorId);

      if (vendorIndex !== -1) {
        const productIndex = cart[vendorIndex].items.findIndex(item => item.id === product.id);
        
        if (productIndex !== -1) {
          cart[vendorIndex].items[productIndex].quantity += 1;
        } else {
          cart[vendorIndex].items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            unit: product.unit,
            imageUrl: product.imageUrl
          });
        }
      } else {
        cart.push({
          id: product.vendorId,
          vendor: product.vendor,
          items: [{
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            unit: product.unit,
            imageUrl: product.imageUrl
          }]
        });
      }

      await AsyncStorage.setItem('userCart', JSON.stringify(cart));
      loadCartCount();
      Alert.alert('Added to Cart', `${product.name} added to your cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const formatPeso = (amount) => {
    return `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const openDirections = () => {
    const url = Platform.select({
      ios: `maps://?q=${vendor.lat},${vendor.lng}`,
      android: `geo:${vendor.lat},${vendor.lng}?q=${vendor.lat},${vendor.lng}(${vendor.name})`
    });
    Linking.openURL(url);
  };

  const openPhone = () => {
    Linking.openURL(`tel:${vendor.contact}`);
  };

  // Render product in grid format (2 columns) like SearchScreen
  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <View style={styles.productImageContainer}>
        <Image 
          source={{ uri: item.imageUrl }}
          style={styles.productImage}
          defaultSource={require('../../assets/placeholder.png')}
        />
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleProductFavorite(item)}
        >
          <Icon 
            name={isFavoriteProduct(item.id) ? "favorite" : "favorite-border"} 
            size={20} 
            color={isFavoriteProduct(item.id) ? "#FF5252" : "#FFF"} 
          />
        </TouchableOpacity>
        {!item.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockOverlayText}>Out of Stock</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.vendorRow}>
          <Icon name="store" size={12} color="#999" />
          <Text style={styles.vendorName} numberOfLines={1}>{item.vendor}</Text>
        </View>
        
        <View style={styles.ratingRow}>
          <Icon name="star" size={14} color="#FFB800" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.soldCount}>• {item.soldCount} sold</Text>
        </View>
        
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.productPrice}>{formatPeso(item.price)}</Text>
            <Text style={styles.productUnit}>/ {item.unit}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.addToCartButton, !item.inStock && styles.addToCartButtonDisabled]}
            onPress={() => addToCart(item)}
            disabled={!item.inStock}
          >
            <Icon name="add-shopping-cart" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#010F1C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendor Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartButton}>
            <Icon name="shopping-cart" size={24} color="#010F1C" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Vendor Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.iconContainer}>
            <Icon name="store" size={80} color="#3BB77E" />
          </View>
          <TouchableOpacity style={styles.favoriteIcon} onPress={toggleVendorFavorite}>
            <Icon 
              name={isFavoriteVendor(vendor.id) ? "favorite" : "favorite-border"} 
              size={28} 
              color={isFavoriteVendor(vendor.id) ? "#FF5252" : "#FFF"} 
            />
          </TouchableOpacity>
        </View>

        {/* Vendor Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.vendorName}>{vendor.name}</Text>
          
          <View style={styles.ratingRow}>
            <Icon name="star" size={16} color="#FFB800" />
            <Text style={styles.ratingValue}>{vendor.rating}</Text>
            <Text style={styles.dot}>•</Text>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.distanceText}>{vendor.distance}</Text>
            <Text style={styles.dot}>•</Text>
            <Icon name="people" size={16} color="#666" />
            <Text style={styles.followerText}>{vendor.followers} followers</Text>
          </View>

          {/* Contact Info */}
          <View style={styles.contactSection}>
            <TouchableOpacity style={styles.contactButton} onPress={openPhone}>
              <Icon name="phone" size={20} color="#3BB77E" />
              <Text style={styles.contactText}>{vendor.contact}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactButton} onPress={openDirections}>
              <Icon name="directions" size={20} color="#3BB77E" />
              <Text style={styles.contactText}>Get Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Address */}
          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={18} color="#666" />
              <Text style={styles.detailText}>{vendor.address}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="access-time" size={18} color="#666" />
              <Text style={styles.detailText}>Hours: {vendor.hours}</Text>
            </View>
            
            {vendor.isOpen && (
              <View style={styles.openBadge}>
                <Text style={styles.openBadgeText}>Open Now</Text>
              </View>
            )}
          </View>

          {/* Produce Section */}
          <View style={styles.produceSection}>
            <Text style={styles.sectionTitle}>Products We Offer</Text>
            <View style={styles.produceTags}>
              {vendor.produce.map((item, index) => (
                <View key={index} style={styles.produceTag}>
                  <Text style={styles.produceTagText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Products List - Grid Layout like SearchScreen */}
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>All Products ({products.length})</Text>
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={item => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              scrollEnabled={false}
              contentContainerStyle={styles.productsList}
            />
          </View>
        </View>
      </ScrollView>
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
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    color: '#010F1C',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  bannerContainer: {
    height: 200,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
    padding: 8,
  },
  infoContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 20,
  },
  vendorName: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    color: '#010F1C',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  ratingValue: {
    fontSize: 14,
    color: '#FFB800',
    marginLeft: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  dot: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 6,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 2,
    fontFamily: 'Poppins-Regular',
  },
  followerText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 2,
    fontFamily: 'Poppins-Regular',
  },
  contactSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#3BB77E',
    fontFamily: 'Poppins-SemiBold',
  },
  detailSection: {
    borderTopWidth: 1,
    borderTopColor: '#EDE9E0',
    paddingTop: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  openBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  openBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  produceSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    color: '#010F1C',
    marginBottom: 12,
  },
  produceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  produceTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  produceTagText: {
    fontSize: 12,
    color: '#2E7D32',
    fontFamily: 'Poppins-Regular',
  },
  productsSection: {
    marginBottom: 100,
  },
  productsList: {
    paddingHorizontal: 0,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 4,
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
  productImageContainer: {
    height: 140,
    backgroundColor: '#F9F9F9',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 6,
  },
  outOfStockOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  outOfStockOverlayText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    color: '#010F1C',
    marginBottom: 4,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  vendorName: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFB800',
    marginLeft: 4,
  },
  soldCount: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    marginLeft: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    color: '#3BB77E',
  },
  productUnit: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#999',
  },
  addToCartButton: {
    backgroundColor: '#3BB77E',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3BB77E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
  },
});

export default VendorDetailsScreen;