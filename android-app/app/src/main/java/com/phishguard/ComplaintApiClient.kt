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

    // Configurable backend URL.
    // 10.0.2.2 = emulator host loopback. 192.168.0.136 = LAN IP for USB-debugging on physical device.
    var baseUrl: String = "http://192.168.0.136:3000"

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

                val responseJson = try {
                    JSONObject(sb.toString())
                } catch (e: Exception) {
                    JSONObject()
                }

                if (statusCode in 200..299) {
                    val complaintId = responseJson.optString("complaintId", "PG-RECORDED")
                    val message = responseJson.optString("message", "Submitted successfully.")
                    val result = ComplaintResponse(
                        success = true,
                        complaintId = complaintId,
                        message = message,
                        error = null
                    )
                    callback.onSuccess(result)
                } else {
                    val errMsg = responseJson.optString("error", "HTTP error $statusCode")
                    callback.onError(errMsg)
                }
            } catch (e: Exception) {
                callback.onError(e.message ?: "Network error connecting to PhishGuard SecOps")
            } finally {
                connection?.disconnect()
            }
        }.start()
    }
}

