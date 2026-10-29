package com.phishguard

import org.junit.Assert.*
import org.junit.Test

class PhishingEngineTest {

    @Test
    fun testEmptyUrlReturnsDangerousNotSafe() {
        val result = PhishingEngine.verifyUrl("")
        assertFalse(result.isSafe)
        assertEquals("DANGEROUS", result.rating)
        assertEquals(0, result.score)
    }

    @Test
    fun testNullUrlReturnsDangerous() {
        val result = PhishingEngine.verifyUrl(null)
        assertFalse(result.isSafe)
        assertEquals("DANGEROUS", result.rating)
    }

    @Test
    fun testMalformedUrlReturnsDangerous() {
        val result = PhishingEngine.verifyUrl("http://")
        assertFalse(result.isSafe)
        assertEquals("DANGEROUS", result.rating)
    }

    @Test
    fun testDangerousSchemesBlocked() {
        val jsResult = PhishingEngine.verifyUrl("javascript:alert(1)")
        assertFalse(jsResult.isSafe)
        assertEquals("DANGEROUS", jsResult.rating)

        val fileResult = PhishingEngine.verifyUrl("file:///etc/passwd")
        assertFalse(fileResult.isSafe)
        assertEquals("DANGEROUS", fileResult.rating)
    }

    @Test
    fun testWhitelistedBrandIsSafe() {
        val googleResult = PhishingEngine.verifyUrl("https://www.google.com")
        assertTrue(googleResult.isSafe)
        assertEquals(100, googleResult.score)
        assertEquals("SAFE", googleResult.rating)

        val subGoogle = PhishingEngine.verifyUrl("https://mail.google.com/mail/u/0")
        assertTrue(subGoogle.isSafe)
        assertEquals("SAFE", subGoogle.rating)
    }

    @Test
    fun testBrandAbuseSubdomainDetection() {
        // Attackers using brand in domain without being official subdomain
        val spoofResult = PhishingEngine.verifyUrl("http://google.com.attacker-controlled-site.xyz/login")
        assertFalse(spoofResult.isSafe)
        assertNotEquals("SAFE", spoofResult.rating)
        assertTrue(spoofResult.score < 50)
    }

    @Test
    fun testRawIpAddressDetection() {
        val ipResult = PhishingEngine.verifyUrl("http://192.168.1.1/admin")
        assertFalse(ipResult.isSafe)
        assertTrue(ipResult.warnings.any { it.contains("IP Domain") || it.contains("Insecure") })
    }

    @Test
    fun testPunycodeHomographDetection() {
        val punyResult = PhishingEngine.verifyUrl("http://xn--pypal-4ve.com")
        assertFalse(punyResult.isSafe)
        assertTrue(punyResult.warnings.any { it.contains("Homograph") })
    }

    @Test
    fun testTyposquattingDetection() {
        val typoResult = PhishingEngine.verifyUrl("http://g00gle.com")
        assertFalse(typoResult.isSafe)
        assertTrue(typoResult.warnings.isNotEmpty())
    }
}

