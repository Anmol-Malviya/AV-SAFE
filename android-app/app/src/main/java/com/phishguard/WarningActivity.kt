package com.phishguard

import android.app.AlertDialog
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
        val txtWarningReasons = findViewById<TextView>(R.id.txtWarningReasons)
        val btnGoBack = findViewById<Button>(R.id.btnGoBack)
        val btnOpenSandbox = findViewById<Button>(R.id.btnOpenSandbox)
        val btnReportComplaint = findViewById<Button>(R.id.btnReportComplaint)
        val txtAdvancedToggle = findViewById<TextView>(R.id.txtAdvancedToggle)
        val btnIgnoreAndOpen = findViewById<Button>(R.id.btnIgnoreAndOpen)

        txtUrlBlocked.text = url

        // Dynamic styling depending on whether link is DANGEROUS, SUSPICIOUS, or SCAN_FAILURE
        if (rating == "DANGEROUS") {
            txtWarningTitle.text = "High-Risk Threat Blocked"
            txtScoreVerdict.text = "Safety Score: $score / 100 (DANGEROUS)"
        } else if (rating == "SUSPICIOUS") {
            txtWarningTitle.text = "Suspicious Link Warning"
            txtScoreVerdict.text = "Safety Score: $score / 100 (SUSPICIOUS)"
        } else {
            txtWarningTitle.text = "Scan Uncertainty Warning"
            txtScoreVerdict.text = "Safety Score: $score / 100 ($rating)"
        }

        // Build bullet-pointed text for warning reasons
        if (warnings.isNotEmpty()) {
            val sb = StringBuilder()
            for (w in warnings) {
                sb.append(w).append("\n\n")
            }
            txtWarningReasons.text = sb.toString().trim()
        } else {
            txtWarningReasons.text = "• Phishing Safety Score: $score/100.\n• Potential social engineering, brand mimicry, or deceptive content."
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

        txtAdvancedToggle.setOnClickListener {
            if (btnIgnoreAndOpen.visibility == View.GONE) {
                btnIgnoreAndOpen.visibility = View.VISIBLE
                txtAdvancedToggle.text = "Advanced Options ▴"
            } else {
                btnIgnoreAndOpen.visibility = View.GONE
                txtAdvancedToggle.text = "Advanced Options ▾"
            }
        }

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
                            Toast.makeText(this@WarningActivity, "Report submission failed: $error", Toast.LENGTH_LONG).show()
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
            .setMessage("Your threat report has been registered with SecOps under Case ID:\n\n$complaintId\n\nThank you for helping keep the network safe.")
            .setPositiveButton("OK", null)
            .show()
    }

    private fun openInChrome(url: String) {
        try {
            val chromeIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                setPackage("com.android.chrome")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(chromeIntent)
        } catch (e: Exception) {
            try {
                val genericIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                val chooser = Intent.createChooser(genericIntent, "Open anyway in Browser")
                startActivity(chooser)
            } catch (ex: Exception) {
                Toast.makeText(this, "No browser found.", Toast.LENGTH_SHORT).show()
            }
        }
        finish()
    }
}
