package com.example.fitfi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.EmojiFlags
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Paid
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.example.fitfi.data.models.*
import com.example.fitfi.ui.components.*
import com.example.fitfi.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExploreScreen(
    navController: NavHostController
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf("All") }
    
    // Sample data
    val challenges = listOf(
        Challenge(
            id = "1",
            title = "10K Steps Challenge",
            description = "First to reach 10,000 steps wins the pot!",
            metric = "steps",
            target = 10000f,
            duration = 86400000, // 24 hours
            participants = 3,
            maxParticipants = 5,
            stake = 50,
            createdBy = "FitnessPro",
            isPublic = true
        ),
        Challenge(
            id = "2",
            title = "Calorie Burn Sprint",
            description = "30-minute calorie burning competition",
            metric = "calories",
            target = 300f,
            duration = 1800000, // 30 minutes
            participants = 1,
            maxParticipants = 2,
            stake = 25,
            createdBy = "BurnItUp",
            isPublic = true
        ),
        Challenge(
            id = "3",
            title = "5K Distance Run",
            description = "Virtual 5K race - first to finish wins",
            metric = "distance",
            target = 5000f,
            duration = 3600000, // 1 hour
            participants = 8,
            maxParticipants = 10,
            stake = 100,
            createdBy = "RunnerClub",
            isPublic = true
        )
    )
    
    val filterChips = listOf("All", "Steps", "Calories", "Distance")
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background)
    ) {
        // Header
        TopAppBar(
            title = {
                Text(
                    text = "Explore Challenges",
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
        
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(FitFiSpacing.lg),
            verticalArrangement = Arrangement.spacedBy(FitFiSpacing.md)
        ) {
            // Search Bar
            item {
                FitFiInput(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = "Search challenges...",
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = null,
                            tint = FitFiColors.TextMuted,
                            modifier = Modifier.size(20.dp)
                        )
                    },
                    modifier = Modifier.fillMaxWidth()
                )
            }
            
            // Filter Chips
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(FitFiSpacing.sm),
                    contentPadding = PaddingValues(horizontal = FitFiSpacing.xs)
                ) {
                    items(filterChips) { filter ->
                        FilterChip(
                            selected = selectedFilter == filter,
                            onClick = { selectedFilter = filter },
                            label = {
                                Text(
                                    text = filter,
                                    style = MaterialTheme.typography.bodySmall
                                )
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = FitFiColors.Primary,
                                selectedLabelColor = FitFiColors.TextPrimary,
                                containerColor = FitFiColors.SurfaceAlt,
                                labelColor = FitFiColors.TextSecondary
                            )
                        )
                    }
                }
            }
            
            // Challenge List
            items(challenges.filter { challenge ->
                val matchesSearch = searchQuery.isEmpty() || 
                    challenge.title.contains(searchQuery, ignoreCase = true) ||
                    challenge.description.contains(searchQuery, ignoreCase = true)
                
                val matchesFilter = selectedFilter == "All" || 
                    challenge.metric.equals(selectedFilter, ignoreCase = true)
                
                matchesSearch && matchesFilter
            }) { challenge ->
                ChallengeCard(
                    challenge = challenge,
                    onJoinChallenge = {
                        // Handle joining challenge
                        // In real app, make API call
                    }
                )
            }
            
            // Empty state
            if (challenges.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = null,
                                tint = FitFiColors.TextMuted,
                                modifier = Modifier.size(48.dp)
                            )
                            
                            Spacer(modifier = Modifier.height(FitFiSpacing.md))
                            
                            Text(
                                text = "No challenges found",
                                style = MaterialTheme.typography.titleMedium,
                                color = FitFiColors.TextSecondary
                            )
                            
                            Text(
                                text = "Try adjusting your search or filter",
                                style = MaterialTheme.typography.bodyMedium,
                                color = FitFiColors.TextMuted
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ChallengeCard(
    challenge: Challenge,
    onJoinChallenge: () -> Unit
) {
    FitFiElevatedCard(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = challenge.title,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.SemiBold
                        ),
                        color = FitFiColors.TextPrimary
                    )
                    
                    Spacer(modifier = Modifier.height(FitFiSpacing.xs))
                    
                    Text(
                        text = challenge.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = FitFiColors.TextSecondary
                    )
                }
                
                FitFiBadge(
                    text = challenge.metric.uppercase(),
                    variant = FitFiBadgeVariant.Info
                )
            }
            
            Spacer(modifier = Modifier.height(FitFiSpacing.md))
            
            // Challenge details
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(FitFiSpacing.lg)
            ) {
                ChallengeDetail(
                    icon = Icons.Default.EmojiFlags,
                    label = "Target",
                    value = "${challenge.target.toInt()} ${getMetricUnit(challenge.metric)}"
                )
                
                ChallengeDetail(
                    icon = Icons.Default.Timer,
                    label = "Duration",
                    value = formatDuration(challenge.duration)
                )
                
                ChallengeDetail(
                    icon = Icons.Default.People,
                    label = "Participants",
                    value = "${challenge.participants}/${challenge.maxParticipants}"
                )
            }
            
            Spacer(modifier = Modifier.height(FitFiSpacing.md))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Paid,
                        contentDescription = null,
                        tint = FitFiColors.Accent,
                        modifier = Modifier.size(16.dp)
                    )
                    
                    Spacer(modifier = Modifier.width(FitFiSpacing.xs))
                    
                    Text(
                        text = "${challenge.stake} tokens stake",
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontWeight = FontWeight.Medium
                        ),
                        color = FitFiColors.Accent
                    )
                }
                
                FitFiPrimaryButton(
                    text = if (challenge.participants >= challenge.maxParticipants) "Full" else "Join",
                    onClick = onJoinChallenge,
                    enabled = challenge.participants < challenge.maxParticipants,
                    size = FitFiButtonSize.Small
                )
            }
        }
    }
}

@Composable
private fun ChallengeDetail(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String
) {
    Row(
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = FitFiColors.TextMuted,
            modifier = Modifier.size(16.dp)
        )
        
        Spacer(modifier = Modifier.width(FitFiSpacing.xs))
        
        Column {
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = FitFiColors.TextMuted
            )
            Text(
                text = value,
                style = MaterialTheme.typography.bodySmall.copy(
                    fontWeight = FontWeight.Medium
                ),
                color = FitFiColors.TextSecondary
            )
        }
    }
}

private fun getMetricUnit(metric: String): String {
    return when (metric.lowercase()) {
        "steps" -> "steps"
        "calories" -> "cal"
        "distance" -> "m"
        else -> ""
    }
}

private fun formatDuration(durationMs: Long): String {
    val hours = durationMs / (1000 * 60 * 60)
    val minutes = (durationMs % (1000 * 60 * 60)) / (1000 * 60)
    
    return when {
        hours >= 24 -> "${hours / 24}d"
        hours > 0 -> "${hours}h"
        minutes > 0 -> "${minutes}m"
        else -> "< 1m"
    }
}
