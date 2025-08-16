import React from 'react';

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
}

export function SelectField({ 
  label, 
  value, 
  onChange, 
  options,
  required = false,
  placeholder = "Select an option",
  disabled = false,
  error,
  helpText,
  className = ''
}: SelectFieldProps) {
  const selectId = `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  const baseSelectClasses = `
    w-full px-3 py-2 border rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition duration-200 bg-white
    ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
  `.trim();

  return (
    <div className={`space-y-1 ${className}`}>
      <label 
        htmlFor={selectId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={baseSelectClasses}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
}

export default SelectField;