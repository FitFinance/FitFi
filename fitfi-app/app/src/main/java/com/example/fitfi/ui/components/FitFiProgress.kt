package com.example.fitfi.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.example.fitfi.ui.theme.*
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun FitFiProgressRing(
    percent: Float,
    modifier: Modifier = Modifier,
    size: Dp = 80.dp,
    strokeWidth: Dp = 8.dp,
    statusColor: androidx.compose.ui.graphics.Color = FitFiColors.Primary,
    showPercentageText: Boolean = true
) {
    Box(
        modifier = modifier.size(size),
        contentAlignment = Alignment.Center
    ) {
        Canvas(
            modifier = Modifier.fillMaxSize()
        ) {
            val canvasSize = this.size.minDimension
            val radius = (canvasSize - strokeWidth.toPx()) / 2
            val center = this.center
            
            // Background circle
            drawCircle(
                color = FitFiColors.Border,
                radius = radius,
                center = center,
                style = Stroke(strokeWidth.toPx(), cap = StrokeCap.Round)
            )
            
            // Progress arc
            val sweepAngle = (percent / 100f) * 360f
            drawArc(
                color = statusColor,
                startAngle = -90f,
                sweepAngle = sweepAngle,
                useCenter = false,
                style = Stroke(strokeWidth.toPx(), cap = StrokeCap.Round),
                topLeft = androidx.compose.ui.geometry.Offset(
                    center.x - radius,
                    center.y - radius
                ),
                size = androidx.compose.ui.geometry.Size(radius * 2, radius * 2)
            )
        }
        
        if (showPercentageText) {
            Text(
                text = "${percent.toInt()}%",
                style = MaterialTheme.typography.labelLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = FitFiColors.TextPrimary
            )
        }
    }
}

@Composable
fun FitFiMetricProgressBar(
    current: Float,
    target: Float,
    modifier: Modifier = Modifier,
    label: String,
    unit: String = "",
    color: androidx.compose.ui.graphics.Color = FitFiColors.Primary
) {
    val progress = if (target > 0) (current / target).coerceIn(0f, 1f) else 0f
    
    Column(modifier = modifier) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium,
                color = FitFiColors.TextSecondary
            )
            Text(
                text = "${current.toInt()}${unit} / ${target.toInt()}${unit}",
                style = MaterialTheme.typography.bodySmall,
                color = FitFiColors.TextMuted
            )
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.xs))
        
        LinearProgressIndicator(
            progress = { progress },
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp),
            color = color,
            trackColor = FitFiColors.Border,
            strokeCap = StrokeCap.Round
        )
    }
}
