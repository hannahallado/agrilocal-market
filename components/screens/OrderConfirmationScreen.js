import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OrderConfirmationScreen = ({ navigation, route }) => {
  const { orderDetails } = route.params || {
    orderNumber: '3911690705825',
    orderDate: 'April 3, 2026',
    subtotal: 3900.00,
    shipping: 200.00,
    tax: 100.00,
    total: 4200.00,
    items: [
      {
        name: 'Organic Heirloom Tomatoes',
        quantity: '2 kg',
        price: 3900.00,
        description: 'Fresh baby spinach included',
        emoji: '🍅'
      }
    ],
    shippingAddress: {
      name: 'John Newman',
      address: '2125 Chestnut Street',
      cityStateZip: 'San Francisco, CA 94123',
      email: 'test-order@baymard.com'
    },
    paymentMethod: 'VISA Ending in 8903',
    vendor: 'Green Valley Farm',
    estimatedDelivery: 'Tue, May 10'
  };

  const formatPeso = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '₱0.00';
    return `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Confirmation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <Icon name="check-circle" size={60} color="#2E7D32" />
          <Text style={styles.successTitle}>Thank you for your order</Text>
          <Text style={styles.orderNumber}>#{orderDetails.orderNumber}</Text>
          <Text style={styles.successMessage}>
            We'll send you a message with tracking information when your item ships.
          </Text>
        </View>

        {/* Order Info Card */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order placed:</Text>
            <Text style={styles.infoValue}>{orderDetails.orderDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Value shipping:</Text>
            <Text style={styles.infoValue}>Standard Shipping</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Arrives by:</Text>
            <Text style={styles.infoValue}>{orderDetails.estimatedDelivery}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sold by:</Text>
            <Text style={styles.infoValue}>{orderDetails.vendor}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order #:</Text>
            <Text style={styles.infoValue}>{orderDetails.orderNumber}</Text>
          </View>
        </View>

        {/* Order Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({orderDetails.items.length} item{orderDetails.items.length !== 1 ? 's' : ''}):</Text>
            <Text style={styles.summaryValue}>{formatPeso(orderDetails.subtotal)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Value shipping:</Text>
            <Text style={styles.summaryValue}>{formatPeso(orderDetails.shipping)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Est. tax:</Text>
            <Text style={styles.summaryValue}>{formatPeso(orderDetails.tax)}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatPeso(orderDetails.total)}</Text>
          </View>
        </View>

        {/* Shipping Address Card - Now shows logged-in user's name */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shipping address</Text>
          <Text style={styles.addressText}>{orderDetails.shippingAddress.name}</Text>
          <Text style={styles.addressText}>{orderDetails.shippingAddress.address}</Text>
          <Text style={styles.addressText}>{orderDetails.shippingAddress.cityStateZip}</Text>
          <Text style={styles.addressText}>{orderDetails.shippingAddress.email}</Text>
        </View>

        {/* Payment Type Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment type</Text>
          <Text style={styles.paymentText}>{orderDetails.paymentMethod}</Text>
        </View>

        {/* Billing Address Card - Now shows logged-in user's name */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Billing address</Text>
          <Text style={styles.addressText}>{orderDetails.shippingAddress.name}</Text>
          <Text style={styles.addressText}>{orderDetails.shippingAddress.address}</Text>
          <Text style={styles.addressText}>{orderDetails.shippingAddress.cityStateZip}</Text>
          <Text style={styles.addressText}>{orderDetails.shippingAddress.email}</Text>
        </View>

        {/* Items Card with emoji support */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {orderDetails.items.map((item, index) => (
            <View key={index}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemEmoji}>{item.emoji || '🛒'}</Text>
                <View style={styles.itemHeaderText}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  )}
                </View>
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemShipping}>
                  Value shipping: Arrives by {orderDetails.estimatedDelivery}
                </Text>
                <View style={styles.itemRow}>
                  <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>{formatPeso(item.price)}</Text>
                </View>
              </View>
              {index < orderDetails.items.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* View All Orders Button */}
        <TouchableOpacity 
          style={styles.viewOrdersButton}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Text style={styles.viewOrdersText}>View All Orders</Text>
        </TouchableOpacity>

        {/* Continue Shopping Button */}
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={styles.continueButtonText}>Continue Shopping</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  successBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 12,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  orderNumber: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
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
  addressText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  paymentText: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemEmoji: {
    fontSize: 30,
    marginRight: 12,
  },
  itemHeaderText: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  itemDetails: {
    marginTop: 4,
    marginLeft: 42,
  },
  itemShipping: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    fontFamily: 'Poppins-SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  viewOrdersButton: {
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  viewOrdersText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  continueButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default OrderConfirmationScreen;