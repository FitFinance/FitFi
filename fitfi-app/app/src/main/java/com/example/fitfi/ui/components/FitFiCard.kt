package com.example.fitfi.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.fitfi.ui.theme.*

enum class FitFiCardVariant {
    Base, Elevated, Highlight
}

@Composable
fun FitFiCard(
    modifier: Modifier = Modifier,
    variant: FitFiCardVariant = FitFiCardVariant.Base,
    content: @Composable ColumnScope.() -> Unit
) {
    val (backgroundColor, borderColor, elevation) = when (variant) {
        FitFiCardVariant.Base -> Triple(
            FitFiColors.Surface,
            FitFiColors.Border,
            0.dp
        )
        FitFiCardVariant.Elevated -> Triple(
            FitFiColors.Surface,
            FitFiColors.Border,
            FitFiShadows.md
        )
        FitFiCardVariant.Highlight -> Triple(
            FitFiColors.BackgroundAlt,
            FitFiColors.Primary,
            0.dp
        )
    }

    Column(
        modifier = modifier
            .shadow(
                elevation = elevation,
                shape = RoundedCornerShape(FitFiRadii.md),
                ambientColor = Color.Black.copy(alpha = 0.35f),
                spotColor = Color.Black.copy(alpha = 0.35f)
            )
            .clip(RoundedCornerShape(FitFiRadii.md))
            .background(backgroundColor)
            .border(
                width = 1.dp,
                color = borderColor,
                shape = RoundedCornerShape(FitFiRadii.md)
            )
            .padding(FitFiSpacing.md),
        content = content
    )
}

@Composable
fun FitFiElevatedCard(
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit
) {
    FitFiCard(
        modifier = modifier,
        variant = FitFiCardVariant.Elevated,
        content = content
    )
}

@Composable
fun FitFiHighlightCard(
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit
) {
    FitFiCard(
        modifier = modifier,
        variant = FitFiCardVariant.Highlight,
        content = content
    )
}
