import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RidesContext } from '../context/RidesContext';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from '../useTranslation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const LOGO_WIDTH = screenWidth * 0.30;
const LOGO_HEIGHT = LOGO_WIDTH * 1.0;

// Funkcija koja vraća današnji datum u "YYYY-MM-DD" formatu
function todayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export default function MainMenuScreen() {
  const navigation = useNavigation();
  const { rides } = useContext(RidesContext); // samo rides iz contexta!
  const { themeStyles } = useContext(ThemeContext);
  const { t, language } = useTranslation();

  const [abholungen, setAbholungen] = useState([]);
  const today = todayStr();

  // Učitaj abholungen kad god je ekran u fokusu
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('abholungen').then(data => {
        if (data) setAbholungen(JSON.parse(data));
        else setAbholungen([]);
      });
    }, [])
  );

  // Pravi broj vožnji za danas (rides iz contexta + abholungen iz storage-a)
  const todayRidesCount =
    (rides?.filter(r => r.date === today).length || 0) +
    (abholungen?.filter(a => a.date === today).length || 0);

  const buttons = [
    { icon: 'plus-circle-outline', label: t('addRide'), screen: 'ChooseRideType', color: '#1dc731' },
    { icon: 'car-multiple', label: t('allRides'), screen: 'AllRides', color: '#2196f3' },
    { icon: 'chart-bar', label: t('stats'), screen: 'Stats', color: '#933fff' },
    { icon: 'file-chart-outline', label: t('reports'), screen: 'Reports', color: '#fd9906' },
    { icon: 'cog-outline', label: t('settings'), screen: 'Settings', color: '#222' },
    { icon: 'information-outline', label: t('about'), screen: 'About', color: '#2196f3' },
  ];

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: themeStyles.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo i naslov u istom redu */}
        <View style={styles.headerRow}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandMain}>
            <Text style={{ fontWeight: 'bold', color: '#203464' }}>Sonderfahrt{"\n"}</Text>
            <Text style={{ color: '#1862d7', fontWeight: '600', fontStyle: 'italic' }}>by Eldin Begić</Text>
          </Text>
        </View>

        {/* Zastavice - gore desno (po potrebi, ovdje demo) */}
        <View style={styles.langBar}>
          <Text style={styles.lang}>{language === "bs" ? "🇧🇦" : language === "de" ? "🇩🇪" : "🇬🇧"}</Text>
        </View>

        {/* DANAS: X VOŽNJI */}
        <View style={styles.ridesBox}>
          <Icon name="cube-send" color="#1dc731" size={22} />
          <Text style={styles.ridesText}>
            <Text style={styles.boldText}>{t('todayRides') || "Danas"}:</Text>
            <Text style={styles.todayRidesValue}> {todayRidesCount}</Text>
          </Text>
        </View>

        {/* Glavni meni dugmad */}
        <View style={styles.menu}>
          {buttons.map((btn, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.menuBtn,
                { borderLeftColor: btn.color, shadowColor: btn.color },
              ]}
              onPress={() => navigation.navigate(btn.screen, btn.params)}
              activeOpacity={0.92}
            >
              <Icon name={btn.icon} size={24} color={btn.color} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: btn.color }]}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {/* Copyright na dnu */}
      <Text style={styles.footer}>© 2025 B&D Kleintransporte KG</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fafcff',
  },
  container: {
    padding: 18,
    alignItems: 'center',
    flexGrow: 1,
    paddingBottom: 70,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
    width: '100%',
    justifyContent: 'center',
    gap: 16,
  },
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    borderRadius: 24,
    backgroundColor: '#fff',
    marginRight: 10,
    elevation: 6,
    shadowColor: "#aaa",
  },
  brandMain: {
    fontSize: 22,
    letterSpacing: 0.17,
    textAlign: 'left',
    marginTop: 0,
    marginBottom: 0,
    maxWidth: 180,
  },
  langBar: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 10,
    marginTop: 3,
  },
  lang: {
    fontSize: 28,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ececec',
    paddingVertical: 2,
    paddingHorizontal: 7,
    overflow: 'hidden',
    shadowColor: '#aaa',
    shadowOpacity: 0.1,
    elevation: 3,
  },
  ridesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7fbe7',
    borderRadius: 16,
    paddingHorizontal: 26,
    paddingVertical: 13,
    marginBottom: 18,
    marginTop: 3,
    shadowColor: '#43df6e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.17,
    shadowRadius: 7,
    elevation: 3,
  },
  ridesText: {
    marginLeft: 9,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: '#1dc731',
  },
  todayRidesValue: {
    color: '#1dc731',
    fontWeight: 'bold',
    fontSize: 20,
  },
  boldText: { fontWeight: 'bold', color: '#193865', fontSize: 18 },
  menu: {
    width: '100%',
    marginTop: 5,
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 14,
    paddingVertical: 18,
    paddingHorizontal: 19,
    borderLeftWidth: 8,
    elevation: 5,
    shadowOpacity: 0.17,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 2 },
    gap: 7,
  },
  menuIcon: {
    marginRight: 14,
    opacity: 0.94,
  },
  menuText: {
    fontSize: 17,
    fontWeight: 'bold',
    opacity: 0.96,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    textAlign: 'center',
    fontSize: 13,
    color: '#b8bac1',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
});
