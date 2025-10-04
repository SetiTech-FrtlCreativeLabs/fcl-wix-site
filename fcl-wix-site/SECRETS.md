# Required Secrets Configuration

This document lists all the secrets you need to configure in Wix Studio for the Frtl Creative Labs site to function properly.

## 🔐 Wix Secrets Manager

Go to **Wix Studio** → **Settings** → **Secrets** and add the following:

### Stripe Configuration (Required)
```
STRIPE_SECRET_KEY=sk_test_51ABC123...
STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

### Crypto Payment Configuration (Choose One)

#### Option 1: Coinbase Commerce
```
COINBASE_API_KEY=your_coinbase_api_key
COINBASE_WEBHOOK_SECRET=your_coinbase_webhook_secret
```

#### Option 2: NOWPayments
```
NOWPAYMENTS_API_KEY=your_nowpayments_api_key
NOWPAYMENTS_IPN_SECRET=your_nowpayments_ipn_secret
```

### Blockchain Integration (Optional)
```
BLOCKCHAIN_API_KEY=your_blockchain_api_key
BLOCKCHAIN_NETWORK=ethereum
```

### Email Configuration (Optional)
```
EMAIL_API_KEY=your_email_api_key
FROM_EMAIL=noreply@frtlcreativelabs.com
ADMIN_EMAIL=admin@frtlcreativelabs.com
```

## 🔑 How to Get API Keys

### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API Keys**
3. Copy **Publishable key** and **Secret key**
4. For webhook secret: **Developers** → **Webhooks** → **Add endpoint**
5. Set webhook URL: `https://your-site.wixsite.com/_functions/stripeWebhook`
6. Copy webhook signing secret

### Coinbase Commerce
1. Go to [Coinbase Commerce](https://commerce.coinbase.com)
2. Navigate to **Settings** → **API Keys**
3. Create new API key
4. Set webhook URL: `https://your-site.wixsite.com/_functions/coinbaseWebhook`

### NOWPayments
1. Go to [NOWPayments](https://nowpayments.io)
2. Navigate to **API Keys**
3. Create new API key
4. Set IPN URL: `https://your-site.wixsite.com/_functions/nowpaymentsWebhook`

## ⚠️ Important Notes

1. **Test Mode First**: Always start with test API keys
2. **Webhook URLs**: Update webhook URLs to match your site
3. **Security**: Never commit secrets to GitHub
4. **Rotation**: Regularly rotate API keys
5. **Monitoring**: Monitor API usage and costs

## 🧪 Test Mode Setup

### Stripe Test Mode
- Use keys starting with `sk_test_` and `pk_test_`
- Test card: `4242 4242 4242 4242`
- Any future expiry date and CVC

### Crypto Test Mode
- Use sandbox/testnet for crypto providers
- Test with small amounts
- Verify webhook delivery

## 🔄 Production Setup

1. **Switch to Live Keys**: Replace test keys with live keys
2. **Update Webhook URLs**: Point to production site
3. **Test Thoroughly**: Verify all payment flows
4. **Monitor**: Set up monitoring and alerts

## 📞 Support

If you need help with API key setup:
- **Stripe**: [Stripe Support](https://support.stripe.com)
- **Coinbase**: [Coinbase Support](https://help.coinbase.com)
- **NOWPayments**: [NOWPayments Support](https://nowpayments.io/support)

