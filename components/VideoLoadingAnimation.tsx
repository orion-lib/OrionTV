import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface VideoLoadingAnimationProps {
  showProgressBar?: boolean;
}

const VideoLoadingAnimation: React.FC<VideoLoadingAnimationProps> = ({ showProgressBar = true }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const bounceAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const progressAnim = useRef(new Animated.Value(0)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const shapeAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -20,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );

    const bounceAnimations = bounceAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(anim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      )
    );

    const progressAnimation = Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: false, // width animation not supported by native driver
        easing: Easing.inOut(Easing.ease),
      })
    );

    const gradientAnimation = Animated.loop(
      Animated.timing(gradientAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false, // gradient animation not supported by native driver
        easing: Easing.inOut(Easing.ease),
      })
    );

    const textFadeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(textFadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );

    const shapeAnimations = shapeAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 2000),
          Animated.timing(anim, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      )
    );

    Animated.parallel([
      floatAnimation,
      pulseAnimation,
      ...bounceAnimations,
      progressAnimation,
      gradientAnimation,
      textFadeAnimation,
      ...shapeAnimations,
    ]).start();
  }, []);

  const animatedStyles = {
    float: {
      transform: [{ translateY: floatAnim }],
    },
    pulse: {
      opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }),
      transform: [
        { translateX: -12.5 },
        { translateY: -15 },
        {
          scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }),
        },
      ],
    },
    bounce: bounceAnims.map((anim) => ({
      transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) }],
      opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
    })),
    progress: {
      width: progressAnim.interpolate({
        inputRange: [0, 0.7, 1],
        outputRange: ["0%", "100%", "100%"],
      }),
    },
    textFade: {
      opacity: textFadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
    },
    shapes: shapeAnims.map((anim, i) => ({
      transform: [
        {
          translateY: anim.interpolate({
            inputRange: [0, 0.33, 0.66, 1],
            outputRange: [0, -30, 10, 0],
          }),
        },
        {
          rotate: anim.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "360deg"],
          }),
        },
      ],
    })),
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgShapes}>
        <Animated.View style={[styles.shape, styles.shape1, animatedStyles.shapes[0]]} />
        <Animated.View style={[styles.shape, styles.shape2, animatedStyles.shapes[1]]} />
        <Animated.View style={[styles.shape, styles.shape3, animatedStyles.shapes[2]]} />
        <Animated.View style={[styles.shape, styles.shape4, animatedStyles.shapes[3]]} />
      </View>
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.videoIcon, animatedStyles.float]}>
          <View style={styles.videoFrame}>
            <Animated.View style={[styles.playButton, animatedStyles.pulse]} />
          </View>
        </Animated.View>

        {/* <View style={styles.loadingDots}>
          <Animated.View style={[styles.dot, animatedStyles.bounce[0]]} />
          <Animated.View style={[styles.dot, animatedStyles.bounce[1]]} />
          <Animated.View style={[styles.dot, animatedStyles.bounce[2]]} />
        </View> */}

        {showProgressBar && (
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, animatedStyles.progress]}>
              <LinearGradient
                colors={["#00bb5e", "#feff5f"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
        )}

        <Animated.Text style={[styles.loadingText, animatedStyles.textFade]}>正在加载视频</Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  loadingContainer: {
    alignItems: "center",
    zIndex: 10,
  },
  videoIcon: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  videoFrame: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderLeftWidth: 25,
    borderLeftColor: "rgba(255, 255, 255, 0.9)",
    borderTopWidth: 15,
    borderTopColor: "transparent",
    borderBottomWidth: 15,
    borderBottomColor: "transparent",
  },
  loadingDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 12,
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 6,
  },
  progressBar: {
    width: 300,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    marginVertical: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 18,
    fontWeight: "300",
    letterSpacing: 2,
    marginTop: 10,
  },
  bgShapes: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  shape: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 50,
  },
  shape1: {
    width: 80,
    height: 80,
    top: "20%",
    left: "10%",
  },
  shape2: {
    width: 60,
    height: 60,
    top: "60%",
    right: "15%",
  },
  shape3: {
    width: 100,
    height: 100,
    bottom: "20%",
    left: "20%",
  },
  shape4: {
    width: 40,
    height: 40,
    top: "30%",
    right: "30%",
  },
});

export default VideoLoadingAnimation;
