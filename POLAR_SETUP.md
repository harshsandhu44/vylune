# Polar.sh Setup Guide

This guide walks you through setting up Polar.sh for the Vylune subscription system.

## Prerequisites

- Vylune backend deployed to AWS (or running locally)
- Access to create a Polar.sh account
- AWS CLI configured (for deployment)

## Step 1: Create Polar.sh Account

1. Go to [polar.sh](https://polar.sh)
2. Sign up with your email
3. Complete your profile setup
4. Create or select your organization

## Step 2: Create Products

### Base Product (€25 for 5 seats)

1. Navigate to **Products** in the dashboard
2. Click **Create Product**
3. Fill in the details:
   ```
   Name: Vylune Inventory - Base Plan
   Description: Base plan includes 5 team seats with full inventory management
   Price: €25.00
   Billing: Recurring (Monthly)
   Currency: EUR
   ```
4. Save the product
5. **Copy the Product ID** (format: `prod_xxxxxxxxxxxxx`)
   - Save this as `POLAR_BASE_PRODUCT_ID`

### Additional Seat Price

1. Create another product/price
2. Fill in the details:
   ```
   Name: Additional Seat
   Description: Add extra team members to your organization
   Price: €10.00
   Billing: Recurring (Monthly)
   Currency: EUR
   Type: Metered/Per-unit
   ```
3. Save the product
4. **Copy the Price ID** (format: `price_xxxxxxxxxxxxx`)
   - Save this as `POLAR_ADDITIONAL_SEAT_PRICE_ID`

## Step 3: Get API Credentials

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Set permissions:
   - ✅ Read Checkouts
   - ✅ Write Checkouts
   - ✅ Read Subscriptions
   - ✅ Write Subscriptions
   - ✅ Read Customers
4. **Copy the API Key** (format: `polar_xxxxxxxxxxxxx`)
   - ⚠️ This is shown only once! Save it immediately
   - Save this as `POLAR_API_KEY`

## Step 4: Configure Webhook

1. Go to **Settings** → **Webhooks**
2. Click **Add Webhook Endpoint**
3. Configure the endpoint:

   **For Production:**
   ```
   URL: https://your-api.execute-api.eu-central-1.amazonaws.com/webhooks/polar
   ```

   **For Local Development:**
   ```
   URL: https://your-ngrok-url.ngrok.io/webhooks/polar
   ```

4. Select events to listen for:
   - ✅ `checkout.created`
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.cancelled`

5. Click **Create Endpoint**
6. **Copy the Webhook Secret** (format: `whsec_xxxxxxxxxxxxx`)
   - Save this as `POLAR_WEBHOOK_SECRET`

## Step 5: Update Environment Variables

### Backend (services/api/.env.local)

```bash
# Polar.sh Configuration
POLAR_API_KEY=polar_xxxxxxxxxxxxx              # From Step 3
POLAR_BASE_PRODUCT_ID=prod_xxxxxxxxxxxxx       # From Step 2 (Base Product)
POLAR_ADDITIONAL_SEAT_PRICE_ID=price_xxxxxxxx  # From Step 2 (Additional Seat)
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx       # From Step 4
POLAR_API_URL=https://api.polar.sh

# Frontend URL
FRONTEND_URL=https://vylune.com                # Your frontend URL
```

### Frontend (apps/web/.env.local)

No changes needed - already configured with:
```bash
NEXT_PUBLIC_API_URL=https://your-api.execute-api.eu-central-1.amazonaws.com
NEXT_PUBLIC_AWS_REGION=eu-central-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-central-1_xxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxx
```

## Step 6: Deploy Infrastructure Updates

The CDK stack needs to be updated to include the webhook handler and environment variables.

1. Export environment variables for deployment:

   ```bash
   export POLAR_API_KEY=polar_xxxxxxxxxxxxx
   export POLAR_BASE_PRODUCT_ID=prod_xxxxxxxxxxxxx
   export POLAR_ADDITIONAL_SEAT_PRICE_ID=price_xxxxxxxxxxxxx
   export POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   export FRONTEND_URL=https://vylune.com
   ```

2. Deploy to dev environment:
   ```bash
   bun run cdk:deploy:dev
   ```

3. After successful deployment, copy the webhook URL from CDK outputs

4. Update the webhook URL in Polar.sh (Step 4) with your actual API Gateway URL

## Step 7: Test the Integration

### Enable Test Mode

1. In Polar.sh dashboard, toggle **Test Mode** (top right)
2. In test mode, you can use test card numbers

### Test Card Numbers

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Any expiry date in the future and any 3-digit CVC work.

### Test the Flow

1. Sign up for a new account in your app
2. Create an organization (trial starts automatically)
3. Go to Billing settings
4. Click "Upgrade to Paid Plan"
5. Complete checkout with test card
6. Verify:
   - ✅ Redirected to success page
   - ✅ Subscription status changes to "active"
   - ✅ Webhook events received and processed
   - ✅ Can access all features

### Check Webhook Logs

1. In Polar.sh dashboard, go to **Webhooks**
2. Click on your webhook endpoint
3. View **Recent Deliveries** to see webhook events
4. Check for successful deliveries (200 status codes)

## Step 8: Go Live

Once testing is complete:

1. **Disable Test Mode** in Polar.sh
2. Update environment variables to production values
3. Redeploy your infrastructure:
   ```bash
   bun run cdk:deploy:prd
   ```
4. Update webhook URL in Polar.sh to production API Gateway URL
5. Test with a small real transaction
6. Monitor webhook deliveries and subscription activations

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is publicly accessible
2. Verify webhook secret matches in environment variables
3. Check API Gateway logs in AWS CloudWatch
4. Test webhook endpoint with Polar.sh "Send Test Event"

### Subscription Not Activating

1. Check webhook event is being received (Polar.sh dashboard)
2. Check Lambda logs in CloudWatch for errors
3. Verify DynamoDB permissions for Lambda function
4. Check organization ID in webhook payload matches database

### Payment Failing

1. Check product IDs match in environment variables
2. Verify pricing calculation is correct
3. Test in Polar.sh test mode first
4. Check browser console for errors during checkout

## Pricing Reference

Your pricing structure:

- **Base Plan**: €25/month for 5 seats (including leader)
- **Additional Seats**: €10/month per seat

**Examples:**
- 5 seats: €25/month
- 8 seats: €25 + (3 × €10) = €55/month
- 10 seats: €25 + (5 × €10) = €75/month

## Support

- Polar.sh Documentation: https://docs.polar.sh
- Polar.sh Support: support@polar.sh
- Webhook Events Reference: https://docs.polar.sh/webhooks

## Security Notes

- ✅ Never commit `.env.local` files
- ✅ Webhook signature verification is implemented
- ✅ Idempotency checks prevent duplicate processing
- ✅ All webhook events are logged for audit
- ✅ API keys have minimal required permissions
