import { useState, useEffect } from 'react';

interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'xl';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-settings');
      return saved ? JSON.parse(saved) : {
        fontSize: 'normal',
        highContrast: false,
        reducedMotion: false,
        screenReader: false
      };
    }
    return {
      fontSize: 'normal' as const,
      highContrast: false,
      reducedMotion: false,
      screenReader: false
    };
  });

  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    
    const root = window.document.documentElement;
    
    // Apply font size
    root.classList.remove('text-base', 'text-lg', 'text-xl');
    switch (settings.fontSize) {
      case 'large':
        root.classList.add('text-lg');
        break;
      case 'xl':
        root.classList.add('text-xl');
        break;
      default:
        root.classList.add('text-base');
    }
    
    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
      // Aplica preferência de motion reduzido ao sistema
      root.style.setProperty('--transition-smooth', 'none');
      root.style.setProperty('--transition-bounce', 'none');
    } else {
      root.classList.remove('reduce-motion');
      root.style.setProperty('--transition-smooth', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
      root.style.setProperty('--transition-bounce', 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)');
    }
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting };
};