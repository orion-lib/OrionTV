import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  findNodeHandle,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Category} from '../types';

interface Props {
  data: Category[];
  activeId: string;
  onChange: (id: string) => void;
  onFocusChange?: (id: string) => void;
  onFocusHandleChange?: (handle?: number) => void;
}

type PressableHandle = React.ElementRef<typeof Pressable>;

export const CategoryChips: React.FC<Props> = ({
  data,
  activeId,
  onChange,
  onFocusChange,
  onFocusHandleChange,
}) => {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const preferredFocusId = useRef(activeId);
  const scrollRef = useRef<ScrollView>(null);
  const layoutMap = useRef<Record<string, {x: number; width: number}>>({});
  const chipRefs = useRef<Record<string, PressableHandle | null>>({});

  const registerLayout = useCallback(
    (id: string) => (event: LayoutChangeEvent) => {
      layoutMap.current[id] = event.nativeEvent.layout;
    },
    [],
  );

  const scrollToChip = useCallback((id: string) => {
    const layout = layoutMap.current[id];
    if (!layout) {
      return;
    }
    scrollRef.current?.scrollTo({
      x: Math.max(layout.x - 12, 0),
      animated: true,
    });
  }, []);

  const getHandle = useCallback((id?: string) => {
    if (!id) {
      return undefined;
    }
    const node = chipRefs.current[id];
    const handle = node ? findNodeHandle(node) : null;
    return handle ?? undefined;
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {data.map((item, index) => {
        const active = item.id === activeId;
        const focused = item.id === focusedId;
        const leftId = data[index - 1]?.id ?? item.id;
        const rightId = data[index + 1]?.id ?? item.id;
        const selfHandle = getHandle(item.id);
        const leftHandle = getHandle(leftId) ?? selfHandle;
        const rightHandle = getHandle(rightId) ?? selfHandle;
        return (
          <Pressable
            key={item.id}
            ref={node => {
              chipRefs.current[item.id] = node;
            }}
            onPress={() => onChange(item.id)}
            focusable
            hasTVPreferredFocus={item.id === preferredFocusId.current}
            nextFocusLeft={leftHandle}
            nextFocusRight={rightHandle}
            onFocus={() => {
              setFocusedId(item.id);
              preferredFocusId.current = item.id;
              onFocusChange?.(item.id);
              onFocusHandleChange?.(selfHandle);
              scrollToChip(item.id);
            }}
            onBlur={() =>
              setFocusedId(current => (current === item.id ? null : current))
            }
            onKeyDown={event => {
              if (isLeftKey(event)) {
                event.preventDefault?.();
                const nextId = data[index - 1]?.id;
                if (nextId) {
                  focusChip(nextId);
                }
                return;
              }
              if (isRightKey(event)) {
                event.preventDefault?.();
                const nextId = data[index + 1]?.id;
                if (nextId) {
                  focusChip(nextId);
                }
              }
            }}
            onLayout={registerLayout(item.id)}
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
