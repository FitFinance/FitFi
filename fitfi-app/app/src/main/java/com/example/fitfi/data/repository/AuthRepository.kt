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
}
