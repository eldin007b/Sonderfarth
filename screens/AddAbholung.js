import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Button, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from '../useTranslation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AddAbholung() {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fahrer, setFahrer] = useState('');
  const [details, setDetails] = useState('');
  const [stops, setStops] = useState('');
  const [hours, setHours] = useState('');
  const [price, setPrice] = useState(0);
  const [message, setMessage] = useState('');
  const [abholungen, setAbholungen] = useState([]);
  const stopsInput = useRef();

  const { themeStyles } = useContext(ThemeContext);
  const { t } = useTranslation();

  useEffect(() => {
    const sat = parseInt(hours) || 0;
    setPrice(sat * 30);
  }, [hours]);

  useEffect(() => {
    loadAbholungen();
  }, []);

  const loadAbholungen = async () => {
    const data = await AsyncStorage.getItem('abholungen');
    if (data) setAbholungen(JSON.parse(data));
    else setAbholungen([]);
  };

  const saveAbholung = async () => {
    if (!fahrer.trim() || !details.trim() || !stops.trim() || !hours.trim()) {
      setMessage(t('missingFields') || 'Popuni sva polja');
      return;
    }

    const newAbholung = {
      id: Date.now().toString(),
      date: date.toISOString().split('T')[0],
      fahrer,
      details,
      stops,
      hours,
      euro: price,
      type: 'Abholung',
    };

    let abholungenNow = [...abholungen];
    abholungenNow.unshift(newAbholung);
    await AsyncStorage.setItem('abholungen', JSON.stringify(abholungenNow));
    setAbholungen(abholungenNow);
    setMessage(t('success') || 'Uspješno dodano!');
    setFahrer('');
    setDetails('');
    setStops('');
    setHours('');
    stopsInput.current && stopsInput.current.blur();
  };

  const handleDelete = async (id) => {
    const updated = abholungen.filter((item) => item.id !== id);
    setAbholungen(updated);
    await AsyncStorage.setItem('abholungen', JSON.stringify(updated));
    setMessage(t('deleted') || 'Obrisano!');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { backgroundColor: themeStyles.background }]}>
        <Text style={styles.title}>{t('newAbholung') || 'Nova Abholung tura'}</Text>

        {/* Datum picker */}
        <Text style={styles.label}>{t('date') || 'Datum'}</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputRow}>
          <Icon name="calendar" size={22} color="#1976D2" style={styles.leftIcon} />
          <TextInput
            style={[styles.input, { color: themeStyles.color, backgroundColor: themeStyles.inputBackground, borderColor: themeStyles.border }]}
            value={date.toISOString().split('T')[0]}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>{t('driver') || 'Vozač'}</Text>
        <View style={styles.inputRow}>
          <Icon name="account-tie" size={22} color="#1976D2" style={styles.leftIcon} />
          <TextInput style={styles.input} placeholder={t('driver') || 'Vozač'} value={fahrer} onChangeText={setFahrer} />
        </View>

        <Text style={styles.label}>{t('details') || 'Detalji'}</Text>
        <View style={styles.inputRow}>
          <Icon name="file-document" size={22} color="#1976D2" style={styles.leftIcon} />
          <TextInput style={styles.input} placeholder={t('details') || 'Detalji'} value={details} onChangeText={setDetails} />
        </View>

        <Text style={styles.label}>{t('stops') || 'Broj adresa'}</Text>
        <View style={styles.inputRow}>
          <Icon name="home-group" size={22} color="#1976D2" style={styles.leftIcon} />
          <TextInput style={styles.input} placeholder={t('stops') || 'Broj adresa'} value={stops} onChangeText={setStops} keyboardType="numeric" />
        </View>

        <Text style={styles.label}>{t('hours') || 'Sati (30€ po satu)'}</Text>
        <View style={styles.inputRow}>
          <Icon name="clock" size={22} color="#1976D2" style={styles.leftIcon} />
          <TextInput
            ref={stopsInput}
            style={styles.input}
            placeholder={t('hours') || 'Broj sati'}
            value={hours}
            onChangeText={setHours}
            keyboardType="numeric"
          />
        </View>

        <Text style={[styles.price, { color: '#ff9000' }]}>
          {t('totalPrice') || 'Cijena'}: {price} €
        </Text>

        <TouchableOpacity style={styles.button} onPress={saveAbholung}>
          <Text style={styles.buttonText}>{t('save') || 'Spremi'}</Text>
        </TouchableOpacity>
        {message ? <Text style={{ color: 'green', marginTop: 10 }}>{message}</Text> : null}

        {/* Zadnje abholung vožnje */}
        <Text style={[styles.label, { marginTop: 20, color: themeStyles.color, fontSize: 16, fontWeight: 'bold' }]}>
          {t('recentAbholung') || 'Zadnje preuzimanje'}
        </Text>
        <FlatList
          data={abholungen.slice(0, 5)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.rideItem}>
              <Icon name="truck-fast" size={22} color="#1976D2" style={{ marginRight: 6 }} />
              <Text style={{ color: themeStyles.color, flex: 1 }}>
                {item.date} - {item.fahrer} - {item.details} - {item.stops} {t('stops') || 'adresa'} - {item.hours} {t('hours') || 'sati'} - {item.euro}€
              </Text>
              <Button title="🗑️" onPress={() => handleDelete(item.id)} color="red" />
            </View>
          )}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 22, color: "#18365c", fontWeight: 'bold' },
  label: { fontSize: 16, marginTop: 8, marginBottom: 2, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  leftIcon: { marginRight: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, marginVertical: 4, padding: 10, fontSize: 16, backgroundColor: '#f7fafe', color: "#222" },
  button: { backgroundColor: '#007c25', padding: 16, borderRadius: 8, marginTop: 18, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  price: { fontSize: 18, fontWeight: 'bold', marginTop: 14, marginBottom: 10, textAlign: 'right' },
  rideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 9,
    shadowColor: "#2c5aa0",
    shadowOpacity: 0.06,
    elevation: 2,
  },
});
