import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = ({ navigation, userData }) => {
  const [notifications, setNotifications] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userInfo, setUserInfo] = useState({
    fullName: 'Guest User',
    email: 'guest@example.com',
    role: 'buyer',
    phone: '+63 912 345 6789',
    birthdate: 'January 15, 1990'
  });
  
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: 'Home',
      address: '123 Lacson Street, Barangay Mandalagan, Bacolod City, Negros Occidental, 6100',
      isDefault: true
    },
    {
      id: 2,
      label: 'Office',
      address: '22 Rizal Street, Barangay III, Silay City, Negros Occidental, 6116',
      isDefault: false
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'credit',
      label: 'Credit Card',
      last4: '4242',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: 2,
      type: 'cash',
      label: 'Cash on Delivery',
      isDefault: false
    }
  ]);

  useEffect(() => {
    if (userData) {
      setUserInfo(userData);
      setNewName(userData.fullName);
      loadProfileImage();
    } else {
      const getUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserInfo({
            fullName: session.user?.user_metadata?.full_name || 'Guest User',
            email: session.user?.email,
            role: session.user?.user_metadata?.role || 'buyer',
            phone: '+63 912 345 6789',
            birthdate: 'January 15, 1990'
          });
          setNewName(session.user?.user_metadata?.full_name || 'Guest User');
          loadProfileImage();
        }
      };
      getUser();
    }
    loadAddresses();
    loadPaymentMethods();
  }, [userData]);

  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const saveProfileImage = async (imageUri) => {
    try {
      await AsyncStorage.setItem('profileImage', imageUri);
      setProfileImage(imageUri);
    } catch (error) {
      console.error('Error saving profile image:', error);
    }
  };

  const loadAddresses = async () => {
    try {
      const savedAddresses = await AsyncStorage.getItem('userAddresses');
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const savedPayments = await AsyncStorage.getItem('paymentMethods');
      if (savedPayments) {
        setPaymentMethods(JSON.parse(savedPayments));
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await supabase.auth.signOut();
              navigation.navigate('RoleSelection');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          } 
        }
      ]
    );
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: newName.trim() }
        });
        if (error) throw error;
      }

      const updatedUserInfo = { ...userInfo, fullName: newName.trim() };
      setUserInfo(updatedUserInfo);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserInfo));
      
      Alert.alert('Success', 'Name updated successfully');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update name');
    } finally {
      setIsLoading(false);
    }
  };

  const pickProfileImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await saveProfileImage(result.assets[0].uri);
        Alert.alert('Success', 'Profile picture updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const getInitials = () => {
    const name = userInfo.fullName;
    if (!name || name === 'Guest User') return '👤';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const PersonalInfoModal = () => (
    <Modal
      visible={isEditing}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditing(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Personal Information</Text>
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <Icon name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
            
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={userInfo.phone}
              onChangeText={(text) => setUserInfo({...userInfo, phone: text})}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
            
            <Text style={styles.inputLabel}>Birthdate</Text>
            <TextInput
              style={styles.input}
              value={userInfo.birthdate}
              onChangeText={(text) => setUserInfo({...userInfo, birthdate: text})}
              placeholder="Enter your birthdate"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleUpdateName}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const AddressCard = ({ address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressLabelContainer}>
          <Icon name={address.label === 'Home' ? 'home' : 'work'} size={18} color="#3BB77E" />
          <Text style={styles.addressLabel}>{address.label}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <TouchableOpacity>
          <Icon name="edit" size={18} color="#999" />
        </TouchableOpacity>
      </View>
      <Text style={styles.addressText}>{address.address}</Text>
    </View>
  );

  const PaymentCard = ({ method }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentLabelContainer}>
          <Icon 
            name={method.type === 'credit' ? 'credit-card' : 'attach-money'} 
            size={18} 
            color="#3BB77E" 
          />
          <Text style={styles.paymentLabel}>{method.label}</Text>
          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <TouchableOpacity>
          <Icon name="edit" size={18} color="#999" />
        </TouchableOpacity>
      </View>
      {method.type === 'credit' && (
        <Text style={styles.paymentDetails}>
          •••• {method.last4} • Expires {method.expiry}
        </Text>
      )}
    </View>
  );

  return (
    <>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={pickProfileImage} style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Text style={styles.profileEmoji}>{getInitials()}</Text>
            )}
            <View style={styles.cameraIcon}>
              <Icon name="camera-alt" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.profileName}>{userInfo.fullName}</Text>
          <Text style={styles.profileEmail}>{userInfo.email}</Text>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="person" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{userInfo.fullName}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="email" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{userInfo.email}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{userInfo.phone || 'Not set'}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Icon name="cake" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Birthdate</Text>
                <Text style={styles.infoValue}>{userInfo.birthdate || 'Not set'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Saved Addresses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Addresses</Text>
            <TouchableOpacity>
              <Text style={styles.addText}>+ Add New</Text>
            </TouchableOpacity>
          </View>
          {addresses.map(address => (
            <AddressCard key={address.id} address={address} />
          ))}
        </View>

        {/* Payment Methods Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <TouchableOpacity>
              <Text style={styles.addText}>+ Add New</Text>
            </TouchableOpacity>
          </View>
          {paymentMethods.map(method => (
            <PaymentCard key={method.id} method={method} />
          ))}
        </View>

        {/* Orders Section - Consistent with Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orders</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Icon name="history" size={22} color="#666" />
              <Text style={styles.menuItemLabel}>Order History</Text>
            </View>
            <Icon name="chevron-right" size={22} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Icon name="track-changes" size={22} color="#666" />
              <Text style={styles.menuItemLabel}>Track Orders</Text>
            </View>
            <Icon name="chevron-right" size={22} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, styles.lastMenuItem]}>
            <View style={styles.menuItemLeft}>
              <Icon name="rate-review" size={22} color="#666" />
              <Text style={styles.menuItemLabel}>My Reviews</Text>
            </View>
            <Icon name="chevron-right" size={22} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Settings Section - Consistent with Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={[styles.menuItem, styles.lastMenuItem]}>
            <View style={styles.menuItemLeft}>
              <Icon name="notifications" size={22} color="#666" />
              <Text style={styles.menuItemLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E0E0E0', true: '#2E7D32' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Logout Button - Now fully visible */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Icon name="logout" size={22} color="#FF5252" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
        
        {/* Extra bottom padding for scroll */}
        <View style={{ height: 30 }} />
      </ScrollView>

      <PersonalInfoModal />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9E0',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3BB77E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileEmoji: {
    fontSize: 40,
    color: '#FFF',
    fontWeight: 'bold',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3BB77E',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    color: '#010F1C',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    marginBottom: 12,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  editProfileText: {
    fontSize: 13,
    color: '#3BB77E',
    fontFamily: 'Poppins-SemiBold',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EDE9E0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    color: '#010F1C',
  },
  editText: {
    fontSize: 13,
    color: '#3BB77E',
    fontFamily: 'Poppins-SemiBold',
  },
  addText: {
    fontSize: 13,
    color: '#3BB77E',
    fontFamily: 'Poppins-SemiBold',
  },
  infoCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9E0',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Poppins-Regular',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#010F1C',
    fontFamily: 'Poppins-Regular',
  },
  addressCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#010F1C',
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: '#2E7D32',
    fontFamily: 'Poppins-SemiBold',
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    lineHeight: 16,
  },
  paymentCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#010F1C',
  },
  paymentDetails: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginLeft: 26,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9E0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLabel: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#010F1C',
  },
  logoutContainer: {
    marginTop: 24,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    color: '#FF5252',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9E0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    color: '#010F1C',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EDE9E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#010F1C',
    backgroundColor: '#F9F9F9',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDE9E0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#3BB77E',
  },
  saveButtonText: {
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
});

export default ProfileScreen;