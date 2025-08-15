package com.example.fitfi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.example.fitfi.ui.components.*
import com.example.fitfi.ui.theme.*

private data class ChallengeUI(
    val id: String,
    val title: String,
    val description: String,
    val type: String, // daily | weekly | custom
    val duration: String,
    val stake: Int,
    val maxParticipants: Int,
    val currentParticipants: Int,
    val reward: Int,
    val difficulty: String, // easy | medium | hard
    val requirements: List<String>,
    val featured: Boolean = false
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChallengesScreen(
    navController: NavHostController,
    onBack: () -> Unit = { navController.popBackStack() }
) {
    var selectedFilter by remember { mutableStateOf("all") }

    val challenges = remember {
        listOf(
            ChallengeUI(
                id = "1",
                title = "10K Daily Steps",
                description = "Walk 10,000 steps every day for a week",
                type = "daily",
                duration = "7 days",
                stake = 50,
                maxParticipants = 100,
                currentParticipants = 67,
                reward = 100,
                difficulty = "easy",
                requirements = listOf("10,000 steps daily", "No rest days", "Auto-tracking only"),
                featured = true
            ),
            ChallengeUI(
                id = "2",
                title = "Weekend Warrior",
                description = "Complete 20K steps each day during the weekend",
                type = "weekly",
                duration = "2 days",
                stake = 75,
                maxParticipants = 50,
                currentParticipants = 23,
                reward = 150,
                difficulty = "medium",
                requirements = listOf("20,000 steps Sat", "20,000 steps Sun", "Weekend only")
            ),
            ChallengeUI(
                id = "3",
                title = "Marathon Month",
                description = "Walk a marathon distance over 30 days",
                type = "custom",
                duration = "30 days",
                stake = 200,
                maxParticipants = 25,
                currentParticipants = 8,
                reward = 500,
                difficulty = "hard",
                requirements = listOf("42.2 km total", "Within 30 days", "Min 1km per day"),
                featured = true
            ),
            ChallengeUI(
                id = "4",
                title = "Morning Jogger",
                description = "5K steps before 9 AM for 5 consecutive days",
                type = "daily",
                duration = "5 days",
                stake = 30,
                maxParticipants = 200,
                currentParticipants = 145,
                reward = 60,
                difficulty = "easy",
                requirements = listOf("5,000 steps by 9 AM", "5 consecutive days", "Early bird bonus")
            )
        )
    }

    val filters = listOf(
        "all" to "All",
        "daily" to "Daily",
        "weekly" to "Weekly",
        "custom" to "Custom"
    )

    val filtered = challenges.filter { selectedFilter == "all" || it.type == selectedFilter }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background)
    ) {
        TopAppBar(
            title = {
                Text(
                    text = "Challenges",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.SemiBold),
                    color = FitFiColors.TextPrimary
                )
            },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = FitFiColors.Primary
                    )
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = FitFiColors.Background)
        )

        // Filters
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = FitFiSpacing.md, vertical = FitFiSpacing.sm),
            horizontalArrangement = Arrangement.spacedBy(FitFiSpacing.xs)
        ) {
            filters.forEach { (key, label) ->
                val selected = selectedFilter == key
                FilterChip(
                    selected = selected,
                    onClick = { selectedFilter = key },
                    label = { Text(label) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = FitFiColors.Primary,
                        selectedLabelColor = FitFiColors.TextPrimary,
                        containerColor = FitFiColors.SurfaceAlt,
                        labelColor = FitFiColors.TextSecondary
                    )
                )
            }
        }

        if (filtered.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "🎯",
                        style = MaterialTheme.typography.displaySmall
                    )
                    Spacer(Modifier.height(FitFiSpacing.sm))
                    Text(
                        text = "No Challenges Found",
                        style = MaterialTheme.typography.titleMedium,
                        color = FitFiColors.TextPrimary
                    )
                    Spacer(Modifier.height(FitFiSpacing.xs))
                    Text(
                        text = "Try a different filter or check back later",
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
                items(filtered, key = { it.id }) { challenge ->
                    ChallengeCard(challenge = challenge)
                }
            }
        }
    }
}

@Composable
private fun ChallengeCard(challenge: ChallengeUI) {
    FitFiCard(
        modifier = Modifier.fillMaxWidth(),
        variant = if (challenge.featured) FitFiCardVariant.Highlight else FitFiCardVariant.Base
    ) {
        if (challenge.featured) {
            FitFiBadge(
                text = "FEATURED",
                modifier = Modifier.align(Alignment.End),
                variant = FitFiBadgeVariant.Custom,
                customBackgroundColor = FitFiColors.Primary,
                customTextColor = FitFiColors.TextPrimary
            )
            Spacer(Modifier.height(FitFiSpacing.sm))
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = challenge.title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = FitFiColors.TextPrimary
                )
                Spacer(Modifier.height(FitFiSpacing.xs))
                Text(
                    text = challenge.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = FitFiColors.TextSecondary
                )
            }
            DifficultyBadge(challenge.difficulty)
        }

        Spacer(Modifier.height(FitFiSpacing.md))

        // Meta rows
        MetaRow(label = "Duration", value = challenge.duration)
        MetaRow(label = "Stake", value = "${challenge.stake} FF")
        MetaRow(label = "Reward", value = "${challenge.reward} FF", highlight = true)

        Spacer(Modifier.height(FitFiSpacing.sm))

        // Participation
        val participationRate = (challenge.currentParticipants * 100f / challenge.maxParticipants).coerceAtMost(100f)
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "${challenge.currentParticipants}/${challenge.maxParticipants} participants",
                    style = MaterialTheme.typography.bodySmall,
                    color = FitFiColors.TextSecondary
                )
                Text(
                    text = "${participationRate.toInt()}% full",
                    style = MaterialTheme.typography.bodySmall,
                    color = FitFiColors.TextPrimary
                )
            }
            Spacer(Modifier.height(FitFiSpacing.xs))
            LinearProgressIndicator(
                progress = { participationRate / 100f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp),
                color = if (participationRate >= 100f) FitFiColors.Error else FitFiColors.Primary,
                trackColor = FitFiColors.Border
            )
        }

        Spacer(Modifier.height(FitFiSpacing.md))

        Text(
            text = "Requirements:",
            style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.SemiBold),
            color = FitFiColors.TextPrimary
        )
        Spacer(Modifier.height(FitFiSpacing.xs))
        challenge.requirements.forEach { req ->
            Text(
                text = "• $req",
                style = MaterialTheme.typography.bodySmall,
                color = FitFiColors.TextSecondary
            )
        }

        Spacer(Modifier.height(FitFiSpacing.md))

        val full = participationRate >= 100f
        FitFiPrimaryButton(
            text = if (full) "Challenge Full" else "Join (${challenge.stake} FF)",
            onClick = { /* TODO integrate backend / contracts */ },
            enabled = !full,
            modifier = Modifier.fillMaxWidth(),
            size = FitFiButtonSize.Medium
        )
    }
}

@Composable
private fun MetaRow(label: String, value: String, highlight: Boolean = false) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = FitFiColors.TextSecondary
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
            color = if (highlight) FitFiColors.Primary else FitFiColors.TextPrimary
        )
    }
}

@Composable
private fun DifficultyBadge(difficulty: String) {
    val (emoji, color) = when (difficulty.lowercase()) {
        "easy" -> "🟢" to FitFiColors.Success
        "medium" -> "🟡" to FitFiColors.Warning
        "hard" -> "🔴" to FitFiColors.Error
        else -> "⚪" to FitFiColors.TextMuted
    }
    FitFiBadge(
        text = "$emoji ${difficulty.uppercase()}",
        variant = FitFiBadgeVariant.Custom,
        customBackgroundColor = color,
        customTextColor = FitFiColors.Background
    )
}
