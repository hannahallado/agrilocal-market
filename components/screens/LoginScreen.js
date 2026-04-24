import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation, route }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const role = route?.params?.userRole || 'buyer';

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      if (data?.user) {
        const userFullName = data.user.user_metadata?.full_name || 'Guest User';
        const userRoleData = data.user.user_metadata?.role || data.user.user_metadata?.user_type || role || 'buyer';

        await signIn({
          fullName: userFullName,
          email: data.user.email,
          role: userRoleData,
        });

        Alert.alert('Success', `Welcome back, ${userFullName}!`);
      }
    } catch (error) {
      let errorMessage = error.message;
      if (error.message === 'Invalid login credentials') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email before logging in. Check your inbox.';
      }
      setMessage(`❌ ${errorMessage}`);
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setMessage('');

    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: role,
            user_type: role,
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setMessage('❌ This email is already registered. Please login instead.');
          Alert.alert('Error', 'Email already exists. Please login.');
        } else {
          setMessage(`❌ ${error.message}`);
          Alert.alert('Signup Failed', error.message);
        }
        return;
      }

      if (data?.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          setMessage('❌ This email is already registered. Please login instead.');
          Alert.alert('Error', 'Email already exists. Please login.');
        } else {
          setMessage('✅ Account created successfully! Please check your email for verification.');
          Alert.alert(
            'Success!', 
            'Account created successfully!\n\nPlease check your email to verify your account before logging in.',
            [
              { 
                text: 'OK', 
                onPress: () => {
                  setIsSignUp(false);
                  setPassword('');
                  setConfirmPassword('');
                  setFullName('');
                  setMessage('');
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      setMessage('❌ Connection error. Please try again.');
      console.error('Signup error:', error);
      Alert.alert('Error', 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    console.log('DEBUG: Guest login with role:', role);
    console.log('DEBUG: Route params:', route?.params);
    await signIn({
      fullName: 'Guest User',
      email: 'guest@agrilocal.com',
      role: role,
    });
    Alert.alert('Guest Mode', 'You are continuing as a guest. Some features may be limited.');
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setMessage('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
          <Text style={styles.subtitle}>
            {isSignUp 
              ? `Sign up as a ${role === 'vendor' ? 'Vendor' : 'Buyer'}` 
              : `Login to your ${role === 'vendor' ? 'vendor' : 'buyer'} account`}
          </Text>
        </View>

        <View style={styles.form}>
          {isSignUp && (
            <>
              <View style={styles.inputContainer}>
                <Icon name="person" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </>
          )}

          <View style={styles.inputContainer}>
            <Icon name="email" size={20} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#999" />
            <TextInput
              style={styles.input}
              placeholder={isSignUp ? "Password (min. 6 characters)" : "Password"}
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "visibility" : "visibility-off"} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {isSignUp && (
            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Icon name={showConfirmPassword ? "visibility" : "visibility-off"} size={20} color="#999" />
              </TouchableOpacity>
            </View>
          )}

          {message !== '' && (
            <Text style={[
              styles.messageText,
              message.includes('✅') ? styles.successMessage : styles.errorMessage
            ]}>
              {message}
            </Text>
          )}

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={isSignUp ? handleSignup : handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
            )}
          </TouchableOpacity>

          {!isSignUp && (
            <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin} disabled={loading}>
              <Text style={styles.guestText}>Continue as Guest</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            onPress={() => {
              setIsSignUp(!isSignUp);
              resetForm();
            }}
          >
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Developed By Section */}
        <View style={styles.developedByContainer}>
          <Text style={styles.developedByTitle}>Developed by:</Text>
          <Text style={styles.developerName}>Hannah Grace S. Allado</Text>
          <Text style={styles.developerName}>Alyhanna Azel Pineda</Text>
          <Text style={styles.developerName}>Babylin B. Sebongga</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#010F1C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDE9E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F7F8FA',
    gap: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#010F1C',
  },
  submitButton: {
    backgroundColor: '#3BB77E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDE9E0',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  guestText: {
    color: '#666',
    fontSize: 14,
  },
  switchText: {
    textAlign: 'center',
    color: '#3BB77E',
    marginTop: 16,
    fontSize: 14,
  },
  messageText: {
    textAlign: 'center',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  successMessage: {
    backgroundColor: '#DFF0D8',
    color: '#3C763D',
  },
  errorMessage: {
    backgroundColor: '#F2DEDE',
    color: '#A94442',
  },
  
  developedByContainer: {
    marginTop: 80,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EDE9E0',
    alignItems: 'center',
  },
  developedByTitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
    fontWeight: '500',
  },
  developerName: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;