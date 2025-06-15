import React, { useContext, useLayoutEffect, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RidesContext } from '../context/RidesContext';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from '../useTranslation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AllRidesScreen() {
  const { rides } = useContext(RidesContext);
  const { themeStyles } = useContext(ThemeContext);
  const { t, language } = useTranslation();

  const [abholungen, setAbholungen] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('abholungen').then(data => {
      if (data) setAbholungen(JSON.parse(data));
      else setAbholungen([]);
    });
  }, []);

  // Kombiniraj obje vrste vožnji
  const allRides = [
    ...rides.map(r => ({ ...r, type: 'Zustellung' })),
    ...abholungen.map(a => ({ ...a, type: 'Abholung' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filtriranje
  let filteredRides = allRides.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  // Pretraga po vozaču/ruti/PLZ (opcionalno)
  if (search) {
    const s = search.toLowerCase();
    filteredRides = filteredRides.filter(
      item =>
        (item.driver || item.fahrer || '').toLowerCase().includes(s) ||
        (item.route || item.details || '').toLowerCase().includes(s) ||
        (item.plz || '').toLowerCase().includes(s)
    );
  }

  // Ukupna suma
  const totalSum = filteredRides.reduce(
    (sum, item) => sum + parseFloat(item.type === 'Abholung' ? (item.euro || 0) : (item.price || 0)),
    0
  );

  // Render kartice
  const renderItem = ({ item }) => (
    <View style={styles.rideCard}>
      <View style={{ flex: 1 }}>
        <View style={styles.row}>
          <Text style={styles.dateText}>{item.date}</Text>
          <View style={[
            styles.badge,
            item.type === 'Zustellung' ? styles.zustellungBadge : styles.abholungBadge
          ]}>
            <Text style={styles.badgeText}>
              {item.type === 'Abholung' ? t('filterAbholung') : t('filterZustellung')}
            </Text>
          </View>
          <Text style={styles.priceText}>
            {parseFloat(item.type === 'Abholung' ? item.euro : item.price).toFixed(2)} €
          </Text>
        </View>
        <Text style={styles.mainText}>
          {item.type === 'Abholung'
            ? (item.fahrer || '-') : (item.driver || '-')}
          {'  '}|  {item.type === 'Abholung'
            ? (item.details || '-') : (item.route || '-')}
        </Text>
        <Text style={styles.subText}>
          {item.type === 'Abholung'
            ? `${t('stops')}: ${item.stops}  |  ${t('hours')}: ${item.hours || '-'}` 
            : `PLZ: ${item.plz}  |  ${t('stops')}: ${item.stops}`}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.background }]}>
      <Text style={styles.header}>{t('allRides')}</Text>
      {/* Filter dugmad */}
      <View style={styles.filterRow}>
        {['all', 'Zustellung', 'Abholung'].map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterBtn,
              filter === f && styles.filterBtnActive,
            ]}
            activeOpacity={0.85}
          >
            <Text style={[
              styles.filterBtnText,
              filter === f && styles.filterBtnTextActive
            ]}>
              {f === 'all' ? t('filterAll') : f === 'Zustellung' ? t('filterZustellung') : t('filterAbholung')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Icon name="magnify" size={22} color="#1976D2" style={{ marginRight: 6 }} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t('search') || "Pretraga..."}
          placeholderTextColor="#bbb"
        />
      </View>
      {/* Ukupna suma */}
      <Text style={styles.totalSum}>
        {t('totalPrice')}: <Text style={{ color: "#ff9000" }}>{totalSum.toFixed(2)} €</Text>
      </Text>
      {/* Lista vožnji */}
      <FlatList
        data={filteredRides}
        keyExtractor={(item, idx) => item.id ? item.id.toString() : idx.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyMsg}>{t('noRides') || "Nema vožnji"}</Text>
        }
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 17, backgroundColor: "#f8faff" },
  header: { fontSize: 23, fontWeight: 'bold', marginBottom: 10, color: "#24477a", textAlign: 'center', letterSpacing: 0.2 },
  filterRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 7, gap: 8 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 16, backgroundColor: '#e8f1fb', marginHorizontal: 2 },
  filterBtnActive: { backgroundColor: '#1976D2', elevation: 2 },
  filterBtnText: { color: '#1976D2', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.3 },
  filterBtnTextActive: { color: '#fff' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, marginVertical: 7, borderWidth: 1, borderColor: "#e6eaf2", elevation: 2 },
  searchInput: { flex: 1, padding: 10, fontSize: 15, color: "#222" },
  totalSum: { color: '#24477a', fontWeight: 'bold', fontSize: 16, marginVertical: 5, textAlign: 'right' },
  rideCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2, shadowColor: "#24477a", shadowOpacity: 0.09 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 1, justifyContent: 'space-between' },
  dateText: { color: '#1976D2', fontWeight: 'bold', fontSize: 15, flex: 1 },
  badge: { paddingVertical: 2, paddingHorizontal: 11, borderRadius: 11, marginLeft: 10, alignSelf: 'center' },
  zustellungBadge: { backgroundColor: '#e3f6fc' },
  abholungBadge: { backgroundColor: '#ffedd5' },
  badgeText: { fontWeight: 'bold', fontSize: 13, color: '#1976D2' },
  priceText: { color: '#ff9000', fontWeight: 'bold', fontSize: 15, minWidth: 60, textAlign: 'right' },
  mainText: { fontWeight: '600', fontSize: 15, color: "#162c40", marginTop: 2 },
  subText: { color: "#555", fontSize: 13, marginTop: 1, marginBottom: 3 },
  emptyMsg: { color: '#b0bac8', textAlign: 'center', marginTop: 60, fontSize: 15 },
});
