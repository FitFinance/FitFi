package com.example.fitfi.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.fitfi.data.network.NetworkModule
import com.example.fitfi.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val isAuthenticated: Boolean = false,
    val walletAddress: String? = null,
    val token: String? = null
)

class AuthViewModel : ViewModel() {
    private val repo = AuthRepository(NetworkModule.authApi)
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState

    // Placeholder wallet until wallet provider integration
    private val devWalletAddress = "0x1234567890abcdef1234567890abcdef12345678"

    fun connectAndAuthenticate(onSuccess: () -> Unit) {
        if (_uiState.value.isLoading) return
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)

        viewModelScope.launch {
            try {
                val msgResp = repo.getWalletMessage(devWalletAddress)
                val message = msgResp.data?.message
                if (message.isNullOrBlank()) error("Missing auth message")

                // TODO integrate actual signing. Backend accepts mock signatures in development.
                val mockSignature = "mock-" + System.currentTimeMillis()
                val authResp = repo.walletAuth(devWalletAddress, mockSignature)
                val token = authResp.data?.token ?: error("No token returned")

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isAuthenticated = true,
                    walletAddress = devWalletAddress,
                    token = token
                )
                onSuccess()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }
}
