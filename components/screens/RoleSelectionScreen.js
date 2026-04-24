import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RoleSelectionScreen = ({ navigation }) => {
  const selectRole = (role) => {
    navigation.navigate('Login', { userRole: role });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.appName}>AgriLocal Market</Text>
          <Text style={styles.subtitle}>Choose your account type to continue</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={[styles.optionCard, styles.buyerCard]} onPress={() => selectRole('buyer')}>
            <Icon name="shopping-basket" size={50} color="#2E7D32" />
            <Text style={styles.optionTitle}>I'm a Buyer</Text>
            <Text style={styles.optionDescription}>Discover fresh produce from local farms</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionCard, styles.vendorCard]} onPress={() => selectRole('vendor')}>
            <Icon name="store" size={50} color="#F57C00" />
            <Text style={styles.optionTitle}>I'm a Vendor</Text>
            <Text style={styles.optionDescription}>List your products and grow your farm business</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', marginTop: 30 },
  scrollContent: { flexGrow: 1, padding: 24 },
  header: { alignItems: 'center', marginVertical: 40 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 10 },
  optionsContainer: { gap: 20 },
  optionCard: { padding: 30, borderRadius: 20, alignItems: 'center', elevation: 5 },
  buyerCard: { backgroundColor: '#E8F5E9' },
  vendorCard: { backgroundColor: '#FFF3E0' },
  optionTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 15 },
  optionDescription: { textAlign: 'center', color: '#666', marginTop: 5 },
});

export default RoleSelectionScreen;
