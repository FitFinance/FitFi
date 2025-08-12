package com.example.fitfi.data.network

import com.google.gson.annotations.SerializedName
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST

// Request bodies
data class WalletAddressBody(@SerializedName("walletAddress") val walletAddress: String)
data class WalletAuthBody(
    @SerializedName("walletAddress") val walletAddress: String,
    @SerializedName("signature") val signature: String
)

// Generic API envelope (partial)
data class ApiEnvelope<T>(
    val message: String?,
    val success: Boolean?,
    val status: String?,
    val data: T?
)

data class WalletMessageData(
    val walletAddress: String?,
    val nonce: Long?,
    val message: String?
)

data class WalletAuthUser(
    val id: String?,
    val walletAddress: String?,
    val name: String?,
    val role: String?,
    val isNewUser: Boolean?
)

data class WalletAuthData(
    val user: WalletAuthUser?,
    val nonce: Long?,
    val token: String?
)

interface AuthApi {
    @Headers("Content-Type: application/json")
    @POST("auth/wallet-get-message")
    suspend fun walletGetMessage(@Body body: WalletAddressBody): ApiEnvelope<WalletMessageData>

    @Headers("Content-Type: application/json")
    @POST("auth/wallet-auth")
    suspend fun walletAuth(@Body body: WalletAuthBody): ApiEnvelope<WalletAuthData>
}
