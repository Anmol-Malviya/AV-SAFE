package com.phishguard

import android.net.Uri
import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.WebChromeClient
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
    private var originalHost: String = ""

    @Suppress("DEPRECATION")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sandbox)

        val url = intent.getStringExtra("URL") ?: ""

        // Parse and lock to the original host for containment
        originalHost = try {
            Uri.parse(url).host?.lowercase() ?: ""
        } catch (e: Exception) { "" }

        val txtSandboxUrl = findViewById<TextView>(R.id.txtSandboxUrl)
        val btnSandboxClose = findViewById<TextView>(R.id.btnSandboxClose)
        sandboxWebView = findViewById(R.id.sandboxWebView)

        txtSandboxUrl.text = url

        btnSandboxClose.setOnClickListener {
            cleanupAndFinish()
        }

        val settings = sandboxWebView.settings

        // 1. Enable JavaScript so the page actually renders (required for modern sites).
        //    Navigation is contained to the original host by shouldOverrideUrlLoading below.
        settings.javaScriptEnabled = true

        // 2. Disable all persistent storage — nothing survives the session
        settings.domStorageEnabled = false
        settings.databaseEnabled = false
        settings.cacheMode = WebSettings.LOAD_NO_CACHE

        // 3. Block filesystem, content-provider, and cross-origin file access
        settings.allowFileAccess = false
        settings.allowContentAccess = false
        settings.allowFileAccessFromFileURLs = false
        settings.allowUniversalAccessFromFileURLs = false

        // 4. Block geolocation requests and mixed HTTP content inside HTTPS pages
        settings.setGeolocationEnabled(false)
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW

        // 5. Block popups / new windows
        settings.setSupportMultipleWindows(false)
        settings.javaScriptCanOpenWindowsAutomatically = false

        // 6. Clear all existing cookies; refuse to accept new ones
        try {
            val cm = CookieManager.getInstance()
            cm.setAcceptCookie(false)
            cm.removeAllCookies(null)
            cm.flush()
        } catch (e: Exception) { /* ignore */ }

        // 7. Intercept every navigation — allow same-host HTTP(S), block everything else
        sandboxWebView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
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

                // Block non-web schemes (intent:, file:, javascript:, data:, etc.)
                if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
                    Toast.makeText(
                        this@SandboxActivity,
                        "⛔ Blocked: ${nextUrl.take(60)}",
                        Toast.LENGTH_SHORT
                    ).show()
                    return true // consumed — do NOT load
                }

                // Block cross-origin navigation (lock to original host)
                val nextHost = try { Uri.parse(nextUrl).host?.lowercase() ?: "" } catch (e: Exception) { "" }
                if (originalHost.isNotEmpty() && nextHost != originalHost &&
                    !nextHost.endsWith(".$originalHost")
                ) {
                    Toast.makeText(
                        this@SandboxActivity,
                        "⛔ Off-domain blocked: $nextHost",
                        Toast.LENGTH_SHORT
                    ).show()
                    return true // consumed — do NOT load
                }

                txtSandboxUrl.text = nextUrl
                return false // allow same-host load within WebView
            }
        }

        // 8. Block all popup windows from JS (window.open etc.)
        sandboxWebView.webChromeClient = object : WebChromeClient() {
            override fun onCreateWindow(
                view: WebView?,
                isDialog: Boolean,
                isUserGesture: Boolean,
                resultMsg: android.os.Message?
            ): Boolean {
                Toast.makeText(this@SandboxActivity, "⛔ Popup blocked", Toast.LENGTH_SHORT).show()
                return false
            }
        }

        // Back-press: navigate within sandbox history, or close
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (sandboxWebView.canGoBack()) sandboxWebView.goBack()
                else cleanupAndFinish()
            }
        })

        // 9. Load the target URL
        val loadUrl = if (url.startsWith("http://", ignoreCase = true) ||
            url.startsWith("https://", ignoreCase = true)
        ) url else "https://$url"
        sandboxWebView.loadUrl(loadUrl)
    }

    private fun cleanupAndFinish() {
        try {
            sandboxWebView.stopLoading()
            sandboxWebView.clearCache(true)
            sandboxWebView.clearHistory()
            sandboxWebView.clearFormData()
            sandboxWebView.loadUrl("about:blank")
            sandboxWebView.onPause()
            sandboxWebView.removeAllViews()
            sandboxWebView.destroy()
            // Flush cookies that may have slipped through
            CookieManager.getInstance().removeAllCookies(null)
            CookieManager.getInstance().flush()
        } catch (e: Exception) { /* ignore */ }
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        try { sandboxWebView.destroy() } catch (e: Exception) { /* ignore */ }
    }
}
