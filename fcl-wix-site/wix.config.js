// Wix configuration file
// This file configures the Wix site deployment

module.exports = {
  // Site configuration
  site: {
    name: 'Frtl Creative Labs',
    description: 'Innovation meets creativity in the future of technology',
    version: '1.0.0'
  },

  // Build configuration
  build: {
    // Output directory
    outputDir: 'dist',
    
    // Source directory
    sourceDir: '.',
    
    // Include patterns
    include: [
      'pages/**/*.js',
      'backend/**/*.js',
      'public/**/*',
      'collections/**/*.json',
      'sample-data/**/*.json'
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules/**',
      '.git/**',
      '*.md',
      '*.json',
      '!package.json',
      '!collections/**/*.json',
      '!sample-data/**/*.json'
    ]
  },

  // Deployment configuration
  deploy: {
    // Auto-deploy on push
    autoDeploy: true,
    
    // Branch to deploy from
    branch: 'main',
    
    // Preview deployment for other branches
    previewBranches: ['develop', 'feature/*']
  },

  // Velo configuration
  velo: {
    // Enable Velo
    enabled: true,
    
    // Backend functions
    backend: {
      functions: [
        'orders',
        'stripeWebhook',
        'cryptoPayments'
      ]
    },
    
    // Page code
    pages: [
      'welcome',
      'home',
      'product',
      'cart',
      'checkout'
    ]
  },

  // Database configuration
  database: {
    // Collections to create
    collections: [
      'Products',
      'Initiatives',
      'Orders',
      'Profiles',
      'ContactMessages',
      'SiteSettings'
    ],
    
    // Sample data to import
    sampleData: [
      'initiatives',
      'products',
      'siteSettings'
    ]
  },

  // Payment configuration
  payments: {
    // Stripe configuration
    stripe: {
      enabled: true,
      testMode: true
    },
    
    // Crypto payments
    crypto: {
      enabled: true,
      providers: ['coinbase', 'nowpayments']
    }
  },

  // Features
  features: {
    // E-commerce
    ecommerce: true,
    
    // Crypto payments
    cryptoPayments: true,
    
    // Blockchain integration
    blockchain: true,
    
    // Unique codes
    uniqueCodes: true,
    
    // Email notifications
    emailNotifications: true
  }
};

