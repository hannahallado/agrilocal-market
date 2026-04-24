import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert,
  SafeAreaView,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  background: '#ffffff',
  redAccent: '#9a3718',
  greenAccent: '#546a40',
  darkGreen: '#374629',
  lightGreen: '#bac76a',
  darkRed: '#6a2009',
};

const AddProductScreen = ({ navigation, route }) => {
  const editProduct = route.params?.product;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill form if editing
  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name || '');
      setPrice(editProduct.price ? editProduct.price.toString() : '');
      
      // Handle stock that might be a number or string with 'kg'
      let stockValue = '';
      if (editProduct.stock) {
        if (typeof editProduct.stock === 'number') {
          stockValue = editProduct.stock.toString();
        } else if (typeof editProduct.stock === 'string') {
          stockValue = editProduct.stock.replace('kg', '').trim();
        }
      }
      setStock(stockValue);
      
      setCategory(editProduct.category || '');
      setImage(editProduct.imageUrl || editProduct.image || null);
    }
  }, [editProduct]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please grant permission to access your photos');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            navigation.navigate('InventoryMain', { deletedProductId: editProduct.id });
            Alert.alert('Deleted', `${name} has been deleted`);
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!name || !price || !stock) {
      Alert.alert('Incomplete Form', 'Please provide at least the name, price, and stock quantity.');
      return;
    }
    
    setLoading(true);
    
    const newProductData = {
      id: editProduct?.id || Date.now().toString(),
      name: name,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      stockDisplay: `${stock} kg`,
      category: category || 'Uncategorized',
      status: 'Active',
      imageUrl: image,
      image: image,
    };

    setTimeout(() => {
      setLoading(false);
      navigation.navigate('InventoryMain', { newProduct: newProductData });
      Alert.alert(
        editProduct ? 'Updated' : 'Success', 
        `${name} has been ${editProduct ? 'updated' : 'added'}!`
      );
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>
          {editProduct ? 'Edit Product' : 'Add New Product'}
        </Text>
        
        {/* Image Picker Area */}
        <TouchableOpacity 
          style={[styles.imageContainer, { borderColor: image ? COLORS.darkGreen : COLORS.lightGreen }]} 
          onPress={pickImage}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.productImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <MaterialCommunityIcons name="camera-plus-outline" size={48} color={COLORS.greenAccent} />
              <Text style={styles.uploadText}>Add Product Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <TextInput
            label="Product Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            outlineColor={COLORS.lightGreen}
            activeOutlineColor={COLORS.darkGreen}
            style={styles.input}
          />

          <View style={styles.row}>
            <TextInput
              label="Price (₱)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              mode="outlined"
              outlineColor={COLORS.lightGreen}
              activeOutlineColor={COLORS.darkGreen}
              style={[styles.input, { flex: 1, marginRight: 10 }]}
            />
            <TextInput
              label="Stock (kg)"
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
              mode="outlined"
              outlineColor={COLORS.lightGreen}
              activeOutlineColor={COLORS.darkGreen}
              style={[styles.input, { flex: 1 }]}
            />
          </View>

          <TextInput
            label="Category"
            value={category}
            onChangeText={setCategory}
            mode="outlined"
            outlineColor={COLORS.lightGreen}
            activeOutlineColor={COLORS.darkGreen}
            style={styles.input}
          />

          <Button 
            mode="contained" 
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            contentStyle={styles.buttonInner}
          >
            {editProduct ? 'Update Product' : 'Add Product'}
          </Button>

          {editProduct && (
            <Button 
              mode="outlined" 
              onPress={handleDelete}
              style={styles.deleteButton}
              labelStyle={styles.deleteButtonLabel}
              icon="delete"
            >
              Delete Product
            </Button>
          )}

          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.cancelContainer}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.darkGreen, marginBottom: 20 },
  imageContainer: { 
    height: 200, 
    backgroundColor: '#F7F9F7', 
    borderRadius: 15, 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 25, 
    overflow: 'hidden' 
  },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadPlaceholder: { alignItems: 'center' },
  uploadText: { color: COLORS.greenAccent, marginTop: 8, fontWeight: '600' },
  form: { width: '100%' },
  input: { marginBottom: 15, backgroundColor: '#fff' },
  row: { flexDirection: 'row' },
  submitButton: { 
    backgroundColor: COLORS.redAccent, 
    marginTop: 10, 
    borderRadius: 10, 
    elevation: 3 
  },
  buttonInner: { paddingVertical: 6 },
  deleteButton: {
    marginTop: 10,
    borderRadius: 10,
    borderColor: COLORS.redAccent,
    borderWidth: 1,
  },
  deleteButtonLabel: {
    color: COLORS.redAccent,
    fontWeight: '600',
  },
  cancelContainer: { alignSelf: 'center', marginTop: 20 },
  cancelText: { color: COLORS.darkRed, fontWeight: '700', fontSize: 14 }
});

export default AddProductScreen;