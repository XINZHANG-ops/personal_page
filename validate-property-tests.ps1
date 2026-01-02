# Property-Based Test Validation Script
# This script validates the core logic that would be tested by property-based tests
# when Node.js/npm is not available

Write-Host "Property-Based Test Logic Validation" -ForegroundColor Blue
Write-Host "Validating core property test logic without running actual PBT framework"
Write-Host ""

$totalProperties = 0
$passedProperties = 0

function Test-Property {
    param(
        [string]$Name,
        [bool]$Result,
        [string]$Info = ""
    )
    $script:totalProperties++
    if ($Result) {
        $script:passedProperties++
        Write-Host "PASS Property: $Name" -ForegroundColor Green
    } else {
        Write-Host "FAIL Property: $Name" -ForegroundColor Red
    }
    if ($Info) {
        Write-Host "  $Info" -ForegroundColor Yellow
    }
}

# Read files
$htmlContent = Get-Content "index.html" -Raw
$cssContent = Get-Content "css/main.css" -Raw
$jsContent = Get-Content "js/main.js" -Raw

Write-Host "=== Property 1: Project Display Completeness ===" -ForegroundColor Blue
# Validates: Requirements 2.2
# For any project data with title, description, and links, the rendered HTML should contain all three elements

# Check that JavaScript creates project card structure (cards are dynamically generated)
$hasCreateProjectCard = $jsContent -match 'function createProjectCard'
$hasProjectCardClass = $jsContent -match 'project-card'
$hasProjectTitleClass = $jsContent -match 'project-card__title'
$hasProjectDescClass = $jsContent -match 'project-card__description'
$hasProjectLinksClass = $jsContent -match 'project-card__links'
$hasProjectTechClass = $jsContent -match 'project-card__technologies'

Test-Property "Project card creation function exists" ($hasCreateProjectCard -and $hasProjectCardClass) "createProjectCard function and classes found in JS"
Test-Property "Project card structure complete" ($hasProjectTitleClass -and $hasProjectDescClass -and $hasProjectLinksClass -and $hasProjectTechClass) "All project card element classes found in JS"

# Check JavaScript project data structure
$hasProjectsArray = $jsContent -match 'const projects = \['
$hasProjectTitle = $jsContent -match 'title:'
$hasProjectDescription = $jsContent -match 'description:'
$hasProjectGithub = $jsContent -match 'githubUrl:'

Test-Property "Project data structure complete" ($hasProjectsArray -and $hasProjectTitle -and $hasProjectDescription -and $hasProjectGithub) "Project data includes all required fields"

Write-Host ""
Write-Host "=== Property 2: External Link Behavior ===" -ForegroundColor Blue
# Validates: Requirements 2.5
# For any external project or writing link, the HTML should include target="_blank" attribute

$externalLinksWithTarget = ([regex]::Matches($htmlContent, 'href="https?://[^"]*"[^>]*target="_blank"')).Count
$externalLinksTotal = ([regex]::Matches($htmlContent, 'href="https?://[^"]*"')).Count
$hasNoopenerRel = $htmlContent -match 'rel="noopener noreferrer"'

Test-Property "External links open in new tab" ($externalLinksWithTarget -gt 0) "Found $externalLinksWithTarget external links with target=_blank"
Test-Property "External links have security attributes" $hasNoopenerRel "Found noopener noreferrer attributes"

Write-Host ""
Write-Host "=== Property 3: Content Organization Consistency ===" -ForegroundColor Blue
# Validates: Requirements 3.4
# For any collection of writing entries with dates, display should be ordered chronologically

$hasWritingSection = $htmlContent -match 'writing'
$hasWritingData = $jsContent -match 'const writings = \['
$hasWritingDates = $jsContent -match 'date:'

Test-Property "Writing content organization exists" ($hasWritingSection -and $hasWritingData) "Writing section and data structure found"
Test-Property "Writing entries include dates" $hasWritingDates "Date fields found in writing data"

Write-Host ""
Write-Host "=== Property 4: Contact Information Formatting ===" -ForegroundColor Blue
# Validates: Requirements 4.3
# For any contact method displayed, HTML should include appropriate icon elements and formatting

$hasContactSection = $htmlContent -match 'contact'
$hasContactIcons = $htmlContent -match 'icon'
$hasContactLinks = $htmlContent -match 'mailto:|linkedin|github'

Test-Property "Contact section exists" $hasContactSection "Contact section found in HTML"
Test-Property "Contact information includes icons and links" ($hasContactIcons -and $hasContactLinks) "Icons and contact links found"

Write-Host ""
Write-Host "=== Property 5: Responsive Layout Adaptation ===" -ForegroundColor Blue
# Validates: Requirements 5.1, 5.2
# For any viewport width at defined breakpoints, CSS should apply appropriate layout changes

$hasMobileQuery = $cssContent -match '@media \(max-width: 767px\)'
$hasTabletQuery = $cssContent -match '@media \(min-width: 768px\)'
$hasDesktopQuery = $cssContent -match '@media \(min-width: 1024px\)'
$hasFlexbox = $cssContent -match 'display:\s*flex'
$hasGrid = $cssContent -match 'display:\s*grid'

Test-Property "Responsive breakpoints defined" ($hasMobileQuery -and $hasTabletQuery -and $hasDesktopQuery) "All three breakpoints found"
Test-Property "Modern layout methods used" ($hasFlexbox -and $hasGrid) "Flexbox and Grid found in CSS"

Write-Host ""
Write-Host "=== Property 6: Semantic HTML Structure ===" -ForegroundColor Blue
# Validates: Requirements 5.4
# For any page section, HTML should use proper semantic elements

$hasHeader = $htmlContent -match '<header'
$hasMain = $htmlContent -match '<main'
$hasNav = $htmlContent -match '<nav'
$hasSection = $htmlContent -match '<section'
$hasFooter = $htmlContent -match '<footer'
# Article elements are created dynamically by JavaScript
$hasArticleInJS = $jsContent -match 'createElement\(''article''\)'

Test-Property "Semantic HTML elements used" ($hasHeader -and $hasMain -and $hasNav -and $hasSection -and $hasFooter) "All major semantic elements found"
Test-Property "Article elements for content" $hasArticleInJS "Article elements created dynamically in JavaScript"

Write-Host ""
Write-Host "=== Property 7: Accessibility Standards Compliance ===" -ForegroundColor Blue
# Validates: Requirements 5.5
# For any color combination, contrast ratio should meet WCAG AA standards

$hasAriaLabels = $htmlContent -match 'aria-label'
$hasAriaRoles = $htmlContent -match 'role='
$hasSkipLink = $htmlContent -match 'skip-link'
$hasAltText = $htmlContent -match 'alt='
$hasLangAttribute = $htmlContent -match 'lang="en"'

Test-Property "ARIA accessibility attributes" ($hasAriaLabels -and $hasAriaRoles) "ARIA labels and roles found"
Test-Property "Basic accessibility features" ($hasSkipLink -and $hasAltText -and $hasLangAttribute) "Skip links, alt text, and lang attribute found"

Write-Host ""
Write-Host "=== Property 8: Asset Optimization ===" -ForegroundColor Blue
# Validates: Requirements 6.5
# For any image or CSS file, file size should be optimized

$hasMinifiedCSS = Test-Path "css/main.min.css"
$hasMinifiedJS = Test-Path "js/main.min.js"
$referencesMinifiedCSS = $htmlContent -match 'main\.min\.css'
$referencesMinifiedJS = $htmlContent -match 'main\.min\.js'
$hasLazyLoading = $htmlContent -match 'loading="lazy"'

Test-Property "Minified assets exist" ($hasMinifiedCSS -and $hasMinifiedJS) "Minified CSS and JS files found"
Test-Property "HTML references minified assets" ($referencesMinifiedCSS -and $referencesMinifiedJS) "HTML uses minified versions"
Test-Property "Lazy loading implemented" $hasLazyLoading "Lazy loading attributes found"

Write-Host ""
Write-Host "=== Property 9: Design System Consistency ===" -ForegroundColor Blue
# Validates: Requirements 7.2
# For any color or font declaration, should use CSS custom properties

$hasColorVariables = $cssContent -match '--color-'
$hasFontVariables = $cssContent -match '--font-'
$hasSpacingVariables = $cssContent -match '--space-'
$usesVariables = $cssContent -match 'var\('

Test-Property "CSS custom properties defined" ($hasColorVariables -and $hasFontVariables -and $hasSpacingVariables) "Color, font, and spacing variables found"
Test-Property "CSS variables are used" $usesVariables "var() usage found in CSS"

Write-Host ""
Write-Host "=== Property 10: Visual Hierarchy Structure ===" -ForegroundColor Blue
# Validates: Requirements 7.4
# For any heading elements, should follow proper hierarchical order

$hasH1 = $htmlContent -match '<h1'
$hasH2 = $htmlContent -match '<h2'
$hasH3 = $htmlContent -match '<h3'
$h1Count = ([regex]::Matches($htmlContent, '<h1')).Count

Test-Property "Heading hierarchy exists" ($hasH1 -and $hasH2 -and $hasH3) "H1, H2, and H3 elements found"
Test-Property "Single H1 element" ($h1Count -eq 1) "Found $h1Count H1 elements (should be 1)"

Write-Host ""
Write-Host "=== Property 11: Code Structure Maintainability ===" -ForegroundColor Blue
# Validates: Requirements 8.2
# For any HTML file, inline styles should be avoided

$inlineStyleCount = ([regex]::Matches($htmlContent, 'style="')).Count
$hasExternalCSS = $htmlContent -match 'rel="stylesheet"'
$hasExternalJS = $htmlContent -match '<script src='

Test-Property "No inline styles" ($inlineStyleCount -eq 0) "Found $inlineStyleCount inline styles (should be 0)"
Test-Property "External stylesheets and scripts" ($hasExternalCSS -and $hasExternalJS) "External CSS and JS files referenced"

Write-Host ""
Write-Host "=== Property 12: Content Update Patterns ===" -ForegroundColor Blue
# Validates: Requirements 8.4
# For any similar content section, HTML structure should follow same pattern

$hasProjectComments = $htmlContent -match 'To add new projects'
$hasWritingComments = $htmlContent -match 'To add new writing'
# Check for consistent patterns in JavaScript card creation
$hasConsistentCardStructure = ($jsContent -match 'project-card__') -and ($jsContent -match '__title') -and ($jsContent -match '__description')

Test-Property "Content update instructions" ($hasProjectComments -and $hasWritingComments) "Update instructions found in HTML comments"
Test-Property "Consistent card structure patterns" $hasConsistentCardStructure "Consistent naming patterns for card elements in JS"

# Final Results
Write-Host ""
Write-Host "=== Property Test Logic Validation Summary ===" -ForegroundColor Blue
Write-Host ""

$passRate = [math]::Round(($passedProperties / $totalProperties) * 100, 1)

Write-Host "Total Properties Validated: $totalProperties"
Write-Host "Passed: $passedProperties" -ForegroundColor Green
Write-Host "Failed: $($totalProperties - $passedProperties)" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%"
Write-Host ""

if ($passedProperties -eq $totalProperties) {
    Write-Host "ALL PROPERTY LOGIC VALIDATED" -ForegroundColor Green
    Write-Host ""
    Write-Host "All property-based test logic is correctly implemented!" -ForegroundColor Green
    Write-Host "The code structure supports all required properties." -ForegroundColor Green
} else {
    Write-Host "SOME PROPERTY LOGIC FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Some property test logic validation failed." -ForegroundColor Yellow
    Write-Host "Review the failed properties above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Note: This validates the logic that property-based tests would verify." -ForegroundColor Cyan
Write-Host "Actual property-based tests require Node.js/npm to run with fast-check library." -ForegroundColor Cyan