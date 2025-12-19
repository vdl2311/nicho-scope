import React from 'react';

interface ScoreGaugeProps {
  score: number;
  label: string;
  color?: 'green' | 'blue' | 'red' | 'orange' | 'purple';
  inverse?: boolean; // If true, lower score is "better" color-wise (e.g. supply)
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, label, color = 'blue', inverse = false }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let strokeColor = '';
  
  // Determine color based on score and inverse flag logic
  if (color === 'green') strokeColor = 'text-emerald-500';
  else if (color === 'blue') strokeColor = 'text-blue-500';
  else if (color === 'red') strokeColor = 'text-red-500';
  else if (color === 'orange') strokeColor = 'text-orange-500';
  else strokeColor = 'text-purple-500';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-20 h-20">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 70 70">
          <circle
            className="text-slate-700"
            strokeWidth="6"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="35"
            cy="35"
          />
          {/* Progress Circle */}
          <circle
            className={`${strokeColor} transition-all duration-1000 ease-out`}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="35"
            cy="35"
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className={`text-lg font-bold ${strokeColor}`}>{score}</span>
        </div>
      </div>
      <span className="mt-2 text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
};

export default ScoreGauge;