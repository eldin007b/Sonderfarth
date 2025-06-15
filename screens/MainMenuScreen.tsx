import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export default function MainMenuScreen({ navigation }: any) {
  const { role } = useAuth();

  return (
    <View style={styles.container}>
      {role === 'admin' && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Admin Panel</Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('AdminPanel')}
            >
              Otvori Admin Panel
            </Button>
          </Card.Content>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginVertical: 8, padding: 16 },
  title: { fontSize: 18, marginBottom: 8 },
});
