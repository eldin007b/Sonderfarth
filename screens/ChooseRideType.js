import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from '../useTranslation';

export default function ChooseRideType({ navigation }) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('chooseRideType') || "Odaberi tip vožnje"}</Text>
      <Text style={styles.desc}>{t('chooseRideDesc') || "Odaberi šta želiš dodati: dostavu (Zustellung) ili preuzimanje (Abholung)."}</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#e3f6fc" }]}
          onPress={() => navigation.replace('AddRide')}
        >
          <Icon name="cube-send" size={54} color="#1976D2" />
          <Text style={styles.cardText}>{t('filterZustellung') || "Dostava"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#ffedd5" }]}
          onPress={() => navigation.replace('AddAbholung')}
        >
          <Icon name="handshake" size={54} color="#f9a400" />
          <Text style={styles.cardText}>{t('filterAbholung') || "Preuzimanje"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#f8faff", padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: "#18365c", marginBottom: 11 },
  desc: { fontSize: 16, color: "#7b90ad", marginBottom: 23, textAlign: "center" },
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 14 },
  card: { alignItems: 'center', justifyContent: 'center', padding: 22, borderRadius: 22, width: 145, elevation: 4, marginHorizontal: 7 },
  cardText: { fontSize: 17, color: "#162c40", fontWeight: 'bold', marginTop: 7 },
});
