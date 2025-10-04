// Checkout Page - Payment processing functionality
// Copy this code to the Checkout page in Wix Studio

import wixLocation from 'wix-location';
import { fetch } from 'wix-fetch';

$w.onReady(function () {
    initializeCheckoutPage();
});

function initializeCheckoutPage() {
    loadCheckoutData();
    setupPaymentMethods();
    setupFormValidation();
    setupCheckoutFlow();
}

function loadCheckoutData() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        if (cart.length === 0) {
            showEmptyCart();
            return;
        }
        
        displayCartSummary(cart);
        calculateCheckoutTotals(cart);
        loadUserData();
        
    } catch (error) {
        console.error('Error loading checkout data:', error);
        showError('Failed to load checkout data');
    }
}

function displayCartSummary(cart) {
    $w('#checkoutItemsRepeater').data = cart;
    
    $w('#checkoutItemsRepeater').onItemReady(($item, itemData) => {
        $item('#checkoutItemTitle').text = itemData.title;
        $item('#checkoutItemPrice').text = `$${(itemData.price / 100).toFixed(2)}`;
        $item('#checkoutItemQuantity').text = `Qty: ${itemData.quantity}`;
        $item('#checkoutItemTotal').text = `$${((itemData.price * itemData.quantity) / 100).toFixed(2)}`;
        $item('#checkoutItemImage').src = itemData.image;
    });
}

function calculateCheckoutTotals(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.08);
    const shipping = subtotal > 5000 ? 0 : 1000;
    const total = subtotal + tax + shipping;
    
    $w('#checkoutSubtotal').text = `$${(subtotal / 100).toFixed(2)}`;
    $w('#checkoutTax').text = `$${(tax / 100).toFixed(2)}`;
    $w('#checkoutShipping').text = shipping === 0 ? 'Free' : `$${(shipping / 100).toFixed(2)}`;
    $w('#checkoutTotal').text = `$${(total / 100).toFixed(2)}`;
    
    localStorage.setItem('checkoutTotals', JSON.stringify({
        subtotal,
        tax,
        shipping,
        total
    }));
}

function loadUserData() {
    try {
        const savedData = localStorage.getItem('userData');
        if (savedData) {
            const userData = JSON.parse(savedData);
            
            $w('#billingFirstName').value = userData.firstName || '';
            $w('#billingLastName').value = userData.lastName || '';
            $w('#billingEmail').value = userData.email || '';
            $w('#billingPhone').value = userData.phone || '';
            $w('#billingAddress').value = userData.address || '';
            $w('#billingCity').value = userData.city || '';
            $w('#billingState').value = userData.state || '';
            $w('#billingZip').value = userData.zip || '';
            $w('#billingCountry').value = userData.country || 'US';
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function setupPaymentMethods() {
    $w('#stripePaymentOption').onClick(() => {
        selectPaymentMethod('stripe');
    });
    
    $w('#cryptoPaymentOption').onClick(() => {
        selectPaymentMethod('crypto');
    });
    
    selectPaymentMethod('stripe');
}

function selectPaymentMethod(method) {
    $w('#stripePaymentOption').className = method === 'stripe' ? 'payment-option-selected' : 'payment-option';
    $w('#cryptoPaymentOption').className = method === 'crypto' ? 'payment-option-selected' : 'payment-option';
    
    if (method === 'stripe') {
        $w('#stripePaymentForm').show();
        $w('#cryptoPaymentForm').hide();
    } else {
        $w('#stripePaymentForm').hide();
        $w('#cryptoPaymentForm').show();
    }
    
    localStorage.setItem('selectedPaymentMethod', method);
}

function setupFormValidation() {
    $w('#billingForm').onSubmit((event) => {
        event.preventDefault();
        if (validateBillingForm()) {
            processPayment();
        }
    });
    
    setupRealTimeValidation();
}

function validateBillingForm() {
    const requiredFields = [
        'billingFirstName',
        'billingLastName',
        'billingEmail',
        'billingAddress',
        'billingCity',
        'billingState',
        'billingZip'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = $w(`#${fieldId}`);
        if (!field.value.trim()) {
            showFieldError(fieldId, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(fieldId);
        }
    });
    
    if ($w('#billingEmail').value && !isValidEmail($w('#billingEmail').value)) {
        showFieldError('billingEmail', 'Please enter a valid email address');
        isValid = false;
    }
    
    return isValid;
}

function setupRealTimeValidation() {
    const fields = [
        'billingFirstName',
        'billingLastName',
        'billingEmail',
        'billingAddress',
        'billingCity',
        'billingState',
        'billingZip'
    ];
    
    fields.forEach(fieldId => {
        $w(`#${fieldId}`).onChange(() => {
            validateField(fieldId);
        });
    });
}

function validateField(fieldId) {
    const field = $w(`#${fieldId}`);
    const value = field.value.trim();
    
    if (!value) {
        showFieldError(fieldId, 'This field is required');
        return false;
    }
    
    if (fieldId === 'billingEmail' && !isValidEmail(value)) {
        showFieldError(fieldId, 'Please enter a valid email address');
        return false;
    }
    
    clearFieldError(fieldId);
    return true;
}

function showFieldError(fieldId, message) {
    const field = $w(`#${fieldId}`);
    field.className = 'form-field-error';
    
    const errorElement = $w(`#${fieldId}Error`);
    if (errorElement) {
        errorElement.text = message;
        errorElement.show();
    }
}

function clearFieldError(fieldId) {
    const field = $w(`#${fieldId}`);
    field.className = 'form-field';
    
    const errorElement = $w(`#${fieldId}Error`);
    if (errorElement) {
        errorElement.hide();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function setupCheckoutFlow() {
    $w('#placeOrderButton').onClick(() => {
        processPayment();
    });
    
    $w('#backToCartButton').onClick(() => {
        wixLocation.to('/cart');
    });
}

async function processPayment() {
    try {
        if (!validateBillingForm()) {
            return;
        }
        
        $w('#placeOrderButton').text = 'Processing...';
        $w('#placeOrderButton').disable();
        
        const paymentMethod = localStorage.getItem('selectedPaymentMethod') || 'stripe';
        
        const orderData = await createOrder();
        
        if (paymentMethod === 'stripe') {
            await processStripePayment(orderData);
        } else {
            await processCryptoPayment(orderData);
        }
        
    } catch (error) {
        console.error('Error processing payment:', error);
        showError('Payment processing failed. Please try again.');
    } finally {
        $w('#placeOrderButton').text = 'Place Order';
        $w('#placeOrderButton').enable();
    }
}

async function createOrder() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totals = JSON.parse(localStorage.getItem('checkoutTotals') || '{}');
        const paymentMethod = localStorage.getItem('selectedPaymentMethod') || 'stripe';
        
        const orderData = {
            userId: getCurrentUserId(),
            items: cart,
            total: totals.total,
            currency: 'USD',
            paymentMethod: paymentMethod,
            billingInfo: {
                firstName: $w('#billingFirstName').value,
                lastName: $w('#billingLastName').value,
                email: $w('#billingEmail').value,
                phone: $w('#billingPhone').value,
                address: $w('#billingAddress').value,
                city: $w('#billingCity').value,
                state: $w('#billingState').value,
                zip: $w('#billingZip').value,
                country: $w('#billingCountry').value
            }
        };
        
        const response = await fetch('/_functions/createOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            return result.order;
        } else {
            throw new Error(result.message || 'Failed to create order');
        }
        
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

async function processStripePayment(orderData) {
    try {
        const response = await fetch('/_functions/stripeCreatePaymentIntent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: orderData.id,
                amount: orderData.total,
                currency: orderData.currency
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            await initializeStripeElements(result.clientSecret);
        } else {
            throw new Error(result.message || 'Failed to create payment intent');
        }
        
    } catch (error) {
        console.error('Error processing Stripe payment:', error);
        throw error;
    }
}

async function processCryptoPayment(orderData) {
    try {
        const cryptoProvider = localStorage.getItem('cryptoProvider') || 'coinbase';
        
        if (cryptoProvider === 'coinbase') {
            await processCoinbasePayment(orderData);
        } else {
            await processNOWPaymentsPayment(orderData);
        }
        
    } catch (error) {
        console.error('Error processing crypto payment:', error);
        throw error;
    }
}

async function processCoinbasePayment(orderData) {
    try {
        const response = await fetch('/_functions/createCoinbaseCharge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: orderData.id,
                amount: orderData.total,
                currency: orderData.currency,
                metadata: {
                    orderId: orderData.id,
                    userId: orderData.userId
                }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            window.location.href = result.checkoutUrl;
        } else {
            throw new Error(result.message || 'Failed to create crypto payment');
        }
        
    } catch (error) {
        console.error('Error processing Coinbase payment:', error);
        throw error;
    }
}

async function processNOWPaymentsPayment(orderData) {
    try {
        const response = await fetch('/_functions/createNOWPaymentsInvoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: orderData.id,
                amount: orderData.total,
                currency: orderData.currency,
                orderId: orderData.id
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            window.location.href = result.checkoutUrl;
        } else {
            throw new Error(result.message || 'Failed to create crypto payment');
        }
        
    } catch (error) {
        console.error('Error processing NOWPayments payment:', error);
        throw error;
    }
}

async function initializeStripeElements(clientSecret) {
    try {
        if (!window.Stripe) {
            await loadScript('https://js.stripe.com/v3/');
        }
        
        const stripe = Stripe('pk_test_51ABC123...'); // Replace with your publishable key
        const elements = stripe.elements({
            clientSecret: clientSecret
        });
        
        const paymentElement = elements.create('payment');
        paymentElement.mount('#stripe-payment-element');
        
        const form = document.getElementById('stripe-payment-form');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/order-confirmation`
                }
            });
            
            if (error) {
                showError(error.message);
            }
        });
        
    } catch (error) {
        console.error('Error initializing Stripe Elements:', error);
        throw error;
    }
}

function showEmptyCart() {
    $w('#emptyCartMessage').show();
    $w('#checkoutForm').hide();
    $w('#placeOrderButton').hide();
}

function showError(message) {
    $w('#errorMessage').text = message;
    $w('#errorMessage').show();
    
    setTimeout(() => {
        $w('#errorMessage').hide();
    }, 5000);
}

function getCurrentUserId() {
    return null; // Implement user authentication
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

