// Backend function for crypto payment integration
// Copy this code to a new backend function in Wix Studio

import { fetch } from 'wix-fetch';
import wixSecretsBackend from 'wix-secrets-backend';
import { getSecret } from 'wix-secrets-backend';

export async function createCoinbaseCharge(orderData) {
    try {
        const { orderId, amount, currency, metadata } = orderData;
        
        const apiKey = await getSecret('COINBASE_API_KEY');
        
        const chargeRequest = {
            name: `Order ${orderId}`,
            description: `Payment for order ${orderId}`,
            local_price: {
                amount: (amount / 100).toFixed(2),
                currency: currency
            },
            pricing_type: 'fixed_price',
            metadata: metadata
        };
        
        const response = await fetch('https://api.commerce.coinbase.com/charges', {
            method: 'POST',
            headers: {
                'X-CC-Api-Key': apiKey,
                'X-CC-Version': '2018-03-22',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chargeRequest)
        });
        
        if (!response.ok) {
            throw new Error(`Coinbase API error: ${response.status}`);
        }
        
        const charge = await response.json();
        
        await wixData.update('Orders', orderId, {
            cryptoInvoiceId: charge.data.id,
            updatedAt: new Date()
        });
        
        return {
            success: true,
            chargeId: charge.data.id,
            checkoutUrl: charge.data.hosted_url,
            expiresAt: charge.data.expires_at
        };
        
    } catch (error) {
        console.error('Error creating Coinbase charge:', error);
        throw new Error(`Failed to create crypto payment: ${error.message}`);
    }
}

export async function createNOWPaymentsInvoice(orderData) {
    try {
        const { orderId, amount, currency, metadata } = orderData;
        
        const apiKey = await getSecret('NOWPAYMENTS_API_KEY');
        
        const invoiceRequest = {
            price_amount: (amount / 100).toFixed(2),
            price_currency: currency.toLowerCase(),
            pay_currency: 'btc',
            order_id: orderId,
            order_description: `Payment for order ${orderId}`,
            ipn_callback_url: `${process.env.WIX_SITE_URL}/_functions/nowpaymentsWebhook`,
            case: 'success'
        };
        
        const response = await fetch('https://api.nowpayments.io/v1/payment', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invoiceRequest)
        });
        
        if (!response.ok) {
            throw new Error(`NOWPayments API error: ${response.status}`);
        }
        
        const payment = await response.json();
        
        await wixData.update('Orders', orderId, {
            cryptoInvoiceId: payment.payment_id,
            updatedAt: new Date()
        });
        
        return {
            success: true,
            paymentId: payment.payment_id,
            checkoutUrl: payment.pay_url,
            expiresAt: payment.expiration_estimate_date
        };
        
    } catch (error) {
        console.error('Error creating NOWPayments invoice:', error);
        throw new Error(`Failed to create crypto payment: ${error.message}`);
    }
}

export async function coinbaseWebhook(request) {
    try {
        const signature = request.headers['x-cc-webhook-signature'];
        const payload = JSON.stringify(request.body);
        
        if (!signature) {
            throw new Error('Missing Coinbase signature');
        }

        const webhookSecret = await getSecret('COINBASE_WEBHOOK_SECRET');
        
        if (!verifyCoinbaseSignature(payload, signature, webhookSecret)) {
            throw new Error('Invalid Coinbase signature');
        }

        const event = request.body;
        console.log('Received Coinbase webhook:', event.type);

        switch (event.type) {
            case 'charge:confirmed':
                await handleCoinbasePaymentSuccess(event.data);
                break;
                
            case 'charge:failed':
                await handleCoinbasePaymentFailure(event.data);
                break;
                
            case 'charge:delayed':
                await handleCoinbasePaymentDelayed(event.data);
                break;
                
            default:
                console.log(`Unhandled Coinbase event type: ${event.type}`);
        }

        return {
            success: true,
            message: 'Coinbase webhook processed successfully'
        };
    } catch (error) {
        console.error('Coinbase webhook error:', error);
        throw new Error(`Coinbase webhook processing failed: ${error.message}`);
    }
}

export async function nowpaymentsWebhook(request) {
    try {
        const signature = request.headers['x-nowpayments-sig'];
        const payload = JSON.stringify(request.body);
        
        if (!signature) {
            throw new Error('Missing NOWPayments signature');
        }

        const ipnSecret = await getSecret('NOWPAYMENTS_IPN_SECRET');
        
        if (!verifyNOWPaymentsSignature(payload, signature, ipnSecret)) {
            throw new Error('Invalid NOWPayments signature');
        }

        const event = request.body;
        console.log('Received NOWPayments IPN:', event.payment_status);

        switch (event.payment_status) {
            case 'confirmed':
                await handleNOWPaymentsPaymentSuccess(event);
                break;
                
            case 'failed':
                await handleNOWPaymentsPaymentFailure(event);
                break;
                
            case 'partially_paid':
                await handleNOWPaymentsPaymentPartial(event);
                break;
                
            default:
                console.log(`Unhandled NOWPayments status: ${event.payment_status}`);
        }

        return {
            success: true,
            message: 'NOWPayments IPN processed successfully'
        };
    } catch (error) {
        console.error('NOWPayments webhook error:', error);
        throw new Error(`NOWPayments webhook processing failed: ${error.message}`);
    }
}

function verifyCoinbaseSignature(payload, signature, secret) {
    try {
        const expectedSignature = require('crypto').createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
        
        return signature === expectedSignature;
    } catch (error) {
        console.error('Coinbase signature verification failed:', error);
        return false;
    }
}

function verifyNOWPaymentsSignature(payload, signature, secret) {
    try {
        const expectedSignature = require('crypto').createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
        
        return signature === expectedSignature;
    } catch (error) {
        console.error('NOWPayments signature verification failed:', error);
        return false;
    }
}

async function handleCoinbasePaymentSuccess(charge) {
    try {
        const orderId = charge.metadata.orderId;
        
        if (!orderId) {
            console.error('No order ID in Coinbase charge metadata');
            return;
        }

        await wixData.update('Orders', orderId, {
            status: 'paid',
            cryptoInvoiceId: charge.id,
            webhookStatus: 'crypto_payment_confirmed',
            updatedAt: new Date()
        });

        const uniqueCodeResult = await createUniqueCode(orderId);
        
        if (uniqueCodeResult.success) {
            await wixData.update('Orders', orderId, {
                uniqueCode: uniqueCodeResult.uniqueCode,
                updatedAt: new Date()
            });
        }

        await sendOrderConfirmationEmail(orderId);

        console.log(`Order ${orderId} Coinbase payment confirmed`);
    } catch (error) {
        console.error('Error handling Coinbase payment success:', error);
        throw error;
    }
}

async function handleNOWPaymentsPaymentSuccess(payment) {
    try {
        const orderId = payment.order_id;
        
        if (!orderId) {
            console.error('No order ID in NOWPayments payment');
            return;
        }

        await wixData.update('Orders', orderId, {
            status: 'paid',
            cryptoInvoiceId: payment.payment_id,
            webhookStatus: 'crypto_payment_confirmed',
            updatedAt: new Date()
        });

        const uniqueCodeResult = await createUniqueCode(orderId);
        
        if (uniqueCodeResult.success) {
            await wixData.update('Orders', orderId, {
                uniqueCode: uniqueCodeResult.uniqueCode,
                updatedAt: new Date()
            });
        }

        await sendOrderConfirmationEmail(orderId);

        console.log(`Order ${orderId} NOWPayments payment confirmed`);
    } catch (error) {
        console.error('Error handling NOWPayments payment success:', error);
        throw error;
    }
}

async function handleCoinbasePaymentFailure(charge) {
    try {
        const orderId = charge.metadata.orderId;
        
        if (!orderId) {
            console.error('No order ID in Coinbase charge metadata');
            return;
        }

        await wixData.update('Orders', orderId, {
            status: 'payment_failed',
            webhookStatus: 'crypto_payment_failed',
            updatedAt: new Date()
        });

        console.log(`Order ${orderId} Coinbase payment failed`);
    } catch (error) {
        console.error('Error handling Coinbase payment failure:', error);
        throw error;
    }
}

async function handleNOWPaymentsPaymentFailure(payment) {
    try {
        const orderId = payment.order_id;
        
        if (!orderId) {
            console.error('No order ID in NOWPayments payment');
            return;
        }

        await wixData.update('Orders', orderId, {
            status: 'payment_failed',
            webhookStatus: 'crypto_payment_failed',
            updatedAt: new Date()
        });

        console.log(`Order ${orderId} NOWPayments payment failed`);
    } catch (error) {
        console.error('Error handling NOWPayments payment failure:', error);
        throw error;
    }
}

async function handleCoinbasePaymentDelayed(charge) {
    try {
        const orderId = charge.metadata.orderId;
        
        if (!orderId) {
            console.error('No order ID in Coinbase charge metadata');
            return;
        }

        await wixData.update('Orders', orderId, {
            status: 'pending',
            webhookStatus: 'crypto_payment_delayed',
            updatedAt: new Date()
        });

        console.log(`Order ${orderId} Coinbase payment delayed`);
    } catch (error) {
        console.error('Error handling Coinbase payment delay:', error);
        throw error;
    }
}

async function handleNOWPaymentsPaymentPartial(payment) {
    try {
        const orderId = payment.order_id;
        
        if (!orderId) {
            console.error('No order ID in NOWPayments payment');
            return;
        }

        await wixData.update('Orders', orderId, {
            status: 'pending',
            webhookStatus: 'crypto_payment_partial',
            updatedAt: new Date()
        });

        console.log(`Order ${orderId} NOWPayments payment partial`);
    } catch (error) {
        console.error('Error handling NOWPayments partial payment:', error);
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

