package com.example.fitfi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.example.fitfi.data.models.*
import com.example.fitfi.navigation.Screen
import com.example.fitfi.ui.components.*
import com.example.fitfi.ui.theme.*

private data class DuelUI(
    val id: String,
    val opponent: String,
    val status: String, // active, pending, searching, accepted
    val stake: Int,
    val mySteps: Int,
    val theirSteps: Int,
    val timeLeft: String,
    val challengeType: String,
    val duration: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ActiveDuelsScreen(
    navController: NavHostController
) {
    val mockActiveDuels = remember {
        listOf(
            DuelUI("1", "Sarah Runner", "active", 100, 8420, 7890, "4h 23m", "24h Step Challenge", "24 hours"),
            DuelUI("2", "Mike Walker", "active", 50, 6230, 8100, "12h 15m", "Morning Sprint", "12 hours"),
            DuelUI("3", "Lisa Jogger", "pending", 75, 0, 0, "2h 45m", "Weekend Challenge", "48 hours"),
            DuelUI("4", "Tom Sprint", "accepted", 200, 0, 0, "30m", "Elite Challenge", "24 hours"),
            DuelUI("5", "Finding opponent...", "searching", 50, 0, 0, "∞", "Quick Match", "6 hours")
        )
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background)
    ) {
        TopAppBar(
            title = {
                Text(
                    text = "Active Duels",
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
            Text(
                text = "${mockActiveDuels.size} active ${if (mockActiveDuels.size == 1) "duel" else "duels"}",
                style = MaterialTheme.typography.bodyMedium,
                color = FitFiColors.TextSecondary
            )
        }
        
        if (mockActiveDuels.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "🏃‍♂️",
                        style = MaterialTheme.typography.displayMedium
                    )
                    Spacer(modifier = Modifier.height(FitFiSpacing.md))
                    Text(
                        text = "No Active Duels",
                        style = MaterialTheme.typography.titleLarge,
                        color = FitFiColors.TextPrimary
                    )
                    Spacer(modifier = Modifier.height(FitFiSpacing.xs))
                    Text(
                        text = "Start your fitness journey by joining a challenge!",
                        style = MaterialTheme.typography.bodyMedium,
                        color = FitFiColors.TextSecondary
                    )
                    Spacer(modifier = Modifier.height(FitFiSpacing.lg))
                    FitFiPrimaryButton(
                        text = "Browse Challenges",
                        onClick = { navController.navigate(Screen.Challenges.route) }
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = FitFiSpacing.md, vertical = FitFiSpacing.sm),
                verticalArrangement = Arrangement.spacedBy(FitFiSpacing.md)
            ) {
                items(mockActiveDuels) { duel ->
                    DuelCardExpanded(
                        duel = duel,
                        onClick = {
                            when (duel.status) {
                                "active" -> navController.navigate(Screen.DuelHealthMonitor.createRoute(duel.id))
                                else -> navController.navigate(Screen.DuelDetails.createRoute(duel.id))
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun DuelCardExpanded(
    duel: DuelUI,
    onClick: () -> Unit
) {
    FitFiCard(
        modifier = Modifier.fillMaxWidth()
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = duel.challengeType,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.SemiBold
                    ),
                    color = FitFiColors.TextPrimary
                )
                Text(
                    text = "vs ${duel.opponent}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = FitFiColors.TextSecondary
                )
            }
            
            FitFiStatusBadge(status = duel.status)
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.md))
        
        // Duel Info
        Column(
            verticalArrangement = Arrangement.spacedBy(FitFiSpacing.xs)
        ) {
            DuelInfoRow("Stake:", "${duel.stake} FF")
            DuelInfoRow("Duration:", duel.duration)
            DuelInfoRow("Time Left:", duel.timeLeft, highlight = true)
        }
        
        // Status-specific content
        when (duel.status) {
            "active" -> {
                Spacer(modifier = Modifier.height(FitFiSpacing.md))
                
                HorizontalDivider(color = FitFiColors.Border)
                
                Spacer(modifier = Modifier.height(FitFiSpacing.md))
                
                Text(
                    text = "Current Progress",
                    style = MaterialTheme.typography.labelLarge.copy(
                        fontWeight = FontWeight.SemiBold
                    ),
                    color = FitFiColors.TextPrimary
                )
                
                Spacer(modifier = Modifier.height(FitFiSpacing.sm))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    ProgressSide("You", duel.mySteps, isLeading = duel.mySteps > duel.theirSteps)
                    Text(
                        text = "VS",
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = FitFiColors.TextMuted
                    )
                    ProgressSide("Them", duel.theirSteps, isLeading = duel.theirSteps > duel.mySteps)
                }
                
                Spacer(modifier = Modifier.height(FitFiSpacing.sm))
                
                val diff = kotlin.math.abs(duel.mySteps - duel.theirSteps)
                val isWinning = duel.mySteps > duel.theirSteps
                
                Text(
                    text = when {
                        duel.mySteps == duel.theirSteps -> "🟡 It's a tie!"
                        isWinning -> "🟢 You're leading by $diff steps!"
                        else -> "🔴 You're behind by $diff steps"
                    },
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontWeight = FontWeight.Medium
                    ),
                    color = when {
                        duel.mySteps == duel.theirSteps -> FitFiColors.Warning
                        isWinning -> FitFiColors.Success
                        else -> FitFiColors.Error
                    }
                )
            }
            
            "searching" -> {
                Spacer(modifier = Modifier.height(FitFiSpacing.md))
                HorizontalDivider(color = FitFiColors.Border)
                Spacer(modifier = Modifier.height(FitFiSpacing.md))
                Text(
                    text = "🔍 Looking for an opponent...",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = FontWeight.Medium
                    ),
                    color = FitFiColors.Accent
                )
                Text(
                    text = "You'll be notified when someone accepts",
                    style = MaterialTheme.typography.bodySmall,
                    color = FitFiColors.TextMuted
                )
            }
            
            "pending" -> {
                Spacer(modifier = Modifier.height(FitFiSpacing.md))
                HorizontalDivider(color = FitFiColors.Border)
                Spacer(modifier = Modifier.height(FitFiSpacing.md))
                Text(
                    text = "⏳ Waiting for opponent to confirm",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = FontWeight.Medium
                    ),
                    color = FitFiColors.Warning
                )
            }
            
            "accepted" -> {
                Spacer(modifier = Modifier.height(FitFiSpacing.md))
                HorizontalDivider(color = FitFiColors.Border)
                Spacer(modifier = Modifier.height(FitFiSpacing.md))
                Text(
                    text = "✅ Challenge accepted! Starting soon...",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = FontWeight.Medium
                    ),
                    color = FitFiColors.Success
                )
            }
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.md))
        
        FitFiSecondaryButton(
            text = when (duel.status) {
                "active" -> "View Live Monitor"
                "searching" -> "Cancel Search"
                "pending" -> "View Details"
                "accepted" -> "Get Ready"
                else -> "View Details"
            },
            onClick = onClick,
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun DuelInfoRow(
    label: String,
    value: String,
    highlight: Boolean = false
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = FitFiColors.TextSecondary
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium.copy(
                fontWeight = FontWeight.SemiBold
            ),
            color = if (highlight) FitFiColors.Warning else FitFiColors.TextPrimary
        )
    }
}

@Composable
private fun ProgressSide(
    label: String,
    steps: Int,
    isLeading: Boolean
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = FitFiColors.TextMuted
        )
        Text(
            text = steps.toString(),
            style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.Bold
            ),
            color = if (isLeading) FitFiColors.Success else FitFiColors.TextPrimary
        )
        Text(
            text = "steps",
            style = MaterialTheme.typography.bodySmall,
            color = FitFiColors.TextMuted
        )
    }
}

@Composable
fun PreviousDuelsScreen(
    navController: NavHostController
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "📋",
            style = MaterialTheme.typography.displayMedium
        )
        Spacer(modifier = Modifier.height(FitFiSpacing.md))
        Text(
            text = "Previous Duels",
            style = MaterialTheme.typography.headlineMedium,
            color = FitFiColors.TextPrimary
        )
        Spacer(modifier = Modifier.height(FitFiSpacing.sm))
        Text(
            text = "Your duel history will appear here",
            style = MaterialTheme.typography.bodyLarge,
            color = FitFiColors.TextSecondary
        )
    }
}

@Composable
fun SettingsScreen(
    navController: NavHostController
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "⚙️",
            style = MaterialTheme.typography.displayMedium
        )
        Spacer(modifier = Modifier.height(FitFiSpacing.md))
        Text(
            text = "Settings",
            style = MaterialTheme.typography.headlineMedium,
            color = FitFiColors.TextPrimary
        )
        Spacer(modifier = Modifier.height(FitFiSpacing.sm))
        Text(
            text = "App settings and preferences",
            style = MaterialTheme.typography.bodyLarge,
            color = FitFiColors.TextSecondary
        )
    }
}

@Composable
fun DuelDetailsScreen(
    duelId: String,
    onNavigateBack: () -> Unit,
    onNavigateToLiveMonitor: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "🎯",
            style = MaterialTheme.typography.displayMedium
        )
        Spacer(modifier = Modifier.height(FitFiSpacing.md))
        Text(
            text = "Duel Details",
            style = MaterialTheme.typography.headlineMedium,
            color = FitFiColors.TextPrimary
        )
        Spacer(modifier = Modifier.height(FitFiSpacing.sm))
        Text(
            text = "Duel ID: $duelId",
            style = MaterialTheme.typography.bodyLarge,
            color = FitFiColors.TextSecondary
        )
    }
}

@Composable
fun DuelHealthMonitorScreen(
    duelId: String,
    onNavigateBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "📱",
            style = MaterialTheme.typography.displayMedium
        )
        Spacer(modifier = Modifier.height(FitFiSpacing.md))
        Text(
            text = "Health Monitor",
            style = MaterialTheme.typography.headlineMedium,
            color = FitFiColors.TextPrimary
        )
        Spacer(modifier = Modifier.height(FitFiSpacing.sm))
        Text(
            text = "Live tracking for Duel: $duelId",
            style = MaterialTheme.typography.bodyLarge,
            color = FitFiColors.TextSecondary
        )
    }
}

@Composable
fun UserSettingsScreen(
    onNavigateBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "👤",
            style = MaterialTheme.typography.displayMedium
        )
        Spacer(modifier = Modifier.height(FitFiSpacing.md))
        Text(
            text = "User Settings",
            style = MaterialTheme.typography.headlineMedium,
            color = FitFiColors.TextPrimary
        )
        Spacer(modifier = Modifier.height(FitFiSpacing.sm))
        Text(
            text = "Profile and account settings",
            style = MaterialTheme.typography.bodyLarge,
            color = FitFiColors.TextSecondary
        )
    }
}

@Composable
fun NetworkTestScreen(
    onNavigateBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "🌐",
            style = MaterialTheme.typography.displayMedium
        )
        Spacer(modifier = Modifier.height(FitFiSpacing.md))
        Text(
            text = "Network Test",
            style = MaterialTheme.typography.headlineMedium,
            color = FitFiColors.TextPrimary
        )
        Spacer(modifier = Modifier.height(FitFiSpacing.sm))
        Text(
            text = "Test network connectivity",
            style = MaterialTheme.typography.bodyLarge,
            color = FitFiColors.TextSecondary
        )
    }
}
