import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';
import { useUserStore } from '@/store/user-store';
import Button3D from '@/components/Button3D';
import Input from '@/components/Input';
import FloatingStars from '@/components/FloatingStars';
import { Platform } from 'react-native';

export default function LoginScreen() {
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const { setUser } = useUserStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleLogin = async () => {
    console.log('Login button pressed');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Starting login process...');
      // Simulate login
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user for demo
      const user = {
        id: '1',
        name: 'Demo User',
        email: email,
        photoUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop',
      };
      
      console.log('Setting user:', user);
      setUser(user);
      
      console.log('Navigating to tabs...');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    console.log('Google login button pressed');
    setLoading(true);
    
    try {
      // Simulate Google login
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user for demo
      const user = {
        id: '2',
        name: 'Google User',
        email: 'google@example.com',
        photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      };
      
      setUser(user);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Google login error:', error);
      
      if (Platform.OS === 'web') {
        alert('Failed to sign in with Google. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/(auth)/signup');
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
          <Text style={[styles.title, { color: colors.text }]}>CallGenie</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Smart calling with gestures and voice
          </Text>
        </View>
        
        <View style={styles.form}>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            leftIcon={<Mail size={20} color={colors.subtext} />}
            label="Email"
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
          />
          
          {error ? (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          ) : null}
          
          <Button3D
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
            icon={<LogIn size={20} color="#FFFFFF" />}
          />
          
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.subtext }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>
          
          <Button3D
            title="Continue with Google"
            onPress={handleGoogleLogin}
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
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>
              Sign Up
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
  errorText: {
    marginBottom: 16,
    fontSize: 14,
  },
  loginButton: {
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