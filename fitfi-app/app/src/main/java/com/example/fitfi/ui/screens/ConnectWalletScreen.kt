package com.example.fitfi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Wallet
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.fitfi.ui.components.*
import com.example.fitfi.ui.theme.*

enum class WalletConnectionState {
    Idle, Connecting, Signing, Error
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConnectWalletScreen(
    onNavigateBack: () -> Unit,
    onNavigateToProfileSetup: () -> Unit,
    onNavigateToHome: () -> Unit
) {
    var connectionState by remember { mutableStateOf(WalletConnectionState.Idle) }
    var selectedWallet by remember { mutableStateOf<String?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background)
    ) {
        // Header
        TopAppBar(
            title = {
                Text(
                    text = "Connect Wallet",
                    style = MaterialTheme.typography.headlineSmall.copy(
                        fontWeight = FontWeight.SemiBold
                    ),
                    color = FitFiColors.TextPrimary
                )
            },
            navigationIcon = {
                IconButton(
                    onClick = onNavigateBack
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = FitFiColors.TextPrimary
                    )
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = FitFiColors.Background
            )
        )
        
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(FitFiSpacing.lg),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(FitFiSpacing.md))
            
            Text(
                text = "Choose your preferred wallet to get started with FitFi",
                style = MaterialTheme.typography.bodyLarge,
                color = FitFiColors.TextSecondary,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(FitFiSpacing.xxl))
            
            // Wallet Options
            Column(
                verticalArrangement = Arrangement.spacedBy(FitFiSpacing.md)
            ) {
                WalletOption(
                    name = "MetaMask",
                    description = "Most popular Ethereum wallet",
                    isSelected = selectedWallet == "metamask",
                    isLoading = connectionState == WalletConnectionState.Connecting && selectedWallet == "metamask",
                    isEnabled = connectionState == WalletConnectionState.Idle,
                    onClick = {
                        selectedWallet = "metamask"
                        connectionState = WalletConnectionState.Connecting
                        // Simulate connection process
                        // In real app, integrate with MetaMask SDK
                        onNavigateToHome()
                    }
                )
                
                WalletOption(
                    name = "WalletConnect",
                    description = "Connect to multiple wallet providers",
                    isSelected = selectedWallet == "walletconnect",
                    isLoading = connectionState == WalletConnectionState.Connecting && selectedWallet == "walletconnect",
                    isEnabled = connectionState == WalletConnectionState.Idle,
                    onClick = {
                        selectedWallet = "walletconnect"
                        connectionState = WalletConnectionState.Connecting
                        // Simulate connection process
                        onNavigateToHome()
                    }
                )
                
                WalletOption(
                    name = "Trust Wallet",
                    description = "Secure mobile wallet via WalletConnect",
                    isSelected = selectedWallet == "trust",
                    isLoading = connectionState == WalletConnectionState.Connecting && selectedWallet == "trust",
                    isEnabled = connectionState == WalletConnectionState.Idle,
                    onClick = {
                        selectedWallet = "trust"
                        connectionState = WalletConnectionState.Connecting
                        onNavigateToHome()
                    }
                )
                
                WalletOption(
                    name = "Coinbase Wallet",
                    description = "Easy-to-use wallet from Coinbase",
                    isSelected = selectedWallet == "coinbase",
                    isLoading = connectionState == WalletConnectionState.Connecting && selectedWallet == "coinbase",
                    isEnabled = connectionState == WalletConnectionState.Idle,
                    onClick = {
                        selectedWallet = "coinbase"
                        connectionState = WalletConnectionState.Connecting
                        onNavigateToHome()
                    }
                )
            }
            
            Spacer(modifier = Modifier.height(FitFiSpacing.xl))
            
            // Info Card
            FitFiCard {
                Column {
                    Text(
                        text = "Why connect a wallet?",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.SemiBold
                        ),
                        color = FitFiColors.TextPrimary
                    )
                    
                    Spacer(modifier = Modifier.height(FitFiSpacing.sm))
                    
                    Text(
                        text = "• Secure authentication without passwords\n• Earn and manage tokens from duels\n• Participate in the FitFi ecosystem\n• Own your fitness achievements on-chain",
                        style = MaterialTheme.typography.bodyMedium,
                        color = FitFiColors.TextSecondary
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(FitFiSpacing.lg))
            
            // Alternative login
            TextButton(
                onClick = onNavigateBack
            ) {
                Text(
                    text = "Login with OTP Instead",
                    style = MaterialTheme.typography.bodyMedium,
                    color = FitFiColors.Primary
                )
            }
            
            // Error handling
            if (errorMessage != null) {
                Spacer(modifier = Modifier.height(FitFiSpacing.md))
                FitFiCard(variant = FitFiCardVariant.Base) {
                    Text(
                        text = errorMessage!!,
                        style = MaterialTheme.typography.bodyMedium,
                        color = FitFiColors.Error
                    )
                    
                    Spacer(modifier = Modifier.height(FitFiSpacing.sm))
                    
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(FitFiSpacing.sm)
                    ) {
                        FitFiSecondaryButton(
                            text = "Try Again",
                            onClick = {
                                errorMessage = null
                                connectionState = WalletConnectionState.Idle
                                selectedWallet = null
                            },
                            size = FitFiButtonSize.Small
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun WalletOption(
    name: String,
    description: String,
    isSelected: Boolean,
    isLoading: Boolean,
    isEnabled: Boolean,
    onClick: () -> Unit
) {
    FitFiCard(
        variant = if (isSelected) FitFiCardVariant.Highlight else FitFiCardVariant.Base,
        modifier = Modifier
            .fillMaxWidth()
            .clickable(enabled = isEnabled) { onClick() }
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Wallet,
                    contentDescription = null,
                    tint = if (isSelected) FitFiColors.Primary else FitFiColors.TextMuted,
                    modifier = Modifier.size(32.dp)
                )
                
                Spacer(modifier = Modifier.width(FitFiSpacing.md))
                
                Column {
                    Text(
                        text = name,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.SemiBold
                        ),
                        color = FitFiColors.TextPrimary
                    )
                    
                    Text(
                        text = description,
                        style = MaterialTheme.typography.bodySmall,
                        color = FitFiColors.TextMuted
                    )
                }
            }
            
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = FitFiColors.Primary,
                    strokeWidth = 2.dp
                )
            }
        }
    }
}
