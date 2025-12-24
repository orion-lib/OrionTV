import React, {useRef, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Category} from '../types';

interface Props {
  data: Category[];
  activeId: string;
  onChange: (id: string) => void;
  onFocusChange?: (id: string) => void;
}

export const CategoryChips: React.FC<Props> = ({
  data,
  activeId,
  onChange,
  onFocusChange,
}) => {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const preferredFocusId = useRef(activeId);

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
            hasTVPreferredFocus={item.id === preferredFocusId.current}
            onFocus={() => {
              setFocusedId(item.id);
              onFocusChange?.(item.id);
            }}
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
            {(active || focused) && <View style={styles.underline} />}
          </Pressable>
        );
      })}
      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
  },
  active: {
    transform: [{scale: 1.05}],
  },
  label: {
    color: '#e5e7eb',
    fontWeight: '700',
    fontSize: 16,
  },
  activeLabel: {
    color: '#5ac8fa',
  },
  pressed: {
    opacity: 0.9,
  },
  underline: {
    marginTop: 6,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#5ac8fa',
  },
  spacer: {
    width: 12,
  },
});
