import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from '../useTranslation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-root-toast';
import plzPrices from '../data/plzPrices';
import stopPrices from '../data/stopPrices';

export default function AddRideScreen() {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [driver, setDriver] = useState('');
  const [route, setRoute] = useState('');
  const [plz, setPlz] = useState('');
  const [stops, setStops] = useState('');
  const [price, setPrice] = useState(0);
  const [rides, setRides] = useState([]);
  const stopsInput = useRef();

  // Automatsko računanje cijene
  useEffect(() => {
    let plzPart = 0;
    let stopsPart = 0;
    if (plz && plzPrices[plz]) plzPart = plzPrices[plz];
    if (stops && stopPrices[stops]) stopsPart = stopPrices[stops];
    setPrice(plzPart + stopsPart);
  }, [plz, stops]);

  // Učitaj zadnje vožnje
  useEffect(() => {
    AsyncStorage.getItem('rides').then(data => {
      if (data) setRides(JSON.parse(data));
    });
  }, []);

  // Spremi novu vožnju
  const saveRide = async () => {
    if (!driver || !route || !plz || !stops) {
      Toast.show(t('missingFields') || "Popuni sva polja!", { backgroundColor: '#ff5454' });
      return;
    }
    const newRide = {
      id: Date.now().toString(),
      date: date.toISOString().split('T')[0],
      driver, route, plz, stops, price
    };
    const newRides = [newRide, ...rides];
    setRides(newRides);
    await AsyncStorage.setItem('rides', JSON.stringify(newRides));
    Toast.show(t('success') || "Vožnja uspješno dodana!", { backgroundColor: '#007c25' });
    setDriver(''); setRoute(''); setPlz(''); setStops(''); setPrice(0);
  };

  // Obriši vožnju
  const deleteRide = (id) => {
    Alert.alert(
      t('delete') || "Obriši",
      t('confirm') || "Jesi siguran da želiš obrisati vožnju?",
      [
        { text: t('no') || "Ne", style: "cancel" },
        {
          text: t('yes') || "Da", style: "destructive",
          onPress: async () => {
            const filtered = rides.filter(r => r.id !== id);
            setRides(filtered);
            await AsyncStorage.setItem('rides', JSON.stringify(filtered));
          }
        }
      ]
    );
  };

  // Reset form
  const resetForm = () => {
    setDriver(''); setRoute(''); setPlz(''); setStops(''); setPrice(0);
    Toast.show(t('resetForm') || "Forma resetirana", { backgroundColor: '#444' });
    stopsInput.current && stopsInput.current.blur();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('addRide')}</Text>
        <Text style={styles.desc}>{t('addRideDesc') || "Popuni podatke o novoj vožnji."}</Text>

        {/* Forma */}
        <View style={styles.card}>
          {/* Datum */}
          <Text style={styles.label}>{t('date')}</Text>
          <TouchableOpacity onPress={() => setShowDate(true)} style={styles.inputRow}>
            <Icon name="calendar" size={22} color="#1976D2" style={styles.leftIcon} />
            <TextInput
              style={[styles.input, { color: '#222' }]}
              value={date.toISOString().split('T')[0]}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {showDate && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(e, d) => { setShowDate(false); d && setDate(d); }}
            />
          )}

          {/* Vozač */}
          <Text style={styles.label}>{t('driver')}</Text>
          <View style={styles.inputRow}>
            <Icon name="account-tie" size={22} color="#1976D2" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              value={driver}
              onChangeText={setDriver}
              placeholder={t('driver')}
              placeholderTextColor="#bbb"
              autoCapitalize="words"
            />
          </View>

          {/* Ruta */}
          <Text style={styles.label}>{t('route')}</Text>
          <View style={styles.inputRow}>
            <Icon name="road-variant" size={22} color="#1976D2" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              value={route}
              onChangeText={setRoute}
              placeholder={t('route')}
              placeholderTextColor="#bbb"
              autoCapitalize="words"
            />
          </View>

          {/* Poštanski broj */}
          <Text style={styles.label}>{t('plz')}</Text>
          <View style={styles.inputRow}>
            <Icon name="map-marker" size={22} color="#1976D2" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              value={plz}
              onChangeText={setPlz}
              placeholder={t('plz')}
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          {/* Broj adresa */}
          <Text style={styles.label}>{t('stops')}</Text>
          <View style={styles.inputRow}>
            <Icon name="home-group" size={22} color="#1976D2" style={styles.leftIcon} />
            <TextInput
              ref={stopsInput}
              style={styles.input}
              value={stops}
              onChangeText={setStops}
              placeholder={t('stops')}
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
        </View>

        {/* Prikaz detalja cijene */}
        <View style={styles.priceCard}>
          <Icon name="cash-multiple" size={22} color="#ff9000" />
          <Text style={styles.priceText}>
            {plz && plzPrices[plz] ? `PLZ ${plz}: ${plzPrices[plz]}€  ` : ''}
            {stops && stopPrices[stops] ? `| ${stops} ${t('stops')}: ${stopPrices[stops]}€` : ''}
            {price ? `| ${t('totalPrice')}: ${price}€` : ''}
          </Text>
        </View>

        {/* Dugmad */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.addBtn} onPress={saveRide}>
            <Icon name="plus-circle-outline" size={20} color="#fff" />
            <Text style={styles.addBtnText}>{t('addRide')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
            <Icon name="close-circle-outline" size={20} color="#fff" />
            <Text style={styles.cancelBtnText}>{t('resetForm')}</Text>
          </TouchableOpacity>
        </View>

        {/* Zadnje vožnje */}
        <Text style={styles.lastRidesTitle}>{t('recentRides') || "Zadnje vožnje"}</Text>
        <FlatList
          data={rides.slice(0, 5)}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.rideCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rideMain}>{item.date} • {item.driver}</Text>
                <Text style={styles.rideDetail}>{t('route')}: {item.route} | PLZ: {item.plz} | {t('stops')}: {item.stops}</Text>
                <Text style={styles.ridePrice}>{t('totalPrice')}: {item.price} €</Text>
              </View>
              <TouchableOpacity onPress={() => deleteRide(item.id)} style={styles.rideDelete}>
                <Icon name="delete" size={26} color="#ff3333" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#f8faff' },
  title: { fontSize: 28, fontWeight: 'bold', marginTop: 10, color: "#18365c", textAlign: 'center', marginBottom: 1 },
  desc: { color: "#7b90ad", fontSize: 14, marginBottom: 10, textAlign: 'center' },
  card: { backgroundColor: "#fff", borderRadius: 15, padding: 16, elevation: 4, marginBottom: 8, shadowColor: "#2c5aa0", shadowOpacity: 0.09 },
  label: { fontWeight: '600', fontSize: 15, color: "#18365c", marginTop: 4, marginBottom: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  leftIcon: { marginRight: 7 },
  input: { flex: 1, borderWidth: 1, borderColor: '#c5d5ea', borderRadius: 9, paddingVertical: 10, paddingHorizontal: 13, fontSize: 15, color: "#222", backgroundColor: '#f7fafe' },
  priceCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9e9c3', padding: 12, borderRadius: 12, marginTop: 10, marginBottom: 9 },
  priceText: { fontWeight: 'bold', fontSize: 16, marginLeft: 9, color: "#7b4e00" },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, marginTop: 7, gap: 10 },
  addBtn: { flex: 1, backgroundColor: '#007c25', borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, marginRight: 4 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 7 },
  cancelBtn: { flex: 1, backgroundColor: '#d32f2f', borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, marginLeft: 4 },
  cancelBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 7 },
  lastRidesTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 7, color: "#1a2c40" },
  rideCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#fff", borderRadius: 10, padding: 13, marginBottom: 8, shadowColor: "#2c5aa0", shadowOpacity: 0.06, elevation: 2 },
  rideMain: { fontWeight: 'bold', fontSize: 15, color: "#18365c" },
  rideDetail: { color: "#445", fontSize: 13, marginVertical: 1 },
  ridePrice: { color: "#ff9000", fontWeight: 'bold', fontSize: 14, marginTop: 3 },
  rideDelete: { marginLeft: 13, padding: 4 },
});
