package com.example.fitfi.ui.theme

import androidx.compose.ui.graphics.Color

// FitFi Design System Colors - Dark First
object FitFiColors {
    // Background
    val Background = Color(0xFF0E1114)
    val BackgroundAlt = Color(0xFF161B20)
    
    // Surface
    val Surface = Color(0xFF1E252B)
    val SurfaceAlt = Color(0xFF263039)
    
    // Primary
    val Primary = Color(0xFF4F8BFF)
    val PrimaryHover = Color(0xFF3B76EB)
    val PrimaryActive = Color(0xFF275FCC)
    
    // Accent
    val Accent = Color(0xFFFF9F43)
    val AccentAlt = Color(0xFFFFB866)
    
    // Status
    val Success = Color(0xFF42C98B)
    val Warning = Color(0xFFFFB020)
    val Error = Color(0xFFFF4D4F)
    val Info = Color(0xFF3BA3FF)
    
    // Border
    val Border = Color(0xFF2E3942)
    val BorderStrong = Color(0xFF3B4954)
    
    // Text
    val TextPrimary = Color(0xFFF2F6F9)
    val TextSecondary = Color(0xFFB4C0CC)
    val TextMuted = Color(0xFF788491)
    
    // Status Colors
    val StatusChallenge = Color(0xFFFF9F43)
    val StatusActiveDuel = Color(0xFF4F8BFF)
    val StatusCompleted = Color(0xFF42C98B)
    
    // Special
    val Transparent = Color(0x00000000)
}

// Gradient definitions
object FitFiGradients {
    val PrimaryGradient = listOf(FitFiColors.Primary, FitFiColors.PrimaryActive)
}

// Opacity values
object FitFiOpacities {
    const val Disabled = 0.45f
    const val Overlay = 0.65f
}