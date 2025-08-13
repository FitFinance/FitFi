package com.example.fitfi.wallet

import android.app.Application
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import dagger.Provides
import javax.inject.Singleton
import io.metamask.androidsdk.DappMetadata
import io.metamask.androidsdk.Ethereum
import io.metamask.androidsdk.SDKOptions
import com.example.fitfi.BuildConfig

@Module
@InstallIn(SingletonComponent::class)
object EthereumModule {
    @Provides
    @Singleton
    fun provideEthereum(app: Application): Ethereum {
        val key = BuildConfig.INFURA_KEY.takeIf { it.isNotBlank() }
        val url = BuildConfig.DAPP_URL.ifBlank { "https://example.org" }
        return Ethereum(
            context = app,
            dappMetadata = DappMetadata(name = "FitFi", url = url),
            sdkOptions = SDKOptions(
                infuraAPIKey = key,
                readonlyRPCMap = emptyMap()
            )
        )
    }
}
