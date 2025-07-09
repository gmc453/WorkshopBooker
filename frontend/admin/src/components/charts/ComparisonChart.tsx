import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ComparisonDataPoint {
  label: string;
  value: number;
  date?: string;
}

interface ComparisonDataset {
  label: string;
  data: ComparisonDataPoint[];
  color: string;
  borderColor: string;
  backgroundColor: string;
}

interface ComparisonChartProps {
  datasets: ComparisonDataset[];
  title?: string;
  height?: number;
  yAxisLabel?: string;
  showLegend?: boolean;
  showPoints?: boolean;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ 
  datasets, 
  title = 'Porównanie danych',
  height = 300,
  yAxisLabel = 'Wartość',
  showLegend = true,
  showPoints = true
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
    datasets.map(dataset => dataset.label)
  );

  const filteredDatasets = datasets.filter(dataset => 
    selectedMetrics.includes(dataset.label)
  );

  const chartData = {
    labels: filteredDatasets[0]?.data.map(item => item.label) || [],
    datasets: filteredDatasets.map(dataset => ({
      label: dataset.label,
      data: dataset.data.map(item => item.value),
      borderColor: dataset.borderColor,
      backgroundColor: dataset.backgroundColor,
      borderWidth: 2,
      pointRadius: showPoints ? 4 : 0,
      pointHoverRadius: 6,
      tension: 0.1,
      fill: false,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        onClick: (_event: any, legendItem: any) => {
          const label = legendItem.text;
          setSelectedMetrics(prev => 
            prev.includes(label) 
              ? prev.filter(item => item !== label)
              : [...prev, label]
          );
        },
      },
      title: {
        display: !!title,
        text: title,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Okres',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: yAxisLabel,
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div>
      {showLegend && datasets.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {datasets.map((dataset, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedMetrics(prev => 
                  prev.includes(dataset.label)
                    ? prev.filter(item => item !== dataset.label)
                    : [...prev, dataset.label]
                );
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedMetrics.includes(dataset.label)
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
              style={{
                backgroundColor: selectedMetrics.includes(dataset.label) 
                  ? dataset.backgroundColor 
                  : '#f3f4f6',
                color: selectedMetrics.includes(dataset.label) 
                  ? '#1e40af' 
                  : '#6b7280',
              }}
            >
              {dataset.label}
            </button>
          ))}
        </div>
      )}
      <div style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ComparisonChart; 