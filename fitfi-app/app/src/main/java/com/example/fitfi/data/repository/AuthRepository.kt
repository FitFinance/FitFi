package com.example.fitfi.data.repository

import com.example.fitfi.data.network.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AuthRepository(private val api: AuthApi) {
    suspend fun getWalletMessage(walletAddress: String) = withContext(Dispatchers.IO) {
        api.walletGetMessage(WalletAddressBody(walletAddress))
    }

    suspend fun walletAuth(walletAddress: String, signature: String) = withContext(Dispatchers.IO) {
        api.walletAuth(WalletAuthBody(walletAddress, signature))
    }

    suspend fun register(username: String, password: String, wallet: String, appVersion: String) = withContext(Dispatchers.IO) {
        api.register(RegisterBody(username, password, wallet, appVersion))
    }

    suspend fun login(username: String, password: String, appVersion: String) = withContext(Dispatchers.IO) {
        api.login(LoginBody(username, password, appVersion))
    }
}
