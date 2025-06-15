import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from '../useTranslation';

export default function UserPanel() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Icon name="account-circle" size={90} color="#1976D2" style={{ marginBottom: 10 }} />
      <Text style={styles.text}>{t('welcomeUser') || "Dobrodošli korisniče!"}</Text>
      <Text style={styles.subtext}>{t('userPanelDesc') || "Ovdje možeš pristupiti svojim podacima, promijeniti postavke ili pogledati svoje vožnje."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#f5faff" },
  text: { fontSize: 22, fontWeight: 'bold', color: "#18365c", marginBottom: 8 },
  subtext: { fontSize: 15, color: "#7b90ad", textAlign: "center", paddingHorizontal: 18 },
});
