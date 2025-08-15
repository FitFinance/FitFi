package com.example.fitfi.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.fitfi.ui.theme.*

enum class FitFiBadgeVariant {
    Info, Warning, Success, Custom
}

@Composable
fun FitFiBadge(
    text: String,
    modifier: Modifier = Modifier,
    variant: FitFiBadgeVariant = FitFiBadgeVariant.Info,
    customBackgroundColor: androidx.compose.ui.graphics.Color? = null,
    customTextColor: androidx.compose.ui.graphics.Color? = null
) {
    val (backgroundColor, textColor) = when (variant) {
        FitFiBadgeVariant.Info -> Pair(FitFiColors.Primary, FitFiColors.TextPrimary)
        FitFiBadgeVariant.Warning -> Pair(FitFiColors.Warning, FitFiColors.Background)
        FitFiBadgeVariant.Success -> Pair(FitFiColors.Success, FitFiColors.Background)
        FitFiBadgeVariant.Custom -> Pair(
            customBackgroundColor ?: FitFiColors.Primary,
            customTextColor ?: FitFiColors.TextPrimary
        )
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(FitFiRadii.pill))
            .background(backgroundColor)
            .padding(horizontal = FitFiSpacing.sm, vertical = FitFiSpacing.xs),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.Medium
            ),
            color = textColor
        )
    }
}

@Composable
fun FitFiStatusBadge(
    status: String,
    modifier: Modifier = Modifier
) {
    val (backgroundColor, textColor) = when (status.lowercase()) {
        "active", "ongoing" -> Pair(FitFiColors.StatusActiveDuel, FitFiColors.TextPrimary)
        "completed", "finished", "won" -> Pair(FitFiColors.StatusCompleted, FitFiColors.Background)
        "challenge", "pending" -> Pair(FitFiColors.StatusChallenge, FitFiColors.Background)
        "lost", "failed" -> Pair(FitFiColors.Error, FitFiColors.TextPrimary)
        else -> Pair(FitFiColors.TextMuted, FitFiColors.Background)
    }

    FitFiBadge(
        text = status,
        modifier = modifier,
        variant = FitFiBadgeVariant.Custom,
        customBackgroundColor = backgroundColor,
        customTextColor = textColor
    )
}
