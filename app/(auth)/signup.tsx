import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import { useUserStore } from '@/store/user-store';
import Button3D from '@/components/Button3D';
import Input from '@/components/Input';
import FloatingStars from '@/components/FloatingStars';
import { Platform } from 'react-native';

export default function SignUpScreen() {
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const { setUser } = useUserStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    let isValid = true;
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email address';
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSignUp = async () => {
    console.log('Signup button pressed');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      console.log('Starting signup process...');
      // Simulate signup process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user for demo
      const user = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim(),
        photoUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop',
      };
      
      console.log('Setting user:', user);
      setUser(user);
      
      // Show success message
      if (Platform.OS === 'web') {
        alert('Account created successfully!');
      } else {
        Alert.alert('Success', 'Account created successfully!');
      }
      
      console.log('Navigating to tabs...');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Signup error:', error);
      
      if (Platform.OS === 'web') {
        alert('Failed to create account. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignUp = async () => {
    console.log('Google signup button pressed');
    setLoading(true);
    
    try {
      // Simulate Google signup
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user for demo
      const user = {
        id: Date.now().toString(),
        name: 'Google User',
        email: 'google@example.com',
        photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      };
      
      setUser(user);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Google signup error:', error);
      
      if (Platform.OS === 'web') {
        alert('Failed to sign up with Google. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to sign up with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignIn = () => {
    router.back();
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FloatingStars />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Join CallGenie for smart calling
          </Text>
        </View>
        
        <View style={styles.form}>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            leftIcon={<User size={20} color={colors.subtext} />}
            label="Full Name"
            error={errors.name}
            autoCapitalize="words"
          />
          
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            leftIcon={<Mail size={20} color={colors.subtext} />}
            label="Email"
            error={errors.email}
          />
          
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={!showPassword}
            leftIcon={<Lock size={20} color={colors.subtext} />}
            rightIcon={showPassword ? 
              <EyeOff size={20} color={colors.subtext} /> : 
              <Eye size={20} color={colors.subtext} />
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
            label="Password"
            error={errors.password}
          />
          
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            secureTextEntry={!showConfirmPassword}
            leftIcon={<Lock size={20} color={colors.subtext} />}
            rightIcon={showConfirmPassword ? 
              <EyeOff size={20} color={colors.subtext} /> : 
              <Eye size={20} color={colors.subtext} />
            }
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            label="Confirm Password"
            error={errors.confirmPassword}
          />
          
          <Button3D
            title="Create Account"
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
            style={styles.signupButton}
            icon={<UserPlus size={20} color="#FFFFFF" />}
          />
          
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.subtext }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>
          
          <Button3D
            title="Continue with Google"
            onPress={handleGoogleSignUp}
            variant="outline"
            loading={loading}
            disabled={loading}
            style={styles.googleButton}
            icon={
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} 
                style={styles.googleIcon} 
              />
            }
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.subtext }]}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={handleSignIn}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  signupButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    marginBottom: 16,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});