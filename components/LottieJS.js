import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import lottie from 'lottie-web';

export default function LottieJS({ animationData, width = 200, height = 200 }) {
  const container = useRef(null);

  useEffect(() => {
    const anim = lottie.loadAnimation({
      container: container.current,
      renderer: 'svg',  // JS-only renderer
      loop: true,
      autoplay: true,
      animationData: animationData,
    });
    return () => anim.destroy(); // cleanup
  }, [animationData]);

  return <View ref={container} style={{ width, height }} />;
}
