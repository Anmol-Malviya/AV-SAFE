package com.phishguard

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions
import com.google.mlkit.vision.barcode.common.Barcode
import java.net.URI

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val intentData: Uri? = intent.data
        val action: String? = intent.action

        if (Intent.ACTION_VIEW == action && intentData != null) {
            val url = intentData.toString()
            handleIncomingUrl(url)
        } else {
            // Opened from launcher icon
            setContentView(R.layout.activity_main)

            // Setup QR code scanner trigger
            val cardScanQr = findViewById<View>(R.id.cardScanQr)
            cardScanQr.setOnClickListener {
                val options = GmsBarcodeScannerOptions.Builder()
                    .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                    .enableAutoZoom()
                    .build()

                val scanner = GmsBarcodeScanning.getClient(this, options)

                scanner.startScan()
                    .addOnSuccessListener { barcode ->
                        val rawValue = barcode.rawValue
                        if (!rawValue.isNullOrBlank()) {
                            handleIncomingUrl(rawValue)
                        } else {
                            Toast.makeText(this, "Empty QR code detected.", Toast.LENGTH_SHORT).show()
                        }
                    }
                    .addOnFailureListener { e ->
                        Toast.makeText(this, "Scan failed: ${e.message}", Toast.LENGTH_SHORT).show()
                    }
            }

            val btnSettings = findViewById<Button>(R.id.btnSettings)
            btnSettings.setOnClickListener {
                try {
                    // Open default apps settings page (Android 7.0+)
                    val settingsIntent = Intent(Settings.ACTION_MANAGE_DEFAULT_APPS_SETTINGS)
                    startActivity(settingsIntent)
                } catch (e: Exception) {
                    try {
                        // Fallback to normal settings
                        val settingsIntent = Intent(Settings.ACTION_SETTINGS)
                        startActivity(settingsIntent)
                    } catch (ex: Exception) {
                        Toast.makeText(this, "Could not open settings. Please go to Settings -> Apps -> Default Apps manually.", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        val data = intent?.data
        if (intent?.action == Intent.ACTION_VIEW && data != null) {
            handleIncomingUrl(data.toString())
        }
    }

    private fun handleIncomingUrl(rawUrl: String) {
        val trimmed = rawUrl.trim()
        if (trimmed.isEmpty()) {
            Toast.makeText(this, "Empty link provided.", Toast.LENGTH_SHORT).show()
            return
        }

        // Scheme verification: reject non-http/https links before execution
        val scheme = try {
            val hasExplicitScheme = trimmed.startsWith("http://", ignoreCase = true) || 
                                    trimmed.startsWith("https://", ignoreCase = true)
            if (hasExplicitScheme) {
                URI(trimmed).scheme?.lowercase() ?: ""
            } else {
                if (trimmed.contains(":")) trimmed.substringBefore(":").lowercase() else "https"
            }
        } catch (e: Exception) {
            ""
        }

        if (scheme !in listOf("http", "https")) {
            Toast.makeText(this, "Blocked unsupported URI scheme: $scheme", Toast.LENGTH_LONG).show()
            val warningIntent = Intent(this, WarningActivity::class.java).apply {
                putExtra("URL", trimmed)
                putExtra("RATING", "DANGEROUS")
                putExtra("SCORE", 0)
                putStringArrayListExtra("WARNINGS", arrayListOf("• Unsupported or Malicious URI Protocol: '$scheme:' protocol is blocked by security policy."))
            }
            startActivity(warningIntent)
            finish()
            return
        }

        // Run Phishing Detection Engine
        val result = PhishingEngine.verifyUrl(trimmed)

        if (result.isSafe) {
            // Link is safe! Open in Chrome browser without intent looping
            openInChrome(result.url)
        } else {
            // Link is suspicious, dangerous, or unverified! Route to Warning Screen
            val warningIntent = Intent(this, WarningActivity::class.java).apply {
                putExtra("URL", result.url)
                putExtra("RATING", result.rating)
                putExtra("SCORE", result.score)
                putStringArrayListExtra("WARNINGS", ArrayList(result.warnings))
            }
            startActivity(warningIntent)
            finish()
        }
    }

    private fun openInChrome(url: String) {
        val uri = Uri.parse(url)
        try {
            val chromeIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                // Explicitly target Chrome package to prevent looping back into PhishGuard
                setPackage("com.android.chrome")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(chromeIntent)
        } catch (e: Exception) {
            // Chrome not installed, fall back to browser chooser excluding ourselves
            try {
                val genericIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                val chooser = Intent.createChooser(genericIntent, "Open Safe Link in Browser")
                startActivity(chooser)
            } catch (ex: Exception) {
                Toast.makeText(this, "No browser found to open link.", Toast.LENGTH_SHORT).show()
            }
        }
        finish()
    }
}
