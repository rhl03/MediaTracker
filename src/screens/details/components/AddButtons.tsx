import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Status } from '../../../domain/types';

type Props = {
  onAdd: (status: Status) => void;
};

export function AddButtons({ onAdd }: Props): React.JSX.Element {
  return (
    <View style={styles.buttons}>
      <Pressable
        style={[styles.button, styles.buttonPrimary]}
        onPress={() => onAdd('watching')}
      >
        <Text style={styles.buttonPrimaryText}>Add to Watching</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => onAdd('watchlist')}>
        <Text style={styles.buttonText}>Add to Watchlist</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#a8c7fa',
  },
  buttonPrimary: {
    backgroundColor: '#a8c7fa',
  },
  buttonText: {
    color: '#a8c7fa',
    fontWeight: 'bold',
  },
  buttonPrimaryText: {
    color: '#121318',
    fontWeight: 'bold',
  },
});
