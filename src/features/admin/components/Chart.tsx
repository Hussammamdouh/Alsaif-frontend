import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { CHART_COLORS } from '../admin.constants';
import { useTheme } from '../../../app/providers';

const screenWidth = Dimensions.get('window').width;

interface BaseChartProps {
  title?: string;
  subtitle?: string;
}

interface LineChartProps extends BaseChartProps {
  type: 'line';
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity?: number) => string;
      strokeWidth?: number;
    }>;
  };
  height?: number;
  showLegend?: boolean;
  bezier?: boolean;
}

interface BarChartProps extends BaseChartProps {
  type: 'bar';
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity?: number) => string;
    }>;
  };
  height?: number;
  showLegend?: boolean;
}

interface PieChartProps extends BaseChartProps {
  type: 'pie';
  data: Array<{
    name: string;
    value: number;
    color: string;
    legendFontColor?: string;
    legendFontSize?: number;
  }>;
  height?: number;
}

interface ProgressChartProps extends BaseChartProps {
  type: 'progress';
  data: {
    labels: string[];
    data: number[];
  };
  height?: number;
}

type ChartProps = LineChartProps | BarChartProps | PieChartProps | ProgressChartProps;

export const Chart: React.FC<ChartProps> = (props) => {
  const { theme } = useTheme();
  const { title, subtitle } = props;
  const height = props.height || 220;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const chartConfig = {
    backgroundColor: theme.background.secondary,
    backgroundGradientFrom: theme.background.secondary,
    backgroundGradientTo: theme.background.secondary,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.primary.main,
    labelColor: (opacity = 1) => theme.text.tertiary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.primary.main,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.border.main,
      strokeWidth: 0.5,
    },
  };

  const renderChart = () => {
    switch (props.type) {
      case 'line':
        return (
          <LineChart
            data={props.data}
            width={screenWidth - 64}
            height={height}
            chartConfig={chartConfig}
            bezier={props.bezier}
            style={styles.chart}
            withShadow={false}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero
          />
        );

      case 'bar':
        return (
          <BarChart
            data={props.data}
            width={screenWidth - 64}
            height={height}
            chartConfig={chartConfig}
            style={styles.chart}
            withInnerLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero
            showValuesOnTopOfBars
            yAxisLabel=""
            yAxisSuffix=""
          />
        );

      case 'pie':
        const pieData = props.data.map(item => ({
          ...item,
          legendFontColor: theme.text.secondary,
        }));
        return (
          <PieChart
            data={pieData}
            width={screenWidth - 64}
            height={height}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
            hasLegend={true}
          />
        );

      case 'progress':
        return (
          <ProgressChart
            data={props.data}
            width={screenWidth - 64}
            height={height}
            chartConfig={chartConfig}
            style={styles.chart}
            hideLegend={false}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={styles.chartContainer}>{renderChart()}</View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
  },
});

// Utility function to generate chart colors
export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    CHART_COLORS.PRIMARY,
    CHART_COLORS.SUCCESS,
    CHART_COLORS.WARNING,
    CHART_COLORS.DANGER,
    CHART_COLORS.INFO,
    CHART_COLORS.SECONDARY,
    CHART_COLORS.GRAY,
  ];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

// Utility function to format chart data
export const formatChartData = (
  labels: string[],
  datasets: Array<{ label?: string; data: number[]; color?: string }>
) => {
  return {
    labels,
    datasets: datasets.map((dataset) => ({
      data: dataset.data,
      color: dataset.color
        ? (opacity = 1) => dataset.color!
        : (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
      strokeWidth: 2,
    })),
  };
};

// Utility function to format pie chart data
export const formatPieChartData = (
  items: Array<{ name: string; value: number }>
): Array<{
  name: string;
  value: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}> => {
  const colors = generateChartColors(items.length);
  return items.map((item, index) => ({
    name: item.name,
    value: item.value,
    color: colors[index],
    legendFontColor: '#8e8e93',
    legendFontSize: 12,
  }));
};
