import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

type Props = {
  isMovie: boolean;
  onPress: () => void;
};

export function FinishButton({ isMovie, onPress }: Props): React.JSX.Element {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
    >
      <MaterialIcons
        name={isMovie ? 'check-circle' : 'done-all'}
        size={20}
        color="#121318"
      />
      <Text style={styles.text}>
        {isMovie ? 'Mark as watched' : 'Mark as Done'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#a8c7fa',
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    color: '#121318',
    fontWeight: 'bold',
  },
});
