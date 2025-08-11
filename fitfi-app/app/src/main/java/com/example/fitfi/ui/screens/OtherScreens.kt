package com.example.fitfi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.navigation.NavHostController
import com.example.fitfi.data.models.*
import com.example.fitfi.navigation.Screen
import com.example.fitfi.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ActiveDuelsScreen(
    navController: NavHostController
) {
    // Sample data
    val activeDuels = listOf(
        Duel(
            id = "1",
            opponentName = "Alex Runner",
            status = DuelStatus.ACTIVE,
            metric = "steps",
            currentProgress = 6500f,
            targetProgress = 10000f,
            opponentProgress = 7200f,
            timeRemaining = 3600000,
            stake = 50,
            startTime = System.currentTimeMillis() - 86400000,
            endTime = System.currentTimeMillis() + 3600000,
            rules = "First to 10,000 steps wins"
        ),
        Duel(
            id = "2",
            opponentName = "Sarah Fit",
            status = DuelStatus.ACTIVE,
            metric = "calories",
            currentProgress = 320f,
            targetProgress = 500f,
            opponentProgress = 280f,
            timeRemaining = 7200000,
            stake = 75,
            startTime = System.currentTimeMillis() - 43200000,
            endTime = System.currentTimeMillis() + 7200000,
            rules = "First to burn 500 calories wins"
        )
    )
    
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
        
        if (activeDuels.isEmpty()) {
            // Empty state - reuse from HomeScreen
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = androidx.compose.ui.Alignment.Center
            ) {
                Text(
                    text = "No active duels",
                    style = MaterialTheme.typography.titleMedium,
                    color = FitFiColors.TextSecondary
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(FitFiSpacing.lg),
                verticalArrangement = Arrangement.spacedBy(FitFiSpacing.md)
            ) {
                items(activeDuels) { duel ->
                    DuelCardExpanded(
                        duel = duel,
                        onClick = {
                            navController.navigate(Screen.DuelDetails.createRoute(duel.id))
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun PreviousDuelsScreen(
    navController: NavHostController
) {
    // Placeholder for now
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
    ) {
        Text(
            text = "Previous Duels",
            style = MaterialTheme.typography.headlineMedium,
            color = FitFiColors.TextPrimary
        )
        Text(
            text = "Coming soon...",
            style = MaterialTheme.typography.bodyLarge,
            color = FitFiColors.TextSecondary
        )
    }
}

@Composable
fun SettingsScreen(
    navController: NavHostController
) {
    // Placeholder for now
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
    ) {
        Text(
            text = "Settings",
            style = MaterialTheme.typography.headlineMedium,
            color = FitFiColors.TextPrimary
        )
        Text(
            text = "Coming soon...",
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
    // Placeholder for now
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
    ) {
        Text(
            text = "Duel Details",
            style = MaterialTheme.typography.headlineMedium,
            color = FitFiColors.TextPrimary
        )
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
    // Placeholder for now
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
    ) {
        Text(
            text = "Health Monitor",
            style = MaterialTheme.typography.headlineMedium,
            color = FitFiColors.TextPrimary
        )
        Text(
            text = "Duel ID: $duelId",
            style = MaterialTheme.typography.bodyLarge,
            color = FitFiColors.TextSecondary
        )
    }
}

@Composable
fun UserSettingsScreen(
    onNavigateBack: () -> Unit
) {
    // Placeholder for now
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
    ) {
        Text(
            text = "User Settings",
            style = MaterialTheme.typography.headlineMedium,
            color = FitFiColors.TextPrimary
        )
        Text(
            text = "Coming soon...",
            style = MaterialTheme.typography.bodyLarge,
            color = FitFiColors.TextSecondary
        )
    }
}

@Composable
fun NetworkTestScreen(
    onNavigateBack: () -> Unit
) {
    // Placeholder for now
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
    ) {
        Text(
            text = "Network Test",
            style = MaterialTheme.typography.headlineMedium,
            color = FitFiColors.TextPrimary
        )
        Text(
            text = "Coming soon...",
            style = MaterialTheme.typography.bodyLarge,
            color = FitFiColors.TextSecondary
        )
    }
}

// Expanded duel card for the Active Duels screen
@Composable
private fun DuelCardExpanded(
    duel: Duel,
    onClick: () -> Unit
) {
    // This would be similar to the DuelCard from HomeScreen but with more details
    // For now, reusing the same component
    // In a real app, you'd create a more detailed version
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(FitFiColors.Background)
    ) {
        Text(
            text = "Expanded Duel Card",
            style = MaterialTheme.typography.titleMedium,
            color = FitFiColors.TextPrimary
        )
        Text(
            text = "VS ${duel.opponentName}",
            style = MaterialTheme.typography.bodyLarge,
            color = FitFiColors.TextSecondary
        )
    }
}
