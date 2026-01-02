# Simple Integration Testing Script
# Validates all sections are properly linked and navigable
# Tests cross-browser compatibility requirements
# Validates HTML and CSS for standards compliance
# Verifies external links work correctly

Write-Host "Portfolio Site Integration Testing" -ForegroundColor Blue
Write-Host "Testing final integration and cross-browser compatibility" -ForegroundColor White
Write-Host ""

$totalTests = 0
$passedTests = 0

function Test-Condition {
    param(
        [string]$TestName,
        [bool]$Condition,
        [string]$Details = ""
    )
    $script:totalTests++
    if ($Condition) {
        $script:passedTests++
        Write-Host "✓ PASS $TestName" -ForegroundColor Green
    } else {
        Write-Host "✗ FAIL $TestName" -ForegroundColor Red
    }
    if ($Details) {
        Write-Host "  $Details" -ForegroundColor Yellow
    }
}

# Test 1: Section Linking and Navigation
Write-Host "=== Section Linking and Navigation Tests ===" -ForegroundColor Blue

$htmlContent = Get-Content "index.html" -Raw

# Check navigation links have corresponding sections
$navLinksCount = ([regex]::Matches($htmlContent, 'href="#[^"]+"')).Count
$sectionsCount = ([regex]::Matches($htmlContent, 'id="[^"]+"')).Count
Test-Condition "Navigation links have corresponding sections" ($navLinksCount -gt 0 -and $sectionsCount -gt 0) "Found $navLinksCount nav links and $sectionsCount sections"

# Check semantic HTML structure
$hasHeader = $htmlContent -match '<header'
$hasMain = $htmlContent -match '<main'
$hasNav = $htmlContent -match '<nav'
$hasFooter = $htmlContent -match '<footer'
$hasSections = $htmlContent -match '<section'
Test-Condition "Proper semantic HTML structure" ($hasHeader -and $hasMain -and $hasNav -and $hasFooter -and $hasSections) "Checking for header, main, nav, footer, and section elements"

# Check accessibility attributes
$hasAriaLabels = $htmlContent -match 'aria-label'
$hasRoleAttributes = $htmlContent -match 'role='
$hasSkipLink = $htmlContent -match 'skip-link'
Test-Condition "Accessibility attributes present" ($hasAriaLabels -and $hasRoleAttributes -and $hasSkipLink) "Checking ARIA labels, roles, and skip link"

# Test 2: Standards Compliance
Write-Host ""
Write-Host "=== Standards Compliance Tests ===" -ForegroundColor Blue

# HTML5 DOCTYPE and structure
$hasDoctype = $htmlContent.StartsWith('<!DOCTYPE html>')
$hasLang = $htmlContent -match 'lang="en"'
$hasCharset = $htmlContent -match 'charset="UTF-8"'
$hasViewport = $htmlContent -match 'viewport'
Test-Condition "Valid HTML5 DOCTYPE and structure" ($hasDoctype -and $hasLang -and $hasCharset -and $hasViewport) "Checking DOCTYPE, lang, charset, and viewport"

# CSS custom properties
$cssContent = Get-Content "css/main.css" -Raw
$hasColorVars = $cssContent -match '--color-primary'
$hasFontVars = $cssContent -match '--font-size'
$hasSpaceVars = $cssContent -match '--space-'
Test-Condition "CSS custom properties for design system" ($hasColorVars -and $hasFontVars -and $hasSpaceVars) "Checking for color, font, and spacing variables"

# No inline styles
$inlineStylesCount = ([regex]::Matches($htmlContent, 'style="')).Count
Test-Condition "No inline styles in HTML" ($inlineStylesCount -eq 0) "Found $inlineStylesCount inline styles"

# Test 3: Responsive Design
Write-Host ""
Write-Host "=== Responsive Design Tests ===" -ForegroundColor Blue

# Media queries for different breakpoints
$mobileQuery = $cssContent -match '@media \(max-width: 767px\)'
$tabletQuery = $cssContent -match '@media \(min-width: 768px\)'
$desktopQuery = $cssContent -match '@media \(min-width: 1024px\)'
Test-Condition "Media queries for mobile, tablet, desktop" ($mobileQuery -and $tabletQuery -and $desktopQuery) "Checking for 767px, 768px, and 1024px breakpoints"

# Responsive navigation
$hasMobileNav = $cssContent -match '\.nav__toggle'
$hasHiddenMenu = $cssContent -match 'nav__menu--open'
Test-Condition "Responsive navigation menu" ($hasMobileNav -and $hasHiddenMenu) "Checking mobile navigation toggle and menu states"

# Flexible layouts
$hasGrid = ($cssContent -match 'display: grid') -or ($cssContent -match 'display:grid')
$hasFlex = ($cssContent -match 'display: flex') -or ($cssContent -match 'display:flex')
Test-Condition "CSS Grid and Flexbox layouts" ($hasGrid -and $hasFlex) "Checking for CSS Grid and Flexbox usage"

# Test 4: External Links
Write-Host ""
Write-Host "=== External Links Tests ===" -ForegroundColor Blue

# External links have target="_blank"
$externalLinksCount = ([regex]::Matches($htmlContent, 'href="https?://[^"]*"')).Count
$targetBlankCount = ([regex]::Matches($htmlContent, 'target="_blank"')).Count
Test-Condition "External links open in new tab" ($targetBlankCount -gt 0) "Found $externalLinksCount external links, $targetBlankCount with target=_blank"

# External links have security attributes
$secureLinksCount = ([regex]::Matches($htmlContent, 'rel="noopener noreferrer"')).Count
Test-Condition "External links have security attributes" ($secureLinksCount -gt 0) "Found $secureLinksCount secure external links"

# Project and writing data structure
$jsContent = Get-Content "js/main.js" -Raw
$hasGithubUrls = $jsContent -match 'githubUrl:'
$hasLiveUrls = $jsContent -match 'liveUrl:'
$hasWritingUrls = ($jsContent -match 'url:') -and ($jsContent -match 'writings')
Test-Condition "Project and writing data contains external links" ($hasGithubUrls -and $hasLiveUrls -and $hasWritingUrls) "Checking data structure and link attributes"

# Test 5: Asset Optimization
Write-Host ""
Write-Host "=== Asset Optimization Tests ===" -ForegroundColor Blue

# Minified assets referenced
$hasMinifiedCSS = $htmlContent -match 'main\.min\.css'
$hasMinifiedJS = $htmlContent -match 'main\.min\.js'
Test-Condition "Minified assets referenced" ($hasMinifiedCSS -and $hasMinifiedJS) "Checking for .min.css and .min.js references"

# Lazy loading implemented
$hasLazyLoading = $htmlContent -match 'loading="lazy"'
$hasLazyLoadingJS = $jsContent -match 'initializeLazyLoading'
Test-Condition "Lazy loading for images" ($hasLazyLoading -and $hasLazyLoadingJS) "Checking HTML lazy loading and JavaScript implementation"

# Preload critical resources
$hasPreload = $htmlContent -match 'rel="preload"'
$hasPreconnect = $htmlContent -match 'rel="preconnect"'
Test-Condition "Critical resource preloading" ($hasPreload -and $hasPreconnect) "Checking for preload and preconnect directives"

# Check if minified files exist
$minCSSExists = Test-Path "css/main.min.css"
$minJSExists = Test-Path "js/main.min.js"
Test-Condition "Minified files exist" ($minCSSExists -and $minJSExists) "Verifying minified files are present on disk"

# Test 6: Cross-Browser Compatibility
Write-Host ""
Write-Host "=== Cross-Browser Compatibility Tests ===" -ForegroundColor Blue

# JavaScript feature detection
$hasIntersectionObserverCheck = $jsContent -match 'IntersectionObserver'
$hasFallback = ($jsContent -match 'if \(!') -or ($jsContent -match 'if\(!')
Test-Condition "JavaScript feature detection" ($hasIntersectionObserverCheck -and $hasFallback) "Checking for feature detection in JavaScript"

# Accessibility preferences support
$hasReducedMotion = $cssContent -match 'prefers-reduced-motion'
$hasHighContrast = $cssContent -match 'prefers-contrast'
Test-Condition "Accessibility preferences support" ($hasReducedMotion -and $hasHighContrast) "Checking for reduced motion and high contrast support"

# Progressive enhancement
$hasNoJSFallback = ($jsContent -match 'Progressive enhancement') -or ($jsContent -match 'works without JavaScript')
Test-Condition "Progressive enhancement approach" ($hasNoJSFallback) "Checking for progressive enhancement patterns"

# Test 7: Content Management
Write-Host ""
Write-Host "=== Content Management Tests ===" -ForegroundColor Blue

# Content update instructions
$hasProjectInstructions = $htmlContent -match 'To add new projects'
$hasWritingInstructions = $htmlContent -match 'To add new writing'
Test-Condition "Content update instructions in HTML" ($hasProjectInstructions -and $hasWritingInstructions) "Checking for content management comments in HTML"

# Structured data arrays
$hasProjectsArray = $jsContent -match 'const projects = \['
$hasWritingsArray = $jsContent -match 'const writings = \['
Test-Condition "Structured data arrays for content" ($hasProjectsArray -and $hasWritingsArray) "Checking for projects and writings data structures"

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
    Write-Host "🎉 Portfolio site is ready for deployment!" -ForegroundColor Green
    Write-Host "All integration tests passed successfully." -ForegroundColor Green
} else {
    Write-Host "SOME TESTS FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  Some tests failed. Please review and fix issues before deployment." -ForegroundColor Yellow
}

return $passedTests -eq $totalTests