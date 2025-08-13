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

// Username/password auth bodies
data class RegisterBody(
    @SerializedName("username") val username: String,
    @SerializedName("password") val password: String,
    @SerializedName("walletAddress") val walletAddress: String,
    @SerializedName("appVersion") val appVersion: String
)
data class LoginBody(
    @SerializedName("username") val username: String,
    @SerializedName("password") val password: String,
    @SerializedName("appVersion") val appVersion: String
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

data class LoginRegisterUser(
    val id: String?,
    val username: String?,
    val walletAddress: String?,
    val signupAppVersion: String?,
    val lastLoginAppVersion: String?,
    val isFirstLogin: Boolean?,
    val isNewUser: Boolean? = null
)

data class LoginRegisterData(
    val user: LoginRegisterUser?,
    val token: String?
)

interface AuthApi {
    @Headers("Content-Type: application/json")
    @POST("auth/wallet-get-message")
    suspend fun walletGetMessage(@Body body: WalletAddressBody): ApiEnvelope<WalletMessageData>

    @Headers("Content-Type: application/json")
    @POST("auth/wallet-auth")
    suspend fun walletAuth(@Body body: WalletAuthBody): ApiEnvelope<WalletAuthData>

    @Headers("Content-Type: application/json")
    @POST("auth/register")
    suspend fun register(@Body body: RegisterBody): ApiEnvelope<LoginRegisterData>

    @Headers("Content-Type: application/json")
    @POST("auth/login")
    suspend fun login(@Body body: LoginBody): ApiEnvelope<LoginRegisterData>
}
