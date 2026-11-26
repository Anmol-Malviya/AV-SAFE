package com.phishguard

import android.content.Context
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets

object AppSyncManager {
    private const val TAG = "PhishGuardAppSync"

    // Primary and fallback endpoints
    var baseUrl: String = "https://av-safe.vercel.app"
    private const val FALLBACK_URL = "http://10.0.2.2:3000" // Localhost bridge for Android emulator / local testing

    data class ScanRecord(
        val url: String,
        val rating: String,
        val score: Int,
        val source: String = "Android App",
        val detectionReasons: List<String> = emptyList()
    )

    private fun postToEndpoint(targetBase: String, scan: ScanRecord): Boolean {
        var connection: HttpURLConnection? = null
        return try {
            val endpoint = "$targetBase/api/history"
            val targetUrl = URL(endpoint)
            connection = targetUrl.openConnection() as HttpURLConnection
            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
            connection.setRequestProperty("Accept", "application/json")
            connection.connectTimeout = 5000
            connection.readTimeout = 5000
            connection.doOutput = true
            connection.doInput = true

            val jsonBody = JSONObject().apply {
                put("url", scan.url)
                put("rating", scan.rating)
                put("score", scan.score)
                put("source", scan.source)
                val reasonsArray = JSONArray()
                scan.detectionReasons.forEach { reasonsArray.put(it) }
                put("detectionReasons", reasonsArray)
            }

            val os = connection.outputStream
            val writer = OutputStreamWriter(os, StandardCharsets.UTF_8)
            writer.write(jsonBody.toString())
            writer.flush()
            writer.close()
            os.close()

            val statusCode = connection.responseCode
            statusCode in 200..299
        } catch (e: Exception) {
            false
        } finally {
            connection?.disconnect()
        }
    }

    /**
     * Sends the scan result directly to the centralized Web Dashboard (/api/history)
     * asynchronously in background so mobile performance is never affected.
     * Tries primary production cloud server first, with graceful local fallback.
     */
    fun syncScanToDashboard(
        scan: ScanRecord,
        onComplete: ((Boolean) -> Unit)? = null
    ) {
        Thread {
            var success = postToEndpoint(baseUrl, scan)
            if (!success && baseUrl != FALLBACK_URL) {
                // Try fallback endpoint
                success = postToEndpoint(FALLBACK_URL, scan)
            }

            if (success) {
                Log.i(TAG, "Successfully synced scan [${scan.url}] to centralized Web Dashboard.")
            } else {
                Log.w(TAG, "Could not reach dashboard endpoint for [${scan.url}].")
            }
            onComplete?.invoke(success)
        }.start()
    }
}
