import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar, List, Divider, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = { darkGreen: '#374629', redAccent: '#9a3718', lightGreen: '#bac76a', background: '#f5f5f5' };

const OrderDetailScreen = ({ route, navigation }) => {
  const orderId = route.params?.orderId;

  // Mock Data for the "List" view
  const allOrders = [
    { id: 'ORD-101', item: 'Fresh Tomatoes', price: '₱150', status: 'Paid', icon: 'food-apple' },
    { id: 'ORD-102', item: 'Organic Kale', price: '₱85', status: 'Pending', icon: 'leaf' },
    { id: 'ORD-103', item: 'Red Onions', price: '₱210', status: 'Paid', icon: 'clover' },
  ];

  // --- VIEW 1: THE SPECIFIC ORDER DETAILS (If orderId exists) ---
  if (orderId) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.detailCard}>
            <Card.Title title={`Order ${orderId}`} subtitle="Customer: Juan Dela Cruz" />
            <Card.Content>
              <View style={styles.row}><Text>Items:</Text><Text style={styles.bold}>2kg Tomatoes</Text></View>
              <View style={styles.row}><Text>Total:</Text><Text style={styles.price}>₱150.00</Text></View>
              <Chip icon="information" style={{marginTop: 20}}>Status: Processing</Chip>
            </Card.Content>
          </Card>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={{color: '#fff'}}>Back to List</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- VIEW 2: THE ORDER LIST (If clicked from Tab Bar) ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Your Orders</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {allOrders.map((order) => (
          <TouchableOpacity 
            key={order.id} 
            onPress={() => navigation.push('OrderDetail', { orderId: order.id })}
          >
            <Card style={styles.orderItemCard}>
              <List.Item
                title={order.item}
                description={`${order.id} • ${order.price}`}
                left={props => <Avatar.Icon {...props} icon={order.icon} backgroundColor={COLORS.lightGreen} />}
                right={props => <Text style={[styles.statusText, {color: order.status === 'Paid' ? 'green' : 'orange'}]}>{order.status}</Text>}
              />
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 15 },
  listHeader: { padding: 20, backgroundColor: COLORS.darkGreen },
  listTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  detailCard: { borderRadius: 12, elevation: 4 },
  orderItemCard: { marginBottom: 10, borderRadius: 10, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  bold: { fontWeight: 'bold' },
  price: { color: COLORS.redAccent, fontWeight: 'bold', fontSize: 18 },
  statusText: { alignSelf: 'center', fontWeight: 'bold', fontSize: 12 },
  backBtn: { marginTop: 20, backgroundColor: COLORS.darkGreen, padding: 15, borderRadius: 10, alignItems: 'center' }
});

export default OrderDetailScreen;