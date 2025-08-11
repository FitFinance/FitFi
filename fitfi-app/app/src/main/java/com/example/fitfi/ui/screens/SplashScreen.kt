package com.example.fitfi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.fitfi.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onNavigateToLogin: () -> Unit,
    onNavigateToHome: () -> Unit
) {
    var isLoading by remember { mutableStateOf(true) }
    
    // Simulate loading and auth check
    LaunchedEffect(Unit) {
        delay(2000) // Simulate loading time
        // For demo purposes, navigate to login. In real app, check auth state
        isLoading = false
        onNavigateToLogin()
    }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(FitFiColors.Background),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Logo placeholder
            Card(
                modifier = Modifier.size(120.dp),
                colors = CardDefaults.cardColors(
                    containerColor = FitFiColors.Primary
                )
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "FF",
                        style = MaterialTheme.typography.displayLarge.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = FitFiColors.TextPrimary
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(FitFiSpacing.lg))
            
            Text(
                text = "FitFi",
                style = MaterialTheme.typography.displayLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = FitFiColors.TextPrimary
            )
            
            Spacer(modifier = Modifier.height(FitFiSpacing.md))
            
            if (isLoading) {
                CircularProgressIndicator(
                    color = FitFiColors.Primary,
                    modifier = Modifier.size(32.dp)
                )
            }
        }
        
        // Footer
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(FitFiSpacing.lg),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Gamified Fitness Duels",
                style = MaterialTheme.typography.bodySmall,
                color = FitFiColors.TextMuted,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(FitFiSpacing.xs))
            
            Text(
                text = "v1.0.0",
                style = MaterialTheme.typography.labelSmall,
                color = FitFiColors.TextMuted
            )
        }
    }
}
