import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, LayoutChangeEvent, PanResponder } from 'react-native';
import usePlayerStore from '@/stores/playerStore';

interface DraggableProgressBarProps {
  style?: any;
}

export const DraggableProgressBar: React.FC<DraggableProgressBarProps> = ({ style }) => {
  const {
    isSeeking,
    seekPosition,
    progressPosition,
    isDragging,
    dragPosition,
    seekToPosition,
    startDragging,
    updateDragging,
    endDragging,
  } = usePlayerStore();

  const [containerWidth, setContainerWidth] = useState(300);

  // 获取容器布局信息
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  }, []);

  // 处理点击跳转
  const handlePress = useCallback((event: any) => {
    if (isDragging) return; // 如果正在拖动，忽略点击
    const { locationX } = event.nativeEvent;
    const position = Math.max(0, Math.min(1, locationX / containerWidth));
    seekToPosition(position);
  }, [containerWidth, seekToPosition, isDragging]);

  // 使用PanResponder替代PanGestureHandler，更可靠
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: (event) => {
      const { locationX } = event.nativeEvent;
      const position = Math.max(0, Math.min(1, locationX / containerWidth));
      startDragging(position);
    },

    onPanResponderMove: (event) => {
      const { locationX } = event.nativeEvent;
      const position = Math.max(0, Math.min(1, locationX / containerWidth));
      updateDragging(position);
    },

    onPanResponderRelease: () => {
      endDragging();
    },

    onPanResponderTerminate: () => {
      endDragging();
    },
  });

  const currentPosition = isDragging ? dragPosition : isSeeking ? seekPosition : progressPosition;

  return (
    <View 
      style={[styles.container, style]}
      onLayout={onLayout}
    >
      <View style={styles.progressBarBackground} />
      <View
        style={[
          styles.progressBarFilled,
          {
            width: `${currentPosition * 100}%`,
          },
        ]}
      />
      
      {/* 拖动手柄 */}
      <View 
        style={[
          styles.dragHandle,
          {
            left: `${currentPosition * 100}%`,
          }
        ]} 
      />
      
      {/* 手势和点击处理层 */}
      <View
        style={styles.interactionArea}
        {...panResponder.panHandlers}
      >
        <Pressable 
          style={styles.pressableArea} 
          onPress={handlePress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 8,
    position: 'relative',
    marginTop: 10,
  },
  progressBarBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  progressBarFilled: {
    position: 'absolute',
    left: 0,
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  dragHandle: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginLeft: -8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  interactionArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 44,
    top: -18,
    zIndex: 20,
  },
  pressableArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 44,
    top: 0,
  },
});