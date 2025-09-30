#!/bin/bash
# Test the /trip/scheduled endpoint directly

echo "🧪 Testing /trip/scheduled endpoint..."

# Replace with your actual auth token from the app
AUTH_TOKEN="YOUR_TOKEN_HERE"

echo "📞 Making request to: https://getzdriverbackend.vercel.app/api/v1/trip/scheduled"
echo ""

curl -X GET "https://getzdriverbackend.vercel.app/api/v1/trip/scheduled" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\n\n📊 HTTP Status: %{http_code}\n" \
  --connect-timeout 10 \
  --max-time 30

echo ""
echo "✅ Test completed!"
echo ""
echo "📝 Instructions:"
echo "1. Replace YOUR_TOKEN_HERE with actual token from AsyncStorage"
echo "2. Run: chmod +x test-scheduled.sh && ./test-scheduled.sh"
echo "3. Or use PowerShell: "
echo '   Invoke-RestMethod -Uri "https://getzdriverbackend.vercel.app/api/v1/trip/scheduled" -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"; "Content-Type"="application/json"}'
