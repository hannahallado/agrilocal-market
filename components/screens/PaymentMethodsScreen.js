import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  StatusBar,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PaymentMethodsScreen = ({ navigation, route }) => {
  // Get cart data from route params with safe defaults
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(200);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Extract params when component mounts
    const params = route.params || {};
    console.log('PaymentMethods received params:', params);
    
    setCartItems(params.cartItems || []);
    setSubtotal(params.subtotal || 0);
    setShipping(params.shipping || 200);
    setTax(params.tax || 0);
    setTotal(params.total || 0);
    setUserData(params.userData || null);
  }, [route.params]);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'Mastercard',
      cardNumber: '1234 5678 9012 3456',
      cardHolder: 'Origo Smith',
      expiryDate: '05/29',
      isDefault: true,
    },
    {
      id: 2,
      type: 'Visa',
      cardNumber: '9876 5432 1098 7654',
      cardHolder: 'Origo Smith',
      expiryDate: '08/30',
      isDefault: false,
    }
  ]);

  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    type: 'Visa'
  });

  // Negros Occidental cities and municipalities
  const negrosOccidentalLocations = [
    'Bacolod City', 'Bago City', 'Cadiz City', 'Escalante City', 'Himamaylan City',
    'Kabankalan City', 'La Carlota City', 'Sagay City', 'San Carlos City', 'Silay City',
    'Sipalay City', 'Talisay City', 'Victorias City', 'Binalbagan', 'Calatrava',
    'Candoni', 'Cauayan', 'Enrique B. Magalona', 'Hinigaran', 'Hinoba-an',
    'Ilog', 'Isabela', 'La Castellana', 'Manapla', 'Moises Padilla', 'Murcia',
    'Pontevedra', 'Pulupandan', 'San Enrique', 'Toboso', 'Valladolid'
  ];

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return text;
    }
  };

  const handleAddCard = () => {
    if (!newCard.cardNumber || !newCard.cardHolder || !newCard.expiryDate || !newCard.cvv) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newPaymentMethod = {
      id: paymentMethods.length + 1,
      type: newCard.type,
      cardNumber: newCard.cardNumber,
      cardHolder: newCard.cardHolder,
      expiryDate: newCard.expiryDate,
      isDefault: false,
    };

    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setNewCard({
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      type: 'Visa'
    });
    setShowAddCard(false);
    Alert.alert('Success', 'Payment method added successfully');
  };

  const setDefaultCard = (id) => {
    setPaymentMethods(paymentMethods.map(card => ({
      ...card,
      isDefault: card.id === id
    })));
  };

  const deleteCard = (id) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            setPaymentMethods(paymentMethods.filter(card => card.id !== id));
            Alert.alert('Success', 'Payment method removed');
          },
          style: 'destructive'
        }
      ]
    );
  };

  const getCardIcon = (type) => {
    switch(type) {
      case 'Mastercard':
        return 'credit-card';
      case 'Visa':
        return 'credit-card';
      default:
        return 'credit-card';
    }
  };

  const getCardColor = (type) => {
    switch(type) {
      case 'Mastercard':
        return '#FF6B6B';
      case 'Visa':
        return '#4A90E2';
      default:
        return '#666';
    }
  };

  // Format items for order confirmation
  const formatOrderItems = () => {
    const items = [];
    if (cartItems && cartItems.length > 0) {
      cartItems.forEach(vendor => {
        if (vendor && vendor.items) {
          vendor.items.forEach(item => {
            items.push({
              name: item.name,
              quantity: `${item.quantity} ${item.unit}`,
              price: item.price * item.quantity,
              description: `From ${vendor.vendor}`,
              emoji: item.emoji || '🛒'
            });
          });
        }
      });
    }
    return items;
  };

  // Handle payment button press
  const handlePayment = () => {
    const defaultCard = paymentMethods.find(card => card.isDefault) || paymentMethods[0];
    const orderItems = formatOrderItems();
    
    const finalSubtotal = subtotal;
    const finalShipping = shipping;
    const finalTax = tax;
    const finalTotal = total;
    
    const vendorNames = cartItems && cartItems.length > 0 
      ? cartItems.map(v => v.vendor).join(', ')
      : 'Green Valley Farm';
    
    // Use actual user data from props or route
    const userName = userData?.fullName || 'Guest User';
    const userEmail = userData?.email || 'guest@agrilocal.com';
    
    // Set a random address in Negros Occidental
    const randomLocation = negrosOccidentalLocations[Math.floor(Math.random() * negrosOccidentalLocations.length)];
    const streetNames = ['Purok Mabinuligon', 'Barangay Zone 4', 'Hacienda Felisa', 'Lacson Street', 'Araneta Avenue', 'San Juan Street'];
    const randomStreet = streetNames[Math.floor(Math.random() * streetNames.length)];
    
    const orderDetails = {
      orderNumber: Math.floor(Math.random() * 10000000000000).toString(),
      orderDate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      subtotal: finalSubtotal,
      shipping: finalShipping,
      tax: finalTax,
      total: finalTotal,
      items: orderItems,
      shippingAddress: {
        name: userName,
        address: `${randomStreet}, ${randomLocation}`,
        cityStateZip: `${randomLocation}, Negros Occidental, Philippines 6100`,
        email: userEmail
      },
      paymentMethod: defaultCard ? `${defaultCard.type} Ending in ${defaultCard.cardNumber.slice(-4)}` : 'VISA Ending in 8903',
      vendor: vendorNames,
      estimatedDelivery: 'Tue, May 10',
      userData: userData,
      cardHolderName: defaultCard?.cardHolder || 'Card Holder'
    };
    
    console.log('Order Details:', orderDetails);
    
    // Navigate to Order Confirmation screen
    navigation.navigate('OrderConfirmation', { orderDetails });
  };

  // Format peso helper with safe check
  const formatPeso = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '₱0.00';
    return `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.userInfoCard}>
            <View style={styles.userInfoRow}>
              <Icon name="person" size={20} color="#2E7D32" />
              <Text style={styles.userInfoText}>{userData?.fullName || 'Guest User'}</Text>
            </View>
            <View style={styles.userInfoRow}>
              <Icon name="email" size={20} color="#2E7D32" />
              <Text style={styles.userInfoText}>{userData?.email || 'guest@agrilocal.com'}</Text>
            </View>
          </View>
        </View>

        {/* Order Summary Section */}
        <View style={styles.orderSummarySection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            {cartItems && cartItems.length > 0 ? (
              cartItems.map((vendor, vendorIndex) => (
                <View key={vendorIndex}>
                  <Text style={styles.vendorNameSummary}>{vendor.vendor}</Text>
                  {vendor.items && vendor.items.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.summaryItem}>
                      <Text style={styles.summaryItemName}>
                        {item.quantity}x {item.name}
                      </Text>
                      <Text style={styles.summaryItemPrice}>
                        {formatPeso(item.price * item.quantity)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemName}>No items in cart</Text>
              </View>
            )}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>{formatPeso(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping:</Text>
              <Text style={styles.summaryValue}>{formatPeso(shipping)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (5%):</Text>
              <Text style={styles.summaryValue}>{formatPeso(tax)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{formatPeso(total)}</Text>
            </View>
          </View>
        </View>

        {/* Saved Cards Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Cards</Text>
          {paymentMethods.map((card) => (
            <View key={card.id} style={styles.cardItem}>
              <View style={[styles.cardIcon, { backgroundColor: getCardColor(card.type) + '20' }]}>
                <Icon name={getCardIcon(card.type)} size={24} color={getCardColor(card.type)} />
              </View>
              
              <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardType}>{card.type}</Text>
                  {card.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardNumber}>•••• •••• •••• {card.cardNumber.slice(-4)}</Text>
                <Text style={styles.cardExpiry}>Expires {card.expiryDate}</Text>
                <Text style={styles.cardHolder}>{card.cardHolder}</Text>
              </View>

              <View style={styles.cardActions}>
                {!card.isDefault && (
                  <TouchableOpacity 
                    style={styles.actionIcon}
                    onPress={() => setDefaultCard(card.id)}
                  >
                    <Icon name="check-circle" size={22} color="#2E7D32" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.actionIcon}
                  onPress={() => deleteCard(card.id)}
                >
                  <Icon name="delete-outline" size={22} color="#FF5252" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add New Card Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddCard(!showAddCard)}
        >
          <Icon name="add-circle-outline" size={24} color="#2E7D32" />
          <Text style={styles.addButtonText}>Add New Payment Method</Text>
        </TouchableOpacity>

        {/* Add New Card Form */}
        {showAddCard && (
          <View style={styles.addCardSection}>
            <Text style={styles.addCardTitle}>Add New Card</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={newCard.cardNumber}
                onChangeText={(text) => setNewCard({...newCard, cardNumber: formatCardNumber(text)})}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Holder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Card Holder Name"
                value={newCard.cardHolder}
                onChangeText={(text) => setNewCard({...newCard, cardHolder: text})}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={newCard.expiryDate}
                  onChangeText={(text) => setNewCard({...newCard, expiryDate: text})}
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={newCard.cvv}
                  onChangeText={(text) => setNewCard({...newCard, cvv: text})}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Type</Text>
              <View style={styles.cardTypeSelector}>
                <TouchableOpacity 
                  style={[styles.cardTypeBtn, newCard.type === 'Visa' && styles.cardTypeActive]}
                  onPress={() => setNewCard({...newCard, type: 'Visa'})}
                >
                  <Text style={[styles.cardTypeText, newCard.type === 'Visa' && styles.cardTypeTextActive]}>Visa</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.cardTypeBtn, newCard.type === 'Mastercard' && styles.cardTypeActive]}
                  onPress={() => setNewCard({...newCard, type: 'Mastercard'})}
                >
                  <Text style={[styles.cardTypeText, newCard.type === 'Mastercard' && styles.cardTypeTextActive]}>Mastercard</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.addCardActions}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => setShowAddCard(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.saveBtn]}
                onPress={handleAddCard}
              >
                <Text style={styles.saveBtnText}>Add Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Payment Button */}
        <TouchableOpacity 
          style={styles.paymentButton}
          onPress={handlePayment}
        >
          <Text style={styles.paymentButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  userInfoSection: {
    padding: 16,
    paddingBottom: 8,
  },
  userInfoCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  userInfoText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  orderSummarySection: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  summaryCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  vendorNameSummary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryItemName: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  summaryItemPrice: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  summaryValue: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins-Bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    fontFamily: 'Poppins-Bold',
  },
  section: {
    padding: 16,
  },
  addCardSection: {
    backgroundColor: '#F9F9F9',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFF',
    fontFamily: 'Poppins-Regular',
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cardTypeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  cardTypeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  cardTypeActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  cardTypeText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  cardTypeTextActive: {
    color: '#FFF',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  addCardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelBtnText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  saveBtn: {
    backgroundColor: '#2E7D32',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  cardNumber: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
  },
  cardExpiry: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
  },
  cardHolder: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 12,
    borderStyle: 'dashed',
    backgroundColor: '#F9F9F9',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  paymentButton: {
    backgroundColor: '#2E7D32',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
});

export default PaymentMethodsScreen;