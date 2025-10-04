# Deployment Guide - Frtl Creative Labs Wix Site

This guide will walk you through deploying the Frtl Creative Labs site to Wix Studio using Git integration.

## 🚀 Prerequisites

### Required Accounts
- **Wix Studio Account** (free at [studio.wix.com](https://studio.wix.com))
- **GitHub Account** (free at [github.com](https://github.com))
- **Stripe Account** (for payments at [stripe.com](https://stripe.com))
- **Crypto Payment Provider** (Coinbase Commerce or NOWPayments)

### Required Tools
- **Git** (for version control)
- **Wix CLI** (optional, for local development)

## 📋 Step-by-Step Deployment

### Step 1: Create Wix Studio Site

1. **Go to Wix Studio**
   - Visit [studio.wix.com](https://studio.wix.com)
   - Sign up or log in
   - Click **Create New Site**

2. **Choose Template**
   - Select **Blank Site** or any template
   - Name your site: "Frtl Creative Labs"
   - Click **Create Site**

3. **Enable Velo**
   - Go to **Settings** → **Advanced** → **Velo**
   - Toggle **Enable Velo** to ON
   - Accept terms and conditions

### Step 2: Set Up Git Integration

1. **Connect GitHub**
   - In Wix Studio, go to **Settings** → **Git Integration**
   - Click **Connect GitHub**
   - Authorize Wix to access your GitHub account

2. **Select Repository**
   - Choose this repository from the list
   - Click **Connect Repository**

3. **Deploy Site**
   - Click **Deploy** to sync the repository
   - Wait for deployment to complete

### Step 3: Configure Database Collections

1. **Access Database**
   - In Wix Studio, go to **Database**
   - Click **Add Collection**

2. **Import Collections**
   - Create the following collections:
     - `Products` (e-commerce products)
     - `Initiatives` (FCL tech items)
     - `Orders` (customer orders)
     - `Profiles` (user profiles)
     - `ContactMessages` (contact form)
     - `SiteSettings` (site configuration)

3. **Add Sample Data**
   - Import data from `sample-data/` folder
   - Verify all collections have data

### Step 4: Configure Secrets

1. **Access Secrets Manager**
   - Go to **Settings** → **Secrets**
   - Click **Add Secret**

2. **Add Required Secrets**
   - Follow the [SECRETS.md](SECRETS.md) guide
   - Add all API keys and secrets
   - Test each secret

### Step 5: Set Up Pages

1. **Create Pages**
   - Go to **Pages** in Wix Studio
   - Create the following pages:
     - Welcome (splash)
     - Home
     - Who is FCL
     - FCL Tech
     - One2One (marketplace)
     - Contact
     - Product Detail
     - Cart
     - Checkout
     - Order Confirmation
     - Account

2. **Add Page Code**
   - For each page, add the corresponding Velo code
   - Code is located in `pages/` folder
   - Copy and paste into page code sections

### Step 6: Configure Backend Functions

1. **Access Backend**
   - Go to **Backend** in Wix Studio
   - Click **Add Function**

2. **Add Functions**
   - Create functions from `backend/` folder:
     - `orders.js` - Order management
     - `stripeWebhook.js` - Stripe payments
     - `cryptoWebhook.js` - Crypto payments
     - `cryptoPayments.js` - Crypto integration

3. **Set Permissions**
   - Configure function permissions
   - Set up webhook endpoints

### Step 7: Test the Site

1. **Preview Mode**
   - Click **Preview** in Wix Studio
   - Test all pages and functionality
   - Verify responsive design

2. **Test Payments**
   - Use Stripe test mode
   - Test crypto payments in sandbox
   - Verify webhook delivery

3. **Test Admin Functions**
   - Edit content via Wix Editor
   - Add new products
   - Test order management

### Step 8: Go Live

1. **Publish Site**
   - Click **Publish** in Wix Studio
   - Choose domain (free or custom)
   - Complete publishing process

2. **Switch to Live Keys**
   - Update API keys to live mode
   - Test with real payments
   - Monitor for issues

## 🔧 Development Workflow

### Making Changes
1. **Edit Code**
   - Make changes to files in GitHub
   - Commit and push changes

2. **Sync to Wix**
   - Wix automatically syncs changes
   - Preview changes in Wix Studio

3. **Test Changes**
   - Test functionality
   - Fix any issues
   - Deploy to production

### Local Development (Optional)
```bash
# Install Wix CLI
npm install -g @wix/cli

# Login to Wix
wix login

# Clone repository
git clone <your-repo-url>
cd fcl-wix-site

# Preview locally
wix preview
```

## 🧪 Testing Checklist

### Functionality Tests
- [ ] All pages load correctly
- [ ] Navigation works properly
- [ ] Product catalog displays
- [ ] Cart functionality works
- [ ] Checkout process completes
- [ ] Payment processing works
- [ ] Order confirmation displays
- [ ] Unique codes generate
- [ ] Email notifications send

### Payment Tests
- [ ] Stripe test payments work
- [ ] Crypto payments work
- [ ] Webhooks are received
- [ ] Order status updates
- [ ] Refunds process correctly

### Admin Tests
- [ ] Content editing works
- [ ] Product management works
- [ ] Order management works
- [ ] User management works
- [ ] Site settings work

### Mobile Tests
- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] Forms are usable
- [ ] Navigation is accessible

## 🚨 Troubleshooting

### Common Issues

#### Site Not Loading
- Check if Velo is enabled
- Verify Git integration is connected
- Check for JavaScript errors

#### Payments Not Working
- Verify API keys are correct
- Check webhook endpoints
- Test in sandbox mode first

#### Database Issues
- Verify collections exist
- Check field types and permissions
- Import sample data

#### Code Errors
- Check browser console for errors
- Verify function permissions
- Test functions individually

### Getting Help
- **Wix Support**: [support.wix.com](https://support.wix.com)
- **Velo Documentation**: [dev.wix.com](https://dev.wix.com)
- **Community Forum**: [www.wix.com/velo/forum](https://www.wix.com/velo/forum)

## 📊 Monitoring

### Set Up Monitoring
1. **Error Tracking**
   - Monitor JavaScript errors
   - Track payment failures
   - Log user issues

2. **Performance Monitoring**
   - Monitor page load times
   - Track API response times
   - Monitor database performance

3. **Business Metrics**
   - Track sales and conversions
   - Monitor user engagement
   - Analyze payment success rates

## 🔄 Maintenance

### Regular Tasks
- **Weekly**: Check for errors and issues
- **Monthly**: Update dependencies and security
- **Quarterly**: Review and optimize performance
- **Annually**: Audit security and compliance

### Updates
- **Code Updates**: Push to GitHub, Wix syncs automatically
- **Content Updates**: Use Wix Editor
- **Configuration Updates**: Use Wix Studio settings

---

**Need Help?** Check the troubleshooting section or contact support!

