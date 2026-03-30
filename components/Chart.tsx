import React from 'react';
import { Platform, View, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart as VictoryChartNative, VictoryLine as VictoryLineNative, VictoryTheme as VictoryThemeNative, VictoryArea as VictoryAreaNative, VictoryAxis as VictoryAxisNative } from 'victory-native';
import { VictoryChart as VictoryChartWeb, VictoryLine as VictoryLineWeb, VictoryTheme as VictoryThemeWeb, VictoryArea as VictoryAreaWeb, VictoryAxis as VictoryAxisWeb } from 'victory';

const VictoryChart = Platform.OS === 'web' ? VictoryChartWeb : VictoryChartNative;
const VictoryLine = Platform.OS === 'web' ? VictoryLineWeb : VictoryLineNative;
const VictoryTheme = Platform.OS === 'web' ? VictoryThemeWeb : VictoryThemeNative;
const VictoryArea = Platform.OS === 'web' ? VictoryAreaWeb : VictoryAreaNative;
const VictoryAxis = Platform.OS === 'web' ? VictoryAxisWeb : VictoryAxisNative;
import { useAppTheme } from '../lib/theme';
import { WalletBalanceHistory } from '../types';

interface ChartProps {
  data: WalletBalanceHistory[];
}

const { width } = Dimensions.get('window');

export default function Chart({ data }: ChartProps) {
  const { colors, isDark } = useAppTheme();

  // Ensure we have at least 2 points for the chart
  const chartData = data.length > 1 ? data : [
    { date: '2024-01-01', balance: 0 },
    { date: new Date().toISOString(), balance: 0 }
  ];

  return (
    <View style={styles.container}>
      <VictoryChart
        width={width - 40}
        height={220}
        theme={VictoryTheme.material}
        padding={{ top: 10, bottom: 40, left: 50, right: 20 }}
      >
        <VictoryAxis
          style={{
            axis: { stroke: 'transparent' },
            grid: { stroke: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
            tickLabels: { fill: colors.muted, fontSize: 10 },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: 'transparent' },
            grid: { stroke: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
            tickLabels: { fill: colors.muted, fontSize: 10 },
          }}
        />
        <VictoryArea
          data={chartData}
          x="date"
          y="balance"
          animate={{ duration: 1000, onLoad: { duration: 500 } }}
          style={{
            data: {
              fill: colors.primary,
              fillOpacity: 0.1,
              stroke: colors.primary,
              strokeWidth: 3,
            },
          }}
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
});
