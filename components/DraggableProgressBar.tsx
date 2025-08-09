import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
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

  // 处理点击跳转
  const handlePress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const { width } = event.currentTarget.measure || { width: 300 };
    const position = Math.max(0, Math.min(1, locationX / width));
    seekToPosition(position);
  };

  // 处理拖动手势
  const onGestureEvent = (event: any) => {
    const { translationX, absoluteX } = event.nativeEvent;
    // 这里需要根据容器宽度计算位置
    // 简化处理：基于手势的相对移动
    const containerWidth = 300; // 估计值，实际应该通过 onLayout 获取
    const position = Math.max(0, Math.min(1, absoluteX / containerWidth));
    updateDragging(position);
  };

  const onHandlerStateChange = (event: any) => {
    const { state, absoluteX } = event.nativeEvent;
    
    if (state === State.BEGAN) {
      const containerWidth = 300; // 估计值
      const position = Math.max(0, Math.min(1, absoluteX / containerWidth));
      startDragging(position);
    } else if (state === State.END || state === State.CANCELLED) {
      endDragging();
    }
  };

  const currentPosition = isDragging ? dragPosition : isSeeking ? seekPosition : progressPosition;

  return (
    <View style={[styles.container, style]}>
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
      
      {/* 手势处理层 */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
      >
        <View style={styles.gestureArea} />
      </PanGestureHandler>
      
      {/* 点击处理层 */}
      <Pressable 
        style={styles.pressableArea} 
        onPress={handlePress}
      />
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
  gestureArea: {
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
    top: -18,
    zIndex: 10,
  },
});