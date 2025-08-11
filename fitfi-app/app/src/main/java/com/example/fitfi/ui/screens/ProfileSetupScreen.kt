package com.example.fitfi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.fitfi.ui.components.*
import com.example.fitfi.ui.theme.*

@Composable
fun ProfileSetupScreen(
    onNavigateToHome: () -> Unit
) {
    var displayName by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    // Mock user data
    val mockUser = remember {
        mapOf(
            "walletAddress" to "0x1234567890abcdef1234567890abcdef12345678",
            "role" to "User"
        )
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background)
            .verticalScroll(rememberScrollState())
            .padding(FitFiSpacing.lg),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(FitFiSpacing.xxl))
        
        // Header with welcome emoji
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(FitFiRadii.lg))
                    .background(FitFiColors.Primary),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "👋",
                    style = MaterialTheme.typography.headlineLarge
                )
            }
            
            Spacer(modifier = Modifier.height(FitFiSpacing.md))
            
            Text(
                text = "Welcome to FitFi!",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = FitFiColors.TextPrimary,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(FitFiSpacing.sm))
            
            Text(
                text = "Let's set up your profile",
                style = MaterialTheme.typography.bodyLarge,
                color = FitFiColors.TextSecondary,
                textAlign = TextAlign.Center
            )
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.xl))
        
        // Connected Wallet Info
        FitFiCard(variant = FitFiCardVariant.Highlight) {
            Text(
                text = "Connected Wallet:",
                style = MaterialTheme.typography.labelLarge.copy(
                    fontWeight = FontWeight.SemiBold
                ),
                color = FitFiColors.TextSecondary
            )
            
            Spacer(modifier = Modifier.height(FitFiSpacing.xs))
            
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(FitFiRadii.sm))
                    .background(FitFiColors.Surface)
                    .padding(FitFiSpacing.sm)
            ) {
                Text(
                    text = mockUser["walletAddress"] ?: "",
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace
                    ),
                    color = FitFiColors.TextPrimary
                )
            }
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.lg))
        
        // Display Name Input
        Column {
            FitFiInput(
                value = displayName,
                onValueChange = { 
                    displayName = it
                    errorMessage = null
                },
                placeholder = "Enter your name or nickname",
                label = "What should we call you?",
                isError = errorMessage != null,
                errorMessage = errorMessage,
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(FitFiSpacing.xs))
            
            Text(
                text = "This is how you'll appear to other users in challenges and leaderboards.",
                style = MaterialTheme.typography.bodySmall,
                color = FitFiColors.TextMuted
            )
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.lg))
        
        // Avatar Preview
        Box(
            modifier = Modifier
                .size(100.dp)
                .clip(RoundedCornerShape(FitFiRadii.lg))
                .background(FitFiColors.Primary),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = if (displayName.isNotEmpty()) {
                    displayName.take(2).uppercase()
                } else {
                    "👤"
                },
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = FitFiColors.TextPrimary
            )
        }
        
        Spacer(modifier = Modifier.weight(1f))
        
        // Privacy Note
        FitFiCard(variant = FitFiCardVariant.Base) {
            Text(
                text = "Privacy Note",
                style = MaterialTheme.typography.labelLarge.copy(
                    fontWeight = FontWeight.SemiBold
                ),
                color = FitFiColors.TextPrimary
            )
            
            Spacer(modifier = Modifier.height(FitFiSpacing.xs))
            
            Text(
                text = "Your wallet address is used for authentication and blockchain transactions. Your display name is only used within the app and can be changed anytime.",
                style = MaterialTheme.typography.bodySmall,
                color = FitFiColors.TextSecondary
            )
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.lg))
        
        // Save Button
        FitFiPrimaryButton(
            text = if (isLoading) "Saving..." else "Save & Continue",
            onClick = {
                if (displayName.isNotBlank()) {
                    if (displayName.length >= 2) {
                        isLoading = true
                        // Simulate profile setup
                        onNavigateToHome()
                    } else {
                        errorMessage = "Display name must be at least 2 characters"
                    }
                } else {
                    errorMessage = "Please enter a valid name"
                }
            },
            enabled = !isLoading,
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(FitFiSpacing.sm))
        
        // Skip Option
        TextButton(
            onClick = onNavigateToHome
        ) {
            Text(
                text = "Skip for Now",
                style = MaterialTheme.typography.bodyMedium,
                color = FitFiColors.TextMuted
            )
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.lg))
    }
}
