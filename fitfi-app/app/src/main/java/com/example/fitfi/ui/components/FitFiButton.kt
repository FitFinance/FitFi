package com.example.fitfi.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.fitfi.ui.theme.*

enum class FitFiButtonVariant {
    Primary, Secondary, Danger, Ghost
}

enum class FitFiButtonSize {
    Small, Medium, Large
}

@Composable
fun FitFiButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: FitFiButtonVariant = FitFiButtonVariant.Primary,
    size: FitFiButtonSize = FitFiButtonSize.Medium,
    enabled: Boolean = true,
    content: @Composable RowScope.() -> Unit
) {
    val (backgroundColor, textColor, borderColor) = when (variant) {
        FitFiButtonVariant.Primary -> Triple(
            if (enabled) FitFiColors.Primary else FitFiColors.Primary.copy(alpha = FitFiOpacities.Disabled),
            FitFiColors.TextPrimary,
            Color.Transparent
        )
        FitFiButtonVariant.Secondary -> Triple(
            FitFiColors.SurfaceAlt,
            FitFiColors.TextSecondary,
            FitFiColors.Border
        )
        FitFiButtonVariant.Danger -> Triple(
            if (enabled) FitFiColors.Error else FitFiColors.Error.copy(alpha = FitFiOpacities.Disabled),
            FitFiColors.TextPrimary,
            Color.Transparent
        )
        FitFiButtonVariant.Ghost -> Triple(
            FitFiColors.Transparent,
            FitFiColors.TextSecondary,
            Color.Transparent
        )
    }

    val (paddingVertical, paddingHorizontal, textStyle) = when (size) {
        FitFiButtonSize.Small -> Triple(
            FitFiSpacing.xs,
            14.dp,
            MaterialTheme.typography.bodyMedium
        )
        FitFiButtonSize.Medium -> Triple(
            FitFiSpacing.sm,
            18.dp,
            MaterialTheme.typography.bodyLarge
        )
        FitFiButtonSize.Large -> Triple(
            FitFiSpacing.md,
            FitFiSpacing.lg,
            MaterialTheme.typography.titleLarge
        )
    }

    Box(
        modifier = modifier
            .heightIn(min = FitFiTouchTargets.minimum)
            .clip(RoundedCornerShape(FitFiRadii.md))
            .background(backgroundColor)
            .border(
                width = if (borderColor != Color.Transparent) 1.dp else 0.dp,
                color = borderColor,
                shape = RoundedCornerShape(FitFiRadii.md)
            )
            .clickable(enabled = enabled) { onClick() }
            .padding(horizontal = paddingHorizontal, vertical = paddingVertical),
        contentAlignment = Alignment.Center
    ) {
        ProvideTextStyle(
            value = textStyle.copy(
                color = textColor,
                fontWeight = FontWeight.Medium
            )
        ) {
            Row(
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
                content = content
            )
        }
    }
}

@Composable
fun FitFiPrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    size: FitFiButtonSize = FitFiButtonSize.Medium,
    enabled: Boolean = true
) {
    FitFiButton(
        onClick = onClick,
        modifier = modifier,
        variant = FitFiButtonVariant.Primary,
        size = size,
        enabled = enabled
    ) {
        Text(text = text)
    }
}

@Composable
fun FitFiSecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    size: FitFiButtonSize = FitFiButtonSize.Medium,
    enabled: Boolean = true
) {
    FitFiButton(
        onClick = onClick,
        modifier = modifier,
        variant = FitFiButtonVariant.Secondary,
        size = size,
        enabled = enabled
    ) {
        Text(text = text)
    }
}
