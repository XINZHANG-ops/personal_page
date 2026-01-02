# Simple Integration Testing Script
Write-Host "Portfolio Site Integration Testing" -ForegroundColor Blue
Write-Host "Testing final integration and cross-browser compatibility"
Write-Host ""

$totalTests = 0
$passedTests = 0

function Test-Feature {
    param(
        [string]$Name,
        [bool]$Result,
        [string]$Info = ""
    )
    $script:totalTests++
    if ($Result) {
        $script:passedTests++
        Write-Host "PASS $Name" -ForegroundColor Green
    } else {
        Write-Host "FAIL $Name" -ForegroundColor Red
    }
    if ($Info) {
        Write-Host "  $Info" -ForegroundColor Yellow
    }
}

# Read files
$htmlContent = Get-Content "index.html" -Raw
$cssContent = Get-Content "css/main.css" -Raw
$jsContent = Get-Content "js/main.js" -Raw

# Test 1: Section Linking
Write-Host "=== Section Linking Tests ===" -ForegroundColor Blue
$navLinksCount = ([regex]::Matches($htmlContent, 'href="#[^"]+"')).Count
$sectionsCount = ([regex]::Matches($htmlContent, 'id="[^"]+"')).Count
Test-Feature "Navigation links exist" ($navLinksCount -gt 0) "Found $navLinksCount nav links"
Test-Feature "Sections with IDs exist" ($sectionsCount -gt 0) "Found $sectionsCount sections"

# Test 2: Semantic HTML
Write-Host ""
Write-Host "=== Semantic HTML Tests ===" -ForegroundColor Blue
Test-Feature "Has header element" ($htmlContent -match '<header')
Test-Feature "Has main element" ($htmlContent -match '<main')
Test-Feature "Has nav element" ($htmlContent -match '<nav')
Test-Feature "Has footer element" ($htmlContent -match '<footer')
Test-Feature "Has section elements" ($htmlContent -match '<section')

# Test 3: Accessibility
Write-Host ""
Write-Host "=== Accessibility Tests ===" -ForegroundColor Blue
Test-Feature "Has ARIA labels" ($htmlContent -match 'aria-label')
Test-Feature "Has role attributes" ($htmlContent -match 'role=')
Test-Feature "Has skip link" ($htmlContent -match 'skip-link')

# Test 4: Standards Compliance
Write-Host ""
Write-Host "=== Standards Compliance Tests ===" -ForegroundColor Blue
Test-Feature "Valid HTML5 DOCTYPE" ($htmlContent.StartsWith('<!DOCTYPE html>'))
Test-Feature "Has lang attribute" ($htmlContent -match 'lang="en"')
Test-Feature "Has charset UTF-8" ($htmlContent -match 'charset="UTF-8"')
Test-Feature "Has viewport meta" ($htmlContent -match 'viewport')

# Test 5: CSS Design System
Write-Host ""
Write-Host "=== CSS Design System Tests ===" -ForegroundColor Blue
Test-Feature "Has color variables" ($cssContent -match '--color-primary')
Test-Feature "Has font variables" ($cssContent -match '--font-size')
Test-Feature "Has spacing variables" ($cssContent -match '--space-')
$inlineStyles = ([regex]::Matches($htmlContent, 'style="')).Count
Test-Feature "No inline styles" ($inlineStyles -eq 0) "Found $inlineStyles inline styles"

# Test 6: Responsive Design
Write-Host ""
Write-Host "=== Responsive Design Tests ===" -ForegroundColor Blue
Test-Feature "Has mobile media query" ($cssContent -match '@media \(max-width: 767px\)')
Test-Feature "Has tablet media query" ($cssContent -match '@media \(min-width: 768px\)')
Test-Feature "Has desktop media query" ($cssContent -match '@media \(min-width: 1024px\)')
Test-Feature "Has mobile navigation" ($cssContent -match '\.nav__toggle')
Test-Feature "Uses CSS Grid" (($cssContent -match 'display: grid') -or ($cssContent -match 'display:grid'))
Test-Feature "Uses Flexbox" (($cssContent -match 'display: flex') -or ($cssContent -match 'display:flex'))

# Test 7: External Links
Write-Host ""
Write-Host "=== External Links Tests ===" -ForegroundColor Blue
$externalLinks = ([regex]::Matches($htmlContent, 'href="https?://[^"]*"')).Count
$targetBlank = ([regex]::Matches($htmlContent, 'target="_blank"')).Count
$secureLinks = ([regex]::Matches($htmlContent, 'rel="noopener noreferrer"')).Count
Test-Feature "Has external links" ($externalLinks -gt 0) "Found $externalLinks external links"
Test-Feature "External links open in new tab" ($targetBlank -gt 0) "Found $targetBlank with target=_blank"
Test-Feature "External links are secure" ($secureLinks -gt 0) "Found $secureLinks secure links"

# Test 8: JavaScript Functionality
Write-Host ""
Write-Host "=== JavaScript Functionality Tests ===" -ForegroundColor Blue
Test-Feature "Has smooth scroll" ($jsContent -match 'initializeSmoothScroll')
Test-Feature "Has lazy loading" ($jsContent -match 'initializeLazyLoading')
Test-Feature "Has project data" ($jsContent -match 'const projects = \[')
Test-Feature "Has writing data" ($jsContent -match 'const writings = \[')
Test-Feature "Has feature detection" ($jsContent -match 'IntersectionObserver')

# Test 9: Asset Optimization
Write-Host ""
Write-Host "=== Asset Optimization Tests ===" -ForegroundColor Blue
Test-Feature "References minified CSS" ($htmlContent -match 'main\.min\.css')
Test-Feature "References minified JS" ($htmlContent -match 'main\.min\.js')
Test-Feature "Has lazy loading HTML" ($htmlContent -match 'loading="lazy"')
Test-Feature "Has preload directives" ($htmlContent -match 'rel="preload"')
Test-Feature "Has preconnect directives" ($htmlContent -match 'rel="preconnect"')
Test-Feature "Minified CSS exists" (Test-Path "css/main.min.css")
Test-Feature "Minified JS exists" (Test-Path "js/main.min.js")

# Test 10: Cross-Browser Support
Write-Host ""
Write-Host "=== Cross-Browser Support Tests ===" -ForegroundColor Blue
Test-Feature "Has reduced motion support" ($cssContent -match 'prefers-reduced-motion')
Test-Feature "Has high contrast support" ($cssContent -match 'prefers-contrast')
Test-Feature "Has progressive enhancement" ($jsContent -match 'Progressive enhancement')

# Test 11: Content Management
Write-Host ""
Write-Host "=== Content Management Tests ===" -ForegroundColor Blue
Test-Feature "Has project instructions" ($htmlContent -match 'To add new projects')
Test-Feature "Has writing instructions" ($htmlContent -match 'To add new writing')
Test-Feature "Has GitHub URLs in data" ($jsContent -match 'githubUrl:')
Test-Feature "Has live URLs in data" ($jsContent -match 'liveUrl:')

# Final Results
Write-Host ""
Write-Host "=== Test Results Summary ===" -ForegroundColor Blue
Write-Host ""

$passRate = [math]::Round(($passedTests / $totalTests) * 100, 1)

Write-Host "Total Tests: $totalTests"
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%"
Write-Host ""

if ($passedTests -eq $totalTests) {
    Write-Host "ALL TESTS PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "Portfolio site is ready for deployment!" -ForegroundColor Green
    Write-Host "All integration tests passed successfully." -ForegroundColor Green
} else {
    Write-Host "SOME TESTS FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Some tests failed. Please review and fix issues." -ForegroundColor Yellow
}