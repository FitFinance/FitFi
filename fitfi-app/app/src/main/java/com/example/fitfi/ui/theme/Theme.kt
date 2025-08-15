package com.example.fitfi.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// FitFi Dark Color Scheme (primary theme)
private val FitFiDarkColorScheme = darkColorScheme(
    primary = FitFiColors.Primary,
    onPrimary = FitFiColors.TextPrimary,
    primaryContainer = FitFiColors.PrimaryActive,
    onPrimaryContainer = FitFiColors.TextPrimary,
    
    secondary = FitFiColors.Accent,
    onSecondary = FitFiColors.Background,
    secondaryContainer = FitFiColors.AccentAlt,
    onSecondaryContainer = FitFiColors.Background,
    
    tertiary = FitFiColors.Info,
    onTertiary = FitFiColors.TextPrimary,
    
    background = FitFiColors.Background,
    onBackground = FitFiColors.TextPrimary,
    
    surface = FitFiColors.Surface,
    onSurface = FitFiColors.TextPrimary,
    surfaceVariant = FitFiColors.SurfaceAlt,
    onSurfaceVariant = FitFiColors.TextSecondary,
    
    error = FitFiColors.Error,
    onError = FitFiColors.TextPrimary,
    errorContainer = FitFiColors.Error,
    onErrorContainer = FitFiColors.TextPrimary,
    
    outline = FitFiColors.Border,
    outlineVariant = FitFiColors.BorderStrong,
    
    scrim = FitFiColors.Background,
    inverseSurface = FitFiColors.TextPrimary,
    inverseOnSurface = FitFiColors.Background,
    inversePrimary = FitFiColors.PrimaryActive,
    
    surfaceDim = FitFiColors.BackgroundAlt,
    surfaceBright = FitFiColors.SurfaceAlt,
    surfaceContainerLowest = FitFiColors.Background,
    surfaceContainerLow = FitFiColors.BackgroundAlt,
    surfaceContainer = FitFiColors.Surface,
    surfaceContainerHigh = FitFiColors.SurfaceAlt,
    surfaceContainerHighest = FitFiColors.BorderStrong
)

// Light color scheme (for potential future use)
private val FitFiLightColorScheme = lightColorScheme(
    primary = FitFiColors.Primary,
    onPrimary = FitFiColors.Background,
    primaryContainer = FitFiColors.PrimaryHover,
    onPrimaryContainer = FitFiColors.Background,
    
    secondary = FitFiColors.Accent,
    onSecondary = FitFiColors.Background,
    
    background = FitFiColors.TextPrimary,
    onBackground = FitFiColors.Background,
    
    surface = FitFiColors.TextSecondary,
    onSurface = FitFiColors.Background
)

@Composable
fun FitFiTheme(
    darkTheme: Boolean = true, // Always default to dark theme as per spec
    dynamicColor: Boolean = false, // Disable dynamic color to maintain brand consistency
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> FitFiDarkColorScheme
        else -> FitFiLightColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = FitFiColors.Background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = FitFiTypography,
        content = content
    )
}