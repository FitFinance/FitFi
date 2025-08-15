package com.example.fitfi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.fitfi.R
import com.example.fitfi.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onNavigateToLogin: () -> Unit,
    onNavigateToHome: () -> Unit
) {
    var isLoading by remember { mutableStateOf(true) }
    var loadingText by remember { mutableStateOf("Loading...") }
    
    // Simulate loading and auth check with text updates
    LaunchedEffect(Unit) {
        loadingText = "Checking authentication..."
        delay(1000)
        loadingText = "Loading app data..."
        delay(500)
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
            // App Logo - Using actual FitFi logo image
            Image(
                painter = painterResource(id = R.drawable.fitfi_logo),
                contentDescription = "FitFi Logo",
                modifier = Modifier
                    .size(180.dp)
                    .clip(RoundedCornerShape(FitFiRadii.lg))
            )
            
            Spacer(modifier = Modifier.height(FitFiSpacing.lg))
            
            Text(
                text = "FitFi",
                style = MaterialTheme.typography.displayLarge.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = FitFiColors.TextPrimary
            )
            
            Spacer(modifier = Modifier.height(FitFiSpacing.xs))
            
            Text(
                text = "Earn by staying fit",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Normal
                ),
                color = FitFiColors.TextSecondary
            )
            
            Spacer(modifier = Modifier.height(FitFiSpacing.xxl))
            
            if (isLoading) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator(
                        color = FitFiColors.Primary,
                        modifier = Modifier.size(40.dp),
                        strokeWidth = 4.dp
                    )
                    
                    Spacer(modifier = Modifier.height(FitFiSpacing.md))
                    
                    Text(
                        text = loadingText,
                        style = MaterialTheme.typography.bodyMedium,
                        color = FitFiColors.TextSecondary
                    )
                }
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
                style = MaterialTheme.typography.bodyMedium,
                color = FitFiColors.TextMuted,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(FitFiSpacing.xs))
            
            Text(
                text = "Version 1.0.0",
                style = MaterialTheme.typography.labelSmall,
                color = FitFiColors.TextMuted
            )
        }
    }
}
