import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  percent: number;
};

export function WatchProgress({ label, percent }: Props): React.JSX.Element {
  return (
    <View style={styles.progress}>
      <View style={styles.textRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: {
    marginTop: 16,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  percent: {
    color: '#a8c7fa',
    fontWeight: 'bold',
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#24262e',
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#a8c7fa',
  },
});
