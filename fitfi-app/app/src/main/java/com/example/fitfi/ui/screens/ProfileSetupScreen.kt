package com.example.fitfi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background)
            .verticalScroll(rememberScrollState())
            .padding(FitFiSpacing.lg),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(FitFiSpacing.xxl))
        
        // Header
        Text(
            text = "Set Up Profile",
            style = MaterialTheme.typography.headlineLarge.copy(
                fontWeight = FontWeight.Bold
            ),
            color = FitFiColors.TextPrimary,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(FitFiSpacing.md))
        
        Text(
            text = "Let's personalize your FitFi experience",
            style = MaterialTheme.typography.bodyLarge,
            color = FitFiColors.TextSecondary,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(FitFiSpacing.xxl))
        
        // Avatar Placeholder
        Card(
            modifier = Modifier.size(100.dp),
            colors = CardDefaults.cardColors(
                containerColor = FitFiColors.SurfaceAlt
            )
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
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
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.lg))
        
        // Display Name Input
        FitFiInput(
            value = displayName,
            onValueChange = { 
                displayName = it
                errorMessage = null
            },
            placeholder = "Enter your display name",
            label = "Display Name",
            isError = errorMessage != null,
            errorMessage = errorMessage,
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(FitFiSpacing.sm))
        
        Text(
            text = "You can change this later in settings",
            style = MaterialTheme.typography.bodySmall,
            color = FitFiColors.TextMuted,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.weight(1f))
        
        // Continue Button
        FitFiPrimaryButton(
            text = if (isLoading) "Setting up..." else "Continue",
            onClick = {
                if (displayName.isNotBlank()) {
                    if (displayName.length >= 2) {
                        isLoading = true
                        // Simulate profile setup
                        // In real app, make API call here
                        onNavigateToHome()
                    } else {
                        errorMessage = "Display name must be at least 2 characters"
                    }
                } else {
                    errorMessage = "Please enter a display name"
                }
            },
            enabled = !isLoading,
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(FitFiSpacing.md))
        
        // Skip Option
        TextButton(
            onClick = onNavigateToHome
        ) {
            Text(
                text = "Skip for now",
                style = MaterialTheme.typography.bodyMedium,
                color = FitFiColors.TextMuted
            )
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.lg))
    }
}
