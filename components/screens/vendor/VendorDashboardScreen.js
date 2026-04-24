import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Avatar, Divider } from 'react-native-paper';
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
};

const TAB_BAR_HEIGHT = 70;

const VendorDashboardScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  
  // Main sales stat - full width at top
  const mainSalesStat = { 
    id: 1, 
    title: "Today's Sales", 
    value: "₱4,250.80", 
    change: "+12% from yesterday",
    icon: "cash-register",
    color: COLORS.redAccent,
    bgColor: "#FFF3F0"
  };

  const secondaryStats = [
    { 
      id: 2, 
      title: "Pending Orders", 
      value: "08", 
      subtext: "3 Urgent",
      icon: "basket-outline",
      color: COLORS.greenAccent,
      bgColor: "#F0F4EE"
    },
    { 
      id: 3, 
      title: "Total Products", 
      value: "24", 
      subtext: "Active in shop",
      icon: "package-variant",
      color: COLORS.darkGreen,
      bgColor: "#E8EDE6"
    }
  ];

  const recentTransactions = [
    { id: 'ORD-9921', customer: 'Leslie G.', amount: 450.00, status: 'Ready', statusColor: COLORS.success, statusBg: '#E8F5E9' },
    { id: 'ORD-9920', customer: 'Marvin K.', amount: 1200.00, status: 'Processing', statusColor: COLORS.warning, statusBg: '#FFF3E0' },
    { id: 'ORD-9919', customer: 'Esther H.', amount: 890.00, status: 'Ready', statusColor: COLORS.success, statusBg: '#E8F5E9' },
    { id: 'ORD-9918', customer: 'Guy Hawkins', amount: 2100.00, status: 'Completed', statusColor: COLORS.darkGreen, statusBg: '#E8F5E9' },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const MainStatCard = ({ stat }) => (
    <Card style={styles.mainStatCard}>
      <Card.Content>
        <View style={styles.mainStatHeader}>
          <View style={[styles.mainStatIconContainer, { backgroundColor: stat.bgColor }]}>
            <MaterialCommunityIcons name={stat.icon} size={28} color={stat.color} />
          </View>
          <TouchableOpacity>
            <MaterialCommunityIcons name="dots-horizontal" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
        <Text style={styles.mainStatLabel}>{stat.title}</Text>
        <Text style={styles.mainStatValue}>{stat.value}</Text>
        {stat.change && <Text style={styles.mainStatChange}>{stat.change}</Text>}
      </Card.Content>
    </Card>
  );

  const SecondaryStatCard = ({ stat }) => (
    <Card style={styles.secondaryStatCard}>
      <Card.Content>
        <View style={styles.secondaryStatHeader}>
          <View style={[styles.secondaryStatIconContainer, { backgroundColor: stat.bgColor }]}>
            <MaterialCommunityIcons name={stat.icon} size={20} color={stat.color} />
          </View>
        </View>
        <Text style={styles.secondaryStatValue}>{stat.value}</Text>
        <Text style={styles.secondaryStatLabel}>{stat.title}</Text>
        {stat.subtext && <Text style={styles.secondaryStatSubtext}>{stat.subtext}</Text>}
      </Card.Content>
    </Card>
  );

  const TransactionItem = ({ transaction }) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={() => navigation.navigate('OrderDetail', { orderId: transaction.id })}
    >
      <View style={styles.transactionRow}>
        <Text style={styles.transactionId}>{transaction.id}</Text>
        <Text style={styles.transactionCustomer}>{transaction.customer}</Text>
        <Text style={styles.transactionAmount}>₱{transaction.amount.toFixed(2)}</Text>
        <View style={[styles.transactionStatus, { backgroundColor: transaction.statusBg }]}>
          <Text style={[styles.transactionStatusText, { color: transaction.statusColor }]}>
            {transaction.status}
          </Text>
        </View>
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
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.title}>Dashboard Overview</Text>
          </View>
          <Avatar.Image 
            size={55} 
            source={{ uri: 'https://i.pravatar.cc/150?u=vendor' }} 
            style={{ borderWidth: 2, borderColor: COLORS.lightGreen }}
          />
        </View>

        {/* Main Sales Stat - Full Width */}
        <MainStatCard stat={mainSalesStat} />

        {/* Secondary Stats - 2 columns */}
        <View style={styles.secondaryStatsGrid}>
          {secondaryStats.map(stat => (
            <SecondaryStatCard key={stat.id} stat={stat} />
          ))}
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OrdersScreen')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
              <Text style={styles.transactionHeaderText}>Order ID</Text>
              <Text style={styles.transactionHeaderText}>Customer</Text>
              <Text style={styles.transactionHeaderText}>Amount</Text>
              <Text style={styles.transactionHeaderText}>Status</Text>
            </View>
            <Divider />
            {recentTransactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('AddProduct')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.redAccent }]}>
                <MaterialCommunityIcons name="plus" size={32} color="#FFF" />
              </View>
              <Text style={styles.actionTitle}>Add Product</Text>
              <Text style={styles.actionSubtext}>List new harvest</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('InventoryMain')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.greenAccent }]}>
                <MaterialCommunityIcons name="package-variant" size={32} color="#FFF" />
              </View>
              <Text style={styles.actionTitle}>Manage Stock</Text>
              <Text style={styles.actionSubtext}>Update inventory</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('OrdersScreen')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.darkGreen }]}>
                <MaterialCommunityIcons name="truck-delivery" size={32} color="#FFF" />
              </View>
              <Text style={styles.actionTitle}>View Orders</Text>
              <Text style={styles.actionSubtext}>Track deliveries</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Extra bottom padding to prevent cutting by tab bar */}
        <View style={{ height: TAB_BAR_HEIGHT + 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 0
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20, 
    marginTop: 10 
  },
  welcomeText: { 
    color: COLORS.greenAccent, 
    fontSize: 14, 
    fontWeight: '500',
    marginBottom: 4
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: COLORS.darkGreen 
  },
  // Main Stat Card (Full Width)
  mainStatCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: 16, 
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  mainStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainStatIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainStatLabel: { 
    color: COLORS.gray, 
    fontSize: 14, 
    marginBottom: 4,
    fontWeight: '500'
  },
  mainStatValue: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: COLORS.darkGreen,
    marginBottom: 4
  },
  mainStatChange: {
    fontSize: 12,
    color: COLORS.greenAccent,
    fontWeight: '500',
  },
  // Secondary Stats Grid
  secondaryStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  secondaryStatCard: { 
    flex: 1,
    backgroundColor: COLORS.white, 
    borderRadius: 16, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  secondaryStatHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryStatIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryStatValue: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: COLORS.darkGreen,
    textAlign: 'center',
    marginBottom: 4
  },
  secondaryStatLabel: { 
    color: COLORS.gray, 
    fontSize: 12, 
    textAlign: 'center',
    fontWeight: '500'
  },
  secondaryStatSubtext: {
    fontSize: 10,
    color: COLORS.redAccent,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGreen,
    marginBottom: 12,
  },
  viewAllText: {
    color: COLORS.redAccent,
    fontWeight: '600',
    fontSize: 13,
  },
  transactionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FBF9',
  },
  transactionHeaderText: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.gray,
  },
  transactionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionId: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.darkGreen,
  },
  transactionCustomer: {
    flex: 1,
    fontSize: 13,
    color: COLORS.darkGreen,
  },
  transactionAmount: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.redAccent,
  },
  transactionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  transactionStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Quick Actions Section
  quickActionsSection: {
    marginBottom: 0,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGreen,
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtext: {
    fontSize: 11,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default VendorDashboardScreen;