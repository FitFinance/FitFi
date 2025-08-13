import { StyleSheet } from 'react-native';

// Dark Mode Color Palette
export const Colors = {
  dark: {
    background: '#0A0A0A',
    surface: '#1A1A1A',
    surfaceSecondary: '#2A2A2A',
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    secondary: '#FF6B35',
    accent: '#2196F3',
    warning: '#FFC107',
    error: '#F44336',
    success: '#4CAF50',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textMuted: '#707070',
    border: '#333333',
    borderLight: '#424242',
    overlay: 'rgba(0, 0, 0, 0.7)',
    gradient: {
      primary: ['#4CAF50', '#388E3C'],
      secondary: ['#FF6B35', '#E65100'],
      accent: ['#2196F3', '#1976D2'],
      dark: ['#1A1A1A', '#0A0A0A'],
    },
  },
};

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: Colors.dark.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },

  // Card Styles
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardSecondary: {
    backgroundColor: Colors.dark.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },

  // Text Styles
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 6,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  body: {
    fontSize: 16,
    color: Colors.dark.text,
    lineHeight: 24,
  },
  bodySecondary: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    lineHeight: 18,
  },

  // Button Styles
  button: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  buttonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Input Styles
  input: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginVertical: 8,
  },
  inputFocused: {
    borderColor: Colors.dark.primary,
  },

  // Layout Styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  column: {
    flexDirection: 'column',
  },

  // Spacing
  margin8: { margin: 8 },
  margin16: { margin: 16 },
  padding8: { padding: 8 },
  padding16: { padding: 16 },
  marginTop8: { marginTop: 8 },
  marginTop16: { marginTop: 16 },
  marginBottom8: { marginBottom: 8 },
  marginBottom16: { marginBottom: 16 },

  // Status Styles
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: Colors.dark.success,
  },
  statusPending: {
    backgroundColor: Colors.dark.warning,
  },
  statusCompleted: {
    backgroundColor: Colors.dark.accent,
  },
  statusError: {
    backgroundColor: Colors.dark.error,
  },

  // Progress Styles
  progressBar: {
    height: 8,
    backgroundColor: Colors.dark.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
    borderRadius: 4,
  },

  // Header Styles
  header: {
    backgroundColor: Colors.dark.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },

  // List Styles
  listItem: {
    backgroundColor: Colors.dark.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },

  // Modal Styles
  modal: {
    backgroundColor: Colors.dark.background,
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    color: Colors.dark.textMuted,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
