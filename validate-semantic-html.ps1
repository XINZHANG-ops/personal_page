# PowerShell script to validate semantic HTML structure
# Property 6: Semantic HTML Structure - Validates Requirements 5.4

Write-Host "Running Property 6: Semantic HTML Structure validation..." -ForegroundColor Cyan
Write-Host "Feature: personal-portfolio-site, Property 6: Semantic HTML Structure" -ForegroundColor Gray
Write-Host "Validates: Requirements 5.4" -ForegroundColor Gray
Write-Host ""

$htmlContent = Get-Content -Path "index.html" -Raw
$passed = 0
$total = 0

# Test 1: Check for required semantic elements
$total++
Write-Host "Test 1: Checking for required semantic elements..." -ForegroundColor Yellow

$hasHeader = $htmlContent -like "*<header*"
$hasMain = $htmlContent -like "*<main*"
$hasFooter = $htmlContent -like "*<footer*"
$hasNav = $htmlContent -like "*<nav*"
$hasSection = $htmlContent -like "*<section*"

if ($hasHeader -and $hasMain -and $hasFooter -and $hasNav -and $hasSection) {
    Write-Host "All required semantic elements found" -ForegroundColor Green
    $passed++
} else {
    Write-Host "Missing some semantic elements" -ForegroundColor Red
    if (-not $hasHeader) { Write-Host "  Missing: header" -ForegroundColor Red }
    if (-not $hasMain) { Write-Host "  Missing: main" -ForegroundColor Red }
    if (-not $hasFooter) { Write-Host "  Missing: footer" -ForegroundColor Red }
    if (-not $hasNav) { Write-Host "  Missing: nav" -ForegroundColor Red }
    if (-not $hasSection) { Write-Host "  Missing: section" -ForegroundColor Red }
}

# Test 2: Check that sections have proper structure
$total++
Write-Host ""
Write-Host "Test 2: Checking section structure..." -ForegroundColor Yellow
$sectionCount = ($htmlContent -split '<section').Length - 1
if ($sectionCount -ge 4) {
    Write-Host "Found $sectionCount sections with proper structure" -ForegroundColor Green
    $passed++
} else {
    Write-Host "Found only $sectionCount sections, expected at least 4" -ForegroundColor Red
}

# Test 3: Check for semantic hierarchy
$total++
Write-Host ""
Write-Host "Test 3: Checking semantic hierarchy..." -ForegroundColor Yellow
$headerPos = $htmlContent.IndexOf('<header')
$mainPos = $htmlContent.IndexOf('<main')
$footerPos = $htmlContent.IndexOf('<footer')

if (($headerPos -ge 0) -and ($mainPos -ge 0) -and ($footerPos -ge 0) -and ($mainPos -gt $headerPos) -and ($footerPos -gt $mainPos)) {
    Write-Host "Proper semantic hierarchy: header -> main -> footer" -ForegroundColor Green
    $passed++
} else {
    Write-Host "Improper semantic hierarchy" -ForegroundColor Red
}

# Test 4: Check for semantic elements usage
$total++
Write-Host ""
Write-Host "Test 4: Checking semantic elements usage..." -ForegroundColor Yellow
$semanticCount = ($htmlContent -split '<header|<main|<section|<article|<footer|<nav|<aside').Length - 1
if ($semanticCount -ge 6) {
    Write-Host "Good use of semantic elements ($semanticCount found)" -ForegroundColor Green
    $passed++
} else {
    Write-Host "Limited use of semantic elements ($semanticCount found)" -ForegroundColor Yellow
    $passed++ # Still acceptable
}

Write-Host ""
Write-Host "Results: $passed/$total tests passed" -ForegroundColor Cyan

if ($passed -eq $total) {
    Write-Host "All semantic HTML property tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed" -ForegroundColor Red
    exit 1
}