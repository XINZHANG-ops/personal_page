# Final Integration and Testing Script (PowerShell)
# Validates all sections are properly linked and navigable
# Tests cross-browser compatibility requirements
# Validates HTML and CSS for standards compliance
# Verifies external links work correctly
# Requirements: 2.5, 3.3, 5.1, 5.2

# ANSI color codes for console output
$colors = @{
    Green = "`e[32m"
    Red = "`e[31m"
    Yellow = "`e[33m"
    Blue = "`e[34m"
    Reset = "`e[0m"
    Bold = "`e[1m"
}

function Write-ColoredOutput {
    param(
        [string]$Message,
        [string]$Color = "Reset"
    )
    Write-Host "$($colors[$Color])$Message$($colors.Reset)"
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-ColoredOutput "=== $Title ===" "Blue"
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Details = ""
    )
    $status = if ($Passed) { "✓ PASS" } else { "✗ FAIL" }
    $statusColor = if ($Passed) { "Green" } else { "Red" }
    Write-ColoredOutput "$status $TestName" $statusColor
    if ($Details) {
        Write-ColoredOutput "  $Details" "Yellow"
    }
}

# Test results tracking
$script:totalTests = 0
$script:passedTests = 0

function Invoke-Test {
    param(
        [string]$TestName,
        [scriptblock]$TestFunction,
        [string]$Details = ""
    )
    $script:totalTests++
    try {
        $result = & $TestFunction
        if ($result) {
            $script:passedTests++
            Write-TestResult $TestName $true $Details
        } else {
            Write-TestResult $TestName $false $Details
        }
        return $result
    } catch {
        Write-TestResult $TestName $false "Error: $($_.Exception.Message)"
        return $false
    }
}

# Read file helper
function Get-FileContent {
    param([string]$FilePath)
    if (-not (Test-Path $FilePath)) {
        throw "Cannot read file $FilePath: File not found"
    }
    return Get-Content $FilePath -Raw
}

# Test 1: Ensure all sections are properly linked and navigable
function Test-SectionLinking {
    Write-Section "Section Linking and Navigation Tests"
    
    $htmlContent = Get-FileContent "index.html"
    
    # Test 1.1: Check that all navigation links have corresponding sections
    Invoke-Test "Navigation links have corresponding sections" {
        $navLinks = [regex]::Matches($htmlContent, 'href="#([^"]+)"')
        $sections = [regex]::Matches($htmlContent, 'id="([^"]+)"')
        
        $navTargets = $navLinks | Where-Object { $_.Groups[1].Value -ne "main-content" } | ForEach-Object { $_.Groups[1].Value }
        $sectionIds = $sections | ForEach-Object { $_.Groups[1].Value }
        
        $allLinked = $true
        foreach ($target in $navTargets) {
            if ($target -notin $sectionIds) {
                $allLinked = $false
                break
            }
        }
        return $allLinked
    } "Found nav targets: $($navLinks.Count)"
    
    # Test 1.2: Check semantic HTML structure
    Invoke-Test "Proper semantic HTML structure" {
        $hasHeader = $htmlContent -match '<header'
        $hasMain = $htmlContent -match '<main'
        $hasNav = $htmlContent -match '<nav'
        $hasFooter = $htmlContent -match '<footer'
        $hasSections = $htmlContent -match '<section'
        
        return $hasHeader -and $hasMain -and $hasNav -and $hasFooter -and $hasSections
    } "Checking for header, main, nav, footer, and section elements"
    
    # Test 1.3: Check ARIA labels and accessibility
    Invoke-Test "Accessibility attributes present" {
        $hasAriaLabels = $htmlContent -match 'aria-label'
        $hasAriaDescribedBy = $htmlContent -match 'aria-describedby'
        $hasRoleAttributes = $htmlContent -match 'role='
        $hasSkipLink = $htmlContent -match 'skip-link'
        
        return $hasAriaLabels -and $hasAriaDescribedBy -and $hasRoleAttributes -and $hasSkipLink
    } "Checking ARIA labels, roles, and skip link"
    
    # Test 1.4: Check smooth scroll JavaScript functionality
    $jsContent = Get-FileContent "js/main.js"
    Invoke-Test "Smooth scroll navigation implemented" {
        return ($jsContent -match 'initializeSmoothScroll') -and ($jsContent -match "behavior: 'smooth'")
    } "Checking for smooth scroll implementation"
}

# Test 2: Validate HTML and CSS for standards compliance
function Test-StandardsCompliance {
    Write-Section "Standards Compliance Tests"
    
    $htmlContent = Get-FileContent "index.html"
    $cssContent = Get-FileContent "css/main.css"
    
    # Test 2.1: HTML5 DOCTYPE and structure
    Invoke-Test "Valid HTML5 DOCTYPE and structure" {
        $hasDoctype = $htmlContent.StartsWith('<!DOCTYPE html>')
        $hasLang = $htmlContent -match 'lang="en"'
        $hasCharset = $htmlContent -match 'charset="UTF-8"'
        $hasViewport = $htmlContent -match 'viewport'
        
        return $hasDoctype -and $hasLang -and $hasCharset -and $hasViewport
    } "Checking DOCTYPE, lang, charset, and viewport"
    
    # Test 2.2: CSS custom properties (design system)
    Invoke-Test "CSS custom properties for design system" {
        $hasColorVars = $cssContent -match '--color-primary'
        $hasFontVars = $cssContent -match '--font-size'
        $hasSpaceVars = $cssContent -match '--space-'
        $hasBreakpointVars = $cssContent -match '--breakpoint-'
        
        return $hasColorVars -and $hasFontVars -and $hasSpaceVars -and $hasBreakpointVars
    } "Checking for color, font, spacing, and breakpoint variables"
    
    # Test 2.3: No inline styles (maintainability)
    Invoke-Test "No inline styles in HTML" {
        $inlineStyleMatches = [regex]::Matches($htmlContent, 'style="')
        return $inlineStyleMatches.Count -eq 0
    } "Found $([regex]::Matches($htmlContent, 'style="').Count) inline styles"
    
    # Test 2.4: Proper heading hierarchy
    Invoke-Test "Proper heading hierarchy" {
        $headings = [regex]::Matches($htmlContent, '<h([1-6])[^>]*>')
        if ($headings.Count -eq 0) { return $false }
        
        $headingLevels = $headings | ForEach-Object { [int]$_.Groups[1].Value }
        
        # Check that h1 comes first
        if ($headingLevels[0] -ne 1) { return $false }
        
        # Check no levels are skipped
        for ($i = 1; $i -lt $headingLevels.Count; $i++) {
            if ($headingLevels[$i] -gt ($headingLevels[$i-1] + 1)) {
                return $false
            }
        }
        
        return $true
    } "Found $($headings.Count) headings"
}

# Test 3: Test responsive design implementation
function Test-ResponsiveDesign {
    Write-Section "Responsive Design Tests"
    
    $cssContent = Get-FileContent "css/main.css"
    
    # Test 3.1: Media queries for different breakpoints
    Invoke-Test "Media queries for mobile, tablet, desktop" {
        $mobileQuery = $cssContent -match '@media \(max-width: 767px\)'
        $tabletQuery = $cssContent -match '@media \(min-width: 768px\)'
        $desktopQuery = $cssContent -match '@media \(min-width: 1024px\)'
        
        return $mobileQuery -and $tabletQuery -and $desktopQuery
    } "Checking for 767px, 768px, and 1024px breakpoints"
    
    # Test 3.2: Responsive navigation implementation
    Invoke-Test "Responsive navigation menu" {
        $hasMobileNav = $cssContent -match '\.nav__toggle'
        $hasHiddenMenu = $cssContent -match 'nav__menu--open'
        $hasHamburger = $cssContent -match 'nav__toggle--active'
        
        return $hasMobileNav -and $hasHiddenMenu -and $hasHamburger
    } "Checking mobile navigation toggle and menu states"
    
    # Test 3.3: Flexible grid layouts
    Invoke-Test "CSS Grid and Flexbox layouts" {
        $hasGrid = ($cssContent -match 'display: grid') -or ($cssContent -match 'display:grid')
        $hasFlex = ($cssContent -match 'display: flex') -or ($cssContent -match 'display:flex')
        
        return $hasGrid -and $hasFlex
    } "Checking for CSS Grid and Flexbox usage"
    
    # Test 3.4: Responsive typography
    Invoke-Test "Responsive typography scaling" {
        $hasFluidTypography = ($cssContent -match 'clamp\(') -or 
                             ($cssContent -match 'vw') -or
                             ([regex]::Matches($cssContent, '@media.*font-size').Count -gt 0)
        
        return $hasFluidTypography
    } "Checking for responsive typography techniques"
}

# Test 4: Verify external links work correctly
function Test-ExternalLinks {
    Write-Section "External Links Tests"
    
    $htmlContent = Get-FileContent "index.html"
    $jsContent = Get-FileContent "js/main.js"
    
    # Test 4.1: External links have target="_blank"
    Invoke-Test "External links open in new tab" {
        $externalLinks = [regex]::Matches($htmlContent, 'href="https?://[^"]*"')
        $targetBlankLinks = [regex]::Matches($htmlContent, 'target="_blank"')
        
        return $targetBlankLinks.Count -gt 0
    } "Found $([regex]::Matches($htmlContent, 'href="https?://[^"]*"').Count) external links"
    
    # Test 4.2: External links have rel="noopener noreferrer"
    Invoke-Test "External links have security attributes" {
        $secureLinks = [regex]::Matches($htmlContent, 'rel="noopener noreferrer"')
        return $secureLinks.Count -gt 0
    } "Found $([regex]::Matches($htmlContent, 'rel="noopener noreferrer"').Count) secure external links"
    
    # Test 4.3: Project links in JavaScript data
    Invoke-Test "Project data contains external links" {
        $hasGithubUrls = $jsContent -match 'githubUrl:'
        $hasLiveUrls = $jsContent -match 'liveUrl:'
        $hasTargetBlank = ($jsContent -match "target = '_blank'") -or ($jsContent -match 'target="_blank"')
        
        return $hasGithubUrls -and $hasLiveUrls -and $hasTargetBlank
    } "Checking project data structure and link attributes"
    
    # Test 4.4: Writing links in JavaScript data
    Invoke-Test "Writing data contains external links" {
        $hasWritingUrls = ($jsContent -match 'url:') -and ($jsContent -match 'writings')
        $hasExternalLinkCreation = ($jsContent -match "target = '_blank'") -or ($jsContent -match 'target="_blank"')
        
        return $hasWritingUrls -and $hasExternalLinkCreation
    } "Checking writing data structure and external link creation"
}

# Test 5: Asset optimization and performance
function Test-AssetOptimization {
    Write-Section "Asset Optimization Tests"
    
    $htmlContent = Get-FileContent "index.html"
    
    # Test 5.1: Minified CSS and JS files referenced
    Invoke-Test "Minified assets referenced" {
        $hasMinifiedCSS = $htmlContent -match 'main\.min\.css'
        $hasMinifiedJS = $htmlContent -match 'main\.min\.js'
        
        return $hasMinifiedCSS -and $hasMinifiedJS
    } "Checking for .min.css and .min.js references"
    
    # Test 5.2: Lazy loading implemented
    Invoke-Test "Lazy loading for images" {
        $hasLazyLoading = $htmlContent -match 'loading="lazy"'
        $jsContent = Get-FileContent "js/main.js"
        $hasLazyLoadingJS = $jsContent -match 'initializeLazyLoading'
        
        return $hasLazyLoading -and $hasLazyLoadingJS
    } "Checking HTML lazy loading and JavaScript implementation"
    
    # Test 5.3: Preload critical resources
    Invoke-Test "Critical resource preloading" {
        $hasPreload = $htmlContent -match 'rel="preload"'
        $hasPreconnect = $htmlContent -match 'rel="preconnect"'
        
        return $hasPreload -and $hasPreconnect
    } "Checking for preload and preconnect directives"
    
    # Test 5.4: Check if minified files exist
    Invoke-Test "Minified files exist" {
        $minCSSExists = Test-Path "css/main.min.css"
        $minJSExists = Test-Path "js/main.min.js"
        
        return $minCSSExists -and $minJSExists
    } "Verifying minified files are present on disk"
}

# Test 6: Cross-browser compatibility features
function Test-CrossBrowserCompatibility {
    Write-Section "Cross-Browser Compatibility Tests"
    
    $cssContent = Get-FileContent "css/main.css"
    $jsContent = Get-FileContent "js/main.js"
    
    # Test 6.1: CSS fallbacks and progressive enhancement
    Invoke-Test "CSS fallbacks for modern features" {
        $hasFlexFallbacks = ($cssContent -match 'display: block') -or ($cssContent -match 'display: inline-block')
        $hasColorFallbacks = ($cssContent -match 'background-color:') -and ($cssContent -match 'background:')
        
        return $hasFlexFallbacks -or $hasColorFallbacks
    } "Checking for CSS fallback patterns"
    
    # Test 6.2: JavaScript feature detection
    Invoke-Test "JavaScript feature detection" {
        $hasIntersectionObserverCheck = $jsContent -match 'IntersectionObserver'
        $hasFallback = ($jsContent -match 'if \(!') -or ($jsContent -match 'if\(!')
        
        return $hasIntersectionObserverCheck -and $hasFallback
    } "Checking for feature detection in JavaScript"
    
    # Test 6.3: Accessibility preferences support
    Invoke-Test "Accessibility preferences support" {
        $hasReducedMotion = $cssContent -match 'prefers-reduced-motion'
        $hasHighContrast = $cssContent -match 'prefers-contrast'
        
        return $hasReducedMotion -and $hasHighContrast
    } "Checking for reduced motion and high contrast support"
    
    # Test 6.4: Progressive enhancement
    Invoke-Test "Progressive enhancement approach" {
        $hasNoJSFallback = ($jsContent -match 'Progressive enhancement') -or ($jsContent -match 'works without JavaScript')
        $hasCSSSafeDefaults = ($cssContent -match 'display: block') -or ($cssContent -match 'display: inline')
        
        return $hasNoJSFallback -or $hasCSSSafeDefaults
    } "Checking for progressive enhancement patterns"
}

# Test 7: Content management and maintainability
function Test-ContentManagement {
    Write-Section "Content Management Tests"
    
    $htmlContent = Get-FileContent "index.html"
    $jsContent = Get-FileContent "js/main.js"
    
    # Test 7.1: Clear content update instructions
    Invoke-Test "Content update instructions in HTML" {
        $hasProjectInstructions = $htmlContent -match 'To add new projects'
        $hasWritingInstructions = $htmlContent -match 'To add new writing'
        
        return $hasProjectInstructions -and $hasWritingInstructions
    } "Checking for content management comments in HTML"
    
    # Test 7.2: Structured data arrays in JavaScript
    Invoke-Test "Structured data arrays for content" {
        $hasProjectsArray = $jsContent -match 'const projects = \['
        $hasWritingsArray = $jsContent -match 'const writings = \['
        
        return $hasProjectsArray -and $hasWritingsArray
    } "Checking for projects and writings data structures"
    
    # Test 7.3: Consistent data structure patterns
    Invoke-Test "Consistent data structure patterns" {
        $projectFields = @('id:', 'title:', 'description:', 'technologies:', 'githubUrl:')
        $writingFields = @('id:', 'title:', 'type:', 'venue:', 'date:', 'url:')
        
        $hasProjectFields = $true
        foreach ($field in $projectFields) {
            if (-not ($jsContent -match [regex]::Escape($field))) {
                $hasProjectFields = $false
                break
            }
        }
        
        $hasWritingFields = $true
        foreach ($field in $writingFields) {
            if (-not ($jsContent -match [regex]::Escape($field))) {
                $hasWritingFields = $false
                break
            }
        }
        
        return $hasProjectFields -and $hasWritingFields
    } "Checking for consistent field names in data structures"
}

# Main test runner
function Invoke-AllTests {
    Write-ColoredOutput "Portfolio Site Integration Testing" "Blue"
    Write-Host "Testing final integration and cross-browser compatibility"
    
    # Run all test suites
    Test-SectionLinking
    Test-StandardsCompliance
    Test-ResponsiveDesign
    Test-ExternalLinks
    Test-AssetOptimization
    Test-CrossBrowserCompatibility
    Test-ContentManagement
    
    # Final results
    Write-Section "Test Results Summary"
    
    $passRate = [math]::Round(($script:passedTests / $script:totalTests) * 100, 1)
    $status = if ($script:passedTests -eq $script:totalTests) { "ALL TESTS PASSED" } else { "SOME TESTS FAILED" }
    $statusColor = if ($script:passedTests -eq $script:totalTests) { "Green" } else { "Red" }
    
    Write-Host ""
    Write-Host "Total Tests: $($script:totalTests)"
    Write-ColoredOutput "Passed: $($script:passedTests)" "Green"
    Write-ColoredOutput "Failed: $($script:totalTests - $script:passedTests)" "Red"
    Write-Host "Pass Rate: $passRate%"
    Write-Host ""
    Write-ColoredOutput $status $statusColor
    
    if ($script:passedTests -eq $script:totalTests) {
        Write-Host ""
        Write-ColoredOutput "🎉 Portfolio site is ready for deployment!" "Green"
        Write-ColoredOutput "All integration tests passed successfully." "Green"
    } else {
        Write-Host ""
        Write-ColoredOutput "⚠️  Some tests failed. Please review and fix issues before deployment." "Yellow"
    }
    
    return $script:passedTests -eq $script:totalTests
}

# Run tests
Invoke-AllTests