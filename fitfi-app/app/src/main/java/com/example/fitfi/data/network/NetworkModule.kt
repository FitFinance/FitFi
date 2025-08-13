package com.example.fitfi.data.network

import com.example.fitfi.BuildConfig

import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.ResponseBody.Companion.toResponseBody
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import com.google.gson.GsonBuilder

object NetworkModule {
    // Determine base URL dynamically:
    // - If emulator (generic/Android SDK) use 10.0.2.2
    // - Else use BuildConfig.DEV_HOST_IP (configurable) or fallback to local network suggestion
    private val BASE_URL: String by lazy {
        // Detect emulator to map localhost correctly
        val isEmulator = listOf(
            android.os.Build.FINGERPRINT.contains("generic"),
            android.os.Build.FINGERPRINT.lowercase().contains("emulator"),
            android.os.Build.MODEL.contains("Emulator"),
            android.os.Build.MODEL.contains("Android SDK built for"),
            android.os.Build.MANUFACTURER.contains("Genymotion"),
            (android.os.Build.BRAND.startsWith("generic") && android.os.Build.DEVICE.startsWith("generic")),
            "google_sdk" == android.os.Build.PRODUCT
        ).any { it }

        val host = if (isEmulator) "10.0.2.2" else BuildConfig.DEV_HOST_IP

        // Allow switching between http and https without code edits.
        // We inject BUILD config fields via Gradle: DEV_USE_HTTPS ("true"/"false") and optional DEV_HTTP_PORT / DEV_HTTPS_PORT.
        val useHttps = (try { BuildConfig.DEV_USE_HTTPS } catch (_: Throwable) { "false" }) == "true"
        val httpPort = (try { BuildConfig.DEV_HTTP_PORT } catch (_: Throwable) { "3000" })
        val httpsPort = (try { BuildConfig.DEV_HTTPS_PORT } catch (_: Throwable) { "3443" })
        val scheme = if (useHttps) "https" else "http"
        val port = if (useHttps) httpsPort else httpPort

        val base = "$scheme://$host:$port/api/v1/"
        android.util.Log.i("NetworkModule", "Using BASE_URL=$base (useHttps=$useHttps host=$host)")
        base
    }

    private val logging: HttpLoggingInterceptor by lazy {
        HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }
    }

    private val httpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .addInterceptor(logging)
            // Extra interceptor to log raw body when ccount he needs to JSON parsing fails (non 2xx or text/html)
            .addInterceptor { chain ->
                val req = chain.request()
                val res: Response = chain.proceed(req)
                if (!res.isSuccessful) {
                    val bodyStr = res.body?.string() ?: "<empty>"
                    android.util.Log.e("NetworkModule", "Non-2xx ${res.code} ${req.url} body=\n$bodyStr")
                    // Re-create body because it was consumed
                    return@addInterceptor res.newBuilder()
                        .body(bodyStr.toByteArray().toResponseBody(res.body?.contentType() ?: "application/json".toMediaTypeOrNull()))
                        .build()
                }
                res
            }
            .build()
    }

    private val retrofit: Retrofit by lazy {
        val gson = GsonBuilder()
            .setLenient() // tolerate minor server deviations during dev
            .create()
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(httpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
    }

    val authApi: AuthApi by lazy { retrofit.create(AuthApi::class.java) }
}
