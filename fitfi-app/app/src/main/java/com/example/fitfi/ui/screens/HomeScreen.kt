package com.example.fitfi.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue
import androidx.navigation.NavHostController
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.fitfi.ui.components.*
import com.example.fitfi.ui.theme.*
import com.example.fitfi.navigation.Screen

private data class MockUser(
    val name: String,
    val level: Int,
    val todaySteps: Int,
    val stepGoal: Int,
    val totalSteps: Int,
    val activeDuels: Int,
    val totalEarnings: Double
)

private data class MockHealthStats(
    val calories: Int,
    val distance: Double,
    val activeMinutes: Int
)

private data class MockChallenge(
    val id: String,
    val title: String,
    val progress: Int,
    val reward: Int,
    val timeLeft: String
)

private data class MockDuel(
    val id: String,
    val opponent: String,
    val status: String,
    val reward: Int? = null,
    val stake: Int? = null,
    val mySteps: Int,
    val theirSteps: Int? = null,
    val timeLeft: String? = null,
    val date: String? = null
)

@Composable
fun HomeScreen(navController: NavHostController) {
    val mockUser = MockUser(
        name = "Alex Fitness",
        level = 12,
        todaySteps = 8420,
        stepGoal = 10000,
        totalSteps = 145230,
        activeDuels = 2,
        totalEarnings = 1250.5
    )
    
    val mockHealthStats = MockHealthStats(
        calories = 420,
        distance = 6.2,
        activeMinutes = 45
    )
    
    val mockActiveChallenges = listOf(
        MockChallenge("1", "10K Steps Daily", 84, 50, "2 days"),
        MockChallenge("2", "Weekend Warrior", 60, 100, "3 days")
    )
    
    val mockRecentDuels = listOf(
        MockDuel("1", "Sarah Runner", "won", reward = 75, mySteps = 12450, date = "2 hours ago"),
        MockDuel("2", "Mike Walker", "active", stake = 50, mySteps = 8420, theirSteps = 7890, timeLeft = "4h 23m")
    )
    
    val stepProgress = (mockUser.todaySteps.toFloat() / mockUser.stepGoal) * 100f

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(FitFiSpacing.md),
        verticalArrangement = Arrangement.spacedBy(FitFiSpacing.lg)
    ) {
        // Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column {
                    Text(
                        text = "Good morning! 👋",
                        style = MaterialTheme.typography.titleLarge,
                        color = FitFiColors.TextSecondary
                    )
                    Text(
                        text = mockUser.name,
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = FitFiColors.TextPrimary
                    )
                    FitFiBadge(
                        text = "Level ${mockUser.level}",
                        variant = FitFiBadgeVariant.Info
                    )
                }
                
                IconButton(
                    onClick = { navController.navigate(Screen.UserSettings.route) }
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = "Settings",
                        tint = FitFiColors.TextMuted,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
        
        // Today's Progress
        item {
            FitFiElevatedCard {
                Text(
                    text = "Today's Progress",
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.SemiBold
                    ),
                    color = FitFiColors.TextPrimary
                )
                
                Spacer(modifier = Modifier.height(FitFiSpacing.md))
                
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = mockUser.todaySteps.toString(),
                        style = MaterialTheme.typography.displayMedium.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = FitFiColors.Primary
                    )
                    Text(
                        text = "steps today",
                        style = MaterialTheme.typography.bodyLarge,
                        color = FitFiColors.TextSecondary
                    )
                    
                    Spacer(modifier = Modifier.height(FitFiSpacing.sm))
                    
                    FitFiMetricProgressBar(
                        current = mockUser.todaySteps.toFloat(),
                        target = mockUser.stepGoal.toFloat(),
                        label = "${stepProgress.toInt()}% of goal (${mockUser.stepGoal})",
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                
                Spacer(modifier = Modifier.height(FitFiSpacing.md))
                
                // Health Stats Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    HealthStatItem("${mockHealthStats.calories}", "Calories", "🔥")
                    HealthStatItem("${mockHealthStats.distance}", "km", "📏")
                    HealthStatItem("${mockHealthStats.activeMinutes}", "Active min", "⏱️")
                }
            }
        }
        
        // Active Challenges
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Active Challenges",
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.SemiBold
                    ),
                    color = FitFiColors.TextPrimary
                )
                TextButton(
                    onClick = { navController.navigate(Screen.Challenges.route) }
                ) {
                    Text(
                        text = "View All",
                        color = FitFiColors.Primary
                    )
                }
            }
        }
        
        items(mockActiveChallenges) { challenge ->
            FitFiCard {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = challenge.title,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.SemiBold
                        ),
                        color = FitFiColors.TextPrimary
                    )
                    FitFiBadge(
                        text = "+${challenge.reward} FF",
                        variant = FitFiBadgeVariant.Success
                    )
                }
                
                Spacer(modifier = Modifier.height(FitFiSpacing.sm))
                
                LinearProgressIndicator(
                    progress = { challenge.progress / 100f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = FitFiColors.Primary,
                    trackColor = FitFiColors.Border
                )
                
                Spacer(modifier = Modifier.height(FitFiSpacing.xs))
                
                Text(
                    text = "${challenge.progress}% • ${challenge.timeLeft} left",
                    style = MaterialTheme.typography.bodySmall,
                    color = FitFiColors.TextMuted
                )
            }
        }
        
        // Recent Duels
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent Duels",
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.SemiBold
                    ),
                    color = FitFiColors.TextPrimary
                )
                TextButton(
                    onClick = { navController.navigate(Screen.ActiveDuels.route) }
                ) {
                    Text(
                        text = "View All",
                        color = FitFiColors.Primary
                    )
                }
            }
        }
        
        items(mockRecentDuels) { duel ->
            FitFiCard(
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Text(
                        text = "vs ${duel.opponent}",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.SemiBold
                        ),
                        color = FitFiColors.TextPrimary
                    )
                    
                    FitFiStatusBadge(status = duel.status)
                }
                
                Spacer(modifier = Modifier.height(FitFiSpacing.sm))
                
                when (duel.status) {
                    "won" -> {
                        Text(
                            text = "${duel.mySteps} steps",
                            style = MaterialTheme.typography.bodyMedium,
                            color = FitFiColors.TextSecondary
                        )
                        Text(
                            text = "+${duel.reward} FF earned",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.SemiBold
                            ),
                            color = FitFiColors.Success
                        )
                        duel.date?.let {
                            Text(
                                text = it,
                                style = MaterialTheme.typography.bodySmall,
                                color = FitFiColors.TextMuted
                            )
                        }
                    }
                    "active" -> {
                        Text(
                            text = "You: ${duel.mySteps} • Them: ${duel.theirSteps ?: 0}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = FitFiColors.TextSecondary
                        )
                        duel.timeLeft?.let {
                            Text(
                                text = "$it remaining",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    fontWeight = FontWeight.Medium
                                ),
                                color = FitFiColors.Warning
                            )
                        }
                    }
                }
            }
        }
        
        // Quick Actions
        item {
            Text(
                text = "Quick Actions",
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.SemiBold
                ),
                color = FitFiColors.TextPrimary
            )
        }
        
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(FitFiSpacing.sm)
            ) {
                FitFiCard(
                    modifier = Modifier.weight(1f)
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "🏃",
                            style = MaterialTheme.typography.headlineMedium
                        )
                        Spacer(modifier = Modifier.height(FitFiSpacing.xs))
                        Text(
                            text = "Find Opponents",
                            style = MaterialTheme.typography.labelLarge.copy(
                                fontWeight = FontWeight.SemiBold
                            ),
                            color = FitFiColors.TextPrimary
                        )
                    }
                }
                
                FitFiCard(
                    modifier = Modifier.weight(1f)
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "🎯",
                            style = MaterialTheme.typography.headlineMedium
                        )
                        Spacer(modifier = Modifier.height(FitFiSpacing.xs))
                        Text(
                            text = "Browse Challenges",
                            style = MaterialTheme.typography.labelLarge.copy(
                                fontWeight = FontWeight.SemiBold
                            ),
                            color = FitFiColors.TextPrimary
                        )
                    }
                }
            }
        }
        
        // Debug Panel (Development only)
        item {
            val isInInspectionMode by remember { mutableStateOf(false) } // Or use BuildConfig.DEBUG
            if (isInInspectionMode) {
                FitFiCard(variant = FitFiCardVariant.Base) {
                    Text(
                        text = "Debug Panel",
                        style = MaterialTheme.typography.labelLarge.copy(
                            fontWeight = FontWeight.SemiBold
                        ),
                        color = FitFiColors.TextSecondary
                    )
                    
                    Spacer(modifier = Modifier.height(FitFiSpacing.sm))
                    
                    FitFiSecondaryButton(
                        text = "Network Test",
                        onClick = { navController.navigate(Screen.NetworkTest.route) },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    }
}

@Composable
private fun HealthStatItem(
    value: String,
    label: String,
    icon: String
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = icon,
            style = MaterialTheme.typography.titleMedium
        )
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
