import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Badge } from '../domain/types';

export function ProgressBadge(props: {
  badge: Badge;
}): React.JSX.Element | null {
  const { badge } = props;

  switch (badge.kind) {
    case 'none':
      return null;
    case 'percent':
      return (
        <View style={styles.circle}>
          <Text style={styles.percentText}>{badge.value}%</Text>
        </View>
      );
    case 'check':
      return (
        <View style={styles.circle}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#a8c7fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    color: '#121318',
    fontSize: 11,
    fontWeight: 'bold',
    paddingLeft: 4,
  },
  checkText: {
    color: '#121318',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
