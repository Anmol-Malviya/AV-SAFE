package com.phishguard

import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class SandboxActivity : AppCompatActivity() {

    private lateinit var sandboxWebView: WebView

    @Suppress("DEPRECATION")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sandbox)

        val url = intent.getStringExtra("URL") ?: ""

        val txtSandboxUrl = findViewById<TextView>(R.id.txtSandboxUrl)
        val btnSandboxClose = findViewById<TextView>(R.id.btnSandboxClose)
        sandboxWebView = findViewById(R.id.sandboxWebView)

        txtSandboxUrl.text = url

        btnSandboxClose.setOnClickListener {
            cleanupAndFinish()
        }

        // Configure strict on-device sandbox settings
        val settings = sandboxWebView.settings

        // 1. Force Disable JavaScript execution to prevent client-side credential harvest & DOM exploitation
        settings.javaScriptEnabled = false

        // 2. Disable DOM local storage, database cache, and indexedDB
        settings.domStorageEnabled = false
        settings.databaseEnabled = false
        settings.cacheMode = WebSettings.LOAD_NO_CACHE

        // 3. Prevent native filesystem, content, and file URL access
        settings.allowFileAccess = false
        settings.allowContentAccess = false
        settings.allowFileAccessFromFileURLs = false
        settings.allowUniversalAccessFromFileURLs = false

        // 4. Disable geolocation and mixed content
        settings.setGeolocationEnabled(false)
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW

        // 5. Clear all cookies in sandbox mode
        try {
            CookieManager.getInstance().setAcceptCookie(false)
            CookieManager.getInstance().removeAllCookies(null)
        } catch (e: Exception) {
            // ignore
        }

        // 6. Set secure WebClient to intercept and constrain navigation
        sandboxWebView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val nextUrl = request?.url?.toString() ?: return true
                return handleSandboxNavigation(view, nextUrl)
            }

            @Deprecated("Deprecated in Java")
            override fun shouldOverrideUrlLoading(view: WebView?, nextUrl: String?): Boolean {
                if (nextUrl == null) return true
                return handleSandboxNavigation(view, nextUrl)
            }

            private fun handleSandboxNavigation(view: WebView?, nextUrl: String): Boolean {
                val lower = nextUrl.lowercase()
                // Strict scheme restriction: only http and https allowed
                if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
                    Toast.makeText(this@SandboxActivity, "Blocked non-web navigation in sandbox: $nextUrl", Toast.LENGTH_SHORT).show()
                    return true
                }

                txtSandboxUrl.text = nextUrl
                view?.loadUrl(nextUrl)
                return false
            }
        }

        // Setup Modern Back Press Dispatcher
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (sandboxWebView.canGoBack()) {
                    sandboxWebView.goBack()
                } else {
                    cleanupAndFinish()
                }
            }
        })

        // 7. Load suspicious link in sandboxed web frame
        if (url.startsWith("http://", ignoreCase = true) || url.startsWith("https://", ignoreCase = true)) {
            sandboxWebView.loadUrl(url)
        } else {
            sandboxWebView.loadUrl("https://$url")
        }
    }

    private fun cleanupAndFinish() {
        try {
            sandboxWebView.stopLoading()
            sandboxWebView.clearCache(true)
            sandboxWebView.clearHistory()
            sandboxWebView.loadUrl("about:blank")
            sandboxWebView.onPause()
            sandboxWebView.destroy()
        } catch (e: Exception) {
            // ignore
        }
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            sandboxWebView.destroy()
        } catch (e: Exception) {
            // ignore
        }
    }
}
