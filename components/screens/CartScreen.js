import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  Modal,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TAB_BAR_HEIGHT = 70;
const CART_BAR_HEIGHT = 120;

const CartScreen = ({ navigation, userData }) => {
  const [cartItems, setCartItems] = useState([]);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    onConfirm: null,
    itemName: ''
  });

  useEffect(() => {
    loadCartData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCartData();
    }, [])
  );

  const loadCartData = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('userCart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        const defaultCart = [
          {
            id: 1,
            vendor: 'Green Valley Farm',
            items: [
              { id: 101, name: 'Tomatoes', price: 120.00, quantity: 2, unit: 'kg', imageUrl: 'https://images.pexels.com/photos/32570774/pexels-photo-32570774.jpeg' },
              { id: 102, name: 'Lettuce', price: 80.50, quantity: 1, unit: 'head', imageUrl: 'https://images.pexels.com/photos/36486646/pexels-photo-36486646.jpeg' },
            ]
          },
          {
            id: 2,
            vendor: 'Sunrise Organics',
            items: [
              { id: 201, name: 'Brown Eggs', price: 180.00, quantity: 1, unit: 'dozen', imageUrl: 'https://images.pexels.com/photos/30893349/pexels-photo-30893349.jpeg' },
            ]
          }
        ];
        setCartItems(defaultCart);
        await AsyncStorage.setItem('userCart', JSON.stringify(defaultCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCartToStorage = async (updatedCart) => {
    try {
      await AsyncStorage.setItem('userCart', JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const updateQuantity = (vendorId, itemId, increment) => {
    const updatedItems = cartItems.map(vendor => {
      if (vendor.id === vendorId) {
        return {
          ...vendor,
          items: vendor.items.map(item => {
            if (item.id === itemId) {
              const newQuantity = increment ? item.quantity + 1 : Math.max(1, item.quantity - 1);
              return { ...item, quantity: newQuantity };
            }
            return item;
          })
        };
      }
      return vendor;
    });
    setCartItems(updatedItems);
    saveCartToStorage(updatedItems);
  };

  // Show custom modal for delete confirmation
  const showDeleteConfirmation = (vendorId, itemId, itemName) => {
    setModalConfig({
      title: 'Remove Item',
      message: `Do you want to remove ${itemName} from your cart?`,
      onConfirm: () => deleteSingleItem(vendorId, itemId, itemName),
      itemName: itemName
    });
    setModalVisible(true);
  };

  const deleteSingleItem = (vendorId, itemId, itemName) => {
    let updatedCart = [...cartItems];
    const vendorIndex = updatedCart.findIndex(v => v.id === vendorId);
    
    if (vendorIndex !== -1) {
      const vendorItems = updatedCart[vendorIndex].items;
      const filteredItems = vendorItems.filter(item => item.id !== itemId);
      
      if (filteredItems.length === 0) {
        updatedCart.splice(vendorIndex, 1);
      } else {
        updatedCart[vendorIndex].items = filteredItems;
      }
      
      setCartItems(updatedCart);
      saveCartToStorage(updatedCart);
      
      // Show success modal
      setModalConfig({
        title: 'Success',
        message: `${itemName} removed from cart`,
        onConfirm: () => setModalVisible(false)
      });
      setModalVisible(true);
    }
  };

  // Show custom modal for clearing cart
  const showClearCartConfirmation = () => {
    if (cartItems.length === 0) return;
    
    setModalConfig({
      title: 'Clear Cart',
      message: 'Are you sure you want to remove ALL items from your cart?',
      onConfirm: () => {
        setCartItems([]);
        saveCartToStorage([]);
        setModalConfig({
          title: 'Success',
          message: 'Cart has been cleared',
          onConfirm: () => setModalVisible(false)
        });
      }
    });
    setModalVisible(true);
  };

  const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, vendor) => sum + calculateSubtotal(vendor.items), 0);
  };

  const formatPeso = (amount) => {
    return `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const handleCheckout = () => {
    // Calculate actual totals from cart items
    const calculatedSubtotal = calculateTotal();
    const calculatedShipping = 200.00; // Fixed shipping
    const calculatedTax = calculatedSubtotal * 0.05; // 5% tax
    const calculatedTotal = calculatedSubtotal + calculatedShipping + calculatedTax;
    
    console.log('Checkout Values:', {
      subtotal: calculatedSubtotal,
      shipping: calculatedShipping,
      tax: calculatedTax,
      total: calculatedTotal,
      cartItems: cartItems,
      userData: userData
    });
    
    navigation.navigate('PaymentMethods', {
      cartItems: cartItems,
      subtotal: calculatedSubtotal,
      shipping: calculatedShipping,
      tax: calculatedTax,
      total: calculatedTotal,
      userData: userData // Pass user data to PaymentMethods
    });
  };

  // Custom Modal Component
  const CustomModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalIcon}>
            <Icon 
              name={modalConfig.title === 'Success' ? 'check-circle' : 'warning'} 
              size={50} 
              color={modalConfig.title === 'Success' ? '#4CAF50' : '#FF9800'} 
            />
          </View>
          <Text style={styles.modalTitle}>{modalConfig.title}</Text>
          <Text style={styles.modalMessage}>{modalConfig.message}</Text>
          <View style={styles.modalButtons}>
            {modalConfig.title !== 'Success' && (
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[
                styles.modalButton, 
                modalConfig.title === 'Success' ? styles.modalSuccessButton : styles.modalConfirmButton
              ]}
              onPress={() => {
                if (modalConfig.onConfirm) {
                  modalConfig.onConfirm();
                }
                if (modalConfig.title === 'Success') {
                  setModalVisible(false);
                }
              }}
            >
              <Text style={styles.modalConfirmButtonText}>
                {modalConfig.title === 'Success' ? 'OK' : 'Remove'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f8fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={showClearCartConfirmation}>
            <Icon name="delete-sweep" size={24} color="#FF5252" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          cartItems.length > 0 && { paddingBottom: CART_BAR_HEIGHT + TAB_BAR_HEIGHT + 20 }
        ]}
      >
        {cartItems.map((vendor) => (
          <View key={vendor.id} style={styles.vendorSection}>
            <View style={styles.vendorHeader}>
              <Icon name="store" size={20} color="#3BB77E" />
              <Text style={styles.vendorName}>{vendor.vendor}</Text>
            </View>

            {vendor.items.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemLeft}>
                  <Image 
                    source={{ uri: item.imageUrl }}
                    style={styles.itemImage}
                    defaultSource={require('../../assets/placeholder.png')}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      {formatPeso(item.price)}/{item.unit}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemRight}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(vendor.id, item.id, false)}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(vendor.id, item.id, true)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Delete Button */}
                  <TouchableOpacity 
                    onPress={() => showDeleteConfirmation(vendor.id, item.id, item.name)}
                    style={styles.deleteButton}
                  >
                    <Icon name="delete-outline" size={22} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.vendorSubtotal}>
              <Text style={styles.subtotalText}>Subtotal:</Text>
              <Text style={styles.subtotalAmount}>
                {formatPeso(calculateSubtotal(vendor.items))}
              </Text>
            </View>
          </View>
        ))}

        {cartItems.length === 0 && (
          <View style={styles.emptyCart}>
            <Icon name="shopping-cart" size={80} color="#E0E0E0" />
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <Text style={styles.emptyCartSubtext}>
              Add items from local farms to get started
            </Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={styles.shopButtonText}>Browse Farms</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={[styles.bottomBar, { bottom: TAB_BAR_HEIGHT }]}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>{formatPeso(calculateTotal())}</Text>
          </View>

          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleCheckout}
            activeOpacity={0.8}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Custom Modal */}
      <CustomModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9E0',
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    color: '#010F1C',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  vendorSection: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE9E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9E0',
  },
  vendorName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    color: '#010F1C',
    marginLeft: 8,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9E0',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F9F9F9',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#010F1C',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#999999',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9E0',
    borderRadius: 20,
    padding: 2,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3BB77E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    lineHeight: 22,
  },
  quantity: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    color: '#010F1C',
    minWidth: 30,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 4,
  },
  vendorSubtotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDE9E0',
  },
  subtotalText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#999999',
  },
  subtotalAmount: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    color: '#3BB77E',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    borderTopWidth: 1,
    borderTopColor: '#EDE9E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 5,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    color: '#010F1C',
  },
  totalAmount: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    color: '#3BB77E',
  },
  checkoutButton: {
    backgroundColor: '#3BB77E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3BB77E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
  },
  emptyCart: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCartText: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    color: '#010F1C',
    marginTop: 16,
  },
  emptyCartSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#3BB77E',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    color: '#010F1C',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalConfirmButton: {
    backgroundColor: '#FF5252',
  },
  modalSuccessButton: {
    backgroundColor: '#4CAF50',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
  },
});

export default CartScreen;