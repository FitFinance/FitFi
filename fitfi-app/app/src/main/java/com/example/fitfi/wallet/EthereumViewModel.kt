package com.example.fitfi.wallet

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import io.metamask.androidsdk.Ethereum
import io.metamask.androidsdk.EthereumRequest
import io.metamask.androidsdk.Result
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

/**
 * Hilt-enabled wrapper around Ethereum provider. We adapt to app needs:
 * - Expose connection state/address
 * - Provide suspend-style helper wrappers
 */
@HiltViewModel
class EthereumViewModel @Inject constructor(
    private val ethereum: Ethereum
) : ViewModel() {

    private val _address = MutableStateFlow<String?>(null)
    val address: StateFlow<String?> = _address

    private val _connecting = MutableStateFlow(false)
    val connecting: StateFlow<Boolean> = _connecting

    private val _lastError = MutableStateFlow<String?>(null)
    val lastError: StateFlow<String?> = _lastError

    /** Connect to MetaMask. Emits selected address on success */
    fun connect(onResult: ((Result) -> Unit)? = null) {
        if (_connecting.value) return
        _connecting.value = true
        _lastError.value = null
        ethereum.connect { result ->
            when (result) {
                is Result.Error -> {
                    _lastError.value = result.error.message
                }
                is Result.Success.Item -> {
                    _address.value = ethereum.selectedAddress
                }
                else -> { /* ignore other result variants */ }
            }
            _connecting.value = false
            onResult?.invoke(result)
        }
    }

    fun sendRequest(request: EthereumRequest, onResult: ((Result) -> Unit)? = null) {
        ethereum.sendRequest(request) { r -> onResult?.invoke(r) }
    }

    /** Suspend helper returning signature or throwing */
    fun personalSign(message: String, onComplete: (kotlin.Result<String>) -> Unit) {
        val addr = _address.value
        if (addr.isNullOrBlank()) {
            onComplete(kotlin.Result.failure(IllegalStateException("Not connected")))
            return
        }
        val req = EthereumRequest(
            method = io.metamask.androidsdk.EthereumMethod.PERSONAL_SIGN.value,
            params = listOf(message, addr)
        )
        sendRequest(req) { res ->
            when (res) {
                is Result.Error -> onComplete(kotlin.Result.failure(Exception(res.error.message)))
                is Result.Success.Item -> onComplete(kotlin.Result.success(res.value.toString()))
                else -> onComplete(kotlin.Result.failure(Exception("Unexpected result")))
            }
        }
    }
}
