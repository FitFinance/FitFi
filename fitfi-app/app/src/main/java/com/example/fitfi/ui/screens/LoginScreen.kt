package com.example.fitfi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.fitfi.ui.components.*
import com.example.fitfi.ui.theme.*

@Composable
fun LoginScreen(
    onNavigateToConnectWallet: () -> Unit,
    onNavigateToHome: () -> Unit
) {
    var phoneOrEmail by remember { mutableStateOf("") }
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
            text = "Login",
            style = MaterialTheme.typography.headlineLarge.copy(
                fontWeight = FontWeight.Bold
            ),
            color = FitFiColors.TextPrimary,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(FitFiSpacing.md))
        
        Text(
            text = "Enter your phone number or email to get started",
            style = MaterialTheme.typography.bodyLarge,
            color = FitFiColors.TextSecondary,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(FitFiSpacing.xxl))
        
        // Input Section
        FitFiInput(
            value = phoneOrEmail,
            onValueChange = { 
                phoneOrEmail = it
                errorMessage = null
            },
            placeholder = "Phone number or email",
            label = "Contact Information",
            isError = errorMessage != null,
            errorMessage = errorMessage,
            keyboardType = KeyboardType.Email,
            leadingIcon = {
                Icon(
                    imageVector = if (phoneOrEmail.contains("@")) Icons.Default.Email else Icons.Default.Phone,
                    contentDescription = null,
                    tint = FitFiColors.TextMuted,
                    modifier = Modifier.size(20.dp)
                )
            },
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(FitFiSpacing.lg))
        
        // Send OTP Button
        FitFiPrimaryButton(
            text = if (isLoading) "Sending..." else "Send OTP",
            onClick = {
                if (phoneOrEmail.isNotBlank()) {
                    isLoading = true
                    // Simulate OTP sending
                    // In real app, make API call here
                    // For demo, navigate to home after delay
                    onNavigateToHome()
                } else {
                    errorMessage = "Please enter your phone number or email"
                }
            },
            enabled = !isLoading && phoneOrEmail.isNotBlank(),
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(FitFiSpacing.lg))
        
        // Divider
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            HorizontalDivider(
                modifier = Modifier.weight(1f),
                color = FitFiColors.Border
            )
            Text(
                text = "or",
                style = MaterialTheme.typography.bodySmall,
                color = FitFiColors.TextMuted,
                modifier = Modifier.padding(horizontal = FitFiSpacing.md)
            )
            HorizontalDivider(
                modifier = Modifier.weight(1f),
                color = FitFiColors.Border
            )
        }
        
        Spacer(modifier = Modifier.height(FitFiSpacing.lg))
        
        // Connect Wallet Button
        FitFiSecondaryButton(
            text = "Connect Wallet",
            onClick = onNavigateToConnectWallet,
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.weight(1f))
        
        // Footer
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(FitFiSpacing.md)
            ) {
                TextButton(
                    onClick = { /* Navigate to Terms */ }
                ) {
                    Text(
                        text = "Terms",
                        style = MaterialTheme.typography.bodySmall,
                        color = FitFiColors.TextMuted
                    )
                }
                
                TextButton(
                    onClick = { /* Navigate to Privacy */ }
                ) {
                    Text(
                        text = "Privacy",
                        style = MaterialTheme.typography.bodySmall,
                        color = FitFiColors.TextMuted
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(FitFiSpacing.xs))
            
            Text(
                text = "FitFi",
                style = MaterialTheme.typography.labelSmall,
                color = FitFiColors.TextMuted
            )
        }
    }
}
