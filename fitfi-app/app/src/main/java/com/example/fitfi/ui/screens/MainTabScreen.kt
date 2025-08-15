package com.example.fitfi.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.SportsHandball
import androidx.compose.material.icons.filled.RestoreFromTrash
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavHostController
import com.example.fitfi.ui.theme.*

data class TabItem(
    val title: String,
    val icon: ImageVector,
    val screen: @Composable () -> Unit
)

@Composable
fun MainTabScreen(
    navController: NavHostController,
    currentTab: Int
) {
    val tabs = listOf(
        TabItem("Home", Icons.Default.Home) { 
            HomeScreen(navController = navController) 
        },
        TabItem("Explore", Icons.Default.Search) { 
            ExploreScreen(navController = navController) 
        },
        TabItem("Active", Icons.Default.SportsHandball) { 
            ActiveDuelsScreen(navController = navController) 
        },
        TabItem("History", Icons.Default.RestoreFromTrash) { 
            DuelHistoryScreen(navController = navController) 
        },
        TabItem("Settings", Icons.Default.Settings) { 
            UserSettingsScreen(navController = navController) 
        }
    )

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = FitFiColors.BackgroundAlt
            ) {
                tabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        icon = {
                            Icon(
                                imageVector = tab.icon,
                                contentDescription = tab.title
                            )
                        },
                        label = {
                            Text(
                                text = tab.title,
                                style = MaterialTheme.typography.labelSmall
                            )
                        },
                        selected = currentTab == index,
                        onClick = {
                            val routes = listOf("home", "explore", "active_duels", "previous_duels", "settings")
                            navController.navigate(routes[index]) {
                                popUpTo("home") { inclusive = false }
                                launchSingleTop = true
                            }
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = FitFiColors.Primary,
                            selectedTextColor = FitFiColors.Primary,
                            unselectedIconColor = FitFiColors.TextMuted,
                            unselectedTextColor = FitFiColors.TextMuted,
                            indicatorColor = FitFiColors.Primary.copy(alpha = 0.1f)
                        )
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            tabs[currentTab].screen()
        }
    }
}
