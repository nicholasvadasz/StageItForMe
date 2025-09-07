# StageItForMe Setup Guide

Follow these step-by-step instructions to configure all the required services and environment variables.

## 1. Initial Setup

### Copy Environment File
```bash
cp .env.example .env.local
```

## 2. NextAuth Configuration

### Generate NextAuth Secret
```bash
openssl rand -base64 32
```
Or use: https://generate-secret.vercel.app/32

**Set in .env.local:**
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here
```

## 3. Google OAuth Setup

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable Google+ API (if not already enabled)

### Step 2: Create OAuth Credentials
1. Go to "Credentials" in the left sidebar
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Name it: "StageItForMe"
5. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (for production)

### Step 3: Get Your Credentials
Copy the Client ID and Client Secret

**Set in .env.local:**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 4. Convex Database Setup

### Step 1: Create Convex Account
1. Visit: https://convex.dev/
2. Sign up with GitHub or Google
3. Click "Create a new project"
4. Name it: "stageitforme"

### Step 2: Initialize Convex
```bash
npx convex dev
```
This will:
- Prompt you to login
- Create a new deployment
- Generate your URLs

### Step 3: Get Your URLs
After running `convex dev`, you'll see output like:
```
✓ Deployed
  URL: https://your-deployment.convex.cloud
```

**Set in .env.local:**
```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key-from-dashboard
```

### Step 4: Push Schema
```bash
npx convex dev
```
Leave this running in a terminal - it will watch for changes.

## 5. AWS S3 Setup

### Step 1: Create AWS Account
1. Visit: https://aws.amazon.com/
2. Sign up or sign in
3. Go to AWS Console

### Step 2: Create S3 Bucket
1. Go to S3 service
2. Click "Create bucket"
3. Bucket name: `stageitforme-images-{random-string}`
4. Region: `us-east-1` (or your preferred region)
5. Block public access: Keep default (blocked)
6. Create bucket

### Step 3: Create IAM User
1. Go to IAM service
2. Click "Users" > "Add user"
3. Username: `stageitforme-app`
4. Access type: "Programmatic access"
5. Click "Next: Permissions"

### Step 4: Set Permissions
1. Click "Attach existing policies directly"
2. Search for and select: `AmazonS3FullAccess`
3. Continue through wizard
4. Download the CSV with your keys

**Set in .env.local:**
```
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

### Step 5: Configure CORS (Optional)
If you plan to upload directly from browser:
1. Go to your S3 bucket
2. Click "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Add:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT"],
        "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
        "ExposeHeaders": []
    }
]
```

## 6. Stripe Setup

### Step 1: Create Stripe Account
1. Visit: https://stripe.com/
2. Sign up
3. Complete account verification

### Step 2: Get API Keys
1. Go to Stripe Dashboard
2. Click "Developers" > "API keys"
3. Copy your Publishable key and Secret key

**Set in .env.local:**
```
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

### Step 3: Create Products and Prices
1. Go to "Products" in Stripe Dashboard
2. Click "Add product"

**Create these products:**

**Product 1: Starter Plan**
- Name: "Starter Plan"
- Description: "10 photos per month"
- Pricing: $29/month recurring
- Copy the Price ID

**Product 2: Professional Plan**
- Name: "Professional Plan"
- Description: "50 photos per month"
- Pricing: $79/month recurring
- Copy the Price ID

**Product 3: Enterprise Plan**
- Name: "Enterprise Plan"
- Description: "Unlimited photos"
- Pricing: $199/month recurring
- Copy the Price ID

**Set in .env.local:**
```
STRIPE_STARTER_PRICE_ID=price_your-starter-price-id
STRIPE_PROFESSIONAL_PRICE_ID=price_your-professional-price-id
STRIPE_ENTERPRISE_PRICE_ID=price_your-enterprise-price-id
```

### Step 4: Set up Webhooks (Later)
For now, you can skip this. When ready for production:
1. Go to "Webhooks" in Stripe Dashboard
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook secret

## 7. Google Gemini API Setup

### Step 1: Get Gemini API Key
1. Visit: https://aistudio.google.com/
2. Sign in with your Google account
3. Click "Get API key" or go to API keys section
4. Create a new API key for your project
5. Copy the API key

**Set in .env.local:**
```
GEMINI_API_KEY=your-gemini-api-key-here
```

### Step 2: Install Gemini Package
```bash
npm install @google/genai
```

**Note:** StageItForMe uses Gemini's `gemini-2.5-flash-image-preview` model for:
- **Image + Text-to-Image Editing**: Upload room photos and add virtual furniture
- **Style Transfer**: Apply different design styles (modern, traditional, minimalist)
- **Iterative Refinement**: Make progressive adjustments to staging
- **High-Fidelity Results**: Professional-quality staged photos for real estate

## 8. Final Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development
```bash
npm run dev
```

### Step 3: Start Convex (in separate terminal)
```bash
npx convex dev
```

Your app should now be running at: http://localhost:3000

## 9. Verification Checklist

- [ ] Can access landing page at http://localhost:3000
- [ ] Google OAuth button works (test in incognito)
- [ ] Convex functions deploy without errors
- [ ] S3 bucket created and accessible
- [ ] Stripe products created with correct pricing
- [ ] All environment variables set

## 10. Next Steps

After basic setup works:
1. Implement Gemini API integration
2. Add image upload functionality
3. Build out user dashboard
4. Add subscription management
5. Deploy to Vercel

## Troubleshooting

### Common Issues:

**Convex connection errors:**
- Make sure `npx convex dev` is running
- Check that NEXT_PUBLIC_CONVEX_URL is correct

**OAuth errors:**
- Verify redirect URIs match exactly
- Check that OAuth credentials are correct

**S3 upload errors:**
- Verify IAM permissions
- Check bucket name and region

**Stripe errors:**
- Make sure you're using test keys for development
- Verify price IDs are correct

Need help with any step? Let me know!