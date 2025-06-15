import React, { useEffect, useState, useContext, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Button, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from '../useTranslation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ReportsScreen() {
  const [years, setYears] = useState([]);
  const [rides, setRides] = useState([]);
  const [abholungen, setAbholungen] = useState([]);
  const [reportEmail, setReportEmail] = useState("");
  const [filter, setFilter] = useState('all');

  const navigation = useNavigation();
  const { themeStyles } = useContext(ThemeContext);
  const { t, language } = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('reports') });
  }, [navigation, t, language]);

  useEffect(() => {
    loadData();
    loadEmail();
  }, []);

  const loadData = async () => {
    const ridesData = await AsyncStorage.getItem('rides');
    setRides(ridesData ? JSON.parse(ridesData) : []);
    const abholungenData = await AsyncStorage.getItem('abholungen');
    setAbholungen(abholungenData ? JSON.parse(abholungenData) : []);
    // Set all years where ima bar jedna vožnja
    let yearsSet = new Set();
    if (ridesData) {
      JSON.parse(ridesData).forEach(r => yearsSet.add(new Date(r.date).getFullYear()));
    }
    if (abholungenData) {
      JSON.parse(abholungenData).forEach(a => yearsSet.add(new Date(a.date).getFullYear()));
    }
    setYears(Array.from(yearsSet).sort());
  };

  const loadEmail = async () => {
    const email = await AsyncStorage.getItem('reportEmail');
    if (email) setReportEmail(email);
  };

  // Mjeseci iz prevoda
  const months = Array.from({ length: 12 }, (_, i) => t(`month_${i + 1}`));

  // Filter helper
  const getFilteredData = (data, year, monthIndex) => {
    return data.filter(item => {
      const d = new Date(item.date);
      return d.getFullYear() === year && d.getMonth() === monthIndex;
    });
  };

  // Kombiniraj vožnje
  const getCombinedFiltered = (year, monthIndex) => {
    let zustellung = filter === 'Abholung' ? [] : getFilteredData(rides, year, monthIndex).map(r => ({ ...r, type: 'Zustellung' }));
    let abholung = filter === 'Zustellung' ? [] : getFilteredData(abholungen, year, monthIndex).map(a => ({ ...a, type: 'Abholung' }));
    return [...zustellung, ...abholung].sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Generiši PDF i dijeli ga
  const generateReport = async (year, monthIndex) => {
    const data = getCombinedFiltered(year, monthIndex);
    if (!data.length) return;
    const total = data.reduce((sum, r) =>
      sum + parseFloat(r.type === 'Abholung' ? (r.euro || 0) : (r.price || 0)), 0);

    const html = `
      <html>
        <body style="font-family: Arial; padding: 20px;">
          <h2>${t('specialTrip')} ${months[monthIndex]} ${year}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #002b7f; color: #ffd700;">
              <th style="border: 1px solid #000; padding: 6px;">${t('table_date')}</th>
              <th style="border: 1px solid #000; padding: 6px;">Tip</th>
              <th style="border: 1px solid #000; padding: 6px;">${t('table_driver')}</th>
              <th style="border: 1px solid #000; padding: 6px;">${t('table_route')}</th>
              <th style="border: 1px solid #000; padding: 6px;">${t('table_plz')}</th>
              <th style="border: 1px solid #000; padding: 6px;">${t('table_stops')}</th>
              <th style="border: 1px solid #000; padding: 6px;">${t('table_price')}</th>
            </tr>
            ${data.map(r => `
              <tr>
                <td style="border: 1px solid #000; padding: 6px;">${new Date(r.date).toLocaleDateString()}</td>
                <td style="border: 1px solid #000; padding: 6px;">${r.type}</td>
                <td style="border: 1px solid #000; padding: 6px;">${r.driver}</td>
                <td style="border: 1px solid #000; padding: 6px;">${r.type === 'Abholung' ? (r.details || '-') : (r.route || '-')}</td>
                <td style="border: 1px solid #000; padding: 6px;">${r.type === 'Abholung' ? '-' : (r.plz || '-')}</td>
                <td style="border: 1px solid #000; padding: 6px;">${r.stops}</td>
                <td style="border: 1px solid #000; padding: 6px;">${r.type === 'Abholung'
                  ? (parseFloat(r.euro).toFixed(2) + '€')
                  : (parseFloat(r.price).toFixed(2) + '€')
                }</td>
              </tr>
            `).join('')}
          </table>
          <h3>${t('totalPrice')}: ${total.toFixed(2)}€</h3>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  // Pošalji izvještaj na email (otvara email klijent)
  const sendReportToEmail = async (year, monthIndex) => {
    const data = getCombinedFiltered(year, monthIndex);
    if (!data.length || !reportEmail) return;
    const total = data.reduce((sum, r) =>
      sum + parseFloat(r.type === 'Abholung' ? (r.euro || 0) : (r.price || 0)), 0);

    const html = `
      <html>
        <body style="font-family: Arial; padding: 20px;">
          <h2>${t('specialTrip')} ${months[monthIndex]} ${year}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #002b7f; color: #ffd700;">
              <th style="border: 1px solid #000; padding: 6px;">${t('table_date')}</th>
              <th style="border: 1px solid #000; padding: 6px;">Tip</th>
              <th style="border: 1px solid #000; padding: 6px;">${t('table_driver')}</th>
              <th style="border: 1px solid #000; padding: 6px;">${t('table_route')}</th>
              <th style="border: 1px solid #000; padding: 6px;">${t('table_plz')}</th>
              <th style="border: 1px solid #000; padding: 6px;">${t('table_stops')}</th>
              <th style="border: 1px solid #000; padding: 6px;">${t('table_price')}</th>
            </tr>
            ${data.map(r => `
              <tr>
                <td style="border: 1px solid #000; padding: 6px;">${new Date(r.date).toLocaleDateString()}</td>
                <td style="border: 1px solid #000; padding: 6px;">${r.type}</td>
                <td style="border: 1px solid #000; padding: 6px;">${r.driver}</td>
                <td style="border: 1px solid #000; padding: 6px;">${r.type === 'Abholung' ? (r.details || '-') : (r.route || '-')}</td>
                <td style="border: 1px solid #000; padding: 6px;">${r.type === 'Abholung' ? '-' : (r.plz || '-')}</td>
                <td style="border: 1px solid #000; padding: 6px;">${r.stops}</td>
                <td style="border: 1px solid #000; padding: 6px;">${r.type === 'Abholung'
                  ? (parseFloat(r.euro).toFixed(2) + '€')
                  : (parseFloat(r.price).toFixed(2) + '€')
                }</td>
              </tr>
            `).join('')}
          </table>
          <h3>${t('totalPrice')}: ${total.toFixed(2)}€</h3>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      Alert.alert(
        'Mail spreman',
        'Klikni na dugme ispod za slanje e-maila sa izvještajem (PDF fajl). Ako PDF nije automatski u privitku, ručno ga pronađi u Download folderu.',
        [
          {
            text: 'Pošalji Email',
            onPress: () => {
              const subject = `${t('specialTrip')} ${months[monthIndex]} ${year}`;
              const body = `${t('reports')} - ${months[monthIndex]} ${year}\n\nIzvještaj PDF: ${uri}`;
              const emailUrl = `mailto:${reportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              Linking.openURL(emailUrl);
            }
          },
          { text: 'Otkaži', style: 'cancel' }
        ]
      );
    } catch (err) {
      Alert.alert('Greška', 'Ne mogu pripremiti izvještaj za email.');
    }
  };

  const monthsWithData = (year) => {
    // Ima li barem jedna vožnja tog tipa (ili oba) u mjesecu
    return months.map((month, index) => {
      const zustellung = filter === 'Abholung' ? [] : getFilteredData(rides, year, index);
      const abholung = filter === 'Zustellung' ? [] : getFilteredData(abholungen, year, index);
      const hasData = (zustellung.length + abholung.length) > 0;
      return hasData ? { name: month, index } : null;
    }).filter(Boolean);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeStyles.background }]}>
      <Text style={[styles.header, { color: themeStyles.color }]}>{t('reports')}</Text>

      {/* Filter dugmad */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 13, gap: 7 }}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          onPress={() => setFilter('all')}
        >
          <Icon name="filter" size={18} color={filter === 'all' ? "#fff" : "#1976D2"} />
          <Text style={filter === 'all' ? styles.filterBtnTextActive : styles.filterBtnText}> {t('filterAll')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'Zustellung' && styles.filterBtnActive]}
          onPress={() => setFilter('Zustellung')}
        >
          <Icon name="truck" size={18} color={filter === 'Zustellung' ? "#fff" : "#1976D2"} />
          <Text style={filter === 'Zustellung' ? styles.filterBtnTextActive : styles.filterBtnText}> {t('filterZustellung')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'Abholung' && styles.filterBtnActive]}
          onPress={() => setFilter('Abholung')}
        >
          <Icon name="handshake" size={18} color={filter === 'Abholung' ? "#fff" : "#1976D2"} />
          <Text style={filter === 'Abholung' ? styles.filterBtnTextActive : styles.filterBtnText}> {t('filterAbholung')}</Text>
        </TouchableOpacity>
      </View>

      {reportEmail ? (
        <Text style={{
          textAlign: 'center',
          color: '#1877f2',
          marginBottom: 10,
          fontStyle: 'italic'
        }}>
          {t('emailForReports')}: {reportEmail}
        </Text>
      ) : null}

      {years.length === 0 && (
        <Text style={{ color: themeStyles.color, textAlign: 'center', marginVertical: 40, fontSize: 18 }}>
          {t('noReports') || "Nema izvještaja"}
        </Text>
      )}
      {years.map((year) => (
        <View key={year} style={styles.yearBlock}>
          <Text style={[styles.yearTitle, { color: themeStyles.color }]}>{year}</Text>
          {monthsWithData(year).map(({ name, index }) => (
            <View key={index} style={styles.monthRow}>
              <TouchableOpacity
                style={[styles.monthButton, { backgroundColor: '#28a745' }]}
                onPress={() => generateReport(year, index)}>
                <Icon name="file-pdf-box" size={21} color="#fff" />
                <Text style={styles.monthText}> {name}</Text>
              </TouchableOpacity>
              {reportEmail ? (
                <TouchableOpacity
                  style={[styles.emailButton, { backgroundColor: '#1877f2', marginLeft: 7 }]}
                  onPress={() => sendReportToEmail(year, index)}>
                  <Icon name="email-send" size={20} color="#fff" />
                  <Text style={styles.emailButtonText}> {t('sendToEmail')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e0e0', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 15, marginHorizontal: 2 },
  filterBtnActive: { backgroundColor: '#1976D2' },
  filterBtnText: { fontSize: 15, fontWeight: 'bold', color: '#1976D2' },
  filterBtnTextActive: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  yearBlock: { marginBottom: 30 },
  yearTitle: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
  monthRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  monthButton: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8 },
  monthText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 15 },
  emailButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  emailButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
