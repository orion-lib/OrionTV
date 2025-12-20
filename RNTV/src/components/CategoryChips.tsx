import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Category} from '../types';

interface Props {
  data: Category[];
  activeId: string;
  onChange: (id: string) => void;
}

export const CategoryChips: React.FC<Props> = ({data, activeId, onChange}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {data.map(item => {
        const active = item.id === activeId;
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onChange(item.id)}
            style={[styles.chip, active && styles.active]}>
            <Text style={[styles.label, active && styles.activeLabel]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        );
      })}
      <View style={{width: 12}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3b4252',
    marginRight: 8,
    backgroundColor: '#1f2430',
  },
  active: {
    borderColor: '#5ac8fa',
    backgroundColor: '#2e3440',
  },
  label: {
    color: '#e5e7eb',
    fontWeight: '600',
  },
  activeLabel: {
    color: '#5ac8fa',
  },
});
