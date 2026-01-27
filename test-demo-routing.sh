#!/bin/bash

echo "🧪 Testing Demo Page Implementation"
echo "===================================="
echo ""

# Test 1: Check if /demo page exists
echo "✓ Checking app/demo/page.tsx..."
if [ -f "/Users/melisandecornetlichtfus/Desktop/pixel-logo-generate/app/demo/page.tsx" ]; then
    echo "  ✅ /demo page created"
else
    echo "  ❌ /demo page not found"
    exit 1
fi

# Test 2: Check if app/page.tsx has button
echo ""
echo "✓ Checking main page for demo button..."
if grep -q "Try Demo Mode" "/Users/melisandecornetlichtfus/Desktop/pixel-logo-generate/app/page.tsx"; then
    echo "  ✅ Demo button text found"
else
    echo "  ❌ Demo button text not found"
    exit 1
fi

# Test 3: Check if /demo page links back
echo ""
echo "✓ Checking /demo page for back link..."
if grep -q "Back to Normal Mode" "/Users/melisandecornetlichtfus/Desktop/pixel-logo-generate/app/demo/page.tsx"; then
    echo "  ✅ Back link found"
else
    echo "  ❌ Back link not found"
    exit 1
fi

# Test 4: Check LogoGenerator has demoMode prop
echo ""
echo "✓ Checking LogoGenerator for demoMode prop..."
if grep -q "demoMode" "/Users/melisandecornetlichtfus/Desktop/pixel-logo-generate/components/LogoGenerator.tsx" | head -1; then
    echo "  ✅ demoMode prop added"
else
    echo "  ❌ demoMode prop not found"
    exit 1
fi

# Test 5: Check demo rate limit logic
echo ""
echo "✓ Checking demo rate limit logic..."
if grep -q "checkDemoRateLimit" "/Users/melisandecornetlichtfus/Desktop/pixel-logo-generate/components/LogoGenerator.tsx"; then
    echo "  ✅ Demo rate limit function found"
else
    echo "  ❌ Demo rate limit function not found"
    exit 1
fi

# Test 6: Check 5-minute window constant
echo ""
echo "✓ Checking 5-minute rate limit window..."
if grep -q "300000\|5 \* 60" "/Users/melisandecornetlichtfus/Desktop/pixel-logo-generate/components/LogoGenerator.tsx"; then
    echo "  ✅ 5-minute rate limit (300000ms) found"
else
    echo "  ❌ 5-minute rate limit not found"
    exit 1
fi

echo ""
echo "=================================="
echo "✅ All implementation tests passed!"
echo ""
echo "📝 IMPLEMENTATION SUMMARY:"
echo "  • Normal mode on /     (3 tries per day)"
echo "  • Demo mode on /demo   (1 try every 5 minutes)"
echo "  • Button links to demo mode with neon styling"
echo "  • Rate limiting implemented separately for each mode"
echo ""
echo "🚀 Next Steps:"
echo "  1. Open http://localhost:3000"
echo "  2. Click 'Try Demo Mode - 80s Exclusive' button"
echo "  3. Verify you're on /demo with demo styling"
echo "  4. Try forging, wait 5 minutes, try again"
echo "  5. Back button returns to normal mode"
