package com.example.fitfi.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.fitfi.ui.screens.*

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object ConnectWallet : Screen("connect_wallet")
    object ProfileSetup : Screen("profile_setup")
    
    // Tab screens
    object Home : Screen("home")
    object Explore : Screen("explore")
    object ActiveDuels : Screen("active_duels")
    object PreviousDuels : Screen("previous_duels")
    object Settings : Screen("settings")
    
    // Detail screens
    object DuelDetails : Screen("duel_details/{duelId}") {
        fun createRoute(duelId: String) = "duel_details/$duelId"
    }
    object DuelHealthMonitor : Screen("duel_health_monitor/{duelId}") {
        fun createRoute(duelId: String) = "duel_health_monitor/$duelId"
    }
    object UserSettings : Screen("user_settings")
    object NetworkTest : Screen("network_test")
}

@Composable
fun FitFiNavigation(
    navController: NavHostController = rememberNavController(),
    startDestination: String = Screen.Splash.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(
                onNavigateToLogin = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.Login.route) {
            LoginScreen(
                onNavigateToConnectWallet = {
                    navController.navigate(Screen.ConnectWallet.route)
                },
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.ConnectWallet.route) {
            ConnectWalletScreen(
                onNavigateBack = {
                    navController.popBackStack()
                },
                onNavigateToProfileSetup = {
                    navController.navigate(Screen.ProfileSetup.route)
                },
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.ConnectWallet.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.ProfileSetup.route) {
            ProfileSetupScreen(
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.ProfileSetup.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.Home.route) {
            MainTabScreen(
                navController = navController,
                currentTab = 0
            )
        }
        
        composable(Screen.Explore.route) {
            MainTabScreen(
                navController = navController,
                currentTab = 1
            )
        }
        
        composable(Screen.ActiveDuels.route) {
            MainTabScreen(
                navController = navController,
                currentTab = 2
            )
        }
        
        composable(Screen.PreviousDuels.route) {
            MainTabScreen(
                navController = navController,
                currentTab = 3
            )
        }
        
        composable(Screen.Settings.route) {
            MainTabScreen(
                navController = navController,
                currentTab = 4
            )
        }
        
        composable(Screen.DuelDetails.route) { backStackEntry ->
            val duelId = backStackEntry.arguments?.getString("duelId") ?: ""
            DuelDetailsScreen(
                duelId = duelId,
                onNavigateBack = {
                    navController.popBackStack()
                },
                onNavigateToLiveMonitor = {
                    navController.navigate(Screen.DuelHealthMonitor.createRoute(duelId))
                }
            )
        }
        
        composable(Screen.DuelHealthMonitor.route) { backStackEntry ->
            val duelId = backStackEntry.arguments?.getString("duelId") ?: ""
            DuelHealthMonitorScreen(
                duelId = duelId,
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(Screen.UserSettings.route) {
            UserSettingsScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(Screen.NetworkTest.route) {
            NetworkTestScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}
