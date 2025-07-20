# Dark Mode Implementation Guide

This document explains how dark mode is implemented in the FitFi mobile app.

## Features

- **Light/Dark/System theme options**: Users can choose between light mode, dark mode, or system preference
- **Persistent theme selection**: The chosen theme is saved and restored on app restart
- **Theme-aware components**: All screens adapt colors, shadows, and styles based on the selected theme
- **Tailwind CSS support**: Dark mode classes are available for web compatibility
- **Status bar adaptation**: The status bar automatically adjusts to match the theme

## Implementation Overview

### Core Components

1. **ThemeContext** (`contexts/ThemeContext.tsx`)
   - Manages global theme state
   - Provides hooks for theme access
   - Handles persistence with AsyncStorage
   - Supports light/dark/system modes

2. **ThemeManager** (`components/ThemeManager.tsx`)
   - Applies theme to the app root
   - Manages status bar appearance
   - Handles web-specific dark class toggling

3. **Theme utilities** (`utils/theme.ts`)
   - Provides consistent color palettes
   - Includes common styled components
   - Offers typography and spacing scales

### Theme Selection

Users can select their preferred theme in the Settings screen:

- **☀️ Light**: Always use light theme
- **🌙 Dark**: Always use dark theme
- **📱 System**: Follow system preference

### Using Dark Mode in Screens

Each screen that supports dark mode follows this pattern:

```tsx
import { useThemeStyles } from '../contexts/ThemeContext';

export default function MyScreen() {
  const styles = useThemeStyles(lightStyles, darkStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World</Text>
    </View>
  );
}

// Define separate style objects for light and dark themes
const lightStyles = StyleSheet.create({
  container: { backgroundColor: '#f8fafc' },
  title: { color: '#1e293b' },
});

const darkStyles = StyleSheet.create({
  container: { backgroundColor: '#0f172a' },
  title: { color: '#f1f5f9' },
});
```

### Color Palette

#### Light Theme

- **Background**: #f8fafc (slate-50)
- **Secondary Background**: #ffffff (white)
- **Text Primary**: #1e293b (slate-800)
- **Text Secondary**: #64748b (slate-500)
- **Cards**: #ffffff with light shadows

#### Dark Theme

- **Background**: #0f172a (slate-900)
- **Secondary Background**: #1e293b (slate-800)
- **Text Primary**: #f1f5f9 (slate-100)
- **Text Secondary**: #cbd5e1 (slate-300)
- **Cards**: #1e293b with borders and stronger shadows

### Tailwind CSS Classes

For web compatibility, the following CSS variables and classes are available:

```css
/* Automatically applied based on theme */
.dark {
  --background: 15 23 42;
  --foreground: 241 245 249;
  --card: 30 41 59;
}

/* Utility classes */
.bg-background /* Theme-aware background */
.text-foreground /* Theme-aware text */
.fitfi-card /* Theme-aware card component */
```

## Screens with Dark Mode Support

The following screens have been updated with full dark mode support:

- ✅ **SettingsScreen**: Theme selection with visual theme picker
- ✅ **HomeScreen**: Dashboard with theme-aware stats and cards
- ✅ **ActiveDuelsScreen**: Duel listings with theme-appropriate styling

## Adding Dark Mode to New Screens

To add dark mode support to a new screen:

1. Import the theme hook:

   ```tsx
   import { useThemeStyles } from '../contexts/ThemeContext';
   ```

2. Use theme-aware styles:

   ```tsx
   const styles = useThemeStyles(lightStyles, darkStyles);
   ```

3. Create separate StyleSheet objects for light and dark themes

4. Use theme-aware colors for dynamic elements (like Switch components):
   ```tsx
   <Switch
     trackColor={{
       false: isDark ? '#374151' : '#e5e7eb',
       true: '#10b981',
     }}
   />
   ```

## Theme Persistence

The app automatically saves the user's theme preference to device storage using `@react-native-async-storage/async-storage`. The theme is restored when the app launches.

## Next Steps

To expand dark mode support:

1. Update remaining screens (PreviousDuelsScreen, ConnectWalletScreen, etc.)
2. Add dark mode support to custom components
3. Consider adding theme-aware icons or illustrations
4. Test accessibility in both themes
5. Add animations for theme transitions
