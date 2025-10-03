# Frtl Creative Labs (FCL) - Wix/Velo Website

A production-ready website for Frtl Creative Labs featuring an e-commerce marketplace with both fiat (Stripe) and crypto payment options, deployable via Wix Git integration.

## 🚀 Features

- **Multi-page Website**: Welcome, Home, Who is FCL, FCL Tech, One2One marketplace, Contact
- **E-commerce Marketplace**: Product catalog, cart, checkout with Stripe and crypto payments
- **Unique Code Generation**: Blockchain-linked product codes for each purchase
- **Admin-Friendly**: Fully editable content via Wix Editor
- **Responsive Design**: Modern interactive-edge UI with Lottie animations
- **CI/CD Ready**: GitHub Actions for preview and production deployment

## 📁 Repository Structure

```
fcl-frtl-wix/
├── README.md
├── .github/workflows/ci-deploy.yml
├── .wixignore
├── package.json
├── wix/
│   ├── backend/
│   │   ├── orders.js
│   │   ├── stripeWebhook.js
│   │   └── cryptoWebhook.js
│   ├── public/
│   └── frontend/
│       ├── welcome.js
│       ├── home.js
│       └── product.js
├── docs/
│   ├── editor-guide.md
│   └── deployment.md
└── data-models/
    └── schema.json
```

## 🛠 Setup & Deployment

### Prerequisites

1. **Wix Studio Account** with Velo enabled
2. **GitHub Account** with repository access
3. **Stripe Account** for fiat payments
4. **Crypto Payment Provider** (Coinbase Commerce or NOWPayments)

### Environment Variables

Create a `.env` file with the following secrets (store in Wix Secrets Manager):

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Crypto Payment (choose one)
COINBASE_API_KEY=your_coinbase_key
COINBASE_WEBHOOK_SECRET=your_webhook_secret

# OR for NOWPayments
NOWPAYMENTS_API_KEY=your_nowpayments_key
NOWPAYMENTS_IPN_SECRET=your_ipn_secret

# Blockchain Integration
BLOCKCHAIN_API_KEY=your_blockchain_key
BLOCKCHAIN_NETWORK=ethereum

# Wix Configuration
WIX_SITE_ID=your_site_id
WIX_CLI_API_KEY=your_cli_api_key
```

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd fcl-frtl-wix
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Wix CLI**:
   ```bash
   npx wix-cli login --apiKey $WIX_CLI_API_KEY
   ```

4. **Deploy to Wix**:
   ```bash
   npm run wix:preview  # For preview
   npm run wix:publish  # For production
   ```

## 🎨 Content Management

### Adding Products

1. Navigate to **Wix Editor** → **Database** → **Products Collection**
2. Add new product with required fields:
   - Title, SKU, Price, Description
   - Images (upload to Wix Media)
   - Initiative ID (link to FCL Tech item)
   - Stripe Price ID (from Stripe Dashboard)

### Editing Tech Items

1. Go to **Wix Editor** → **Database** → **Initiatives Collection**
2. Update content for the 6 featured tech items
3. Upload hero images and gallery photos
4. Add external documentation links

### Managing Orders

1. Access **Wix Editor** → **Database** → **Orders Collection**
2. View order details, unique codes, and payment status
3. Process refunds through Stripe Dashboard

## 🔧 Development

### Local Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Backend Functions

All backend functions are located in `wix/backend/`:

- `orders.js` - Order creation and management
- `stripeWebhook.js` - Stripe payment verification
- `cryptoWebhook.js` - Crypto payment verification

### Frontend Pages

Page-specific code in `wix/frontend/`:

- `welcome.js` - Splash page functionality
- `home.js` - Home page interactions
- `product.js` - Product detail and cart logic

## 🧪 Testing

### Test Mode Setup

1. **Stripe Test Mode**:
   - Use test API keys (sk_test_...)
   - Test with card: 4242 4242 4242 4242
   - Verify webhook endpoints

2. **Crypto Test Mode**:
   - Use sandbox/testnet for crypto providers
   - Test with small amounts
   - Verify webhook delivery

### QA Checklist

- [ ] All pages load correctly
- [ ] Product catalog displays properly
- [ ] Cart functionality works
- [ ] Stripe checkout completes
- [ ] Crypto checkout completes
- [ ] Unique codes generate
- [ ] Order confirmation emails send
- [ ] Mobile responsiveness
- [ ] Content editing via Wix Editor

## 📚 Documentation

- [Editor Guide](docs/editor-guide.md) - How to edit content
- [Deployment Guide](docs/deployment.md) - Deployment instructions
- [API Reference](docs/api-reference.md) - Backend endpoints

## 🔐 Security

- All API keys stored in Wix Secrets Manager
- Webhook signature verification enabled
- HTTPS enforced for all endpoints
- Input validation on all forms

## 🚀 Deployment

### Automatic Deployment

The repository includes GitHub Actions for automatic deployment:

- **Preview**: Deploys on pull requests
- **Production**: Deploys on merge to main branch

### Manual Deployment

```bash
# Preview deployment
npm run wix:preview

# Production deployment
npm run wix:publish
```

## 📞 Support

For technical support:
- Check [Wix Velo Documentation](https://dev.wix.com/)
- Review [Community Support Forum](https://www.wix.com/velo/forum)
- Contact development team

## 📄 License

© 2024 Frtl Creative Labs. All rights reserved.
