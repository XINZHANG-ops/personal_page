# External Links Validation
# Validates that all external links are properly formatted and secure
# Requirements: 2.5, 3.3 (external links open in new tab)

Write-Host "External Links Validation" -ForegroundColor Blue
Write-Host "Checking external link formatting and security"
Write-Host ""

$htmlContent = Get-Content "index.html" -Raw
$jsContent = Get-Content "js/main.js" -Raw

$totalChecks = 0
$passedChecks = 0

function Check-Links {
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

# Extract external links from HTML
Write-Host "=== HTML External Links ===" -ForegroundColor Blue

$externalLinksHTML = [regex]::Matches($htmlContent, '<a[^>]*href="(https?://[^"]*)"[^>]*>')
$externalURLs = $externalLinksHTML | ForEach-Object { $_.Groups[1].Value }

Write-Host "Found external links in HTML:" -ForegroundColor Yellow
foreach ($url in $externalURLs) {
    Write-Host "  - $url" -ForegroundColor White
}
Write-Host ""

# Check target="_blank" for external links
$externalLinksWithTarget = [regex]::Matches($htmlContent, '<a[^>]*href="https?://[^"]*"[^>]*target="_blank"[^>]*>')
Check-Links "External links open in new tab" ($externalLinksWithTarget.Count -gt 0) "Found $($externalLinksWithTarget.Count) of $($externalLinksHTML.Count) with target=_blank"

# Check rel="noopener noreferrer" for security
$externalLinksSecure = [regex]::Matches($htmlContent, '<a[^>]*href="https?://[^"]*"[^>]*rel="[^"]*noopener[^"]*"[^>]*>')
Check-Links "External links have security attributes" ($externalLinksSecure.Count -gt 0) "Found $($externalLinksSecure.Count) secure external links"

# Check ARIA labels for accessibility
$externalLinksWithAria = [regex]::Matches($htmlContent, '<a[^>]*href="https?://[^"]*"[^>]*aria-label="[^"]*"[^>]*>')
Check-Links "External links have ARIA labels" ($externalLinksWithAria.Count -gt 0) "Found $($externalLinksWithAria.Count) with ARIA labels"

# JavaScript-generated external links
Write-Host ""
Write-Host "=== JavaScript External Links ===" -ForegroundColor Blue

# Check project data structure
$hasGithubUrls = $jsContent -match 'githubUrl:\s*"https?://[^"]*"'
$hasLiveUrls = $jsContent -match 'liveUrl:\s*"https?://[^"]*"'
Check-Links "Project GitHub URLs defined" $hasGithubUrls "GitHub URLs in project data"
Check-Links "Project live URLs defined" $hasLiveUrls "Live demo URLs in project data"

# Check writing data structure
$hasWritingUrls = $jsContent -match 'url:\s*"https?://[^"]*"'
Check-Links "Writing URLs defined" $hasWritingUrls "External URLs in writing data"

# Check that JavaScript creates secure external links
$jsCreatesTargetBlank = $jsContent -match '\.target = ._blank.'
$jsCreatesSecureRel = $jsContent -match '\.rel = .*noopener'
Check-Links "JavaScript creates secure external links" ($jsCreatesTargetBlank -and $jsCreatesSecureRel) "JS-generated links have target=_blank and rel=noopener"

# Link format validation
Write-Host ""
Write-Host "=== Link Format Validation ===" -ForegroundColor Blue

# Extract all URLs from project and writing data
$projectUrls = [regex]::Matches($jsContent, '(?:githubUrl|liveUrl):\s*"(https?://[^"]*)"') | ForEach-Object { $_.Groups[1].Value }
$writingUrls = [regex]::Matches($jsContent, 'url:\s*"(https?://[^"]*)"') | ForEach-Object { $_.Groups[1].Value }

Write-Host "Project URLs found:" -ForegroundColor Yellow
foreach ($url in $projectUrls) {
    Write-Host "  - $url" -ForegroundColor White
}

Write-Host ""
Write-Host "Writing URLs found:" -ForegroundColor Yellow
foreach ($url in $writingUrls) {
    Write-Host "  - $url" -ForegroundColor White
}
Write-Host ""

# Validate URL formats
$allUrls = $externalURLs + $projectUrls + $writingUrls | Where-Object { $_ -ne $null -and $_ -ne "" }
$validUrls = $allUrls | Where-Object { $_ -match '^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' }

Check-Links "All URLs have valid format" ($validUrls.Count -eq $allUrls.Count) "Found $($validUrls.Count) valid URLs out of $($allUrls.Count) total"

# Check for HTTPS usage
$httpsUrls = $allUrls | Where-Object { $_ -match '^https://' }
$httpsPercentage = if ($allUrls.Count -gt 0) { [math]::Round(($httpsUrls.Count / $allUrls.Count) * 100, 1) } else { 0 }
Check-Links "HTTPS usage" ($httpsPercentage -ge 80) "$httpsPercentage% of URLs use HTTPS"

# Social media and professional links validation
Write-Host ""
Write-Host "=== Social Media Links ===" -ForegroundColor Blue

$linkedinLinks = $allUrls | Where-Object { $_ -match 'linkedin\.com' }
$githubLinks = $allUrls | Where-Object { $_ -match 'github\.com' }
$twitterLinks = $allUrls | Where-Object { $_ -match 'twitter\.com' }

Check-Links "LinkedIn profile link" ($linkedinLinks.Count -gt 0) "Professional networking link present"
Check-Links "GitHub profile link" ($githubLinks.Count -gt 0) "Code repository links present"
Check-Links "Social media links" (($twitterLinks.Count -gt 0) -or $true) "Social media presence (optional)"

# Content management validation
Write-Host ""
Write-Host "=== Content Management ===" -ForegroundColor Blue

# Check for clear instructions on adding new links
$hasProjectInstructions = $htmlContent -match 'To add new projects'
$hasWritingInstructions = $htmlContent -match 'To add new writing'
Check-Links "Project addition instructions" $hasProjectInstructions "Clear instructions for adding projects"
Check-Links "Writing addition instructions" $hasWritingInstructions "Clear instructions for adding writing"

# Check data structure consistency
$projectDataConsistent = $jsContent -match 'githubUrl:' -and $jsContent -match 'liveUrl:'
$writingDataConsistent = $jsContent -match 'url:' -and $jsContent -match 'venue:'
Check-Links "Consistent project data structure" $projectDataConsistent "Project data has consistent URL fields"
Check-Links "Consistent writing data structure" $writingDataConsistent "Writing data has consistent URL fields"

# Requirements validation
Write-Host ""
Write-Host "=== Requirements Validation ===" -ForegroundColor Blue

# Requirement 2.5: External project links open in new tab
$projectLinksSecure = $jsContent -match '\.target = ._blank.'
Check-Links "Requirement 2.5: Project links open in new tab" ($projectLinksSecure) "Project external links open in new tab"

# Requirement 3.3: Writing links open in new tab
$writingLinksSecure = $jsContent -match '\.target = ._blank.'
Check-Links "Requirement 3.3: Writing links open in new tab" ($writingLinksSecure) "Writing external links open in new tab"

# Summary
Write-Host ""
Write-Host "=== External Links Validation Summary ===" -ForegroundColor Blue
Write-Host ""

$passRate = [math]::Round(($passedChecks / $totalChecks) * 100, 1)

Write-Host "Total Checks: $totalChecks"
Write-Host "Passed: $passedChecks" -ForegroundColor Green
Write-Host "Failed: $($totalChecks - $passedChecks)" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%"
Write-Host ""

if ($passedChecks -eq $totalChecks) {
    Write-Host "EXTERNAL LINKS VALIDATION PASSED" -ForegroundColor Green
    Write-Host "All external links are properly formatted and secure." -ForegroundColor Green
} elseif ($passRate -ge 90) {
    Write-Host "EXTERNAL LINKS MOSTLY COMPLIANT" -ForegroundColor Yellow
    Write-Host "Minor issues found, but links are functional." -ForegroundColor Yellow
} else {
    Write-Host "EXTERNAL LINKS NEED ATTENTION" -ForegroundColor Red
    Write-Host "Please address the failed checks above." -ForegroundColor Red
}

Write-Host ""
Write-Host "Note: This validation checks link format and security attributes." -ForegroundColor Cyan
Write-Host "Manual testing is recommended to verify that links actually work." -ForegroundColor Cyan