package com.example.fitfi.data.models

data class User(
    val id: String,
    val displayName: String,
    val walletAddress: String? = null,
    val avatarUrl: String? = null,
    val isNewUser: Boolean = false
)

data class UserStats(
    val totalSteps: Int = 0,
    val totalTokens: Int = 0,
    val winRate: Float = 0f,
    val activeDuels: Int = 0,
    val completedDuels: Int = 0
)

data class Duel(
    val id: String,
    val opponentName: String,
    val opponentAvatar: String? = null,
    val status: DuelStatus,
    val metric: String, // "steps", "calories", "distance"
    val currentProgress: Float,
    val targetProgress: Float,
    val opponentProgress: Float,
    val timeRemaining: Long, // milliseconds
    val stake: Int, // tokens or points
    val startTime: Long,
    val endTime: Long,
    val rules: String
)

enum class DuelStatus {
    PENDING, ACTIVE, COMPLETED, SETTLED, FORFEITED
}

data class Challenge(
    val id: String,
    val title: String,
    val description: String,
    val metric: String,
    val target: Float,
    val duration: Long, // milliseconds
    val participants: Int,
    val maxParticipants: Int,
    val stake: Int,
    val createdBy: String,
    val isPublic: Boolean = true
)

data class HealthMetric(
    val type: String, // "steps", "heartRate", "calories", "distance"
    val value: Float,
    val timestamp: Long,
    val unit: String
)

data class DuelEvent(
    val id: String,
    val duelId: String,
    val type: String, // "progress_update", "status_change", "forfeit"
    val description: String,
    val timestamp: Long,
    val userId: String
)
