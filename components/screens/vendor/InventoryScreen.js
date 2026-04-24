import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image, TextInput, RefreshControl } from 'react-native';
import { Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = { 
  background: '#f5f7f5',
  white: '#ffffff', 
  redAccent: '#9a3718', 
  greenAccent: '#546a40', 
  darkGreen: '#374629',
  lightGreen: '#bac76a',
  darkRed: '#6a2009',
  gray: '#666666',
  lightGray: '#f0f0f0',
  warning: '#ff9800',
};

const InventoryScreen = ({ navigation, route }) => {
  const [inventoryItems, setInventoryItems] = useState([
    { 
      id: '1', 
      name: 'Fresh Tomatoes', 
      price: 150, 
      stock: 15, 
      category: 'Vegetables', 
      status: 'Active', 
      imageUrl: 'https://images.pexels.com/photos/30893354/pexels-photo-30893354.jpeg'
    },
    { 
      id: '2', 
      name: 'Organic Kale', 
      price: 85, 
      stock: 5, 
      category: 'Vegetables', 
      status: 'Low Stock', 
      imageUrl: 'https://images.pexels.com/photos/36486646/pexels-photo-36486646.jpeg'
    },
    { 
      id: '3', 
      name: 'Red Onions', 
      price: 120, 
      stock: 8, 
      category: 'Vegetables', 
      status: 'Active', 
      imageUrl: 'https://images.pexels.com/photos/30893349/pexels-photo-30893349.jpeg'
    },
    { 
      id: '4', 
      name: 'Strawberries', 
      price: 250, 
      stock: 12, 
      category: 'Fruits', 
      status: 'Active', 
      imageUrl: 'https://images.pexels.com/photos/29517546/pexels-photo-29517546.jpeg'
    },
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const categories = ['All Categories', 'Vegetables', 'Fruits', 'Herbs', 'Organic'];

  const stats = [
    { label: 'Total Items', value: inventoryItems.length, icon: 'package-variant', color: COLORS.darkGreen },
    { label: 'Low Stock', value: inventoryItems.filter(i => i.stock < 10).length, icon: 'alert-circle', color: COLORS.warning },
  ];

  useEffect(() => {
    if (route.params?.newProduct) {
      const { newProduct } = route.params;
      const itemWithId = { ...newProduct, id: Date.now().toString() };
      setInventoryItems((currentItems) => [itemWithId, ...currentItems]);
      navigation.setParams({ newProduct: undefined });
    }
    
    if (route.params?.deletedProductId) {
      const { deletedProductId } = route.params;
      setInventoryItems((currentItems) => currentItems.filter(item => item.id !== deletedProductId));
      navigation.setParams({ deletedProductId: undefined });
    }
  }, [route.params?.newProduct, route.params?.deletedProductId]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const StatCard = ({ stat }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
        <MaterialCommunityIcons name={stat.icon} size={24} color={stat.color} />
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );

  const InventoryItem = ({ item }) => (
    <View style={styles.inventoryRow}>
      <View style={styles.rowCell}>
        <Image 
          source={{ uri: item.imageUrl }}
          style={styles.productImage}
          defaultSource={require('../../../assets/placeholder.png')}
        />
      </View>
      <View style={[styles.rowCell, styles.productCell]}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
      </View>
      <View style={styles.rowCell}>
        <Text style={styles.productPrice}>₱{item.price}</Text>
      </View>
      <View style={styles.rowCell}>
        <Text style={styles.productStock}>{item.stock} kg</Text>
      </View>
      <View style={styles.rowCell}>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#E8F5E9' : '#FFF3E0' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Active' ? COLORS.greenAccent : COLORS.warning }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={styles.rowCell}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddProduct', { product: item })}
        >
          <MaterialCommunityIcons name="pencil" size={18} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.redAccent]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Add Button */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Product Inventory</Text>
            <Text style={styles.subtitle}>Manage your stock levels and product availability.</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid - Only 2 stats */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchbar}>
            <MaterialCommunityIcons name="magnify" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by product name..."
              placeholderTextColor={COLORS.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close" size={18} color={COLORS.gray} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Text style={styles.filterButtonText}>{selectedCategory}</Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.darkGreen} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.filterIconButton}>
            <MaterialCommunityIcons name="filter-variant" size={20} color={COLORS.darkGreen} />
          </TouchableOpacity>
        </View>

        {/* Simple Filter Menu */}
        {showFilterMenu && (
          <View style={styles.filterMenu}>
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat}
                style={styles.filterMenuItem}
                onPress={() => {
                  setSelectedCategory(cat);
                  setShowFilterMenu(false);
                }}
              >
                <Text style={styles.filterMenuItemText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Inventory Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.imageHeader]}>Image</Text>
          <Text style={[styles.headerCell, styles.productHeader]}>Product</Text>
          <Text style={styles.headerCell}>Price</Text>
          <Text style={styles.headerCell}>Stock</Text>
          <Text style={styles.headerCell}>Status</Text>
          <Text style={styles.headerCell}>Actions</Text>
        </View>

        <View style={styles.divider} />

        {/* Inventory List */}
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <InventoryItem key={item.id} item={item} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-variant" size={60} color={COLORS.lightGray} />
            <Text style={styles.emptyStateText}>No products found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your search or add a new product</Text>
            <TouchableOpacity 
              style={styles.addFirstButton}
              onPress={() => navigation.navigate('AddProduct')}
            >
              <Text style={styles.addFirstButtonText}>+ Add your first product</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.darkGreen, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.gray },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.redAccent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.darkGreen, marginBottom: 4 },
  statLabel: { fontSize: 11, color: COLORS.gray },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  searchbar: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    elevation: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.darkGreen,
    padding: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    elevation: 1,
  },
  filterButtonText: {
    fontSize: 13,
    color: COLORS.darkGreen,
  },
  filterIconButton: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 10,
    elevation: 1,
  },
  filterMenu: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  filterMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterMenuItemText: {
    fontSize: 14,
    color: COLORS.darkGreen,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.gray,
    flex: 1,
  },
  imageHeader: { flex: 0.7 },
  productHeader: { flex: 1.5 },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginBottom: 8,
  },
  inventoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 6,
    elevation: 1,
  },
  rowCell: {
    flex: 1,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  productCell: {
    flex: 1.5,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGreen,
  },
  productCategory: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.redAccent,
  },
  productStock: {
    fontSize: 12,
    color: COLORS.darkGreen,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionButton: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: COLORS.lightGray,
    marginTop: 4,
  },
  addFirstButton: {
    marginTop: 20,
    backgroundColor: COLORS.redAccent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default InventoryScreen;