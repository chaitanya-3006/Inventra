'use client';

interface StatCardProps {
  title: string;
  value: string;
  icon: 'box' | 'package' | 'clock' | 'user' | 'check' | 'lock';
  bgColor: string;
  textColor: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  bgColor, 
  textColor 
}: StatCardProps) {
  const getIcon = () => {
    switch (icon) {
      case 'box': 
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V9a2 2 0 00-2-2m2 2h2" />
          </svg>
        );
      case 'package':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h10m-9-3v6m4-6v6m5-11V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2" />
          </svg>
        );
      case 'clock':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3M6 6a9 9 0 0112 0a9.31 9.31 0 00-3 5.41z" />
          </svg>
        );
      case 'user':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'check':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'lock':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V5a4 4 0 00-4-4H6a4 4 0 00-4 4v6" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${bgColor} rounded-lg p-4 text-center`}>
      <div className="flex items-center justify-center mb-3">
        {getIcon()}
      </div>
      <p className={`${textColor} font-bold text-2xl mb-1`}>
        {value}
      </p>
      <p className={`${textColor} text-sm font-medium`}>
        {title}
      </p>
    </div>
  );
}