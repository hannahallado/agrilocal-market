import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StatusBar,
  Platform,
  Image,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../../context/FavoritesContext';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { favoriteProducts, addFavoriteProduct, removeFavoriteProduct, isFavoriteProduct } = useFavorites();

  const categories = [
    'All', 'Vegetables', 'Fruits', 'Herbs', 'Dairy', 'Eggs', 'Honey', 'Rice', 'Organic'
  ];

  const allProducts = [
    { 
      id: 1, 
      name: 'Kamote (Sweet Potato)', 
      price: 60.00, 
      unit: 'kg', 
      vendor: 'Benguet Farms', 
      category: 'Vegetables', 
      rating: 4.8, 
      soldCount: 234,
      imageUrl: 'https://images.pexels.com/photos/30893354/pexels-photo-30893354.jpeg'
    },
    { 
      id: 2, 
      name: 'Pechay (Bok Choy)', 
      price: 35.00, 
      unit: 'bunch', 
      vendor: 'Mountain Fresh', 
      category: 'Vegetables', 
      rating: 4.7, 
      soldCount: 189,
      imageUrl: 'https://images.pexels.com/photos/36486646/pexels-photo-36486646.jpeg'
    },
    { 
      id: 3, 
      name: 'Itlog (Eggs)', 
      price: 120.00, 
      unit: 'dozen', 
      vendor: 'Happy Hens', 
      category: 'Eggs', 
      rating: 4.9, 
      soldCount: 567,
      imageUrl: 'https://images.pexels.com/photos/30893349/pexels-photo-30893349.jpeg'
    },
    { 
      id: 4, 
      name: 'Strawberries', 
      price: 250.00, 
      unit: 'box', 
      vendor: 'Benguet Berry Farm', 
      category: 'Fruits', 
      rating: 4.9, 
      soldCount: 445,
      imageUrl: 'https://images.pexels.com/photos/29517546/pexels-photo-29517546.jpeg'
    },
    { 
      id: 5, 
      name: 'Saging na Saba', 
      price: 70.00, 
      unit: 'kg', 
      vendor: 'Davao Farms', 
      category: 'Fruits', 
      rating: 4.6, 
      soldCount: 312,
      imageUrl: 'https://images.pexels.com/photos/36836675/pexels-photo-36836675.jpeg'
    },
    { 
      id: 6, 
      name: 'Kamatis (Tomatoes)', 
      price: 80.00, 
      unit: 'kg', 
      vendor: 'Green Valley', 
      category: 'Vegetables', 
      rating: 4.5, 
      soldCount: 278,
      imageUrl: 'https://images.pexels.com/photos/32570774/pexels-photo-32570774.jpeg'
    },
  ];

  const formatPeso = (amount) => {
    return `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const toggleFavorite = (product) => {
    if (isFavoriteProduct(product.id)) {
      removeFavoriteProduct(product.id);
    } else {
      addFavoriteProduct(product);
    }
  };

  const addToCart = async (product) => {
    try {
      const savedCart = await AsyncStorage.getItem('userCart');
      let cart = savedCart ? JSON.parse(savedCart) : [];

      const vendorIndex = cart.findIndex(v => v.vendor === product.vendor);

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
          id: product.id,
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
      Alert.alert('Added to Cart', `${product.name} added to your cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderProductCard = ({ item }) => (
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
          onPress={() => toggleFavorite(item)}
        >
          <Icon 
            name={isFavoriteProduct(item.id) ? "favorite" : "favorite-border"} 
            size={20} 
            color={isFavoriteProduct(item.id) ? "#FF5252" : "#FFF"} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.vendorRow}>
          <Icon name="store" size={12} color="#999" />
          <Text style={styles.vendorName}>{item.vendor}</Text>
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
            style={styles.addToCartButton}
            onPress={() => addToCart(item)}
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
        <Text style={styles.headerTitle}>Browse Products</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Icon name="shopping-cart" size={24} color="#010F1C" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for products or vendors..."
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
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredProducts.length} products available
        </Text>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productList}
        ListFooterComponent={<View style={styles.listFooter} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="search-off" size={60} color="#E0E0E0" />
            <Text style={styles.emptyStateText}>No products found</Text>
            <Text style={styles.emptyStateSubtext}>Try different keywords or category</Text>
          </View>
        }
      />
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
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9E0',
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
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
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
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  productList: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  listFooter: {
    height: 80, // Adds padding below the last row of products
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
});

export default SearchScreen;