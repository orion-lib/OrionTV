import React from 'react';

interface CapsuleSwitchProps {
  options: { label: string; value: string }[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

const CapsuleSwitch: React.FC<CapsuleSwitchProps> = ({
  options,
  active,
  onChange,
  className,
}) => {
  return (
    <div
      className={`inline-flex bg-gray-300/80 rounded-full p-1 dark:bg-gray-700 ${
        className || ''
      }`}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`w-16 px-3 py-1 text-xs sm:w-20 sm:py-2 sm:text-sm rounded-full font-medium transition-all duration-200 ${
            active === opt.value
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-500 dark:text-gray-100'
              : 'text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default CapsuleSwitch;
