import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from '../useTranslation';

export default function MonthlyStatsScreen({ route }) {
  const { year, month, monthName } = route.params;
  const { themeStyles } = useContext(ThemeContext);
  const { t } = useTranslation();

  const [rides, setRides] = useState([]);
  const [abholungen, setAbholungen] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const ridesData = await AsyncStorage.getItem('rides');
    const abholungenData = await AsyncStorage.getItem('abholungen');
    setRides(ridesData ? JSON.parse(ridesData) : []);
    setAbholungen(abholungenData ? JSON.parse(abholungenData) : []);
  };

  // Filtriraj po tipu i mjesecu/godini
  const filteredRides = [
    ...(filter === 'all' || filter === 'Zustellung'
      ? rides.filter(r => {
          const d = new Date(r.date);
          return d.getFullYear() === year && d.getMonth() === month;
        }).map(r => ({ ...r, type: 'Zustellung' }))
      : []
    ),
    ...(filter === 'all' || filter === 'Abholung'
      ? abholungen.filter(a => {
          const d = new Date(a.date);
          return d.getFullYear() === year && d.getMonth() === month;
        }).map(a => ({ ...a, type: 'Abholung' }))
      : []
    ),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Suma
  const sumNeto = filteredRides.reduce((sum, r) =>
    sum + parseFloat(r.type === 'Abholung' ? (r.euro || 0) : (r.price || 0)), 0);

  // Render table header
  const renderHeader = () => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.th]}>{t('table_date')}</Text>
      <Text style={[styles.tableCell, styles.th]}>{t('type')}</Text>
      <Text style={[styles.tableCell, styles.th]}>{t('table_driver')}</Text>
      <Text style={[styles.tableCell, styles.th]}>{t('table_route')}</Text>
      <Text style={[styles.tableCell, styles.th]}>{t('table_plz')}</Text>
      <Text style={[styles.tableCell, styles.th]}>{t('table_stops')}</Text>
      <Text style={[styles.tableCell, styles.th]}>{t('table_price')}</Text>
    </View>
  );

  // Render table rows
  const renderRow = (r, i) => (
    <View style={styles.tableRow} key={r.id || i}>
      <Text style={styles.tableCell}>{r.date}</Text>
      <Text style={styles.tableCell}>{r.type}</Text>
      <Text style={styles.tableCell}>{r.type === 'Abholung' ? (r.fahrer || '-') : (r.driver || '-')}</Text>
      <Text style={styles.tableCell}>{r.type === 'Abholung' ? (r.details || '-') : (r.route || '-')}</Text>
      <Text style={styles.tableCell}>{r.type === 'Abholung' ? '-' : (r.plz || '-')}</Text>
      <Text style={styles.tableCell}>{r.stops}</Text>
      <Text style={styles.tableCell}>{r.type === 'Abholung'
        ? (parseFloat(r.euro).toFixed(2) + '€')
        : (parseFloat(r.price).toFixed(2) + '€')}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeStyles.background }]}>
      <Text style={[styles.header, { color: themeStyles.color }]}>
        {t('specialTrip')} {monthName} {year}
      </Text>
      {/* Filter dugmad */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={filter === 'all' ? styles.filterBtnTextActive : styles.filterBtnText}>{t('filterAll')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'Zustellung' && styles.filterBtnActive]}
          onPress={() => setFilter('Zustellung')}
        >
          <Text style={filter === 'Zustellung' ? styles.filterBtnTextActive : styles.filterBtnText}>{t('filterZustellung')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'Abholung' && styles.filterBtnActive]}
          onPress={() => setFilter('Abholung')}
        >
          <Text style={filter === 'Abholung' ? styles.filterBtnTextActive : styles.filterBtnText}>{t('filterAbholung')}</Text>
        </TouchableOpacity>
      </View>
      {/* Tabela */}
      <ScrollView horizontal style={{ marginTop: 10, marginBottom: 10 }}>
        <View>
          {renderHeader()}
          {filteredRides.map(renderRow)}
        </View>
      </ScrollView>
      <Text style={styles.sumText}>
        {t('net') || "Neto"}: <Text style={{ color: "#ff9000" }}>{sumNeto.toFixed(2)} €</Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 21, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  filterRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 7, gap: 8 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16, backgroundColor: '#e8f1fb', marginHorizontal: 2 },
  filterBtnActive: { backgroundColor: '#1976D2', elevation: 2 },
  filterBtnText: { color: '#1976D2', fontWeight: 'bold', fontSize: 15 },
  filterBtnTextActive: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: "#f1f1f1", minHeight: 38, alignItems: 'center' },
  tableCell: { flex: 1, padding: 4, fontSize: 13, color: "#18365c", minWidth: 65 },
  th: { fontWeight: 'bold', backgroundColor: "#e6ecfa", fontSize: 13 },
  sumText: { color: '#24477a', fontWeight: 'bold', fontSize: 16, marginVertical: 7, textAlign: 'right' },
});
