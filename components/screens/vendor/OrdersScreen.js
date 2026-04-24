// screens/vendor/OrdersScreen.js
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card } from 'react-native-paper';
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
  success: '#4caf50',
  info: '#2196f3',
};

const TAB_BAR_HEIGHT = 70;

const OrdersScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('new');

  const orders = {
    new: [
      { 
        id: 'ORD-9921', 
        date: 'APR 04', 
        customer: 'Leslie G. Alexander', 
        items: 3, 
        type: 'Store Pickup',
        total: 1450.00,
        status: 'Pending'
      },
      { 
        id: 'ORD-9919', 
        date: 'APR 04', 
        customer: 'Esther H. Morrison', 
        items: 2, 
        type: 'Delivery',
        total: 890.00,
        status: 'Pending'
      },
    ],
    ready: [
      { 
        id: 'ORD-9920', 
        date: 'APR 04', 
        customer: 'Marvin K. McKinney', 
        items: 1, 
        type: 'Delivery',
        total: 320.00,
        status: 'Ready'
      },
      { 
        id: 'ORD-9917', 
        date: 'APR 03', 
        customer: 'Catherine D. Smith', 
        items: 4, 
        type: 'Store Pickup',
        total: 2100.00,
        status: 'Ready'
      },
    ],
    completed: [
      { 
        id: 'ORD-9918', 
        date: 'APR 03', 
        customer: 'Guy Hawkins', 
        items: 5, 
        type: 'Store Pickup',
        total: 2100.00,
        status: 'Completed'
      },
    ],
    cancelled: []
  };

  const getStatusCount = (status) => {
    switch(status) {
      case 'new': return orders.new.length;
      case 'ready': return orders.ready.length;
      case 'completed': return orders.completed.length;
      case 'cancelled': return orders.cancelled.length;
      default: return 0;
    }
  };

  const getTabColor = (tab) => {
    switch(tab) {
      case 'new': return COLORS.warning;
      case 'ready': return COLORS.success;
      case 'completed': return COLORS.darkGreen;
      case 'cancelled': return COLORS.redAccent;
      default: return COLORS.gray;
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const OrderCard = ({ order, type }) => (
    <Card style={styles.orderCard}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>{order.id}</Text>
            <Text style={styles.orderDate}>{order.date}</Text>
          </View>
          <View style={[styles.statusChip, { 
            backgroundColor: type === 'new' ? '#FFF3E0' : 
                           type === 'ready' ? '#E8F5E9' : 
                           type === 'completed' ? '#E8F5E9' :
                           '#FFEBEE'
          }]}>
            <Text style={[styles.statusChipText, { 
              color: type === 'new' ? COLORS.warning : 
                     type === 'ready' ? COLORS.success : 
                     type === 'completed' ? COLORS.darkGreen :
                     COLORS.redAccent
            }]}>
              {order.status}
            </Text>
          </View>
        </View>

        <View style={styles.orderCustomer}>
          <MaterialCommunityIcons name="account-circle" size={20} color={COLORS.gray} />
          <Text style={styles.customerName}>{order.customer}</Text>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="shopping-outline" size={16} color={COLORS.gray} />
            <Text style={styles.detailText}>{order.items} items</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name={order.type === 'Delivery' ? 'truck-outline' : 'store-outline'} size={16} color={COLORS.gray} />
            <Text style={styles.detailText}>{order.type}</Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₱{order.total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
          >
            <Text style={styles.actionButtonText}>
              {type === 'new' ? 'View Details' : type === 'ready' ? 'Mark as Ready' : 'View Invoice'}
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.redAccent} />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const StatusTab = ({ tab, label, count }) => (
    <TouchableOpacity 
      style={[styles.tab, selectedTab === tab && styles.tabActive]}
      onPress={() => setSelectedTab(tab)}
    >
      <View style={styles.tabContent}>
        <Text style={[styles.tabCount, selectedTab === tab && styles.tabCountActive]}>
          {count}
        </Text>
        <Text style={[styles.tabLabel, selectedTab === tab && styles.tabLabelActive]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.title}>Order Management</Text>
        <Text style={styles.subtitle}>Track and fulfill incoming customer purchases.</Text>

        {/* Status Tabs - 2x2 Grid */}
        <View style={styles.tabsGrid}>
          <StatusTab tab="new" label="New Orders" count={getStatusCount('new')} />
          <StatusTab tab="ready" label="Ready for Pickup" count={getStatusCount('ready')} />
          <StatusTab tab="completed" label="Completed" count={getStatusCount('completed')} />
          <StatusTab tab="cancelled" label="Cancelled" count={getStatusCount('cancelled')} />
        </View>

        {/* Orders List */}
        {orders[selectedTab].length > 0 ? (
          orders[selectedTab].map(order => (
            <OrderCard key={order.id} order={order} type={selectedTab} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="inbox" size={60} color={COLORS.lightGray} />
            <Text style={styles.emptyStateText}>No orders found</Text>
            <Text style={styles.emptyStateSubtext}>Orders will appear here once customers place them</Text>
          </View>
        )}
        
        {/* Extra bottom padding */}
        <View style={{ height: TAB_BAR_HEIGHT + 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, paddingBottom: 0 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.darkGreen, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.gray, marginBottom: 20 },
  tabsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabActive: {
    backgroundColor: COLORS.redAccent,
    elevation: 4,
    shadowColor: COLORS.redAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabContent: {
    alignItems: 'center',
  },
  tabCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkGreen,
    marginBottom: 4,
  },
  tabCountActive: {
    color: COLORS.white,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: COLORS.white,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkGreen,
  },
  orderDate: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    color: COLORS.darkGreen,
    fontWeight: '500',
  },
  orderDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  totalLabel: {
    fontSize: 11,
    color: COLORS.gray,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.redAccent,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 13,
    color: COLORS.redAccent,
    fontWeight: '600',
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
});

export default OrdersScreen;