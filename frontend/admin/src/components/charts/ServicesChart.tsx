import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ServiceData {
  serviceId: string;
  serviceName: string;
  bookingCount: number;
  totalRevenue: number;
  percentage: number;
  averageRating: number;
}

interface ServicesChartProps {
  data: ServiceData[];
  title?: string;
}

export const ServicesChart: React.FC<ServicesChartProps> = ({ data, title }) => {
  const chartData = {
    labels: data.map(service => service.serviceName),
    datasets: [
      {
        data: data.map(service => service.totalRevenue),
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(147, 51, 234, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const service = data[context.dataIndex];
            return [
              `${service.serviceName}`,
              `Przychody: ${new Intl.NumberFormat('pl-PL', {
                style: 'currency',
                currency: 'PLN'
              }).format(service.totalRevenue)}`,
              `Rezerwacje: ${service.bookingCount}`,
              `Procent: ${service.percentage.toFixed(1)}%`
            ];
          }
        }
      }
    }
  };

  return <Pie data={chartData} options={options} />;
};

export default ServicesChart; 