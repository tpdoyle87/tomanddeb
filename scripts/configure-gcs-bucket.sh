#!/bin/bash

# Google Cloud Storage Bucket Configuration Script
# This script configures your GCS bucket for public read access

BUCKET_NAME="blog-media-doyleengler"
PROJECT_ID="doyleenglerblog"

echo "========================================="
echo "GCS Bucket Configuration for Public Access"
echo "========================================="
echo ""
echo "Bucket: $BUCKET_NAME"
echo "Project: $PROJECT_ID"
echo ""

echo "To make your images publicly accessible, run these commands:"
echo ""
echo "1. First, ensure you're authenticated with Google Cloud:"
echo "   gcloud auth login"
echo ""
echo "2. Set your project:"
echo "   gcloud config set project $PROJECT_ID"
echo ""
echo "3. Make the bucket publicly readable:"
echo "   gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME"
echo ""
echo "OR if you want more granular control:"
echo ""
echo "3a. Create a bucket policy file (bucket-policy.json):"
cat << 'EOF'
{
  "bindings": [
    {
      "role": "roles/storage.objectViewer",
      "members": [
        "allUsers"
      ]
    }
  ]
}
EOF
echo ""
echo "3b. Apply the policy:"
echo "   gsutil iam set bucket-policy.json gs://$BUCKET_NAME"
echo ""
echo "4. Verify the configuration:"
echo "   gsutil iam get gs://$BUCKET_NAME"
echo ""
echo "========================================="
echo "Alternative: Using Google Cloud Console"
echo "========================================="
echo ""
echo "1. Go to: https://console.cloud.google.com/storage/browser/$BUCKET_NAME"
echo "2. Click on 'Permissions' tab"
echo "3. Click 'Grant Access'"
echo "4. In 'New principals' field, enter: allUsers"
echo "5. Select role: 'Storage Object Viewer'"
echo "6. Click 'Save'"
echo ""
echo "========================================="
echo "IMPORTANT NOTES:"
echo "========================================="
echo "- This makes ALL objects in the bucket publicly readable"
echo "- Ensure you're comfortable with this before proceeding"
echo "- You can also set up a CDN with Cloud CDN for better performance"
echo ""