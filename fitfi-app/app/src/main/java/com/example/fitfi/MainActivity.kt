package com.example.fitfi

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.core.view.WindowCompat
import com.example.fitfi.navigation.FitFiNavigation
import com.example.fitfi.ui.theme.FitFiColors
import com.example.fitfi.ui.theme.FitFiTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Enable edge-to-edge display
        enableEdgeToEdge()
        
        // Set status bar appearance
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        setContent {
            FitFiTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = FitFiColors.Background
                ) {
                    FitFiApp()
                }
            }
        }
    }
}

@Composable
fun FitFiApp() {
    FitFiNavigation()
}

@Preview(showBackground = true)
@Composable
fun FitFiAppPreview() {
    FitFiTheme {
        FitFiApp()
    }
}