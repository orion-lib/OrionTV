import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Props {
  title: string;
  description?: string;
}

export const EmptyState: React.FC<Props> = ({title, description}) => (
  <View style={styles.container}>
    <Icon name="sparkles-outline" size={34} color="#5ac8fa" />
    <Text style={styles.title}>{title}</Text>
    {description ? <Text style={styles.desc}>{description}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#e5e7eb',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 12,
  },
  desc: {
    color: '#9ca3af',
    marginTop: 4,
  },
});
