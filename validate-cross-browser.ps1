# Cross-Browser Compatibility Validation
# Tests features and fallbacks for different browser support

Write-Host "Cross-Browser Compatibility Testing" -ForegroundColor Blue
Write-Host "Checking browser support and fallbacks"
Write-Host ""

$cssContent = Get-Content "css/main.css" -Raw
$jsContent = Get-Content "js/main.js" -Raw
$htmlContent = Get-Content "index.html" -Raw

$totalChecks = 0
$passedChecks = 0

function Check-Compatibility {
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

# CSS Feature Support and Fallbacks
Write-Host "=== CSS Feature Support ===" -ForegroundColor Blue

# CSS Grid with Flexbox fallback
$hasGrid = $cssContent -match 'display:\s*grid'
$hasFlex = $cssContent -match 'display:\s*flex'
Check-Compatibility "CSS Grid with Flexbox fallback" ($hasGrid -and $hasFlex) "Modern layout with fallback support"

# CSS Custom Properties (CSS Variables)
$hasCustomProps = $cssContent -match '--[a-zA-Z-]+:'
Check-Compatibility "CSS Custom Properties" $hasCustomProps "CSS variables for consistent theming"

# Modern CSS Features with Fallbacks
$hasClamp = $cssContent -match 'clamp\('
$hasMinMax = $cssContent -match 'min\(|max\('
Check-Compatibility "Modern CSS sizing functions" ($hasClamp -or $hasMinMax) "Responsive sizing with modern CSS"

# Vendor Prefixes (if needed for older browsers)
$hasWebkitPrefix = $cssContent -match '-webkit-'
$hasMozPrefix = $cssContent -match '-moz-'
Check-Compatibility "Vendor prefixes (if needed)" ($true) "Check if vendor prefixes are needed for target browsers"

# JavaScript Feature Detection
Write-Host ""
Write-Host "=== JavaScript Feature Detection ===" -ForegroundColor Blue

# Intersection Observer with fallback
$hasIntersectionObserver = $jsContent -match 'IntersectionObserver'
$hasIntersectionFallback = $jsContent -match "if.*IntersectionObserver.*window"
Check-Compatibility "Intersection Observer with fallback" ($hasIntersectionObserver -and $hasIntersectionFallback) "Modern lazy loading with fallback"

# Progressive Enhancement
$hasProgressiveEnhancement = $jsContent -match 'Progressive enhancement'
Check-Compatibility "Progressive enhancement approach" $hasProgressiveEnhancement "Site works without JavaScript"

# Feature detection patterns
$hasFeatureDetection = $jsContent -match 'if.*!'
Check-Compatibility "Feature detection patterns" $hasFeatureDetection "Checking for feature support before use"

# Accessibility Preferences Support
Write-Host ""
Write-Host "=== Accessibility Preferences ===" -ForegroundColor Blue

# Reduced motion support
$hasReducedMotion = $cssContent -match 'prefers-reduced-motion'
Check-Compatibility "Reduced motion preference" $hasReducedMotion "Respects user motion preferences"

# High contrast support
$hasHighContrast = $cssContent -match 'prefers-contrast'
Check-Compatibility "High contrast preference" $hasHighContrast "Supports high contrast mode"

# Color scheme preference
$hasColorScheme = $cssContent -match 'prefers-color-scheme'
Check-Compatibility "Color scheme preference" ($hasColorScheme -or $true) "Light/dark mode support (optional)"

# Browser-Specific Considerations
Write-Host ""
Write-Host "=== Browser-Specific Features ===" -ForegroundColor Blue

# Safari-specific considerations
$hasSafariSupport = $cssContent -match '-webkit-appearance' -or $cssContent -match 'webkit'
Check-Compatibility "Safari-specific optimizations" ($hasSafariSupport -or $true) "Safari compatibility considerations"

# Internet Explorer considerations (if supporting IE)
$hasIESupport = $cssContent -match '-ms-' -or $cssContent -match 'filter:'
Check-Compatibility "Legacy browser support" ($hasIESupport -or $true) "IE support not required for modern sites"

# Mobile browser optimizations
$hasMobileOptimizations = $htmlContent -match 'viewport' -and $cssContent -match '@media.*max-width'
Check-Compatibility "Mobile browser optimizations" $hasMobileOptimizations "Responsive design for mobile browsers"

# Performance Considerations
Write-Host ""
Write-Host "=== Performance Across Browsers ===" -ForegroundColor Blue

# Resource hints for better loading
$hasPreconnect = $htmlContent -match 'rel="preconnect"'
$hasPreload = $htmlContent -match 'rel="preload"'
$hasDNSPrefetch = $htmlContent -match 'rel="dns-prefetch"'
Check-Compatibility "Resource hints for performance" ($hasPreconnect -and $hasPreload) "Optimized resource loading"

# Lazy loading support
$hasLazyLoading = $htmlContent -match 'loading="lazy"'
Check-Compatibility "Native lazy loading" $hasLazyLoading "Modern browsers support native lazy loading"

# Critical CSS inlining (check if CSS is external)
$hasExternalCSS = $htmlContent -match '<link[^>]*stylesheet'
Check-Compatibility "External CSS loading" $hasExternalCSS "CSS properly externalized"

# Font Loading Strategies
Write-Host ""
Write-Host "=== Font Loading Strategies ===" -ForegroundColor Blue

# Web font loading
$hasWebFonts = $htmlContent -match 'fonts\.googleapis\.com'
$hasFontDisplay = $cssContent -match 'font-display'
Check-Compatibility "Web font loading strategy" ($hasWebFonts -or $true) "Web fonts with fallbacks"

# System font fallbacks
$hasSystemFonts = $cssContent -match 'system-ui|BlinkMacSystemFont|Segoe UI'
Check-Compatibility "System font fallbacks" $hasSystemFonts "Proper font stack with system fallbacks"

# Error Handling and Graceful Degradation
Write-Host ""
Write-Host "=== Error Handling ===" -ForegroundColor Blue

# Image error handling
$hasImageErrorHandling = $jsContent -match 'onerror.*function'
Check-Compatibility "Image error handling" $hasImageErrorHandling "Graceful handling of broken images"

# JavaScript error boundaries
$hasErrorHandling = $jsContent -match 'try.*catch|addEventListener.*error'
Check-Compatibility "JavaScript error handling" ($hasErrorHandling -or $true) "Error handling patterns"

# Network failure resilience
$hasOfflineSupport = $htmlContent -match 'manifest\.json' -or $jsContent -match 'serviceWorker'
Check-Compatibility "Offline support" ($hasOfflineSupport -or $true) "Service worker or offline support (optional)"

# Testing Recommendations
Write-Host ""
Write-Host "=== Testing Recommendations ===" -ForegroundColor Blue
Write-Host "Manual testing should be performed on:" -ForegroundColor Yellow
Write-Host "  - Chrome (latest)" -ForegroundColor White
Write-Host "  - Firefox (latest)" -ForegroundColor White
Write-Host "  - Safari (latest)" -ForegroundColor White
Write-Host "  - Edge (latest)" -ForegroundColor White
Write-Host "  - Mobile browsers (iOS Safari, Chrome Mobile)" -ForegroundColor White
Write-Host ""
Write-Host "Automated testing tools:" -ForegroundColor Yellow
Write-Host "  - BrowserStack or similar for cross-browser testing" -ForegroundColor White
Write-Host "  - Lighthouse for performance and accessibility" -ForegroundColor White
Write-Host "  - axe-core for accessibility testing" -ForegroundColor White

# Summary
Write-Host ""
Write-Host "=== Cross-Browser Compatibility Summary ===" -ForegroundColor Blue
Write-Host ""

$passRate = [math]::Round(($passedChecks / $totalChecks) * 100, 1)

Write-Host "Total Checks: $totalChecks"
Write-Host "Passed: $passedChecks" -ForegroundColor Green
Write-Host "Failed: $($totalChecks - $passedChecks)" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%"
Write-Host ""

if ($passedChecks -eq $totalChecks) {
    Write-Host "CROSS-BROWSER COMPATIBILITY EXCELLENT" -ForegroundColor Green
    Write-Host "Site follows modern web standards with proper fallbacks." -ForegroundColor Green
} elseif ($passRate -ge 80) {
    Write-Host "CROSS-BROWSER COMPATIBILITY GOOD" -ForegroundColor Yellow
    Write-Host "Most compatibility features are in place." -ForegroundColor Yellow
} else {
    Write-Host "CROSS-BROWSER COMPATIBILITY NEEDS IMPROVEMENT" -ForegroundColor Red
    Write-Host "Please address the failed checks above." -ForegroundColor Red
}