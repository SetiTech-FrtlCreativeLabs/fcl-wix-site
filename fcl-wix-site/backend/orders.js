// Backend function for order management
// Copy this code to a new backend function in Wix Studio

import { fetch } from 'wix-fetch';
import wixSecretsBackend from 'wix-secrets-backend';
import { getSecret } from 'wix-secrets-backend';
import { createHash, randomBytes } from 'crypto';

// Initialize Stripe
let stripe;
const initializeStripe = async () => {
    if (!stripe) {
        const secretKey = await getSecret('STRIPE_SECRET_KEY');
        stripe = require('stripe')(secretKey);
    }
    return stripe;
};

export async function createOrder(orderData) {
    try {
        const { userId, items, total, currency = 'USD', paymentMethod } = orderData;
        
        if (!userId || !items || !total) {
            throw new Error('Missing required order fields');
        }

        const orderNumber = `FCL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        const order = {
            orderNumber,
            userId,
            items,
            total,
            currency,
            paymentMethod,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await wixData.save('Orders', order);
        
        return {
            success: true,
            orderId: result._id,
            orderNumber,
            order
        };
    } catch (error) {
        console.error('Error creating order:', error);
        throw new Error(`Failed to create order: ${error.message}`);
    }
}

export async function stripeCreatePaymentIntent(orderData) {
    try {
        const stripeInstance = await initializeStripe();
        const { orderId, amount, currency = 'USD', metadata = {} } = orderData;

        const paymentIntent = await stripeInstance.paymentIntents.create({
            amount: amount,
            currency: currency,
            metadata: {
                orderId,
                ...metadata
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        await wixData.update('Orders', orderId, {
            stripePaymentIntentId: paymentIntent.id,
            updatedAt: new Date()
        });

        return {
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        };
    } catch (error) {
        console.error('Error creating Stripe Payment Intent:', error);
        throw new Error(`Failed to create payment intent: ${error.message}`);
    }
}

export async function createUniqueCode(orderId) {
    try {
        const date = new Date();
        const dateStr = date.getFullYear().toString() + 
                       (date.getMonth() + 1).toString().padStart(2, '0') + 
                       date.getDate().toString().padStart(2, '0');
        
        const randomPart = randomBytes(4).toString('hex').toUpperCase();
        const uniqueCode = `FCL-${dateStr}-${randomPart}`;

        await wixData.update('Orders', orderId, {
            uniqueCode,
            updatedAt: new Date()
        });

        const qrCodeDataUrl = await generateQRCode(uniqueCode);

        return {
            success: true,
            uniqueCode,
            qrCode: qrCodeDataUrl
        };
    } catch (error) {
        console.error('Error generating unique code:', error);
        throw new Error(`Failed to generate unique code: ${error.message}`);
    }
}

export async function getOrdersByUser(userId) {
    try {
        const orders = await wixData.query('Orders')
            .eq('userId', userId)
            .descending('createdAt')
            .find();

        return {
            success: true,
            orders: orders.items
        };
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw new Error(`Failed to fetch orders: ${error.message}`);
    }
}

export async function getOrderDetails(orderId) {
    try {
        const order = await wixData.get('Orders', orderId);
        
        if (!order) {
            throw new Error('Order not found');
        }

        return {
            success: true,
            order
        };
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw new Error(`Failed to fetch order: ${error.message}`);
    }
}

export async function updateOrderStatus(orderId, status, additionalData = {}) {
    try {
        const updateData = {
            status,
            updatedAt: new Date(),
            ...additionalData
        };

        await wixData.update('Orders', orderId, updateData);

        return {
            success: true,
            message: 'Order status updated successfully'
        };
    } catch (error) {
        console.error('Error updating order status:', error);
        throw new Error(`Failed to update order: ${error.message}`);
    }
}

async function generateQRCode(data) {
    try {
        const QRCode = require('qrcode');
        const qrCodeDataUrl = await QRCode.toDataURL(data, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        return qrCodeDataUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        return null;
    }
}

export async function registerOnBlockchain(uniqueCode, metadata) {
    try {
        const blockchainApiKey = await getSecret('BLOCKCHAIN_API_KEY');
        const blockchainNetwork = await getSecret('BLOCKCHAIN_NETWORK') || 'ethereum';
        
        const blockchainResponse = await fetch('https://api.alchemy.com/v2/register-product', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${blockchainApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: uniqueCode,
                metadata: metadata,
                network: blockchainNetwork
            })
        });

        if (!blockchainResponse.ok) {
            throw new Error('Blockchain registration failed');
        }

        const result = await blockchainResponse.json();
        
        return {
            success: true,
            transactionId: result.transactionId,
            blockchainNetwork
        };
    } catch (error) {
        console.error('Error registering on blockchain:', error);
        return {
            success: false,
            message: 'Blockchain registration failed, but order is still valid'
        };
    }
}

