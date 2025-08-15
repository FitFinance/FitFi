package com.example.fitfi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.example.fitfi.ui.components.*
import com.example.fitfi.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

private data class HistoricalDuel(
    val id: String,
    val opponent: String,
    val challengeType: String,
    val result: String, // won, lost, draw, cancelled
    val myScore: Int,
    val opponentScore: Int,
    val stake: Int,
    val tokensWon: Int,
    val duration: String,
    val completedDate: Long,
    val metric: String = "steps"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DuelHistoryScreen(
    navController: NavHostController
) {
    var selectedFilter by remember { mutableStateOf("all") }
    
    val mockDuelHistory = remember {
        listOf(
            HistoricalDuel("1", "Sarah Runner", "24h Step Challenge", "won", 12450, 11230, 100, 200, "24 hours", System.currentTimeMillis() - 86400000),
            HistoricalDuel("2", "Mike Walker", "Morning Sprint", "lost", 8920, 9650, 50, 0, "12 hours", System.currentTimeMillis() - 172800000),
            HistoricalDuel("3", "Lisa Jogger", "Weekend Challenge", "won", 25800, 23400, 75, 150, "48 hours", System.currentTimeMillis() - 259200000),
            HistoricalDuel("4", "Tom Sprint", "Elite Challenge", "draw", 15000, 15000, 200, 200, "24 hours", System.currentTimeMillis() - 345600000),
            HistoricalDuel("5", "Alex Fit", "Quick Match", "cancelled", 0, 0, 50, 0, "6 hours", System.currentTimeMillis() - 432000000),
            HistoricalDuel("6", "Emma Power", "Daily Grind", "won", 18500, 16800, 125, 250, "24 hours", System.currentTimeMillis() - 518400000),
            HistoricalDuel("7", "Chris Speed", "Sprint Series", "lost", 9200, 10100, 75, 0, "12 hours", System.currentTimeMillis() - 604800000)
        )
    }
    
    val filteredDuels = remember(selectedFilter) {
        when (selectedFilter) {
            "won" -> mockDuelHistory.filter { it.result == "won" }
            "lost" -> mockDuelHistory.filter { it.result == "lost" }
            "active" -> emptyList() // No active duels in history
            else -> mockDuelHistory
        }
    }
    
    val winRate = remember(mockDuelHistory) {
        val completed = mockDuelHistory.filter { it.result in listOf("won", "lost", "draw") }
        if (completed.isEmpty()) 0f else completed.count { it.result == "won" }.toFloat() / completed.size * 100
    }
    
    val totalTokensEarned = remember(mockDuelHistory) {
        mockDuelHistory.sumOf { it.tokensWon }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background)
    ) {
        TopAppBar(
            title = {
                Text(
                    text = "Duel History",
                    style = MaterialTheme.typography.headlineSmall.copy(
                        fontWeight = FontWeight.SemiBold
                    ),
                    color = FitFiColors.TextPrimary
                )
            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = FitFiColors.Background
            )
        )
        
        Column(
            modifier = Modifier.padding(horizontal = FitFiSpacing.md, vertical = FitFiSpacing.sm)
        ) {
            // Stats Overview
            FitFiCard {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    StatItem(
                        label = "Total Duels",
                        value = mockDuelHistory.size.toString(),
                        icon = "🎯"
                    )
                    StatItem(
                        label = "Win Rate",
                        value = "${winRate.toInt()}%",
                        icon = "🏆"
                    )
                    StatItem(
                        label = "Tokens Earned",
                        value = "$totalTokensEarned FF",
                        icon = "💰"
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(FitFiSpacing.md))
            
            // Filter Tabs
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(FitFiSpacing.sm)
            ) {
                FilterChip(
                    selected = selectedFilter == "all",
                    onClick = { selectedFilter = "all" },
                    label = { Text("All") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = selectedFilter == "won",
                    onClick = { selectedFilter = "won" },
                    label = { Text("Won") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = selectedFilter == "lost",
                    onClick = { selectedFilter = "lost" },
                    label = { Text("Lost") },
                    modifier = Modifier.weight(1f)
                )
            }
            
            Spacer(modifier = Modifier.height(FitFiSpacing.md))
            
            Text(
                text = "${filteredDuels.size} ${if (filteredDuels.size == 1) "duel" else "duels"}",
                style = MaterialTheme.typography.bodyMedium,
                color = FitFiColors.TextSecondary
            )
        }
        
        if (filteredDuels.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "📊",
                        style = MaterialTheme.typography.displayMedium
                    )
                    Spacer(modifier = Modifier.height(FitFiSpacing.md))
                    Text(
                        text = when (selectedFilter) {
                            "won" -> "No Victories Yet"
                            "lost" -> "No Losses Yet"
                            else -> "No Duel History"
                        },
                        style = MaterialTheme.typography.titleLarge,
                        color = FitFiColors.TextPrimary
                    )
                    Spacer(modifier = Modifier.height(FitFiSpacing.xs))
                    Text(
                        text = when (selectedFilter) {
                            "won" -> "Your victories will appear here once you win some duels!"
                            "lost" -> "Keep it up! No losses to show."
                            else -> "Your completed duels will appear here"
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        color = FitFiColors.TextSecondary
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = FitFiSpacing.md, vertical = FitFiSpacing.sm),
                verticalArrangement = Arrangement.spacedBy(FitFiSpacing.md)
            ) {
                items(filteredDuels) { duel ->
                    DuelHistoryCard(
                        duel = duel,
                        onClick = {
                            // Navigate to duel details with historical data
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun StatItem(
    label: String,
    value: String,
    icon: String
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = icon,
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(FitFiSpacing.xs))
        Text(
            text = value,
            style = MaterialTheme.typography.titleLarge.copy(
                fontWeight = FontWeight.Bold
            ),
            color = FitFiColors.TextPrimary
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = FitFiColors.TextSecondary
        )
    }
}

@Composable
private fun DuelHistoryCard(
    duel: HistoricalDuel,
    onClick: () -> Unit
) {
    FitFiCard(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = duel.challengeType,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.SemiBold
                        ),
                        color = FitFiColors.TextPrimary
                    )
                    Spacer(modifier = Modifier.width(FitFiSpacing.sm))
                    ResultBadge(result = duel.result)
                }
                
                Text(
                    text = "vs ${duel.opponent}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = FitFiColors.TextSecondary
                )
                
                Text(
                    text = formatDate(duel.completedDate),
                    style = MaterialTheme.typography.bodySmall,
                    color = FitFiColors.TextMuted
                )
            }
            
            if (duel.result != "cancelled") {
                Column(
                    horizontalAlignment = Alignment.End
                ) {
                    Text(
                        text = when {
                            duel.tokensWon > 0 -> "+${duel.tokensWon} FF"
                            duel.tokensWon == 0 && duel.result == "draw" -> "${duel.stake} FF"
                            else -> "-${duel.stake} FF"
                        },
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = when {
                            duel.tokensWon > 0 -> FitFiColors.Success
                            duel.tokensWon == 0 && duel.result == "draw" -> FitFiColors.Warning
                            else -> FitFiColors.Error
                        }
                    )
                }
            }
        }
        
        if (duel.result != "cancelled") {
            Spacer(modifier = Modifier.height(FitFiSpacing.md))
            
            HorizontalDivider(color = FitFiColors.Border)
            
            Spacer(modifier = Modifier.height(FitFiSpacing.md))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                ScoreDisplay(
                    label = "You",
                    score = duel.myScore,
                    metric = duel.metric,
                    isWinner = when (duel.result) {
                        "won" -> true
                        "lost" -> false
                        else -> null
                    }
                )
                
                Text(
                    text = "VS",
                    style = MaterialTheme.typography.labelMedium.copy(
                        fontWeight = FontWeight.Bold
                    ),
                    color = FitFiColors.TextMuted,
                    modifier = Modifier.align(Alignment.CenterVertically)
                )
                
                ScoreDisplay(
                    label = "Them",
                    score = duel.opponentScore,
                    metric = duel.metric,
                    isWinner = when (duel.result) {
                        "won" -> false
                        "lost" -> true
                        else -> null
                    }
                )
            }
            
            if (duel.result == "draw") {
                Spacer(modifier = Modifier.height(FitFiSpacing.sm))
                Text(
                    text = "🤝 Perfect tie! Stakes returned",
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontWeight = FontWeight.Medium
                    ),
                    color = FitFiColors.Warning
                )
            }
        } else {
            Spacer(modifier = Modifier.height(FitFiSpacing.md))
            Text(
                text = "❌ Duel was cancelled before completion",
                style = MaterialTheme.typography.bodyMedium,
                color = FitFiColors.TextMuted
            )
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.md))
        
        FitFiSecondaryButton(
            text = "View Details",
            onClick = onClick,
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun ResultBadge(result: String) {
    val (text, color) = when (result) {
        "won" -> "WON" to FitFiColors.Success
        "lost" -> "LOST" to FitFiColors.Error
        "draw" -> "DRAW" to FitFiColors.Warning
        "cancelled" -> "CANCELLED" to FitFiColors.TextMuted
        else -> result.uppercase() to FitFiColors.TextMuted
    }
    
    Surface(
        color = color.copy(alpha = 0.1f),
        shape = androidx.compose.foundation.shape.RoundedCornerShape(12.dp),
        modifier = Modifier.clip(androidx.compose.foundation.shape.RoundedCornerShape(12.dp))
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.Bold
            ),
            color = color,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

@Composable
private fun ScoreDisplay(
    label: String,
    score: Int,
    metric: String,
    isWinner: Boolean?
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = FitFiColors.TextMuted
            )
            if (isWinner == true) {
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "👑",
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
        
        Text(
            text = score.toString(),
            style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.Bold
            ),
            color = when (isWinner) {
                true -> FitFiColors.Success
                false -> FitFiColors.Error
                null -> FitFiColors.TextPrimary
            }
        )
        
        Text(
            text = metric,
            style = MaterialTheme.typography.bodySmall,
            color = FitFiColors.TextMuted
        )
    }
}

private fun formatDate(timestamp: Long): String {
    val formatter = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
    return formatter.format(Date(timestamp))
}
