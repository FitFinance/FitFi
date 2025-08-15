package com.example.fitfi.data.local

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "auth")

class AuthPreferences(private val context: Context) {
    private object Keys {
        val TOKEN = stringPreferencesKey("token")
        val WALLET = stringPreferencesKey("wallet")
    }

    val tokenFlow: Flow<String?> = context.dataStore.data.map { it[Keys.TOKEN] }
    val walletFlow: Flow<String?> = context.dataStore.data.map { it[Keys.WALLET] }

    suspend fun saveAuth(token: String, wallet: String) {
        context.dataStore.edit { prefs ->
            prefs[Keys.TOKEN] = token
            prefs[Keys.WALLET] = wallet.lowercase()
        }
    }

    suspend fun clear() {
        context.dataStore.edit { prefs ->
            prefs.clear()
        }
    }
}
