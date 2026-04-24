import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../../context/FavoritesContext';

const COLORS = {
  darkGreen: '#374629',
  greenAccent: '#3BB77E',
  redAccent: '#9a3718',
  lightGreen: '#bac76a',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f0f0f0',
  warning: '#ff9800',
};

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { isFavoriteProduct, addFavoriteProduct, removeFavoriteProduct } = useFavorites();

  const formatPeso = (amount) => {
    return `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const toggleFavorite = () => {
    if (isFavoriteProduct(product.id)) {
      removeFavoriteProduct(product.id);
      Alert.alert('Removed', `${product.name} removed from favorites`);
    } else {
      addFavoriteProduct(product);
      Alert.alert('Added', `${product.name} added to favorites`);
    }
  };

  const addToCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('userCart');
      let cart = savedCart ? JSON.parse(savedCart) : [];

      const vendorIndex = cart.findIndex(v => v.vendor === product.vendor);

      if (vendorIndex !== -1) {
        const productIndex = cart[vendorIndex].items.findIndex(item => item.id === product.id);
        
        if (productIndex !== -1) {
          cart[vendorIndex].items[productIndex].quantity += quantity;
        } else {
          cart[vendorIndex].items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            unit: product.unit,
            imageUrl: product.imageUrl
          });
        }
      } else {
        cart.push({
          id: product.id,
          vendor: product.vendor,
          items: [{
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            unit: product.unit,
            imageUrl: product.imageUrl
          }]
        });
      }

      await AsyncStorage.setItem('userCart', JSON.stringify(cart));
      Alert.alert('Added to Cart', `${quantity} x ${product.name} added to your cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const updateQuantity = (increment) => {
    if (increment) {
      setQuantity(prev => prev + 1);
    } else if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            defaultSource={require('../../assets/placeholder.png')}
          />
          
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          {/* Favorite Button */}
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <Icon 
              name={isFavoriteProduct(product.id) ? "favorite" : "favorite-border"} 
              size={24} 
              color={isFavoriteProduct(product.id) ? "#FF5252" : "#FFF"} 
            />
          </TouchableOpacity>
        </View>

        {/* Product Details Section */}
        <View style={styles.detailsSection}>
          {/* Product Name and Rating */}
          <View style={styles.headerRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFB800" />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
          </View>

          {/* Vendor Info */}
          <TouchableOpacity style={styles.vendorRow}>
            <Icon name="store" size={16} color={COLORS.gray} />
            <Text style={styles.vendorName}>{product.vendor}</Text>
            <Icon name="chevron-right" size={16} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Price */}
          <Text style={styles.priceText}>
            {formatPeso(product.price)} <Text style={styles.unitText}>/ {product.unit}</Text>
          </Text>

          {/* Sold Count */}
          <View style={styles.soldRow}>
            <MaterialCommunityIcons name="package-variant" size={16} color={COLORS.gray} />
            <Text style={styles.soldText}>{product.soldCount}+ sold</Text>
          </View>

          <Divider style={styles.divider} />

          {/* Product Description */}
          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.description}>
            Freshly harvested {product.name} directly from {product.vendor}. 
            Our produce is grown with sustainable farming practices, ensuring the 
            highest quality and freshest taste for your family. Perfect for your 
            daily cooking needs.
          </Text>

          <Divider style={styles.divider} />

          {/* Product Details */}
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="leaf" size={20} color={COLORS.greenAccent} />
              <Text style={styles.detailLabel}>Organic</Text>
              <Text style={styles.detailValue}>Yes</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="weather-sunny" size={20} color={COLORS.greenAccent} />
              <Text style={styles.detailLabel}>Season</Text>
              <Text style={styles.detailValue}>Year-round</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="truck-delivery" size={20} color={COLORS.greenAccent} />
              <Text style={styles.detailLabel}>Delivery</Text>
              <Text style={styles.detailValue}>Same Day</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="shield-check" size={20} color={COLORS.greenAccent} />
              <Text style={styles.detailLabel}>Quality</Text>
              <Text style={styles.detailValue}>Premium</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Quantity Selector */}
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => updateQuantity(false)}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => updateQuantity(true)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.unitLabel}>{product.unit}</Text>
          </View>

          {/* Total Price */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Price:</Text>
            <Text style={styles.totalPrice}>{formatPeso(product.price * quantity)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.buyNowButton}
          onPress={addToCart}
        >
          <Text style={styles.buyNowText}>Add to Cart</Text>
          <MaterialCommunityIcons name="cart-plus" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#F9F9F9',
  },
  productImage: {
    width: '100%',
    height: 350,
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
    padding: 8,
  },
  detailsSection: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkGreen,
    fontFamily: 'Poppins-Bold',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFB800',
    marginLeft: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  vendorName: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: 'Poppins-Regular',
  },
  priceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.greenAccent,
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
  },
  unitText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: COLORS.gray,
  },
  soldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  soldText: {
    fontSize: 13,
    color: COLORS.gray,
    fontFamily: 'Poppins-Regular',
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGreen,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkGreen,
    fontFamily: 'Poppins-SemiBold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.greenAccent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.greenAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGreen,
    minWidth: 40,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  unitLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: 'Poppins-Regular',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGreen,
    fontFamily: 'Poppins-SemiBold',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.greenAccent,
    fontFamily: 'Poppins-Bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  buyNowButton: {
    backgroundColor: COLORS.greenAccent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.greenAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buyNowText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
});

export default ProductDetailScreen;