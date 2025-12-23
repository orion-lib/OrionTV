import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Category} from '../types';

interface Props {
  data: Category[];
  activeId: string;
  onChange: (id: string) => void;
}

export const CategoryChips: React.FC<Props> = ({data, activeId, onChange}) => {
  const [focusedId, setFocusedId] = useState<string | null>(null);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {data.map(item => {
        const active = item.id === activeId;
        const focused = item.id === focusedId;
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            focusable
            onFocus={() => setFocusedId(item.id)}
            onBlur={() => setFocusedId(null)}
            style={({pressed}) => [
              styles.chip,
              (active || focused) && styles.active,
              pressed && styles.pressed,
            ]}>
            <Text
              style={[
                styles.label,
                (active || focused) && styles.activeLabel,
              ]}>
              {item.title}
            </Text>
          </Pressable>
        );
      })}
      <View style={styles.spacer} />
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
  pressed: {
    opacity: 0.9,
  },
  spacer: {
    width: 12,
  },
});
