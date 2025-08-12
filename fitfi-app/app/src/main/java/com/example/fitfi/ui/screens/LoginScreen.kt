package com.example.fitfi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Wallet
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
fun LoginScreen(
    onNavigateToConnectWallet: () -> Unit,
    onNavigateToHome: () -> Unit
) {
    val viewModel = remember { com.example.fitfi.ui.viewmodel.AuthViewModel() }
    val uiState by viewModel.uiState.collectAsState()
    val isLoading = uiState.isLoading
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background)
            .verticalScroll(rememberScrollState())
            .padding(FitFiSpacing.lg),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(FitFiSpacing.xxl))
        
        // Header with logo
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .clip(RoundedCornerShape(FitFiRadii.lg))
                    .background(FitFiColors.Primary),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "FF",
                    style = MaterialTheme.typography.displayMedium.copy(
                        fontWeight = FontWeight.ExtraBold
                    ),
                    color = FitFiColors.TextPrimary
                )
            }
            
            Spacer(modifier = Modifier.height(FitFiSpacing.md))
            
            Text(
                text = "FitFi",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = FitFiColors.TextPrimary
            )
            
            Spacer(modifier = Modifier.height(FitFiSpacing.sm))
            
            Text(
                text = "Sign in with your wallet",
                style = MaterialTheme.typography.bodyLarge,
                color = FitFiColors.TextSecondary,
                textAlign = TextAlign.Center
            )
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.xxl))
        
        // Description
        FitFiCard {
            Text(
                text = "Gasless message signature – no funds moved.",
                style = MaterialTheme.typography.bodyMedium,
                color = FitFiColors.TextSecondary,
                textAlign = TextAlign.Center
            )
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.lg))
        
        // Connect MetaMask Button
        FitFiButton(
            onClick = { viewModel.connectAndAuthenticate { onNavigateToHome() } },
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLoading,
            variant = FitFiButtonVariant.Primary
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(16.dp),
                    color = FitFiColors.TextPrimary,
                    strokeWidth = 2.dp
                )
                Spacer(modifier = Modifier.width(FitFiSpacing.xs))
                Text("Connecting...")
            } else {
                Text("🔗")
                Spacer(modifier = Modifier.width(FitFiSpacing.xs))
                Text("Connect Wallet")
            }
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.md))
        
        // Use Another Wallet Button
        FitFiSecondaryButton(
            text = "Use Another Wallet",
            onClick = onNavigateToConnectWallet,
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(FitFiSpacing.lg))
        
        // Info Section
        FitFiCard(variant = FitFiCardVariant.Highlight) {
            Text(
                text = "Need a wallet?",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.SemiBold
                ),
                color = FitFiColors.TextPrimary
            )
            Spacer(modifier = Modifier.height(FitFiSpacing.xs))
            Text(
                text = "Install MetaMask, then tap Connect.",
                style = MaterialTheme.typography.bodySmall,
                color = FitFiColors.TextSecondary
            )
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.xl))
        
        // Development Section
        if (uiState.error != null) {
            FitFiCard(variant = FitFiCardVariant.Base) {
                Text(
                    text = uiState.error ?: "",
                    style = MaterialTheme.typography.bodySmall,
                    color = FitFiColors.Error
                )
            }
            Spacer(modifier = Modifier.height(FitFiSpacing.md))
        }
    }
}
