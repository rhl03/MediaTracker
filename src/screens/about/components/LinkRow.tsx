import React from 'react';
import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

type Props = {
  icon: IconName;
  label: string;
  url: string;
};

function openLink(url: string) {
  Linking.openURL(url).catch(e => {
    console.log('Could not open link:', e);
  });
}

export function LinkRow({ icon, label, url }: Props): React.JSX.Element {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => openLink(url)}
    >
      <MaterialIcons name={icon} size={22} color="#a8c7fa" />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <MaterialIcons name="open-in-new" size={18} color="#9a9ca5" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    backgroundColor: '#1c1e25',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  label: {
    flex: 1,
    color: '#a8c7fa',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
});
