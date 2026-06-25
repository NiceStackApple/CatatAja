import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface EChartProps {
  options: echarts.EChartsOption;
  style?: React.CSSProperties;
  className?: string;
}

export default function EChart({ options, style, className }: EChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    // Apply options
    chart.setOption(options);

    // Setup ResizeObserver for responsive resizing
    const resizeObserver = new ResizeObserver(() => {
      try {
        chart.resize();
      } catch (e) {
        console.warn('Error resizing EChart:', e);
      }
    });
    
    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      try {
        chart.dispose();
      } catch (e) {
        console.warn('Error disposing EChart:', e);
      }
      chartInstance.current = null;
    };
  }, []);

  // Update options when they change
  useEffect(() => {
    if (chartInstance.current) {
      try {
        chartInstance.current.setOption(options, { notMerge: true });
      } catch (e) {
        console.warn('Error updating EChart options:', e);
      }
    }
  }, [options]);

  return (
    <div 
      ref={chartRef} 
      style={{ width: '100%', height: '100%', minHeight: '200px', ...style }} 
      className={className}
    />
  );
}
