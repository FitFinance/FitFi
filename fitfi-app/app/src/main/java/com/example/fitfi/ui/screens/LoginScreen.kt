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
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.ui.platform.LocalContext
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
    val viewModel: com.example.fitfi.ui.viewmodel.AuthViewModel = viewModel()
    val context = LocalContext.current
    val activity = context as? android.app.Activity
    val uiState by viewModel.uiState.collectAsState()
    val isLoading = uiState.isLoading
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var walletAddressForRegister by remember { mutableStateOf("") }
    val currentMode = uiState.mode
    
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
                text = when (currentMode) {
                    com.example.fitfi.ui.viewmodel.AuthMode.WALLET -> "Sign in with your wallet"
                    com.example.fitfi.ui.viewmodel.AuthMode.LOGIN -> "Sign in with username"
                    com.example.fitfi.ui.viewmodel.AuthMode.REGISTER -> "Create a new account"
                },
                style = MaterialTheme.typography.bodyLarge,
                color = FitFiColors.TextSecondary,
                textAlign = TextAlign.Center
            )
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.xxl))
        
        // Mode selector
        FitFiCard {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                val walletMode = com.example.fitfi.ui.viewmodel.AuthMode.WALLET
                val loginMode = com.example.fitfi.ui.viewmodel.AuthMode.LOGIN
                val registerMode = com.example.fitfi.ui.viewmodel.AuthMode.REGISTER
                val modes: List<Pair<com.example.fitfi.ui.viewmodel.AuthMode, String>> = listOf(
                    walletMode to "Wallet",
                    loginMode to "Login",
                    registerMode to "Register"
                )
                modes.forEach { pair: Pair<com.example.fitfi.ui.viewmodel.AuthMode, String> ->
                    val (mode, label) = pair
                    val selected = currentMode == mode
                    TextButton(onClick = { viewModel.switchMode(mode) }) {
                        Text(label, color = if (selected) FitFiColors.Primary else FitFiColors.TextSecondary)
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.lg))
        
        when (currentMode) {
            com.example.fitfi.ui.viewmodel.AuthMode.WALLET -> {
                FitFiButton(
                    onClick = { activity?.let { viewModel.connectAndAuthenticate(it) { onNavigateToHome() } } },
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
                FitFiSecondaryButton(
                    text = "Use Another Wallet",
                    onClick = onNavigateToConnectWallet,
                    modifier = Modifier.fillMaxWidth()
                )
            }
            com.example.fitfi.ui.viewmodel.AuthMode.LOGIN -> {
                FitFiInput(
                    value = username,
                    onValueChange = { username = it },
                    placeholder = "Username",
                    label = "Username",
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(FitFiSpacing.sm))
                FitFiInput(
                    value = password,
                    onValueChange = { password = it },
                    placeholder = "Password",
                    label = "Password",
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(FitFiSpacing.md))
                FitFiButton(
                    onClick = {
                        if (username.isNotBlank() && password.isNotBlank()) {
                            viewModel.login(username.trim(), password, "1.0.0", onNavigateToHome)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isLoading,
                    variant = FitFiButtonVariant.Primary
                ) { Text(if (isLoading) "Signing in..." else "Login") }
            }
            com.example.fitfi.ui.viewmodel.AuthMode.REGISTER -> {
                FitFiInput(
                    value = username,
                    onValueChange = { username = it },
                    placeholder = "Username",
                    label = "Username",
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(FitFiSpacing.sm))
                FitFiInput(
                    value = password,
                    onValueChange = { password = it },
                    placeholder = "Password",
                    label = "Password",
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(FitFiSpacing.sm))
                FitFiInput(
                    value = walletAddressForRegister,
                    onValueChange = { walletAddressForRegister = it },
                    placeholder = "Wallet (0x...)",
                    label = "Wallet Address",
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(FitFiSpacing.md))
                FitFiButton(
                    onClick = {
                        if (username.isNotBlank() && password.isNotBlank() && walletAddressForRegister.startsWith("0x")) {
                            viewModel.register(username.trim(), password, walletAddressForRegister.trim(), "1.0.0", onNavigateToHome)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isLoading,
                    variant = FitFiButtonVariant.Primary
                ) { Text(if (isLoading) "Creating..." else "Register") }
            }
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.lg))
        
        if (currentMode == com.example.fitfi.ui.viewmodel.AuthMode.WALLET) {
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
