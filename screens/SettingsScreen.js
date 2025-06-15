import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Platform, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from '../useTranslation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SettingsScreen() {
  const { themeName, setThemeName, themeStyles } = useContext(ThemeContext);
  const { language, setLanguage, t } = useTranslation();
  const [email, setEmail] = useState('');
  const [messageKey, setMessageKey] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('reportEmail').then((value) => {
      if (value) setEmail(value);
    });
  }, []);

  const handleBackup = () => {
    Alert.alert(t('backup'), t('backupSuccess') || "Backup je sačuvan! (samo demo)");
  };
  const handleRestore = () => {
    Alert.alert(t('restore'), t('restoreSuccess') || "Backup je vraćen! (samo demo)");
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setMessageKey(null);
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('reportEmail', email);
      setMessageKey('emailSaved');
    } catch (err) {
      setMessageKey('emailSaveFailed');
    }
  };

  const handleReset = async () => {
    await AsyncStorage.multiRemove(['reportEmail', 'theme']);
    setEmail('');
    setThemeName('light');
    setLanguage('en');
    setMessageKey('resetSuccess');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.background }]}>
      {/* Tema */}
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: themeStyles.color }]}>{t('appearance') || "Izgled"}</Text>
        <Text style={[styles.label, { color: themeStyles.color }]}>{t('themeStyle') || "Tema"}</Text>
        <Picker
          selectedValue={themeName}
          style={[styles.picker, Platform.OS === 'android' && { color: themeStyles.color }]}
          dropdownIconColor={themeStyles.color}
          onValueChange={(value) => setThemeName(value)}>
          <Picker.Item label={`🌞 ${t('lightTheme') || "Svijetla"}`} value="light" />
          <Picker.Item label={`🌙 ${t('darkTheme') || "Tamna"}`} value="dark" />
          <Picker.Item label={`📦 ${t('glsTheme') || "GLS"}`} value="gls" />
        </Picker>
      </View>

      {/* Jezik */}
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: themeStyles.color }]}>{t('language')}</Text>
        <Picker
          selectedValue={language}
          style={[styles.picker, Platform.OS === 'android' && { color: themeStyles.color }]}
          dropdownIconColor={themeStyles.color}
          onValueChange={(value) => setLanguage(value)}>
          <Picker.Item label="🇧🇦 Bosanski" value="bs" />
          <Picker.Item label="🇩🇪 Deutsch" value="de" />
          <Picker.Item label="🇬🇧 English" value="en" />
        </Picker>
      </View>

      {/* Email */}
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: themeStyles.color }]}>{t('emailForReports')}</Text>
        <TextInput
          style={[styles.input, {
            color: themeStyles.color,
            borderColor: themeStyles.color,
          }]}
          value={email}
          placeholder="npr. email@firma.at"
          placeholderTextColor="#888"
          keyboardType="email-address"
          onChangeText={handleEmailChange}
        />
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: themeStyles.color }]} onPress={handleSave}>
          <Text style={{ color: themeStyles.background, fontWeight: 'bold', fontSize: 17 }}>{t('save')}</Text>
        </TouchableOpacity>
      </View>

      {/* Backup & Restore */}
      <View style={styles.cardRow}>
        <TouchableOpacity style={[styles.utilityButton, { backgroundColor: '#1976D2' }]} onPress={handleBackup}>
          <Icon name="cloud-upload" size={26} color="#fff" />
          <Text style={styles.utilityButtonText}>{t('backup')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.utilityButton, { backgroundColor: '#52c41a' }]} onPress={handleRestore}>
          <Icon name="cloud-download" size={26} color="#fff" />
          <Text style={styles.utilityButtonText}>{t('restore')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.utilityButton, { backgroundColor: '#f5222d' }]} onPress={handleReset}>
          <Icon name="restore" size={26} color="#fff" />
          <Text style={styles.utilityButtonText}>{t('resetSettings')}</Text>
        </TouchableOpacity>
      </View>

      {/* Poruka */}
      {messageKey && (
        <Text
          style={{
            color: messageKey.includes('fail') ? 'red' : 'green',
            marginTop: 14,
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 16
          }}>
          {t(messageKey)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, justifyContent: 'flex-start' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 4,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
    marginTop: 10,
  },
  cardTitle: { fontSize: 19, fontWeight: 'bold', marginBottom: 11 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 7 },
  picker: {
    height: 52,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: Platform.OS === 'ios' ? '#f2f2f2' : 'transparent',
  },
  input: {
    height: 46,
    borderWidth: 1.2,
    borderRadius: 9,
    paddingHorizontal: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    marginTop: 7,
  },
  utilityButton: {
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: '#1976D2',
    flexDirection: 'column',
    elevation: 3,
    gap: 5,
  },
  utilityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 17,
    letterSpacing: 0.3,
    marginTop: 5,
  }
});
