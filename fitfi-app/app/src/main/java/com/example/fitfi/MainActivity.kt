package com.example.fitfi

import android.os.Bundle
import android.content.Intent
import android.util.Log
import com.example.fitfi.deeplink.DeepLinkDispatcher
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
        try {
            super.onCreate(savedInstanceState)
        } catch (t: Throwable) {
            // Guard against rare Compose hover event state crash on some OEM devices
            Log.e("MainActivity", "onCreate super threw: ${t.message}")
        }
        
        // Enable edge-to-edge display
        enableEdgeToEdge()
        
        // Set status bar appearance
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        // Check if app was launched via deep link
        intent?.data?.let { data ->
            Log.d("MainActivity", "App launched with deep link: $data")
            if (data.scheme == "fitfi") {
                DeepLinkDispatcher.dispatch(data)
            }
        }
        
        setContent {
            FitFiTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = FitFiColors.Background
                ) {
                    FitFiRootApp()
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        try {
            super.onNewIntent(intent)
        } catch (t: Throwable) {
            Log.e("MainActivity", "onNewIntent super threw: ${t.message}")
        }
        Log.d("MainActivity", "onNewIntent called with intent: $intent")
        if (intent == null) return
        val data = intent.data
        Log.d("MainActivity", "Intent data: $data")
        if (data != null && data.scheme == "fitfi") {
            Log.d("MetaMaskReturn", "Received deep link: $data")
            Log.d("MetaMaskReturn", "Query params: ${data.query}")
            Log.d("MetaMaskReturn", "Fragment: ${data.fragment}")
            DeepLinkDispatcher.dispatch(data)
        }
    }
}

@Composable
fun FitFiRootApp() {
    FitFiNavigation()
}

@Preview(showBackground = true)
@Composable
fun FitFiAppPreview() {
    FitFiTheme {
    FitFiRootApp()
    }
}