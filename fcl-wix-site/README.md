# Frtl Creative Labs - Wix Site

A complete Wix site for Frtl Creative Labs with e-commerce marketplace, crypto payments, and blockchain integration.

## 🚀 Quick Start

### 1. Connect to Wix Studio
1. Go to [Wix Studio](https://studio.wix.com)
2. Create a new site or use existing
3. Enable Velo in site settings
4. Connect this GitHub repository via Git integration

### 2. Deploy from GitHub
1. In Wix Studio, go to **Settings** → **Git Integration**
2. Connect your GitHub account
3. Select this repository
4. Click **Deploy** to sync the site

### 3. Configure Collections
1. Go to **Database** in Wix Studio
2. Import the collections from `collections/` folder
3. Add sample data from `sample-data/` folder

### 4. Set Up Secrets
1. Go to **Settings** → **Secrets**
2. Add the required API keys (see `SECRETS.md`)

## 📁 Project Structure

```
├── collections/           # Wix Data collections
├── sample-data/          # Sample data for testing
├── pages/               # Page-specific Velo code
├── backend/             # Backend functions
├── public/              # Static assets
├── SECRETS.md          # Required secrets configuration
└── DEPLOYMENT.md       # Deployment instructions
```

## 🛍️ Features

- **E-commerce Marketplace**: Product catalog, cart, checkout
- **Dual Payments**: Stripe (fiat) + Crypto (Coinbase/NOWPayments)
- **Unique Codes**: Blockchain-linked product codes
- **Admin Panel**: Full content management via Wix Editor
- **Responsive Design**: Mobile-optimized interface

## 🔧 Development

### Local Development
```bash
# Install Wix CLI
npm install -g @wix/cli

# Login to Wix
wix login

# Preview site
wix preview
```

### Git Workflow
1. Make changes to code
2. Commit and push to GitHub
3. Wix automatically syncs changes
4. Preview in Wix Studio

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md)
- [Secrets Configuration](SECRETS.md)
- [API Reference](docs/api.md)

## 🆘 Support

For issues and questions:
- Check [Wix Velo Documentation](https://dev.wix.com/)
- Review [Community Forum](https://www.wix.com/velo/forum)
- Contact development team

---

**Ready to deploy?** Follow the [Deployment Guide](DEPLOYMENT.md) to get started!

