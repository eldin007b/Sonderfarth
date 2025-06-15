import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, Image, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../useTranslation';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

const LANGUAGES = [
  { label: 'BS', value: 'bs', flag: '🇧🇦' },
  { label: 'DE', value: 'de', flag: '🇩🇪' },
  { label: 'EN', value: 'en', flag: '🇬🇧' },
];

const API_URL = 'https://dsltpiupbfopyvuiqffg.supabase.co/rest/v1/users';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbHRwaXVwYmZvcHl2dWlxZmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mjc3MzcsImV4cCI6MjA2NTUwMzczN30.suu_OSbTBSEkM3YMiPDFIAgDnX3bDavcD8BX4ZfYZxw';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const userInput = useRef(null);

  const { language, setLanguage, t } = useTranslation();

  useEffect(() => {
    setTimeout(() => userInput.current && userInput.current.focus(), 400);
    (async () => {
      const savedUser = await AsyncStorage.getItem('username');
      const savedPass = await AsyncStorage.getItem('password');
      if (savedUser) setUsername(savedUser);
      if (savedPass) setPassword(savedPass);
      setRemember(!!savedUser && !!savedPass);
    })();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}?user=eq.${username}&pass=eq.${password}&select=*`, {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${API_KEY}`,
        },
      });
      const data = await res.json();
      const user = data[0];
      if (user) {
        if (remember) {
          await AsyncStorage.setItem('username', username);
          await AsyncStorage.setItem('password', password);
        } else {
          await AsyncStorage.removeItem('username');
          await AsyncStorage.removeItem('password');
        }

        // optional: update last_login
        await fetch(`${API_URL}?user=eq.${username}`, {
          method: 'PATCH',
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ last_login: new Date().toISOString().split('T')[0] })
        });

        navigation.replace(user.role === 'admin' ? 'AdminPanel' : 'MainMenu');
      } else {
        setError(t('error') || 'Greška');
      }
    } catch (err) {
      setError('Greška prilikom konekcije.');
    }
    setLoading(false);
  };

  const handleLang = (lang) => {
    setLanguage(lang);
  };

  const handleBarcodeLogin = (data) => {
    if (!data) return;
    const { user, password } = data;
    if (user && password) {
      setUsername(user.trim());
      setPassword(password.trim());
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <LinearGradient colors={['#1976D2', '#6dc6ff', '#fff']} style={styles.container}>
        <Animatable.View animation="fadeInDown" duration={1100} style={{ alignItems: 'center', width: '100%' }}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>{t('login')}</Text>
        </Animatable.View>

        {/* Jezik izbor sa zastavicama */}
        <View style={styles.langBar}>
          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.value}
              onPress={() => handleLang(lang.value)}
              style={[
                styles.langBtn,
                language === lang.value && styles.langBtnActive
              ]}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 22, marginRight: 8 }}>{lang.flag}</Text>
              <Text style={[
                styles.langBtnText,
                language === lang.value && styles.langBtnTextActive
              ]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Animatable.View animation="fadeInUp" duration={1100} style={{ width: '100%' }}>
          <View style={styles.inputWrap}>
            <Icon name="account" size={22} color="#1976D2" style={styles.icon} />
            <TextInput
              ref={userInput}
              placeholder={t('username')}
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
              placeholderTextColor="#aaa"
              returnKeyType="next"
              editable={!loading}
            />
          </View>
          <View style={styles.inputWrap}>
            <Icon name="lock" size={22} color="#1976D2" style={styles.icon} />
            <TextInput
              placeholder={t('password')}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={secure}
              placeholderTextColor="#aaa"
              editable={!loading}
              onSubmitEditing={handleLogin}
            />
            <Pressable onPress={() => setSecure(v => !v)}>
              <Icon name={secure ? "eye-off-outline" : "eye-outline"} size={22} color="#1976D2" style={styles.iconRight} />
            </Pressable>
          </View>

          <Pressable
            style={{ marginBottom: 15, alignSelf: 'center', backgroundColor: '#1976D2', borderRadius: 12, padding: 12 }}
            onPress={() => setScannerVisible(true)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Skeniraj Barcode za Login</Text>
          </Pressable>
          <BarcodeScannerModal
            visible={scannerVisible}
            onScan={handleBarcodeLogin}
            onClose={() => setScannerVisible(false)}
          />

          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRemember(r => !r)}
            activeOpacity={0.85}
          >
            <Switch value={remember} onValueChange={setRemember} />
            <Text style={styles.rememberText}>{t('remember')}</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorBox}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.93 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={['#1976D2', '#54b6ff']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.buttonGrad}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>{t('login')}</Text>
              }
            </LinearGradient>
          </Pressable>

          <Text style={styles.subtitle}>© 2025 B&D Kleintransporte KG</Text>
        </Animatable.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 26 },
  logo: { width: 220, height: 110, marginBottom: 16, borderRadius: 26, backgroundColor: '#fff', elevation: 4 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#1976D2', marginBottom: 22, letterSpacing: 1.5 },
  langBar: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18, marginTop: 2, gap: 12 },
  langBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 18, borderRadius: 12, borderWidth: 1.6, borderColor: '#1976D2', backgroundColor: '#fff', marginHorizontal: 3 },
  langBtnActive: { backgroundColor: '#1976D2' },
  langBtnText: { color: '#1976D2', fontWeight: 'bold', fontSize: 17 },
  langBtnTextActive: { color: '#fff' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#1976D2', borderRadius: 16, marginBottom: 14, paddingHorizontal: 12, elevation: 2 },
  input: { flex: 1, padding: 15, fontSize: 17, color: '#222' },
  icon: { marginRight: 7 },
  iconRight: { marginLeft: 7 },
  button: { borderRadius: 20, marginTop: 16, marginBottom: 14, elevation: 3, width: '100%' },
  buttonGrad: { borderRadius: 20, alignItems: 'center', paddingVertical: 15 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 20, letterSpacing: 1.2 },
  errorBox: { backgroundColor: '#fde4e1', color: '#d32f2f', fontWeight: 'bold', textAlign: 'center', marginVertical: 12, borderRadius: 10, padding: 10, fontSize: 15, borderWidth: 1, borderColor: '#ffabab' },
  subtitle: { color: '#a2aab5', fontSize: 13, marginTop: 18, textAlign: 'center', fontWeight: 'bold' },
  rememberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, marginTop: 5, alignSelf: 'flex-start', paddingLeft: 2 },
  rememberText: { color: '#1976D2', fontWeight: '600', marginLeft: 8, fontSize: 17 },
});
