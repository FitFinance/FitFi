package com.example.fitfi.wallet

import android.app.Activity
import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import io.metamask.androidsdk.DappMetadata
import io.metamask.androidsdk.Ethereum
import io.metamask.androidsdk.EthereumMethod
import io.metamask.androidsdk.EthereumRequest
import io.metamask.androidsdk.Result as MMResult
import io.metamask.androidsdk.SDKOptions
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/** MetaMask wallet bridge: creates provider with current Activity (not application!). */
class WalletManager {
    private val _address = MutableStateFlow<String?>(null)
    val account: StateFlow<String?> = _address
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error
    private var ethereum: Ethereum? = null

    private fun ensureProvider(activity: Activity) {
        if (ethereum == null) {
            // Use BuildConfig URL for dapp metadata
            val dappUrl = try {
                com.example.fitfi.BuildConfig.DAPP_URL
            } catch (e: Exception) {
                "https://halleysspaceshooter.netlify.app/"
            }
            android.util.Log.d("WalletManager", "Creating Ethereum provider with dappUrl: $dappUrl")
            ethereum = Ethereum(
                context = activity,
                dappMetadata = DappMetadata("FitFi", dappUrl),
                sdkOptions = SDKOptions(
                    infuraAPIKey = null,
                    readonlyRPCMap = emptyMap()
                )
            )
        }
    }

    private fun hasInternet(context: Context): Boolean {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
        val net = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(net) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    fun connect(activity: Activity, onResult: (Boolean) -> Unit) {
        if (!hasInternet(activity)) {
            _error.value = "No internet connectivity"
            android.util.Log.e("WalletManager", "Abort connect: no internet")
            onResult(false)
            return
        }
        ensureProvider(activity)
        val provider = ethereum ?: return onResult(false)
        android.util.Log.d("WalletManager", "Initiating connect to MetaMask")
        provider.connect { result ->
            android.util.Log.d("WalletManager", "Connect result: $result")
            when (result) {
                is MMResult.Error -> {
                    _error.value = "Connect error: ${result.error.code ?: ""} ${result.error.message}".trim()
                    android.util.Log.e("WalletManager", "Connect error: ${_error.value}")
                    onResult(false)
                }
                is MMResult.Success.Item -> {
                    val addr = provider.selectedAddress
                    android.util.Log.d("WalletManager", "Connect success, selectedAddress: $addr")
                    if (addr.isNullOrBlank()) {
                        _error.value = "No address returned after connect"
                        onResult(false)
                    } else {
                        _address.value = addr
                        onResult(true)
                    }
                }
                else -> {
                    android.util.Log.d("WalletManager", "Connect result other: $result")
                    onResult(false)
                }
            }
        }
    }

    fun ensureConnectedThen(activity: Activity, cont: (String) -> Unit, onFail: (String) -> Unit) {
        val existing = _address.value
        if (!existing.isNullOrBlank()) { cont(existing); return }
        connect(activity) { ok ->
            val addr = _address.value
            if (ok && !addr.isNullOrBlank()) cont(addr) else onFail(_error.value ?: "Wallet connection failed or cancelled")
        }
    }

    fun personalSign(message: String, activity: Activity, callback: (kotlin.Result<String>) -> Unit) {
        ensureProvider(activity)
        val provider = ethereum ?: return callback(kotlin.Result.failure(IllegalStateException("No provider")))
        val addr = _address.value ?: return callback(kotlin.Result.failure(IllegalStateException("Not connected")))
        if (!hasInternet(activity)) {
            android.util.Log.e("WalletManager", "personalSign aborted: no internet")
            callback(kotlin.Result.failure(IllegalStateException("No internet connectivity")))
            return
        }
        android.util.Log.d("WalletManager", "Starting personalSign for message: $message")
        // MetaMask expects [message, address] for personal_sign
        val req = EthereumRequest(
            method = EthereumMethod.PERSONAL_SIGN.value,
            params = listOf(message, addr)
        )
        provider.sendRequest(req) { result ->
            android.util.Log.d("WalletManager", "PersonalSign result: $result")
            when (result) {
                is MMResult.Error -> {
                    android.util.Log.e("WalletManager", "PersonalSign error: ${result.error.message}")
                    callback(kotlin.Result.failure(Exception(result.error.message)))
                }
                is MMResult.Success.Item -> {
                    android.util.Log.d("WalletManager", "PersonalSign success: ${result.value}")
                    callback(kotlin.Result.success(result.value.toString()))
                }
                else -> {
                    android.util.Log.d("WalletManager", "PersonalSign other result: $result")
                    callback(kotlin.Result.failure(Exception("Unexpected result")))
                }
            }
        }
    }
}
