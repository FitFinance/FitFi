package com.example.fitfi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
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

enum class WalletConnectionState {
    Idle, Connecting, Error
}

private data class WalletOption(
    val id: String,
    val name: String,
    val description: String,
    val icon: String
)

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
    
    val walletOptions = remember {
        listOf(
            WalletOption(
                id = "walletconnect",
                name = "Connect Wallet",
                description = "WalletConnect (MetaMask, Trust, Rainbow, Coinbase...)",
                icon = "🔗"
            ),
            WalletOption(
                id = "metamask",
                name = "MetaMask",
                description = "Direct MetaMask SDK (fallback to WC)",
                icon = "🦊"
            ),
            WalletOption(
                id = "trust",
                name = "Trust Wallet (via WC)",
                description = "Trust Wallet through WalletConnect",
                icon = "🛡️"
            ),
            WalletOption(
                id = "coinbase",
                name = "Coinbase Wallet (via WC)",
                description = "Coinbase Wallet through WalletConnect",
                icon = "💙"
            )
        )
    }
    
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
                IconButton(onClick = onNavigateBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = FitFiColors.Primary
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
                text = "Choose your preferred wallet to connect to FitFi",
                style = MaterialTheme.typography.bodyLarge,
                color = FitFiColors.TextSecondary,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(FitFiSpacing.xl))
            
            // Error Message
            if (errorMessage != null) {
                FitFiCard(variant = FitFiCardVariant.Base) {
                    Text(
                        text = errorMessage!!,
                        style = MaterialTheme.typography.bodyMedium,
                        color = FitFiColors.Error
                    )
                    
                    Spacer(modifier = Modifier.height(FitFiSpacing.sm))
                    
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
                
                Spacer(modifier = Modifier.height(FitFiSpacing.md))
            }
            
            // Wallet Options
            Column(
                verticalArrangement = Arrangement.spacedBy(FitFiSpacing.sm)
            ) {
                walletOptions.forEach { wallet ->
                    WalletOptionCard(
                        wallet = wallet,
                        isSelected = selectedWallet == wallet.id,
                        isLoading = connectionState == WalletConnectionState.Connecting && selectedWallet == wallet.id,
                        isEnabled = connectionState == WalletConnectionState.Idle,
                        onClick = {
                            selectedWallet = wallet.id
                            connectionState = WalletConnectionState.Connecting
                            // Simulate connection
                            onNavigateToHome()
                        }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(FitFiSpacing.xl))
            
            // Info Card
            FitFiCard(variant = FitFiCardVariant.Highlight) {
                Text(
                    text = "Why connect a wallet?",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.SemiBold
                    ),
                    color = FitFiColors.TextPrimary
                )
                
                Spacer(modifier = Modifier.height(FitFiSpacing.sm))
                
                Text(
                    text = "• Secure authentication without passwords\n• Earn and manage your FitFi tokens\n• Participate in challenges and duels\n• Track your fitness achievements on-chain",
                    style = MaterialTheme.typography.bodyMedium,
                    color = FitFiColors.TextSecondary
                )
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
        }
    }
}

@Composable
private fun WalletOptionCard(
    wallet: WalletOption,
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
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(FitFiRadii.md))
                        .background(FitFiColors.SurfaceAlt),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = wallet.icon,
                        style = MaterialTheme.typography.headlineSmall
                    )
                }
                
                Spacer(modifier = Modifier.width(FitFiSpacing.md))
                
                Column {
                    Text(
                        text = wallet.name,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.SemiBold
                        ),
                        color = FitFiColors.TextPrimary
                    )
                    
                    Text(
                        text = wallet.description,
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
            } else {
                Text(
                    text = "→",
                    style = MaterialTheme.typography.titleMedium,
                    color = FitFiColors.TextMuted
                )
            }
        }
    }
}
