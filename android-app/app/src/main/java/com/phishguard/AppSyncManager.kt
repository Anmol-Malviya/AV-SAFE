package com.phishguard

import android.content.Context
import android.util.Log
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets

object AppSyncManager {
    private const val TAG = "PhishGuardAppSync"

    // Production centralized backend — Vercel deployment
    var baseUrl: String = "https://av-safe.vercel.app"

    data class ScanRecord(
        val url: String,
        val rating: String,
        val score: Int,
        val source: String = "Android App"
    )

    /**
     * Sends the scan result directly to the centralized Web Dashboard (/api/history)
     * asynchronously in background so mobile performance is never affected.
     */
    fun syncScanToDashboard(
        scan: ScanRecord,
        onComplete: ((Boolean) -> Unit)? = null
    ) {
        Thread {
            var connection: HttpURLConnection? = null
            try {
                val endpoint = "$baseUrl/api/history"
                val targetUrl = URL(endpoint)
                connection = targetUrl.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                connection.setRequestProperty("Accept", "application/json")
                connection.connectTimeout = 8000
                connection.readTimeout = 8000
                connection.doOutput = true
                connection.doInput = true

                val jsonBody = JSONObject().apply {
                    put("url", scan.url)
                    put("rating", scan.rating)
                    put("score", scan.score)
                    put("source", scan.source)
                }

                val os = connection.outputStream
                val writer = OutputStreamWriter(os, StandardCharsets.UTF_8)
                writer.write(jsonBody.toString())
                writer.flush()
                writer.close()
                os.close()

                val statusCode = connection.responseCode
                val stream = if (statusCode in 200..299) {
                    connection.inputStream
                } else {
                    connection.errorStream ?: connection.inputStream
                }

                val reader = BufferedReader(InputStreamReader(stream, StandardCharsets.UTF_8))
                val sb = StringBuilder()
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    sb.append(line)
                }
                reader.close()

                if (statusCode in 200..299) {
                    Log.i(TAG, "Successfully synced scan [${scan.url}] to centralized Web Dashboard.")
                    onComplete?.invoke(true)
                } else {
                    Log.w(TAG, "Dashboard sync returned HTTP $statusCode: $sb")
                    onComplete?.invoke(false)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to sync scan to Centralized Dashboard: ${e.message}")
                onComplete?.invoke(false)
            } finally {
                connection?.disconnect()
            }
        }.start()
    }
}

