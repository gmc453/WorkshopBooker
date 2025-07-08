import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TimeSlotData {
  timeSlot: string;
  bookings: number;
  utilization: number;
}

interface TimeSlotChartProps {
  data: TimeSlotData[];
  title?: string;
  height?: number;
}

export const TimeSlotChart: React.FC<TimeSlotChartProps> = ({ 
  data, 
  title = 'Wykorzystanie slotów czasowych',
  height = 300 
}) => {
  const chartData = {
    labels: data.map(item => item.timeSlot),
    datasets: [
      {
        label: 'Liczba rezerwacji',
        data: data.map(item => item.bookings),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Wykorzystanie (%)',
        data: data.map(item => item.utilization),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 0) {
              return `Rezerwacje: ${context.parsed.y}`;
            } else {
              return `Wykorzystanie: ${context.parsed.y}%`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Liczba rezerwacji',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Wykorzystanie (%)',
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TimeSlotChart; 