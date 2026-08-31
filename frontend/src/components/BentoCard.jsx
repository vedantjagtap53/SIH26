import React from 'react';

export default function BentoCard({ title, value, icon, className = "", children }) {
  return (
    <div className={`bento-tile flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        {title && <h3 className="font-semibold text-gray-700">{title}</h3>}
        {icon && <div className="text-indigo-600 bg-indigo-50 p-2 rounded-lg">{icon}</div>}
      </div>
      {value && <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
