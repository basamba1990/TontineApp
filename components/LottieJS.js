import React from 'react';
import LottieView from 'lottie-react-native';

export default function LottieJS({ animationData, width = 200, height = 200 }) {
  return (
    <LottieView
      source={animationData}
      autoPlay
      loop
      style={{ width, height }}
    />
  );
}
