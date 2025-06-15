import React, { useContext, useRef, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ScrollView } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from '../useTranslation';

const APP_VERSION = '1.0.0';

const CHANGELOG = [
  { version: "1.0.0", date: "12.06.2025", desc: "Prva verzija aplikacije (GLS Sonderfahrt, login, vožnje, izvještaji...)" },
  { version: "1.1.0", date: "21.06.2025", desc: "Dodano: backup/restore, moderniji dizajn, ispravke prevoda" },
];

function getCurrentDate() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}.${m}.${y}`;
}

function HeartAnimation() {
  const heartY = useRef(new Animated.Value(-30)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(heartOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartY, {
        toValue: 18,
        duration: 1100,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginTop: 10 }}>
      <Text style={{ fontSize: 28, marginRight: 6, marginBottom: 2 }}>🚚</Text>
      <Animated.Text
        style={{
          fontSize: 24,
          color: '#1877f2',
          fontWeight: 'bold',
          marginLeft: 2,
          opacity: heartOpacity,
          transform: [{ translateY: heartY }],
        }}>
        💙
      </Animated.Text>
    </View>
  );
}

export default function AboutScreen({ navigation }) {
  const { themeStyles, themeName } = useContext(ThemeContext);
  const { t, language } = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('aboutTitle') || t('about') });
  }, [navigation, t, language]);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          backgroundColor:
            themeName === 'dark' || themeName === 'gls' ? '#111' : themeStyles.background,
        },
      ]}
    >
      <View style={styles.card}>
        <Text style={styles.firmName}>B&D Kleintransporte KG</Text>
        <Text style={styles.appDesc}>GLS Sonderfahrt App</Text>
        <View style={styles.divider} />
        <Text style={styles.info}>begic.prodaja@gmail.com</Text>
        <Text style={styles.info}>+43 664 1234567</Text>
        <View style={styles.divider} />
        <Text style={styles.info}>
          Verzija: <Text style={styles.infoVal}>{APP_VERSION}</Text>
        </Text>
        <Text style={styles.info}>
          Zadnje ažuriranje: <Text style={styles.infoVal}>{getCurrentDate()}</Text>
        </Text>
        <HeartAnimation />

        <View style={styles.changelogContainer}>
          <Text style={styles.changelogTitle}>Changelog</Text>
          {CHANGELOG.map((log, i) => (
            <View key={i} style={styles.changelogEntry}>
              <Text style={styles.changelogVersion}>
                v{log.version} <Text style={styles.changelogDate}>({log.date})</Text>
              </Text>
              <Text style={styles.changelogDesc}>{log.desc}</Text>
            </View>
          ))}
        </View>

        <View style={styles.signatureContainer}>
          <Text style={styles.signatureText}>
            <Text style={styles.signatureYear}>© {new Date().getFullYear()}</Text>
            {"  "}
            <Text style={styles.signatureBlue}>Made with 💙 by Eldin Begić for GLS Depot 57</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 440,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  firmName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00367d',
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  appDesc: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 13,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  divider: {
    width: '90%',
    height: 1.5,
    backgroundColor: '#f0c420',
    marginVertical: 13,
    borderRadius: 2,
  },
  info: { fontSize: 16, marginBottom: 4, textAlign: 'center', color: '#222' },
  infoVal: { fontWeight: 'bold', color: '#00367d' },
  changelogContainer: { width: '100%', marginTop: 30, paddingHorizontal: 4 },
  changelogTitle: { fontWeight: 'bold', fontSize: 18, color: '#00367d', marginBottom: 5 },
  changelogEntry: { marginBottom: 7 },
  changelogVersion: { fontWeight: 'bold', color: '#1976D2' },
  changelogDate: { color: '#aaa' },
  changelogDesc: { color: '#333' },
  signatureContainer: { marginTop: 24, alignItems: 'center', width: '100%' },
  signatureText: { fontSize: 15, fontStyle: 'italic', letterSpacing: 0.2, textAlign: 'center', color: '#375a7f', opacity: 0.97 },
  signatureYear: { color: '#bbb', fontWeight: '600', fontSize: 14 },
  signatureBlue: { color: '#1877f2', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.3 },
});
