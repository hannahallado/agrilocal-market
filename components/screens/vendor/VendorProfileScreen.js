import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const VendorProfileScreen = ({ navigation, userData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  
  // Vendor specific state
  const [vendorInfo, setVendorInfo] = useState({
    fullName: 'Green Valley Farm',
    email: 'vendor@greenvalley.com',
    role: 'vendor',
    phone: '+63 912 345 6789',
    address: 'Brgy. San Jose, Batangas City, 4200',
    hours: '6:00 AM - 6:00 PM',
    rating: 4.8,
    followers: 1234,
    produce: ['Tomatoes', 'Lettuce', 'Cucumbers', 'Bell Peppers'],
    description: 'Family-owned organic farm since 2010. We grow fresh, chemical-free vegetables using sustainable farming practices.',
    website: 'www.greenvalleyfarm.com.ph'
  });

  useEffect(() => {
    if (userData) {
      loadVendorData();
      loadProfileImage();
    } else {
      loadVendorFromSession();
    }
  }, [userData]);

  const loadVendorFromSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setVendorInfo(prev => ({
          ...prev,
          fullName: session.user?.user_metadata?.full_name || prev.fullName,
          email: session.user?.email || prev.email,
        }));
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const loadVendorData = async () => {
    try {
      const savedVendorData = await AsyncStorage.getItem('vendorData');
      if (savedVendorData) {
        setVendorInfo(JSON.parse(savedVendorData));
      }
    } catch (error) {
      console.error('Error loading vendor data:', error);
    }
  };

  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('vendorProfileImage');
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const saveVendorData = async (updatedData) => {
    try {
      await AsyncStorage.setItem('vendorData', JSON.stringify(updatedData));
      setVendorInfo(updatedData);
    } catch (error) {
      console.error('Error saving vendor data:', error);
    }
  };

  const saveProfileImage = async (imageUri) => {
    try {
      await AsyncStorage.setItem('vendorProfileImage', imageUri);
      setProfileImage(imageUri);
    } catch (error) {
      console.error('Error saving profile image:', error);
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
              navigation.navigate('Login');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          } 
        }
      ]
    );
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

  const handleUpdateVendor = async () => {
    setIsLoading(true);
    try {
      await saveVendorData(vendorInfo);
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    const name = vendorInfo.fullName;
    if (!name) return 'GV';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const EditProfileModal = () => (
    <Modal
      visible={isEditing}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditing(false)}
    >
      <ScrollView style={styles.modalOverlay} contentContainerStyle={styles.modalScrollContent}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Shop Profile</Text>
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <Icon name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>Farm/Business Name</Text>
            <TextInput
              style={styles.input}
              value={vendorInfo.fullName}
              onChangeText={(text) => setVendorInfo({...vendorInfo, fullName: text})}
              placeholder="Enter farm name"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={vendorInfo.email}
              onChangeText={(text) => setVendorInfo({...vendorInfo, email: text})}
              placeholder="Enter email"
              placeholderTextColor="#999"
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={vendorInfo.phone}
              onChangeText={(text) => setVendorInfo({...vendorInfo, phone: text})}
              placeholder="Enter phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.input}
              value={vendorInfo.address}
              onChangeText={(text) => setVendorInfo({...vendorInfo, address: text})}
              placeholder="Enter address"
              placeholderTextColor="#999"
              multiline
            />

            <Text style={styles.inputLabel}>Operating Hours</Text>
            <TextInput
              style={styles.input}
              value={vendorInfo.hours}
              onChangeText={(text) => setVendorInfo({...vendorInfo, hours: text})}
              placeholder="e.g., 6:00 AM - 6:00 PM"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Shop Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={vendorInfo.description}
              onChangeText={(text) => setVendorInfo({...vendorInfo, description: text})}
              placeholder="Describe your farm and products"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Website</Text>
            <TextInput
              style={styles.input}
              value={vendorInfo.website}
              onChangeText={(text) => setVendorInfo({...vendorInfo, website: text})}
              placeholder="Enter website URL"
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
              onPress={handleUpdateVendor}
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
      </ScrollView>
    </Modal>
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
              <Text style={styles.profileInitials}>{getInitials()}</Text>
            )}
            <View style={styles.cameraIcon}>
              <Icon name="camera-alt" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.profileName}>{vendorInfo.fullName}</Text>
          <Text style={styles.profileEmail}>{vendorInfo.email}</Text>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => setIsEditing(true)}
          >
            <Icon name="edit" size={16} color="#9a3718" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Shop Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="store" size={20} color="#9a3718" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Farm Name</Text>
                <Text style={styles.infoValue}>{vendorInfo.fullName}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color="#9a3718" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Contact Number</Text>
                <Text style={styles.infoValue}>{vendorInfo.phone}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="email" size={20} color="#9a3718" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{vendorInfo.email}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="location-on" size={20} color="#9a3718" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{vendorInfo.address}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="access-time" size={20} color="#9a3718" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Operating Hours</Text>
                <Text style={styles.infoValue}>{vendorInfo.hours}</Text>
              </View>
            </View>
            
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Icon name="language" size={20} color="#9a3718" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Website</Text>
                <Text style={styles.infoValue}>{vendorInfo.website}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Farm Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Our Farm</Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{vendorInfo.description}</Text>
          </View>
        </View>

        {/* Farm Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farm Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="star" size={24} color="#FFB800" />
              <Text style={styles.statValue}>{vendorInfo.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            
            <View style={styles.statCard}>
              <Icon name="people" size={24} color="#9a3718" />
              <Text style={styles.statValue}>{vendorInfo.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            
            <View style={styles.statCard}>
              <Icon name="local-offer" size={24} color="#546a40" />
              <Text style={styles.statValue}>{vendorInfo.produce.length}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
          </View>
        </View>

        {/* Products Offered */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products Offered</Text>
          <View style={styles.produceTags}>
            {vendorInfo.produce.map((item, index) => (
              <View key={index} style={styles.produceTag}>
                <Text style={styles.produceTagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Icon name="logout" size={22} color="#FF5252" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 30 }} />
      </ScrollView>

      <EditProfileModal />
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
    backgroundColor: '#9a3718',
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
  profileInitials: {
    fontSize: 36,
    color: '#FFF',
    fontWeight: 'bold',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#9a3718',
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
    color: '#9a3718',
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
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    color: '#010F1C',
    marginBottom: 12,
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
  descriptionCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#010F1C',
    marginTop: 8,
    fontFamily: 'Poppins-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  produceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  produceTag: {
    backgroundColor: '#FDE8E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  produceTagText: {
    fontSize: 12,
    color: '#9a3718',
    fontFamily: 'Poppins-Regular',
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
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
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
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#010F1C',
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
    backgroundColor: '#9a3718',
  },
  saveButtonText: {
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
});

export default VendorProfileScreen;