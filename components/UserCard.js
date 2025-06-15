import React from 'react';
import { View } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import styles from '../styles';

export default function UserCard({ user, onEdit, onDelete }) {
  return (
    <Card style={styles.card} elevation={2}>
      <Card.Title
        title={user.user}
        subtitle={user.role}
        left={props => <Card.Icon {...props} icon="account" />}
        right={() => (
          <View style={styles.actions}>
            <IconButton icon="pencil" onPress={onEdit} />
            <IconButton icon="trash-can" onPress={onDelete} />
          </View>
        )}
      />
    </Card>
  );
}
