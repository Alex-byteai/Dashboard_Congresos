#!/bin/bash

echo "🔄 Updating Congress Dashboard Data..."
echo ""

# Install Python dependencies if needed
if ! python3 -c "import pandas" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r backend/requirements.txt
fi

# Run data processor
echo "📊 Processing Excel data..."
python3 backend/data_processor.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dashboard data updated successfully!"
    echo "💡 Run 'npm run dev' to see the changes"
else
    echo ""
    echo "❌ Error updating data. Please check the error messages above."
    exit 1
fi
