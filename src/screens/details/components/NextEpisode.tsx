import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

type Props = {
  text: string;
};

export function NextEpisode({ text }: Props): React.JSX.Element {
  return (
    <View style={styles.row}>
      <MaterialIcons name="event" size={18} color="#a8c7fa" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#1c1e25',
  },
  text: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
