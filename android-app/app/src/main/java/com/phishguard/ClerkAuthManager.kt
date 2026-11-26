package com.phishguard

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets

/**
 * Clerk Authentication and Session Manager for native Android.
 * Communicates with Clerk Frontend API to manage sign-in, token retrieval,
 * and secure credential storage.
 */
object ClerkAuthManager {
    private const val TAG = "ClerkAuthManager"
    private const val PREFS_NAME = "clerk_auth_prefs"
    private const val KEY_SESSION_TOKEN = "session_token"
    private const val KEY_USER_ID = "user_id"
    private const val KEY_USER_EMAIL = "user_email"

    // Clerk Application Publishable Key
    const val CLERK_PUBLISHABLE_KEY = "pk_test_YW1wbGUtZWZ0LTk4MjIuY2xlcmsuYWNjb3VudHMuZGV2JA"
    // Clerk Frontend API Host
    const val CLERK_FAPI_URL = "https://ample-eft-9822.clerk.accounts.dev"

    private var currentSessionToken: String? = null
    private var currentUserId: String? = null
    private var currentUserEmail: String? = null

    interface AuthCallback {
        fun onSuccess(userId: String, token: String)
        fun onError(error: String)
    }

    /**
     * Initializes authentication state from persistent secure shared preferences.
     */
    fun init(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        currentSessionToken = prefs.getString(KEY_SESSION_TOKEN, null)
        currentUserId = prefs.getString(KEY_USER_ID, null)
        currentUserEmail = prefs.getString(KEY_USER_EMAIL, null)
        Log.i(TAG, "ClerkAuthManager initialized. SignedIn: ${isSignedIn()}")
    }

    fun isSignedIn(): Boolean {
        return !currentSessionToken.isNullOrBlank() && !currentUserId.isNullOrBlank()
    }

    fun getSessionToken(): String? {
        return currentSessionToken
    }

    fun getUserId(): String? {
        return currentUserId
    }

    fun getUserEmail(): String? {
        return currentUserEmail
    }

    /**
     * Save authenticated session data locally
     */
    fun setSession(context: Context, token: String, userId: String, email: String? = null) {
        currentSessionToken = token
        currentUserId = userId
        currentUserEmail = email

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .putString(KEY_SESSION_TOKEN, token)
            .putString(KEY_USER_ID, userId)
            .putString(KEY_USER_EMAIL, email)
            .apply()
    }

    /**
     * Clear active session (Sign Out)
     */
    fun signOut(context: Context) {
        currentSessionToken = null
        currentUserId = null
        currentUserEmail = null

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().clear().apply()
        Log.i(TAG, "Clerk session cleared (Sign Out).")
    }

    /**
     * Authenticate with Clerk via email and password using Clerk Frontend API (FAPI).
     */
    fun signInWithCredentials(
        context: Context,
        identifier: String,
        password: String,
        callback: AuthCallback
    ) {
        Thread {
            var connection: HttpURLConnection? = null
            try {
                val endpoint = "$CLERK_FAPI_URL/v1/client/sign_ins"
                val url = URL(endpoint)
                connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
                connection.setRequestProperty("Accept", "application/json")
                connection.setRequestProperty("Clerk-API-Version", "2024-10-01")
                connection.connectTimeout = 10000
                connection.readTimeout = 10000
                connection.doOutput = true
                connection.doInput = true

                val jsonBody = JSONObject().apply {
                    put("identifier", identifier)
                    put("password", password)
                    put("strategy", "password")
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

                if (statusCode in 200..299) {
                    val root = JSONObject(responseStr)
                    val responseObj = root.optJSONObject("response") ?: root
                    val clientObj = root.optJSONObject("client")

                    // Extract session token or client session ID
                    var token = ""
                    var userId = ""

                    if (clientObj != null) {
                        val sessions = clientObj.optJSONArray("sessions")
                        if (sessions != null && sessions.length() > 0) {
                            val activeSession = sessions.getJSONObject(0)
                            token = activeSession.optString("last_active_token", "")
                            userId = activeSession.optJSONObject("user")?.optString("id", "") ?: ""
                        }
                    }

                    if (token.isEmpty()) {
                        // Fallback: extract from session object if present
                        token = responseObj.optString("created_session_id", "")
                        userId = responseObj.optString("user_id", "")
                    }

                    setSession(context, token, userId, identifier)
                    callback.onSuccess(userId, token)
                } else {
                    val errRoot = try { JSONObject(responseStr) } catch (e: Exception) { null }
                    val errMsg = errRoot?.optJSONArray("errors")?.optJSONObject(0)?.optString("message")
                        ?: "Authentication failed (HTTP $statusCode)"
                    callback.onError(errMsg)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Clerk authentication exception: ${e.message}", e)
                callback.onError(e.message ?: "Network error during authentication")
            } finally {
                connection?.disconnect()
            }
        }.start()
    }
}
