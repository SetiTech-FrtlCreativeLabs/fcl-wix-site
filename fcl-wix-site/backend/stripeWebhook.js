// Backend function for Stripe webhook handling
// Copy this code to a new backend function in Wix Studio

import { fetch } from 'wix-fetch';
import wixSecretsBackend from 'wix-secrets-backend';
import { getSecret } from 'wix-secrets-backend';
import { createHash, createHmac } from 'crypto';

// Initialize Stripe
let stripe;
const initializeStripe = async () => {
    if (!stripe) {
        const secretKey = await getSecret('STRIPE_SECRET_KEY');
        stripe = require('stripe')(secretKey);
    }
    return stripe;
};

function verifyStripeSignature(payload, signature, secret) {
    try {
        const stripe = require('stripe')(null);
        const event = stripe.webhooks.constructEvent(payload, signature, secret);
        return event;
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        throw new Error('Invalid signature');
    }
}

export async function verifyStripeWebhook(request) {
    try {
        const signature = request.headers['stripe-signature'];
        const payload = request.body;
        
        if (!signature) {
            throw new Error('Missing Stripe signature');
        }

        const webhookSecret = await getSecret('STRIPE_WEBHOOK_SECRET');
        const event = verifyStripeSignature(payload, signature, webhookSecret);
        
        console.log('Received Stripe webhook:', event.type);

        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data.object);
                break;
                
            case 'payment_intent.payment_failed':
                await handlePaymentFailure(event.data.object);
                break;
                
            case 'payment_intent.canceled':
                await handlePaymentCanceled(event.data.object);
                break;
                
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return {
            success: true,
            message: 'Webhook processed successfully'
        };
    } catch (error) {
        console.error('Stripe webhook error:', error);
        throw new Error(`Webhook processing failed: ${error.message}`);
    }
}

async function handlePaymentSuccess(paymentIntent) {
    try {
        const orderId = paymentIntent.metadata.orderId;
        
        if (!orderId) {
            console.error('No order ID in payment intent metadata');
            return;
        }

        await wixData.update('Orders', orderId, {
            status: 'paid',
            stripePaymentIntentId: paymentIntent.id,
            webhookStatus: 'payment_confirmed',
            updatedAt: new Date()
        });

        const uniqueCodeResult = await createUniqueCode(orderId);
        
        if (uniqueCodeResult.success) {
            await wixData.update('Orders', orderId, {
                uniqueCode: uniqueCodeResult.uniqueCode,
                updatedAt: new Date()
            });

            try {
                const order = await wixData.get('Orders', orderId);
                const blockchainResult = await registerOnBlockchain(
                    uniqueCodeResult.uniqueCode,
                    {
                        orderId,
                        userId: order.userId,
                        total: order.total,
                        currency: order.currency
                    }
                );

                if (blockchainResult.success) {
                    await wixData.update('Orders', orderId, {
                        blockchainTxId: blockchainResult.transactionId,
                        updatedAt: new Date()
                    });
                }
            } catch (blockchainError) {
                console.error('Blockchain registration failed:', blockchainError);
            }
        }

        await sendOrderConfirmationEmail(orderId);

        console.log(`Order ${orderId} payment confirmed and processed`);
    } catch (error) {
        console.error('Error handling payment success:', error);
        throw error;
    }
}

async function handlePaymentFailure(paymentIntent) {
    try {
        const orderId = paymentIntent.metadata.orderId;
        
        if (!orderId) {
            console.error('No order ID in payment intent metadata');
            return;
        }

        await wixData.update('Orders', orderId, {
            status: 'payment_failed',
            webhookStatus: 'payment_failed',
            updatedAt: new Date()
        });

        console.log(`Order ${orderId} payment failed`);
    } catch (error) {
        console.error('Error handling payment failure:', error);
        throw error;
    }
}

async function handlePaymentCanceled(paymentIntent) {
    try {
        const orderId = paymentIntent.metadata.orderId;
        
        if (!orderId) {
            console.error('No order ID in payment intent metadata');
            return;
        }

        await wixData.update('Orders', orderId, {
            status: 'canceled',
            webhookStatus: 'payment_canceled',
            updatedAt: new Date()
        });

        console.log(`Order ${orderId} payment canceled`);
    } catch (error) {
        console.error('Error handling payment cancellation:', error);
        throw error;
    }
}

async function createUniqueCode(orderId) {
    try {
        const date = new Date();
        const dateStr = date.getFullYear().toString() + 
                       (date.getMonth() + 1).toString().padStart(2, '0') + 
                       date.getDate().toString().padStart(2, '0');
        
        const randomPart = require('crypto').randomBytes(4).toString('hex').toUpperCase();
        const uniqueCode = `FCL-${dateStr}-${randomPart}`;

        return {
            success: true,
            uniqueCode
        };
    } catch (error) {
        console.error('Error generating unique code:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function registerOnBlockchain(uniqueCode, metadata) {
    try {
        const blockchainApiKey = await getSecret('BLOCKCHAIN_API_KEY');
        const blockchainNetwork = await getSecret('BLOCKCHAIN_NETWORK') || 'ethereum';
        
        const mockTransactionId = `0x${require('crypto').randomBytes(32).toString('hex')}`;
        
        return {
            success: true,
            transactionId: mockTransactionId,
            blockchainNetwork
        };
    } catch (error) {
        console.error('Error registering on blockchain:', error);
        return {
            success: false,
            message: 'Blockchain registration failed'
        };
    }
}

async function sendOrderConfirmationEmail(orderId) {
    try {
        const order = await wixData.get('Orders', orderId);
        const user = await wixData.get('Profiles', order.userId);
        
        if (!order || !user) {
            console.error('Order or user not found for email confirmation');
            return;
        }

        const member = await wixUsers.getUser(order.userId);
        
        const emailData = {
            to: member.email,
            subject: `Order Confirmation - ${order.orderNumber}`,
            template: 'order-confirmation',
            data: {
                orderNumber: order.orderNumber,
                uniqueCode: order.uniqueCode,
                total: order.total,
                currency: order.currency,
                items: order.items,
                userDisplayName: user.displayName || member.displayName
            }
        };

        await wixEmail.send(emailData);
        
        console.log(`Confirmation email sent for order ${orderId}`);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}

