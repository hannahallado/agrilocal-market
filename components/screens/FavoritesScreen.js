import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../../context/FavoritesContext';

const FavoritesScreen = ({ navigation }) => {
  const {
    loading,
    favoriteVendors,
    favoriteProducts,
    removeFavoriteVendor,
    removeFavoriteProduct,
  } = useFavorites();

  const [activeTab, setActiveTab] = useState('vendors');

  // ─── Add to cart (local AsyncStorage, unchanged) ─────────────────────────────
  const addToCart = async (product) => {
    try {
      const savedCart = await AsyncStorage.getItem('userCart');
      let cart = savedCart ? JSON.parse(savedCart) : [];

      const vendorIndex = cart.findIndex((v) => v.id === product.vendorId);
      if (vendorIndex !== -1) {
        const productIndex = cart[vendorIndex].items.findIndex((item) => item.id === product.id);
        if (productIndex !== -1) {
          cart[vendorIndex].items[productIndex].quantity += 1;
        } else {
          cart[vendorIndex].items.push({
            id: product.id, name: product.name, price: product.price,
            quantity: 1, unit: product.unit, imageUrl: product.imageUrl,
          });
        }
      } else {
        cart.push({
          id: product.vendorId,
          vendor: product.vendor,
          items: [{
            id: product.id, name: product.name, price: product.price,
            quantity: 1, unit: product.unit, imageUrl: product.imageUrl,
          }],
        });
      }

      await AsyncStorage.setItem('userCart', JSON.stringify(cart));
      Alert.alert('Added to Cart', `${product.name} added to your cart`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  // ─── Remove handlers (delegate to context) ───────────────────────────────────
  const handleRemoveVendor = (item) => {
    Alert.alert(
      'Remove from Favorites',
      `Remove ${item.name} from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => removeFavoriteVendor(item.id) },
      ]
    );
  };

  const handleRemoveProduct = (item) => {
    Alert.alert(
      'Remove from Favorites',
      `Remove ${item.name} from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => removeFavoriteProduct(item.id) },
      ]
    );
  };

  // ─── Render items ─────────────────────────────────────────────────────────────
  const renderVendorItem = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      onPress={() => navigation.navigate('VendorDetails', { vendor: item })}
    >
      <View style={styles.cardLeft}>
        <View style={styles.vendorImageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.vendorImage}
              defaultSource={require('../../assets/placeholder.png')}
            />
          ) : (
            <Icon name="store" size={40} color="#2E7D32" />
          )}
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.vendorName}>{item.name}</Text>
          <TouchableOpacity onPress={() => handleRemoveVendor(item)}>
            <Icon name="favorite" size={20} color="#FF5252" />
          </TouchableOpacity>
        </View>
        <View style={styles.vendorMeta}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFB800" />
            <Text style={styles.metaText}>{item.rating}</Text>
          </View>
          <View style={styles.distanceContainer}>
            <Icon name="location-on" size={14} color="#666" />
            <Text style={styles.metaText}>{item.distance}</Text>
          </View>
        </View>
        <Text style={styles.produceText}>{item.produce}</Text>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Store</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productLeft}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.productImage}
          defaultSource={require('../../assets/placeholder.png')}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productVendor}>{item.vendor}</Text>
          <Text style={styles.productPrice}>₱{item.price}/{item.unit}</Text>
        </View>
      </View>
      <View style={styles.productRight}>
        <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
          <Icon name="add-shopping-cart" size={22} color="#2E7D32" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleRemoveProduct(item)}>
          <Icon name="favorite" size={20} color="#FF5252" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const currentItems = activeTab === 'vendors' ? favoriteVendors : favoriteProducts;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Icon name="shopping-cart" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vendors' && styles.activeTab]}
          onPress={() => setActiveTab('vendors')}
        >
          <Icon name="store" size={20} color={activeTab === 'vendors' ? '#2E7D32' : '#999'} />
          <Text style={[styles.tabText, activeTab === 'vendors' && styles.activeTabText]}>
            Vendors ({favoriteVendors.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Icon name="shopping-basket" size={20} color={activeTab === 'products' ? '#2E7D32' : '#999'} />
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
            Products ({favoriteProducts.length})
          </Text>
        </TouchableOpacity>
      </View>

      {currentItems.length > 0 ? (
        <FlatList
          data={currentItems}
          renderItem={activeTab === 'vendors' ? renderVendorItem : renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <Icon name="favorite-border" size={80} color="#E0E0E0" />
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'vendors'
              ? 'Start adding vendors to your favorites'
              : 'Start adding products to your favorites'}
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate(activeTab === 'vendors' ? 'Map' : 'Search')}
          >
            <Text style={styles.browseButtonText}>
              {activeTab === 'vendors' ? 'Browse Vendors' : 'Browse Products'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: Platform.OS === 'ios' ? 50 : 40,
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#FFF',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', fontFamily: 'Poppins-Bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabContainer: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#FFF',
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 10, gap: 8,
  },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#2E7D32' },
  tabText: { fontSize: 14, color: '#999', fontWeight: '500', fontFamily: 'Poppins-Regular' },
  activeTabText: { color: '#2E7D32', fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  listContainer: { padding: 16, paddingBottom: 120 },
  favoriteCard: {
    flexDirection: 'row', backgroundColor: '#F9F9F9', borderRadius: 12,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  cardLeft: { marginRight: 16 },
  vendorImageContainer: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#E8F5E9', justifyContent: 'center',
    alignItems: 'center', overflow: 'hidden',
  },
  vendorImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  vendorName: { fontSize: 16, fontWeight: 'bold', color: '#333', fontFamily: 'Poppins-Bold' },
  vendorMeta: { flexDirection: 'row', marginBottom: 8, gap: 16 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  distanceContainer: { flexDirection: 'row', alignItems: 'center' },
  metaText: { marginLeft: 4, fontSize: 12, color: '#666', fontFamily: 'Poppins-Regular' },
  produceText: { fontSize: 12, color: '#2E7D32', marginBottom: 12, fontFamily: 'Poppins-Regular' },
  viewButton: {
    alignSelf: 'flex-start', paddingHorizontal: 12,
    paddingVertical: 6, backgroundColor: '#E8F5E9', borderRadius: 6,
  },
  viewButtonText: { color: '#2E7D32', fontSize: 12, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  productCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F9F9F9', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  productLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  productImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12, resizeMode: 'cover' },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: 'bold', color: '#333', fontFamily: 'Poppins-SemiBold' },
  productVendor: { fontSize: 12, color: '#999', marginTop: 2, fontFamily: 'Poppins-Regular' },
  productPrice: { fontSize: 14, fontWeight: '600', color: '#2E7D32', marginTop: 4, fontFamily: 'Poppins-SemiBold' },
  productRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  addButton: { padding: 6 },
  emptyContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 40, paddingVertical: 60,
  },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 16, fontFamily: 'Poppins-Bold' },
  emptySubtext: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8, fontFamily: 'Poppins-Regular' },
  browseButton: {
    backgroundColor: '#2E7D32', paddingHorizontal: 30,
    paddingVertical: 12, borderRadius: 8, marginTop: 20,
  },
  browseButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
});

export default FavoritesScreen;
