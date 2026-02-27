// Design tokens extracted from web app's globals.css
export const colors = {
    primary: '#3346D3',       // hsl(230, 75%, 55%) Deep Vibrant Indigo
    primaryLight: '#5B6BDE',
    primaryDark: '#2835A8',
    secondary: '#17A2B8',     // hsl(185, 80%, 45%) Electric Teal
    accent: '#E83E8C',        // hsl(335, 85%, 60%) Vibrant Ruby
    destructive: '#EF4444',

    background: '#F8FAFC',    // hsl(220, 33%, 98%)
    foreground: '#0F172A',    // hsl(224, 71%, 4%)

    card: '#FFFFFF',
    cardForeground: '#0F172A',

    muted: '#F1F5F9',         // hsl(220, 14%, 96%)
    mutedForeground: '#64748B',

    border: '#E2E8F0',        // hsl(220, 13%, 91%)
    input: '#E2E8F0',

    // Semantic
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Slate scale (matching Tailwind)
    slate50: '#F8FAFC',
    slate100: '#F1F5F9',
    slate200: '#E2E8F0',
    slate300: '#CBD5E1',
    slate400: '#94A3B8',
    slate500: '#64748B',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1E293B',
    slate900: '#0F172A',
    slate950: '#020617',

    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
};

export const typography = {
    fontFamily: {
        regular: 'Inter_400Regular',
        medium: 'Inter_500Medium',
        semiBold: 'Inter_600SemiBold',
        bold: 'Inter_700Bold',
        extraBold: 'Inter_800ExtraBold',
        black: 'Inter_900Black',
    },
    size: {
        xs: 10,
        sm: 12,
        base: 14,
        md: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
};

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    xl: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 8,
    },
};

const theme = { colors, typography, spacing, radius, shadows };
export default theme;
