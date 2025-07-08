import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  title?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, title }) => {
  const chartData = {
    labels: data.map(point => new Date(point.date).toLocaleDateString('pl-PL')),
    datasets: [
      {
        label: 'Przychody',
        data: data.map(point => point.revenue),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('pl-PL', {
              style: 'currency',
              currency: 'PLN'
            }).format(value);
          }
        }
      }
    }
  };

  return <Line data={chartData} options={options} />;
};

export default RevenueChart; 