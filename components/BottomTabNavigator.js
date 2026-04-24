import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

import MapHomeScreen from './screens/MapHomeScreen';
import BrowseVendorsScreen from './screens/BrowseVendorsScreen';
import VendorDetailsScreen from './screens/VendorDetailsScreen';
import SearchScreen from './screens/SearchScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import CartScreen from './screens/CartScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ProfileScreen from './screens/ProfileScreen';
import PaymentMethodsScreen from './screens/PaymentMethodsScreen';
import OrderConfirmationScreen from './screens/OrderConfirmationScreen';
import VendorDashboardScreen from './screens/vendor/VendorDashboardScreen';
import InventoryScreen from './screens/vendor/InventoryScreen';
import OrdersScreen from './screens/vendor/OrdersScreen';
import OrderDetailScreen from './screens/vendor/OrderDetailScreen';
import AddProductScreen from './screens/vendor/AddProductScreen';
import VendorProfileScreen from './screens/vendor/VendorProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 1. BUYER TAB LAYOUT
const BuyerTabs = ({ userData }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: '#3BB77E',
      tabBarInactiveTintColor: '#999999',
      tabBarIcon: ({ focused, color }) => {
        let iconName;
        if (route.name === 'Map') iconName = focused ? 'map' : 'map-outline';
        else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
        else if (route.name === 'Cart') iconName = focused ? 'cart' : 'cart-outline';
        else if (route.name === 'Favorites') iconName = focused ? 'heart' : 'heart-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

        if (route.name === 'Cart') {
          return (
            <View style={[styles.cartBubble, focused ? styles.cartBubbleActive : styles.cartBubbleInactive]}>
              <Ionicons name={iconName} size={26} color="#FFFFFF" />
            </View>
          );
        }
        return <Ionicons name={iconName} size={24} color={color} />;
      },
      tabBarLabelStyle: styles.tabLabel,
    })}
  >
    <Tab.Screen name="Map" component={MapHomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Cart">
      {props => <CartScreen {...props} userData={userData} />}
    </Tab.Screen>
    <Tab.Screen name="Favorites" component={FavoritesScreen} />
    <Tab.Screen name="Profile">
      {props => <ProfileScreen {...props} userData={userData} />}
    </Tab.Screen>
  </Tab.Navigator>
);

// 2. VENDOR TAB LAYOUT
const VendorTabs = ({ userData }) => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: '#9a3718',
      tabBarInactiveTintColor: '#999999',
      tabBarLabelStyle: styles.tabLabel,
    }}
  >
    <Tab.Screen 
      name="VendorHome" 
      component={VendorDashboardScreen} 
      options={{ 
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} /> 
      }} 
    />
    
    <Tab.Screen 
      name="InventoryMain" 
      component={InventoryScreen} 
      options={{ 
        tabBarLabel: 'Inventory',
        tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons name={focused ? 'package-variant' : 'package-variant-closed'} size={24} color={color} /> 
      }} 
    />
    
    <Tab.Screen 
      name="OrdersMain" 
      component={OrdersScreen} 
      options={{ 
        tabBarLabel: 'Orders',
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={color} /> 
      }} 
    />
    
    <Tab.Screen 
      name="VendorProfile" 
      options={{ 
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} /> 
      }}
    >
      {props => <VendorProfileScreen {...props} userData={userData} />}
    </Tab.Screen>
  </Tab.Navigator>
);

// 3. MAIN EXPORT
const BottomTabNavigator = ({ userRole }) => {
  const { userData } = useAuth();
  console.log('DEBUG: BottomTabNavigator received userRole:', userRole);
  const isVendor = userRole === 'vendor' || userRole === 'Vendor' || userRole?.toLowerCase() === 'vendor';
  console.log('DEBUG: isVendor:', isVendor);

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="MainTabs">
        {props => isVendor ? 
          <VendorTabs {...props} userData={userData} /> : 
          <BuyerTabs {...props} userData={userData} />
        }
      </Stack.Screen>

      {/* Common Stack Screens */}
      <Stack.Screen 
        name="BrowseVendors" 
        component={BrowseVendorsScreen}
        options={{ 
          headerShown: false,
          animation: 'slide_from_right'
        }}
      />

      <Stack.Screen
        name="VendorDetails"
        component={VendorDetailsScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      />

      <Stack.Screen name="PaymentMethods">
        {props => <PaymentMethodsScreen {...props} userData={userData} />}
      </Stack.Screen>
      
      <Stack.Screen name="OrderConfirmation">
        {props => <OrderConfirmationScreen {...props} userData={userData} />}
      </Stack.Screen>
      
      <Stack.Screen 
        name="OrderDetail" 
        component={OrderDetailScreen} 
        options={{ headerShown: true, headerTitle: 'Order Details' }} 
      />

      <Stack.Screen 
        name="OrdersScreen" 
        component={OrdersScreen} 
        options={{ headerShown: true, headerTitle: 'Order Management' }} 
      />
      
      <Stack.Screen 
        name="AddProduct" 
        component={AddProductScreen} 
        options={{ headerShown: true, headerTitle: '' }} 
      />
      
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={{ headerShown: true, headerTitle: 'Product Details' }} 
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    height: 70,
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 6,
    elevation: 10,
  },
  tabLabel: { 
    fontSize: 11, 
    fontFamily: 'Poppins-SemiBold' 
  },
  cartBubble: {
    width: 54, 
    height: 54, 
    borderRadius: 27,
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: -24, 
    borderWidth: 4, 
    borderColor: '#FFFFFF',
  },
  cartBubbleInactive: { 
    backgroundColor: '#3BB77E' 
  },
  cartBubbleActive: { 
    backgroundColor: '#3BB77E' 
  },
});

export default BottomTabNavigator;