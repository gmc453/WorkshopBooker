import React from 'react';

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
  label?: string;
}

interface HeatmapChartProps {
  data: HeatmapData[];
  title?: string;
  height?: number;
  width?: number;
  showLegend?: boolean;
  colorScheme?: 'blue' | 'green' | 'red' | 'purple';
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ 
  data, 
  title = 'Heatmap aktywności',
  height = 400,
  width = 800,
  showLegend = true,
  colorScheme = 'blue'
}) => {
  const days = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

  // Znajdź min i max wartości dla normalizacji
  const values = data.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;

  const getColor = (value: number) => {
    if (range === 0) return 'rgba(156, 163, 175, 0.3)'; // gray dla jednakowych wartości
    
    const normalizedValue = (value - minValue) / range;
    
    switch (colorScheme) {
      case 'blue':
        return `rgba(59, 130, 246, ${0.2 + normalizedValue * 0.8})`;
      case 'green':
        return `rgba(16, 185, 129, ${0.2 + normalizedValue * 0.8})`;
      case 'red':
        return `rgba(239, 68, 68, ${0.2 + normalizedValue * 0.8})`;
      case 'purple':
        return `rgba(139, 92, 246, ${0.2 + normalizedValue * 0.8})`;
      default:
        return `rgba(59, 130, 246, ${0.2 + normalizedValue * 0.8})`;
    }
  };

  const getCellData = (day: string, hour: number) => {
    return data.find(item => item.day === day && item.hour === hour);
  };

  const cellSize = Math.min((width - 100) / 12, (height - 100) / 7);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="flex">
        {/* Y-axis labels (days) */}
        <div className="flex flex-col mr-2">
          <div className="h-8"></div> {/* Spacer for x-axis labels */}
          {days.map((day) => (
            <div 
              key={day}
              className="flex items-center justify-end pr-2 text-xs text-gray-600 font-medium"
              style={{ height: `${cellSize}px` }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex-1">
          {/* X-axis labels (hours) */}
          <div className="flex mb-2">
            {hours.map((hour) => (
              <div 
                key={hour}
                className="text-xs text-gray-600 font-medium text-center"
                style={{ width: `${cellSize}px` }}
              >
                {hour}:00
              </div>
            ))}
          </div>

          {/* Heatmap cells */}
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${hours.length}, ${cellSize}px)` }}>
            {days.map((day) =>
              hours.map((hour) => {
                const cellData = getCellData(day, hour);
                const value = cellData?.value || 0;
                
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="relative rounded border border-gray-200 hover:border-gray-400 transition-colors cursor-pointer"
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      backgroundColor: getColor(value),
                    }}
                    title={`${day} ${hour}:00 - ${value} ${cellData?.label || 'aktywności'}`}
                  >
                    {value > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {value}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 flex items-center justify-center space-x-4">
          <span className="text-xs text-gray-600">Niska aktywność</span>
          <div className="flex space-x-1">
            {Array.from({ length: 5 }, (_, i) => {
              const intensity = i / 4;
              return (
                <div
                  key={i}
                  className="w-4 h-4 rounded border border-gray-200"
                  style={{ backgroundColor: getColor(minValue + intensity * range) }}
                ></div>
              );
            })}
          </div>
          <span className="text-xs text-gray-600">Wysoka aktywność</span>
        </div>
      )}

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-sm text-gray-500">Min aktywność</div>
          <div className="text-lg font-bold text-gray-900">{minValue}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Średnia aktywność</div>
          <div className="text-lg font-bold text-gray-900">
            {Math.round(values.reduce((a, b) => a + b, 0) / values.length)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Max aktywność</div>
          <div className="text-lg font-bold text-gray-900">{maxValue}</div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart; 