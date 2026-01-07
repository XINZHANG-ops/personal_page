#!/bin/bash

# i18n Implementation Script
# This script completes the bilingual implementation for your portfolio site

echo "🌍 Implementing i18n (bilingual support)..."
echo ""

# Step 1: Add script tags to index.html (before closing </body> tag)
echo "1. Adding i18n scripts to index.html..."
sed -i '' '/<script src="js\/main\.min\.js"><\/script>/i\
    <!-- i18n scripts -->\
    <script src="js/i18n/en.js"></script>\
    <script src="js/i18n/zh.js"></script>\
    <script src="js/i18n.js"></script>\

' index.html

# Step 2: Add language toggle to index.html navigation
echo "2. Adding language toggle to index.html navigation..."
sed -i '' '/<\/ul>/a\
\            <div class="language-toggle">\
                <button class="lang-btn" data-lang="en" aria-label="Switch to English">EN</button>\
                <button class="lang-btn" data-lang="zh" aria-label="切换到中文">中文</button>\
            </div>
' index.html

# Step 3: Add script tags to beer.html
echo "3. Adding i18n scripts to beer.html..."
sed -i '' '/<script src="..\/js\/beer\.js"><\/script>/i\
    <!-- i18n scripts -->\
    <script src="../js/i18n/en.js"></script>\
    <script src="../js/i18n/zh.js"></script>\
    <script src="../js/i18n.js"></script>\

' pages/beer.html

# Step 4: Add language toggle to beer.html navigation
echo "4. Adding language toggle to beer.html navigation..."
sed -i '' -e '/<\/ul>/a\
\            <div class="language-toggle">\
                <button class="lang-btn" data-lang="en" aria-label="Switch to English">EN</button>\
                <button class="lang-btn" data-lang="zh" aria-label="切换到中文">中文</button>\
            </div>
' pages/beer.html

# Step 5: Rebuild assets
echo "5. Rebuilding assets..."
npm run build-all

echo ""
echo "✅ i18n implementation complete!"
echo ""
echo "📋 Next steps (manual):"
echo "1. Add data-i18n attributes to HTML elements in index.html and beer.html"
echo "2. Update build-beer.cjs to use bilingual labels"
echo "3. Test in browser"
echo ""
echo "See the translation files:"
echo "  - js/i18n/en.js (English)"
echo "  - js/i18n/zh.js (Chinese)"
echo ""
echo "To modify translations, edit these files directly."
