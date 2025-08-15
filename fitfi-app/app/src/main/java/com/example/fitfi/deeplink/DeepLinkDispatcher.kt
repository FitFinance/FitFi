package com.example.fitfi.deeplink

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import android.net.Uri

object DeepLinkDispatcher {
    private val _events = MutableSharedFlow<Uri>(extraBufferCapacity = 4)
    val events = _events.asSharedFlow()

    fun dispatch(uri: Uri) {
        _events.tryEmit(uri)
    }
}
