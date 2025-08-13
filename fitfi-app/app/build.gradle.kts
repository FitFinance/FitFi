plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    id("com.google.dagger.hilt.android")
    kotlin("kapt")
}

android {
    namespace = "com.example.fitfi"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.fitfi"
        minSdk = 28
    targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // Provide default dev networking config so BuildConfig fields always exist
        val devHostIpProp = project.findProperty("fitfi.devHostIp") as String? ?: "192.168.164.117"
        buildConfigField("String", "DEV_HOST_IP", "\"$devHostIpProp\"")
        val devUseHttps = project.findProperty("fitfi.useHttps") as String? ?: "false"
        buildConfigField("String", "DEV_USE_HTTPS", "\"$devUseHttps\"")
        val devHttpPort = project.findProperty("fitfi.httpPort") as String? ?: "3000"
        buildConfigField("String", "DEV_HTTP_PORT", "\"$devHttpPort\"")
        val devHttpsPort = project.findProperty("fitfi.httpsPort") as String? ?: "3443"
        buildConfigField("String", "DEV_HTTPS_PORT", "\"$devHttpsPort\"")
        val wcProjectIdProp = project.findProperty("fitfi.wcProjectId") as String? ?: "REPLACE_ME"
        buildConfigField("String", "WC_PROJECT_ID", "\"$wcProjectIdProp\"")
        val wcRelayUrlProp = project.findProperty("fitfi.wcRelayUrl") as String? ?: "wss://relay.walletconnect.com"
        buildConfigField("String", "WC_RELAY_URL", "\"$wcRelayUrlProp\"")
    val infuraKeyProp = project.findProperty("fitfi.infuraKey") as String? ?: ""
    buildConfigField("String", "INFURA_KEY", "\"$infuraKeyProp\"")
    val dappUrlProp = project.findProperty("fitfi.dappUrl") as String? ?: "https://halleysspaceshooter.netlify.app/"
    buildConfigField("String", "DAPP_URL", "\"$dappUrlProp\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // (Optional) Override values for release via -P properties if needed; defaults already set in defaultConfig.
        }
        debug {
            // For debug we rely on defaultConfig values; pass -P flags to override when invoking gradle.
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
    buildConfig = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    // Add extended material icons for missing icons
    implementation("androidx.compose.material:material-icons-extended")
    
    // Navigation
    implementation(libs.androidx.navigation.compose)
    
    // ViewModel
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    
    // Coroutines
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.kotlinx.coroutines.android)
    
    // Networking
    implementation(libs.retrofit)
    implementation(libs.retrofit.gson)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    
    // Accompanist
    implementation(libs.accompanist.permissions)
    implementation(libs.accompanist.swiperefresh)
    
    // DataStore
    implementation(libs.androidx.datastore.preferences)
    
    // Image loading
    implementation(libs.coil.compose)
    // MetaMask Android SDK
    implementation("io.metamask.androidsdk:metamask-android-sdk:0.6.6")
    // Hilt DI
    implementation("com.google.dagger:hilt-android:2.51.1")
    kapt("com.google.dagger:hilt-android-compiler:2.51.1")
    implementation("androidx.hilt:hilt-navigation-compose:1.2.0")
    
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}