package com.phishguard

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets
import java.util.UUID

object ComplaintApiClient {

    var baseUrl: String = "https://av-safe.vercel.app"

    data class ComplaintRequest(
        val originalUrl: String,
        val category: String,
        val description: String,
        val detectionVerdict: String,
        val safetyScore: Int,
        val detectionReasons: List<String>,
        val idempotencyKey: String = UUID.randomUUID().toString()
    )

    data class ComplaintResponse(
        val success: Boolean,
        val complaintId: String?,
        val message: String?,
        val error: String?
    )

    interface Callback {
        fun onSuccess(response: ComplaintResponse)
        fun onError(error: String)
    }

    /**
     * Submits a confirmed complaint report asynchronously on a background worker thread.
     * Automatically includes Clerk Authorization token if signed in.
     */
    fun submitComplaint(
        context: Context,
        request: ComplaintRequest,
        callback: Callback
    ) {
        Thread {
            var connection: HttpURLConnection? = null
            try {
                val endpoint = "$baseUrl/api/complaints"
                val url = URL(endpoint)
                connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                connection.setRequestProperty("Accept", "application/json")

                // If signed in, pass Clerk session token
                val token = ClerkAuthManager.getSessionToken()
                if (!token.isNullOrBlank()) {
                    connection.setRequestProperty("Authorization", "Bearer $token")
                }

                connection.connectTimeout = 8000
                connection.readTimeout = 8000
                connection.doOutput = true
                connection.doInput = true

                val jsonBody = JSONObject().apply {
                    put("confirmed", true)
                    put("originalUrl", request.originalUrl)
                    put("category", request.category)
                    put("description", request.description)
                    put("detectionVerdict", request.detectionVerdict)
                    put("safetyScore", request.safetyScore)
                    put("source", "ANDROID_BROWSER")
                    put("idempotencyKey", request.idempotencyKey)

                    val reasonsArr = JSONArray()
                    for (r in request.detectionReasons) {
                        reasonsArr.put(r)
                    }
                    put("detectionReasons", reasonsArr)
                }

                val os = connection.outputStream
                val writer = OutputStreamWriter(os, StandardCharsets.UTF_8)
                writer.write(jsonBody.toString())
                writer.flush()
                writer.close()
                os.close()

                val statusCode = connection.responseCode
                val stream = if (statusCode in 200..299) connection.inputStream else connection.errorStream
                val reader = BufferedReader(InputStreamReader(stream, StandardCharsets.UTF_8))
                val responseStr = reader.use { it.readText() }

                val json = JSONObject(responseStr)
                if (statusCode in 200..299) {
                    val complaintId = json.optString("complaintId", null)
                    val message = json.optString("message", "Complaint registered successfully.")
                    callback.onSuccess(ComplaintResponse(true, complaintId, message, null))
                } else {
                    val err = json.optString("error", "Failed to submit complaint (HTTP $statusCode)")
                    callback.onError(err)
                }
            } catch (e: Exception) {
                callback.onError(e.message ?: "Failed to connect to complaint service")
            } finally {
                connection?.disconnect()
            }
        }.start()
    }
}
