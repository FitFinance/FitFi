package com.example.fitfi.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun HomeScreen(navController: NavHostController) {
	Surface(
		modifier = Modifier.fillMaxSize(),
		color = MaterialTheme.colorScheme.background
	) {
		Column(
			modifier = Modifier
				.fillMaxSize()
				.padding(24.dp),
			verticalArrangement = Arrangement.Center,
			horizontalAlignment = Alignment.CenterHorizontally
		) {
			Text(
				text = "Welcome to FitFi!",
				fontSize = 28.sp,
				fontWeight = FontWeight.Bold
			)
			Spacer(modifier = Modifier.height(16.dp))
			Text(
				text = "Your fitness, your finance, your future.",
				fontSize = 18.sp
			)
			Spacer(modifier = Modifier.height(32.dp))
			Button(onClick = { /* Example: navController.navigate("explore") */ }) {
				Text("Get Started")
			}
		}
	}
}
