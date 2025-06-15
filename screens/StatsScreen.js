import React, { useEffect, useState, useContext, useLayoutEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from '../useTranslation';

export default function StatsScreen() {
  const [years, setYears] = useState([]);
  const [rides, setRides] = useState([]);
  const navigation = useNavigation();
  const { themeStyles } = useContext(ThemeContext);
  const { t, language } = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('stats') });
  }, [navigation, t, language]);

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    const data = await AsyncStorage.getItem('rides');
    if (!data) return;
    const allRides = JSON.parse(data);
    setRides(allRides);
    const yearSet = new Set();
    allRides.forEach((r) => yearSet.add(new Date(r.date).getFullYear()));
    const sortedYears = Array.from(yearSet).sort();
    setYears(sortedYears);
  };

  // Mjeseci sa prevodima!
  const months = Array.from({ length: 12 }, (_, i) => ({
    name: t(`month_${i + 1}`),
    index: i,
  }));

  const monthsWithData = (year) => {
    return months.map(({ name, index }) => {
      const hasData = rides.some((r) => {
        const d = new Date(r.date);
        return d.getFullYear() === year && d.getMonth() === index;
      });
      return hasData ? { name, index } : null;
    }).filter(Boolean);
  };

  const openMonthStats = (year, monthIndex, monthName) => {
    navigation.navigate('MonthlyStats', {
      year,
      month: monthIndex,
      monthName,
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeStyles.background }]}>
      <Text style={[styles.header, { color: themeStyles.color }]}>{t('specialTrip')}</Text>
      {years.length === 0 && (
        <Text style={{ color: '#b7bfc8', textAlign: 'center', marginVertical: 40, fontSize: 18 }}>
          {t('noReports') || "Nema izvještaja"}
        </Text>
      )}
      {years.map((year) => (
        <View key={year} style={styles.yearBlock}>
          <Text style={[styles.yearTitle, { color: themeStyles.color }]}>{year}</Text>
          <View style={styles.monthsRow}>
            {monthsWithData(year).map(({ name, index }) => (
              <TouchableOpacity
                key={index}
                style={styles.monthButton}
                onPress={() => openMonthStats(year, index, name)}>
                <Text style={styles.monthText}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  yearBlock: { marginBottom: 28 },
  yearTitle: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
  monthsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  monthButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginBottom: 7,
    backgroundColor: '#28a745',
    marginRight: 10,
    marginTop: 5,
  },
  monthText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
