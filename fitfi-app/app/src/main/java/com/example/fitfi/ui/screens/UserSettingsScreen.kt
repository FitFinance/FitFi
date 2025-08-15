package com.example.fitfi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserSettingsScreen(
    navController: NavHostController
) {
    var showLogoutDialog by remember { mutableStateOf(false) }
    var showDeleteDialog by remember { mutableStateOf(false) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background)
    ) {
        TopAppBar(
            title = {
                Text(
                    text = "Profile & Settings",
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
            contentPadding = PaddingValues(horizontal = FitFiSpacing.md, vertical = FitFiSpacing.sm),
            verticalArrangement = Arrangement.spacedBy(FitFiSpacing.md)
        ) {
            // Profile Section
            item {
                FitFiCard {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Avatar
                        Box(
                            modifier = Modifier
                                .size(60.dp)
                                .clip(CircleShape)
                                .background(FitFiColors.Primary),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "👤",
                                style = MaterialTheme.typography.headlineMedium
                            )
                        }
                        
                        Spacer(modifier = Modifier.width(FitFiSpacing.md))
                        
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "FitFi User",
                                style = MaterialTheme.typography.titleLarge.copy(
                                    fontWeight = FontWeight.Bold
                                ),
                                color = FitFiColors.TextPrimary
                            )
                            Text(
                                text = "0x1234...5678",
                                style = MaterialTheme.typography.bodyMedium,
                                color = FitFiColors.TextSecondary
                            )
                            Text(
                                text = "Core Testnet",
                                style = MaterialTheme.typography.bodySmall,
                                color = FitFiColors.Accent
                            )
                        }
                        
                        IconButton(onClick = { /* Edit profile */ }) {
                            Icon(
                                Icons.Default.Edit,
                                contentDescription = "Edit Profile",
                                tint = FitFiColors.Primary
                            )
                        }
                    }
                }
            }
            
            // Wallet Section
            item {
                SettingsSection(title = "Wallet & Blockchain") {
                    SettingsItem(
                        icon = Icons.Default.AccountBalanceWallet,
                        title = "Wallet Address",
                        subtitle = "0x1234567890abcdef1234567890abcdef12345678",
                        onClick = { /* Copy address */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.Link,
                        title = "Network",
                        subtitle = "Core Testnet",
                        onClick = { /* Change network */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.Token,
                        title = "Token Balance",
                        subtitle = "1,250 FF",
                        onClick = { /* View transactions */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.Refresh,
                        title = "Sync Wallet",
                        subtitle = "Last synced: Just now",
                        onClick = { /* Sync wallet */ }
                    )
                }
            }
            
            // Health & Fitness Section
            item {
                SettingsSection(title = "Health & Fitness") {
                    SettingsItem(
                        icon = Icons.Default.FitnessCenter,
                        title = "Health Data",
                        subtitle = "Manage connected health apps",
                        onClick = { /* Health data settings */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.DirectionsRun,
                        title = "Activity Tracking",
                        subtitle = "Steps, distance, calories",
                        onClick = { /* Activity settings */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.Notifications,
                        title = "Fitness Reminders",
                        subtitle = "Daily goals and challenges",
                        onClick = { /* Notification settings */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.Timeline,
                        title = "Goal Settings",
                        subtitle = "Daily step goal: 10,000",
                        onClick = { /* Goal settings */ }
                    )
                }
            }
            
            // Privacy & Security Section
            item {
                SettingsSection(title = "Privacy & Security") {
                    SettingsItem(
                        icon = Icons.Default.Visibility,
                        title = "Profile Visibility",
                        subtitle = "Public profile",
                        onClick = { /* Privacy settings */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.Security,
                        title = "Data Sharing",
                        subtitle = "Manage data permissions",
                        onClick = { /* Data settings */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.Lock,
                        title = "Biometric Lock",
                        subtitle = "Secure app with fingerprint",
                        onClick = { /* Security settings */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.History,
                        title = "Activity History",
                        subtitle = "View and manage your data",
                        onClick = { /* History settings */ }
                    )
                }
            }
            
            // App Settings Section
            item {
                SettingsSection(title = "App Settings") {
                    SettingsItem(
                        icon = Icons.Default.NotificationsActive,
                        title = "Notifications",
                        subtitle = "Push notifications enabled",
                        onClick = { /* Notification settings */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.Palette,
                        title = "Theme",
                        subtitle = "Dark mode",
                        onClick = { /* Theme settings */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.Language,
                        title = "Language",
                        subtitle = "English",
                        onClick = { /* Language settings */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.Storage,
                        title = "Storage",
                        subtitle = "12.3 MB used",
                        onClick = { /* Storage settings */ }
                    )
                }
            }
            
            // Support Section
            item {
                SettingsSection(title = "Support & About") {
                    SettingsItem(
                        icon = Icons.Default.Help,
                        title = "Help Center",
                        subtitle = "FAQs and guides",
                        onClick = { /* Help center */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.ContactSupport,
                        title = "Contact Support",
                        subtitle = "Get help from our team",
                        onClick = { /* Contact support */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.Description,
                        title = "Terms & Privacy",
                        subtitle = "Legal documents",
                        onClick = { /* Terms and privacy */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.Info,
                        title = "About FitFi",
                        subtitle = "Version 1.0.0 (Beta)",
                        onClick = { /* About app */ }
                    )
                }
            }
            
            // Account Actions Section
            item {
                SettingsSection(title = "Account", isWarning = true) {
                    SettingsItem(
                        icon = Icons.Default.Logout,
                        title = "Sign Out",
                        subtitle = "Sign out of your account",
                        onClick = { showLogoutDialog = true },
                        isWarning = true
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.DeleteForever,
                        title = "Delete Account",
                        subtitle = "Permanently delete your account",
                        onClick = { showDeleteDialog = true },
                        isDanger = true
                    )
                }
            }
            
            // Footer space
            item {
                Spacer(modifier = Modifier.height(FitFiSpacing.lg))
            }
        }
    }
    
    // Logout Confirmation Dialog
    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = {
                Text(
                    text = "Sign Out",
                    color = FitFiColors.TextPrimary
                )
            },
            text = {
                Text(
                    text = "Are you sure you want to sign out? You'll need to reconnect your wallet to access your account.",
                    color = FitFiColors.TextSecondary
                )
            },
            confirmButton = {
                FitFiPrimaryButton(
                    text = "Sign Out",
                    onClick = {
                        showLogoutDialog = false
                        // Handle logout
                    }
                )
            },
            dismissButton = {
                FitFiSecondaryButton(
                    text = "Cancel",
                    onClick = { showLogoutDialog = false }
                )
            },
            containerColor = FitFiColors.Surface
        )
    }
    
    // Delete Account Confirmation Dialog
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = {
                Text(
                    text = "Delete Account",
                    color = FitFiColors.Error
                )
            },
            text = {
                Text(
                    text = "This action cannot be undone. All your data, including duel history and tokens, will be permanently deleted.",
                    color = FitFiColors.TextSecondary
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showDeleteDialog = false
                        // Handle account deletion
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = FitFiColors.Error
                    )
                ) {
                    Text("Delete Account")
                }
            },
            dismissButton = {
                FitFiSecondaryButton(
                    text = "Cancel",
                    onClick = { showDeleteDialog = false }
                )
            },
            containerColor = FitFiColors.Surface
        )
    }
}

@Composable
private fun SettingsSection(
    title: String,
    isWarning: Boolean = false,
    content: @Composable ColumnScope.() -> Unit
) {
    Column {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.Bold
            ),
            color = if (isWarning) FitFiColors.Warning else FitFiColors.TextPrimary,
            modifier = Modifier.padding(bottom = FitFiSpacing.sm)
        )
        
        FitFiCard {
            Column {
                content()
            }
        }
    }
}

@Composable
private fun SettingsItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit,
    isWarning: Boolean = false,
    isDanger: Boolean = false
) {
    Surface(
        onClick = onClick,
        color = androidx.compose.ui.graphics.Color.Transparent,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = FitFiSpacing.sm),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = when {
                    isDanger -> FitFiColors.Error
                    isWarning -> FitFiColors.Warning
                    else -> FitFiColors.Primary
                },
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(FitFiSpacing.md))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyLarge.copy(
                        fontWeight = FontWeight.Medium
                    ),
                    color = when {
                        isDanger -> FitFiColors.Error
                        isWarning -> FitFiColors.Warning
                        else -> FitFiColors.TextPrimary
                    }
                )
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = FitFiColors.TextSecondary
                )
            }
            
            Icon(
                Icons.Default.ChevronRight,
                contentDescription = "Navigate",
                tint = FitFiColors.TextMuted,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}
