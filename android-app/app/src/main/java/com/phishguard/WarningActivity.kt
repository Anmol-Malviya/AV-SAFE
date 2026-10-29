package com.phishguard

import android.app.AlertDialog
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity

class WarningActivity : AppCompatActivity() {

    private var isSubmittingComplaint = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_warning)

        val url = intent.getStringExtra("URL") ?: ""
        val rating = intent.getStringExtra("RATING") ?: "SUSPICIOUS"
        val score = intent.getIntExtra("SCORE", 0)
        val warnings = intent.getStringArrayListExtra("WARNINGS") ?: ArrayList<String>()

        val txtWarningTitle = findViewById<TextView>(R.id.txtWarningTitle)
        val txtScoreVerdict = findViewById<TextView>(R.id.txtScoreVerdict)
        val txtUrlBlocked = findViewById<TextView>(R.id.txtUrlBlocked)
        val btnCopyUrl = findViewById<View>(R.id.btnCopyUrl)
        val txtWarningReasons = findViewById<TextView>(R.id.txtWarningReasons)
        val btnGoBack = findViewById<View>(R.id.btnGoBack)
        val btnOpenSandbox = findViewById<View>(R.id.btnOpenSandbox)
        val btnReportComplaint = findViewById<View>(R.id.btnReportComplaint)
        val layoutAdvancedToggle = findViewById<View>(R.id.layoutAdvancedToggle)
        val txtAdvancedToggle = findViewById<TextView>(R.id.txtAdvancedToggle)
        val btnIgnoreAndOpen = findViewById<View>(R.id.btnIgnoreAndOpen)

        txtUrlBlocked.text = url

        // Copy URL action with clipboard feedback
        btnCopyUrl.setOnClickListener {
            if (url.isNotEmpty()) {
                val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                val clip = ClipData.newPlainText("Blocked URL", url)
                clipboard.setPrimaryClip(clip)
                Toast.makeText(this, "URL copied to clipboard", Toast.LENGTH_SHORT).show()
            }
        }

        // Dynamic styling depending on whether link is DANGEROUS, SUSPICIOUS, or SCAN_FAILURE
        if (rating == "DANGEROUS") {
            txtWarningTitle.text = "High-Risk Threat Blocked"
            txtScoreVerdict.text = "Safety Score: $score / 100  ·  DANGEROUS"
        } else if (rating == "SUSPICIOUS") {
            txtWarningTitle.text = "Suspicious Link Warning"
            txtScoreVerdict.text = "Safety Score: $score / 100  ·  SUSPICIOUS"
        } else {
            txtWarningTitle.text = "Scan Uncertainty Warning"
            txtScoreVerdict.text = "Safety Score: $score / 100  ·  $rating"
        }

        // Format detection reasons cleanly
        if (warnings.isNotEmpty()) {
            val sb = StringBuilder()
            for (w in warnings) {
                val cleaned = w.removePrefix("•").removePrefix("-").trim()
                sb.append(cleaned).append("\n")
            }
            txtWarningReasons.text = sb.toString().trim()
        } else {
            txtWarningReasons.text = "Deceptive patterns detected: Potential social engineering, brand mimicry, or unsafe destination."
        }

        btnGoBack.setOnClickListener {
            // Close app and return to safety
            finish()
        }

        btnOpenSandbox.setOnClickListener {
            // Open WebView in secure isolated sandbox
            val sandboxIntent = Intent(this, SandboxActivity::class.java).apply {
                putExtra("URL", url)
            }
            startActivity(sandboxIntent)
        }

        btnReportComplaint.setOnClickListener {
            showComplaintDialog(url, rating, score, warnings)
        }

        val toggleAdvancedAction = View.OnClickListener {
            if (btnIgnoreAndOpen.visibility == View.GONE) {
                btnIgnoreAndOpen.visibility = View.VISIBLE
                txtAdvancedToggle.text = "Advanced Options ∧"
            } else {
                btnIgnoreAndOpen.visibility = View.GONE
                txtAdvancedToggle.text = "Advanced Options ∨"
            }
        }

        layoutAdvancedToggle.setOnClickListener(toggleAdvancedAction)
        txtAdvancedToggle.setOnClickListener(toggleAdvancedAction)

        btnIgnoreAndOpen.setOnClickListener {
            // Explicit user override action with dialog confirmation
            AlertDialog.Builder(this)
                .setTitle("Dangerous Override")
                .setMessage("Are you sure you want to ignore this security block and open this link directly in Chrome? Malicious scripts or phishing forms may compromise your credentials.")
                .setPositiveButton("Proceed Anyway") { _, _ ->
                    openInChrome(url)
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
    }

    private fun showComplaintDialog(
        url: String,
        rating: String,
        score: Int,
        warnings: List<String>
    ) {
        val dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_complaint_report, null)
        val txtTargetUrl = dialogView.findViewById<TextView>(R.id.dialogComplaintTargetUrl)
        val txtVerdict = dialogView.findViewById<TextView>(R.id.dialogComplaintVerdict)
        val spinnerCategory = dialogView.findViewById<Spinner>(R.id.spinnerCategory)
        val editDescription = dialogView.findViewById<EditText>(R.id.editComplaintDescription)
        val progressBar = dialogView.findViewById<ProgressBar>(R.id.progressSubmitting)
        val btnCancel = dialogView.findViewById<Button>(R.id.btnCancelComplaint)
        val btnConfirm = dialogView.findViewById<Button>(R.id.btnConfirmSubmitComplaint)

        txtTargetUrl.text = "Target: $url"
        txtVerdict.text = "Detection: $rating (Safety Score: $score/100)"

        val categories = arrayOf("PHISHING", "MALWARE", "FAKE_LOGIN", "SCAM", "SUSPICIOUS_REDIRECT", "OTHER")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, categories)
        spinnerCategory.adapter = adapter

        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .setCancelable(true)
            .create()

        btnCancel.setOnClickListener {
            if (!isSubmittingComplaint) dialog.dismiss()
        }

        btnConfirm.setOnClickListener {
            if (isSubmittingComplaint) return@setOnClickListener
            isSubmittingComplaint = true
            progressBar.visibility = View.VISIBLE
            btnConfirm.isEnabled = false
            btnCancel.isEnabled = false

            val selectedCategory = spinnerCategory.selectedItem?.toString() ?: "PHISHING"
            val userDescription = editDescription.text.toString().trim()

            val request = ComplaintApiClient.ComplaintRequest(
                originalUrl = url,
                category = selectedCategory,
                description = userDescription,
                detectionVerdict = rating,
                safetyScore = score,
                detectionReasons = warnings
            )

            ComplaintApiClient.submitComplaint(
                this,
                request,
                object : ComplaintApiClient.Callback {
                    override fun onSuccess(response: ComplaintApiClient.ComplaintResponse) {
                        runOnUiThread {
                            isSubmittingComplaint = false
                            dialog.dismiss()
                            showComplaintSuccessDialog(response.complaintId ?: "PG-CONFIRMED")
                        }
                    }

                    override fun onError(error: String) {
                        runOnUiThread {
                            isSubmittingComplaint = false
                            progressBar.visibility = View.GONE
                            btnConfirm.isEnabled = true
                            btnCancel.isEnabled = true
                            Toast.makeText(this@WarningActivity, "Failed to submit: $error", Toast.LENGTH_LONG).show()
                        }
                    }
                }
            )
        }

        dialog.show()
    }

    private fun showComplaintSuccessDialog(complaintId: String) {
        AlertDialog.Builder(this)
            .setTitle("Complaint Registered")
            .setMessage("Thank you for reporting this incident. Your report has been dispatched to cyber defense authorities.\n\nTracking ID: $complaintId")
            .setPositiveButton("Done", null)
            .show()
    }

    private fun openInChrome(url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                setPackage("com.android.chrome")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
            finish()
        } catch (e: Exception) {
            val genericIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(genericIntent)
            finish()
        }
    }
}
