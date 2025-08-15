package com.example.fitfi.ui.viewmodel

import android.app.Application
import android.app.Activity
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.fitfi.data.local.AuthPreferences
import com.example.fitfi.data.network.NetworkModule
import com.example.fitfi.data.repository.AuthRepository
import com.example.fitfi.wallet.WalletManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val isAuthenticated: Boolean = false,
    val walletAddress: String? = null,
    val token: String? = null,
    val username: String? = null,
    val mode: AuthMode = AuthMode.WALLET,
    val justRegistered: Boolean = false
)

enum class AuthMode { WALLET, LOGIN, REGISTER }

class AuthViewModel(app: Application) : AndroidViewModel(app) {
    private val repo = AuthRepository(NetworkModule.authApi)
    private val walletManager = WalletManager()
    private val prefs = AuthPreferences(app)
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState

    init {
        viewModelScope.launch {
            val token = prefs.tokenFlow.first()
            val wallet = prefs.walletFlow.first()
            if (!token.isNullOrBlank() && !wallet.isNullOrBlank()) {
                _uiState.update { it.copy(isAuthenticated = true, token = token, walletAddress = wallet) }
            }
        }
    }

    private var connecting = false

    private fun fetchMessageAndSign(activity: Activity, wallet: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            try {
                val msgResp = repo.getWalletMessage(wallet)
                val message = msgResp.data?.message ?: error("Missing message from server")
                walletManager.personalSign(message, activity) { result ->
                    viewModelScope.launch {
                        result.fold(onSuccess = { sig ->
                            completeAuth(wallet, sig, onSuccess)
                        }, onFailure = { err ->
                            _uiState.update { it.copy(isLoading = false, error = err.message) }
                        })
                    }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }

    fun switchMode(newMode: AuthMode) {
        _uiState.update { it.copy(mode = newMode, error = null) }
    }

    fun connectAndAuthenticate(activity: Activity, onSuccess: () -> Unit) {
        if (_uiState.value.isLoading) return
        if (connecting) return
        connecting = true
        _uiState.update { it.copy(isLoading = true, error = null) }
        walletManager.ensureConnectedThen(activity,
            cont = { addr ->
                connecting = false
                fetchMessageAndSign(activity, addr, onSuccess)
            },
            onFail = { err ->
                connecting = false
                _uiState.update { it.copy(isLoading = false, error = err) }
            }
        )
    }

    private suspend fun completeAuth(wallet: String, signature: String, onSuccess: () -> Unit) {
        try {
            val authResp = repo.walletAuth(wallet, signature)
            val token = authResp.data?.token ?: error("No token")
            prefs.saveAuth(token, wallet)
            _uiState.update { it.copy(isLoading = false, isAuthenticated = true, walletAddress = wallet, token = token) }
            onSuccess()
        } catch (e: Exception) {
            _uiState.update { it.copy(isLoading = false, error = e.message) }
        }
    }

    fun register(username: String, password: String, wallet: String, appVersion: String, onSuccess: () -> Unit) {
        if (_uiState.value.isLoading) return
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val resp = repo.register(username, password, wallet, appVersion)
                val token = resp.data?.token ?: error("No token")
                // Save
                prefs.saveAuth(token, wallet)
                _uiState.update { it.copy(isLoading = false, isAuthenticated = true, walletAddress = wallet, token = token, username = username, justRegistered = true) }
                onSuccess()
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }

    fun login(username: String, password: String, appVersion: String, onSuccess: () -> Unit) {
        if (_uiState.value.isLoading) return
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val resp = repo.login(username, password, appVersion)
                val token = resp.data?.token ?: error("No token")
                val wallet = resp.data?.user?.walletAddress
                if (!wallet.isNullOrBlank()) {
                    prefs.saveAuth(token, wallet)
                }
                _uiState.update { it.copy(isLoading = false, isAuthenticated = true, walletAddress = wallet, token = token, username = username) }
                onSuccess()
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }
}
