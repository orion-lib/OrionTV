import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface Props {
  title: string;
  description?: string;
}

export const SectionHeader: React.FC<Props> = ({title, description}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  desc: {
    marginTop: 4,
    color: '#cfd3dc',
  },
});
