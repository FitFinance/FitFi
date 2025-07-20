import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../contexts/ThemeContext';

// Component to manage app-wide theme settings
export default function ThemeManager({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark } = useTheme();

  useEffect(() => {
    // For web, we can apply the dark class to the body
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDark]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </>
  );
}
