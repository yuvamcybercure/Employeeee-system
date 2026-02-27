import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ActivityIndicator, StyleSheet, StatusBar, Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, typography, radius, shadows, spacing } from '../theme';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <ShieldCheck size={32} color={colors.white} />
            </View>
            <Text style={styles.brandName}>Kinetik</Text>
            <Text style={styles.brandSub}>Employee Management System</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome Back</Text>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Mail size={18} color={colors.slate400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@company.com"
                  placeholderTextColor={colors.slate400}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={18} color={colors.slate400} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.slate400}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword
                    ? <EyeOff size={18} color={colors.slate400} />
                    : <Eye size={18} color={colors.slate400} />
                  }
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInBtn, loading && styles.signInBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.signInText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.copyright}>© 2026 Kinetik HRM. All rights reserved.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
    ...shadows.xl,
  },
  brandName: {
    fontSize: typography.size['3xl'],
    fontFamily: typography.fontFamily.black,
    color: colors.slate900,
    letterSpacing: -1,
  },
  brandSub: {
    fontSize: typography.size.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.slate500,
    marginTop: spacing.xs,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.slate100,
  },
  formTitle: {
    fontSize: typography.size.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.slate900,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  fieldGroup: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.slate700,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.size.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.slate900,
  },
  eyeButton: {
    padding: spacing.xs,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  errorText: {
    fontSize: typography.size.xs,
    fontFamily: typography.fontFamily.bold,
    color: '#DC2626',
  },
  signInBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.base,
    ...shadows.xl,
  },
  signInBtnDisabled: {
    opacity: 0.7,
  },
  signInText: {
    fontSize: typography.size.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
  },
  copyright: {
    textAlign: 'center',
    color: colors.slate400,
    fontSize: typography.size.xs,
    fontFamily: typography.fontFamily.medium,
    marginTop: spacing['2xl'],
  },
});
