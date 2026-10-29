package com.phishguard

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.net.Uri
import android.net.http.SslError
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class SandboxActivity : AppCompatActivity() {

    private lateinit var sandboxWebView: WebView
    private lateinit var sandboxProgress: ProgressBar
    private lateinit var txtSandboxUrl: TextView
    private var originalHost: String = ""

    @SuppressLint("SetJavaScriptEnabled")
    @Suppress("DEPRECATION")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sandbox)

        val rawUrl = intent.getStringExtra("URL") ?: ""
        val targetUrl = when {
            rawUrl.startsWith("http://", ignoreCase = true) ||
            rawUrl.startsWith("https://", ignoreCase = true) -> rawUrl
            rawUrl.isNotBlank() -> "https://$rawUrl"
            else -> "about:blank"
        }

        // Parse and record original host for sandboxed isolation
        originalHost = try {
            Uri.parse(targetUrl).host?.lowercase() ?: ""
        } catch (e: Exception) { "" }

        txtSandboxUrl = findViewById(R.id.txtSandboxUrl)
        val btnSandboxClose = findViewById<TextView>(R.id.btnSandboxClose)
        val btnSandboxRefresh = findViewById<TextView>(R.id.btnSandboxRefresh)
        sandboxProgress = findViewById(R.id.sandboxProgress)
        sandboxWebView = findViewById(R.id.sandboxWebView)

        txtSandboxUrl.text = targetUrl

        btnSandboxClose.setOnClickListener {
            cleanupAndFinish()
        }

        btnSandboxRefresh.setOnClickListener {
            sandboxWebView.reload()
        }

        val settings = sandboxWebView.settings

        // 1. Enable JavaScript and modern viewport for proper website layout rendering
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true // Required by many web frameworks (React/Next/Angular) to render
        settings.databaseEnabled = false
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true

        // 2. Clear & isolate cache to prevent cross-session persistence
        settings.cacheMode = WebSettings.LOAD_NO_CACHE

        // 3. Block local file system and internal storage access
        settings.allowFileAccess = false
        settings.allowContentAccess = false
        settings.allowFileAccessFromFileURLs = false
        settings.allowUniversalAccessFromFileURLs = false

        // 4. Block geolocation requests and mixed content
        settings.setGeolocationEnabled(false)
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW

        // 5. Block popups / multiple windows
        settings.setSupportMultipleWindows(false)
        settings.javaScriptCanOpenWindowsAutomatically = false

        // 6. Clear session cookies on start
        try {
            val cm = CookieManager.getInstance()
            cm.setAcceptCookie(true)
            cm.removeAllCookies(null)
            cm.flush()
        } catch (e: Exception) { /* ignore */ }

        // 7. Controlled WebViewClient with SSL error handling and progress hooks
        sandboxWebView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                sandboxProgress.visibility = View.VISIBLE
                if (!url.isNullOrBlank()) {
                    txtSandboxUrl.text = url
                }
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                sandboxProgress.visibility = View.GONE
            }

            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                super.onReceivedError(view, errorCode, description, failingUrl)
                sandboxProgress.visibility = View.GONE
            }

            @SuppressLint("WebViewClientOnReceivedSslError")
            override fun onReceivedSslError(
                view: WebView?,
                handler: SslErrorHandler?,
                error: SslError?
            ) {
                // In sandbox mode, show alert or proceed with isolated inspection
                // Phishing sites often use invalid/self-signed SSL; proceed to allow visual inspection inside sandbox
                handler?.proceed()
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val nextUrl = request?.url?.toString() ?: return true
                return handleSandboxNavigation(nextUrl)
            }

            @Deprecated("Deprecated in Java")
            override fun shouldOverrideUrlLoading(view: WebView?, nextUrl: String?): Boolean {
                if (nextUrl == null) return true
                return handleSandboxNavigation(nextUrl)
            }

            private fun handleSandboxNavigation(nextUrl: String): Boolean {
                val lower = nextUrl.lowercase()

                // Block non-web schemes (intent:, market:, tel:, sms:, javascript:, data:, etc.)
                if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
                    Toast.makeText(
                        this@SandboxActivity,
                        "Blocked scheme: ${nextUrl.take(45)}",
                        Toast.LENGTH_SHORT
                    ).show()
                    return true
                }

                // Block cross-domain navigation to keep user securely contained to inspected host
                val nextHost = try { Uri.parse(nextUrl).host?.lowercase() ?: "" } catch (e: Exception) { "" }
                if (originalHost.isNotEmpty() && nextHost.isNotEmpty() &&
                    nextHost != originalHost && !nextHost.endsWith(".$originalHost") &&
                    !originalHost.endsWith(".$nextHost")
                ) {
                    Toast.makeText(
                        this@SandboxActivity,
                        "Off-domain navigation blocked: $nextHost",
                        Toast.LENGTH_SHORT
                    ).show()
                    return true
                }

                txtSandboxUrl.text = nextUrl
                return false
            }
        }

        // 8. WebChromeClient for smooth loading progress & popup rejection
        sandboxWebView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    sandboxProgress.visibility = View.VISIBLE
                    sandboxProgress.isIndeterminate = false
                    sandboxProgress.progress = newProgress
                } else {
                    sandboxProgress.visibility = View.GONE
                }
            }

            override fun onCreateWindow(
                view: WebView?,
                isDialog: Boolean,
                isUserGesture: Boolean,
                resultMsg: android.os.Message?
            ): Boolean {
                Toast.makeText(this@SandboxActivity, "Popup window blocked by Sandbox", Toast.LENGTH_SHORT).show()
                return false
            }
        }

        // Handle Back navigation within sandbox
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (sandboxWebView.canGoBack()) {
                    sandboxWebView.goBack()
                } else {
                    cleanupAndFinish()
                }
            }
        })

        // 9. Load target URL
        sandboxWebView.loadUrl(targetUrl)
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

            // Clear cookies & storage to prevent leakage
            val cm = CookieManager.getInstance()
            cm.removeAllCookies(null)
            cm.flush()
            WebStorage.getInstance().deleteAllData()
        } catch (e: Exception) { /* ignore */ }
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        try { sandboxWebView.destroy() } catch (e: Exception) { /* ignore */ }
    }
}
