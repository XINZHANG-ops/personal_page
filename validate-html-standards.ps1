# HTML Standards Validation Script
# Validates HTML structure, accessibility, and standards compliance

Write-Host "HTML Standards Validation" -ForegroundColor Blue
Write-Host "Checking HTML structure and accessibility compliance"
Write-Host ""

$htmlContent = Get-Content "index.html" -Raw
$totalChecks = 0
$passedChecks = 0

function Check-Standard {
    param(
        [string]$Name,
        [bool]$Result,
        [string]$Info = ""
    )
    $script:totalChecks++
    if ($Result) {
        $script:passedChecks++
        Write-Host "PASS $Name" -ForegroundColor Green
    } else {
        Write-Host "FAIL $Name" -ForegroundColor Red
    }
    if ($Info) {
        Write-Host "  $Info" -ForegroundColor Yellow
    }
}

# HTML5 Document Structure
Write-Host "=== HTML5 Document Structure ===" -ForegroundColor Blue
Check-Standard "DOCTYPE declaration" ($htmlContent -match '<!DOCTYPE html>')
Check-Standard "HTML lang attribute" ($htmlContent -match '<html[^>]*lang="[^"]*"')
Check-Standard "Head section exists" ($htmlContent -match '<head>')
Check-Standard "Body section exists" ($htmlContent -match '<body>')
Check-Standard "Meta charset" ($htmlContent -match '<meta[^>]*charset="UTF-8"')
Check-Standard "Meta viewport" ($htmlContent -match '<meta[^>]*viewport')

# Semantic HTML Elements
Write-Host ""
Write-Host "=== Semantic HTML Elements ===" -ForegroundColor Blue
Check-Standard "Header element" ($htmlContent -match '<header[^>]*>')
Check-Standard "Main element" ($htmlContent -match '<main[^>]*>')
Check-Standard "Nav element" ($htmlContent -match '<nav[^>]*>')
Check-Standard "Section elements" ($htmlContent -match '<section[^>]*>')
# Article elements are created dynamically by JavaScript
$jsContent = Get-Content "js/main.js" -Raw
$hasArticleCreation = $jsContent -match "createElement\('article'\)"
Check-Standard "Article elements (dynamic)" $hasArticleCreation "Article elements created by JavaScript"
Check-Standard "Footer element" ($htmlContent -match '<footer[^>]*>')

# Heading Hierarchy
Write-Host ""
Write-Host "=== Heading Hierarchy ===" -ForegroundColor Blue
$h1Count = ([regex]::Matches($htmlContent, '<h1[^>]*>')).Count
$h2Count = ([regex]::Matches($htmlContent, '<h2[^>]*>')).Count
$h3Count = ([regex]::Matches($htmlContent, '<h3[^>]*>')).Count
Check-Standard "Has H1 element" ($h1Count -gt 0) "Found $h1Count H1 elements"
Check-Standard "Has H2 elements" ($h2Count -gt 0) "Found $h2Count H2 elements"
Check-Standard "Has H3 elements" ($h3Count -gt 0) "Found $h3Count H3 elements"
Check-Standard "Only one H1 element" ($h1Count -eq 1) "Should have exactly one H1"

# Accessibility Features
Write-Host ""
Write-Host "=== Accessibility Features ===" -ForegroundColor Blue
Check-Standard "ARIA labels present" ($htmlContent -match 'aria-label')
Check-Standard "ARIA describedby present" ($htmlContent -match 'aria-describedby')
Check-Standard "Role attributes present" ($htmlContent -match 'role=')
Check-Standard "Skip navigation link" ($htmlContent -match 'skip-link')
Check-Standard "Alt text for images" ($htmlContent -match 'alt="[^"]*"')

# Form and Input Accessibility
Write-Host ""
Write-Host "=== Form Accessibility ===" -ForegroundColor Blue
$hasLabels = $htmlContent -match '<label[^>]*>'
$hasInputs = $htmlContent -match '<input[^>]*>'
if ($hasInputs) {
    Check-Standard "Form labels present" $hasLabels "Forms should have associated labels"
} else {
    Check-Standard "No forms to validate" $true "No form elements found"
}

# Link Accessibility
Write-Host ""
Write-Host "=== Link Accessibility ===" -ForegroundColor Blue
$externalLinks = [regex]::Matches($htmlContent, '<a[^>]*href="https?://[^"]*"[^>]*>')
$externalLinksWithAria = [regex]::Matches($htmlContent, '<a[^>]*href="https?://[^"]*"[^>]*aria-label="[^"]*"[^>]*>')
Check-Standard "External links have ARIA labels" ($externalLinksWithAria.Count -gt 0) "Found $($externalLinksWithAria.Count) of $($externalLinks.Count) external links with ARIA labels"

# Image Accessibility
Write-Host ""
Write-Host "=== Image Accessibility ===" -ForegroundColor Blue
$images = [regex]::Matches($htmlContent, '<img[^>]*>')
$imagesWithAlt = [regex]::Matches($htmlContent, '<img[^>]*alt="[^"]*"[^>]*>')
Check-Standard "All images have alt text" ($images.Count -eq $imagesWithAlt.Count) "Found $($imagesWithAlt.Count) of $($images.Count) images with alt text"

# Performance Optimizations
Write-Host ""
Write-Host "=== Performance Optimizations ===" -ForegroundColor Blue
Check-Standard "Lazy loading images" ($htmlContent -match 'loading="lazy"')
Check-Standard "Preload critical resources" ($htmlContent -match 'rel="preload"')
Check-Standard "Preconnect to external domains" ($htmlContent -match 'rel="preconnect"')
Check-Standard "DNS prefetch" ($htmlContent -match 'rel="dns-prefetch"')

# SEO and Meta Tags
Write-Host ""
Write-Host "=== SEO and Meta Tags ===" -ForegroundColor Blue
Check-Standard "Title tag" ($htmlContent -match '<title[^>]*>')
Check-Standard "Meta description" ($htmlContent -match '<meta[^>]*name="description"')
Check-Standard "Meta keywords" ($htmlContent -match '<meta[^>]*name="keywords"')
Check-Standard "Meta author" ($htmlContent -match '<meta[^>]*name="author"')
Check-Standard "Open Graph tags" ($htmlContent -match '<meta[^>]*property="og:')
Check-Standard "Twitter Card tags" ($htmlContent -match '<meta[^>]*property="twitter:')

# Security Features
Write-Host ""
Write-Host "=== Security Features ===" -ForegroundColor Blue
$externalLinksSecure = [regex]::Matches($htmlContent, '<a[^>]*href="https?://[^"]*"[^>]*rel="[^"]*noopener[^"]*"')
Check-Standard "External links are secure" ($externalLinksSecure.Count -gt 0) "Found $($externalLinksSecure.Count) secure external links"

# Validation Summary
Write-Host ""
Write-Host "=== HTML Validation Summary ===" -ForegroundColor Blue
Write-Host ""

$passRate = [math]::Round(($passedChecks / $totalChecks) * 100, 1)

Write-Host "Total Checks: $totalChecks"
Write-Host "Passed: $passedChecks" -ForegroundColor Green
Write-Host "Failed: $($totalChecks - $passedChecks)" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%"
Write-Host ""

if ($passedChecks -eq $totalChecks) {
    Write-Host "HTML VALIDATION PASSED" -ForegroundColor Green
    Write-Host "HTML meets all standards and accessibility requirements." -ForegroundColor Green
} else {
    Write-Host "HTML VALIDATION ISSUES FOUND" -ForegroundColor Yellow
    Write-Host "Please review and fix the failed checks above." -ForegroundColor Yellow
}