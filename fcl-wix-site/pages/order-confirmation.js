// Order Confirmation Page - Order details and unique codes
import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
    initializeOrderConfirmationPage();
});

function initializeOrderConfirmationPage() {
    loadOrderDetails();
    setupOrderActions();
    setupSocialSharing();
}

async function loadOrderDetails() {
    try {
        const orderId = getOrderIdFromUrl() || localStorage.getItem('lastOrderId');
        
        if (!orderId) {
            showError('Order not found');
            return;
        }
        
        const order = await fetchOrderDetails(orderId);
        
        if (order) {
            displayOrderDetails(order);
            displayUniqueCodes(order);
            displayPaymentInfo(order);
        } else {
            showError('Order not found');
        }
        
    } catch (error) {
        console.error('Error loading order details:', error);
        showError('Failed to load order details');
    }
}

function getOrderIdFromUrl() {
    const url = wixLocation.url;
    const match = url.match(/\/order-confirmation\/([^\/]+)/);
    return match ? match[1] : null;
}

async function fetchOrderDetails(orderId) {
    try {
        const response = await fetch(`/_functions/getOrderDetails?orderId=${orderId}`);
        const result = await response.json();
        
        if (result.success) {
            return result.order;
        } else {
            throw new Error(result.message || 'Failed to fetch order details');
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
}

function displayOrderDetails(order) {
    $w('#orderNumber').text = order.orderNumber;
    $w('#orderDate').text = formatDate(order.createdAt);
    $w('#orderStatus').text = formatOrderStatus(order.status);
    $w('#orderTotal').text = `$${(order.total / 100).toFixed(2)}`;
    
    displayOrderItems(order.items);
    displayBillingInfo(order.billingInfo);
    displayShippingInfo(order.shippingInfo);
}

function displayOrderItems(items) {
    $w('#orderItemsRepeater').data = items;
    
    $w('#orderItemsRepeater').onItemReady(($item, itemData) => {
        $item('#orderItemTitle').text = itemData.title;
        $item('#orderItemPrice').text = `$${(itemData.price / 100).toFixed(2)}`;
        $item('#orderItemQuantity').text = `Qty: ${itemData.quantity}`;
        $item('#orderItemTotal').text = `$${((itemData.price * itemData.quantity) / 100).toFixed(2)}`;
        $item('#orderItemImage').src = itemData.image;
    });
}

function displayBillingInfo(billingInfo) {
    if (billingInfo) {
        $w('#billingName').text = `${billingInfo.firstName} ${billingInfo.lastName}`;
        $w('#billingEmail').text = billingInfo.email;
        $w('#billingPhone').text = billingInfo.phone;
        $w('#billingAddress').text = `${billingInfo.address}, ${billingInfo.city}, ${billingInfo.state} ${billingInfo.zip}`;
    }
}

function displayShippingInfo(shippingInfo) {
    if (shippingInfo) {
        $w('#shippingName').text = `${shippingInfo.firstName} ${shippingInfo.lastName}`;
        $w('#shippingAddress').text = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zip}`;
        $w('#shippingMethod').text = shippingInfo.method || 'Standard Shipping';
        $w('#trackingNumber').text = shippingInfo.trackingNumber || 'Not available yet';
    }
}

function displayUniqueCodes(order) {
    if (order.uniqueCode) {
        $w('#uniqueCode').text = order.uniqueCode;
        $w('#uniqueCodeContainer').show();
        
        generateQRCode(order.uniqueCode);
        
        if (order.blockchainTxId) {
            $w('#blockchainTxId').text = order.blockchainTxId;
            $w('#blockchainTxId').href = `https://etherscan.io/tx/${order.blockchainTxId}`;
            $w('#blockchainInfo').show();
        }
    }
}

async function generateQRCode(uniqueCode) {
    try {
        if (!window.QRCode) {
            await loadScript('https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js');
        }
        
        const canvas = document.getElementById('qrCodeCanvas');
        if (canvas) {
            QRCode.toCanvas(canvas, uniqueCode, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
        }
    } catch (error) {
        console.error('Error generating QR code:', error);
    }
}

function displayPaymentInfo(order) {
    $w('#paymentMethod').text = formatPaymentMethod(order.paymentMethod);
    $w('#paymentStatus').text = formatPaymentStatus(order.status);
    
    if (order.stripePaymentIntentId) {
        $w('#stripePaymentId').text = order.stripePaymentIntentId;
        $w('#stripePaymentInfo').show();
    }
    
    if (order.cryptoInvoiceId) {
        $w('#cryptoInvoiceId').text = order.cryptoInvoiceId;
        $w('#cryptoPaymentInfo').show();
    }
}

function setupOrderActions() {
    $w('#continueShoppingButton').onClick(() => {
        wixLocation.to('/one2one');
    });
    
    $w('#viewOrderHistoryButton').onClick(() => {
        wixLocation.to('/account/orders');
    });
    
    $w('#downloadReceiptButton').onClick(() => {
        downloadReceipt();
    });
    
    $w('#printOrderButton').onClick(() => {
        printOrder();
    });
}

function setupSocialSharing() {
    $w('#shareOrderButton').onClick(() => {
        shareOrder();
    });
}

function shareOrder() {
    const orderNumber = $w('#orderNumber').text;
    const message = `Just made a purchase from Frtl Creative Labs! Order #${orderNumber}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Frtl Creative Labs Purchase',
            text: message,
            url: window.location.href
        });
    } else {
        copyToClipboard(message);
        showMessage('Order details copied to clipboard!', 'success');
    }
}

function downloadReceipt() {
    try {
        const receiptHTML = generateReceiptHTML();
        
        const blob = new Blob([receiptHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${$w('#orderNumber').text}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage('Receipt downloaded!', 'success');
    } catch (error) {
        console.error('Error downloading receipt:', error);
        showMessage('Failed to download receipt', 'error');
    }
}

function generateReceiptHTML() {
    const orderNumber = $w('#orderNumber').text;
    const orderDate = $w('#orderDate').text;
    const orderTotal = $w('#orderTotal').text;
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${orderNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .order-info { margin-bottom: 20px; }
                .items { margin-bottom: 20px; }
                .total { font-weight: bold; font-size: 18px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Frtl Creative Labs</h1>
                <h2>Order Receipt</h2>
            </div>
            <div class="order-info">
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Date:</strong> ${orderDate}</p>
                <p><strong>Total:</strong> ${orderTotal}</p>
            </div>
            <div class="total">
                <p>Total: ${orderTotal}</p>
            </div>
        </body>
        </html>
    `;
}

function printOrder() {
    try {
        $w('#printOrderButton').hide();
        $w('#shareOrderButton').hide();
        $w('#continueShoppingButton').hide();
        
        window.print();
        
        setTimeout(() => {
            $w('#printOrderButton').show();
            $w('#shareOrderButton').show();
            $w('#continueShoppingButton').show();
        }, 1000);
        
    } catch (error) {
        console.error('Error printing order:', error);
        showMessage('Failed to print order', 'error');
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatOrderStatus(status) {
    const statusMap = {
        'pending': 'Pending Payment',
        'paid': 'Payment Confirmed',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    
    return statusMap[status] || status;
}

function formatPaymentMethod(method) {
    const methodMap = {
        'stripe': 'Credit Card',
        'coinbase': 'Cryptocurrency (Coinbase)',
        'nowpayments': 'Cryptocurrency (NOWPayments)'
    };
    
    return methodMap[method] || method;
}

function formatPaymentStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'paid': 'Paid',
        'failed': 'Failed',
        'cancelled': 'Cancelled'
    };
    
    return statusMap[status] || status;
}

function showError(message) {
    $w('#errorMessage').text = message;
    $w('#errorMessage').show();
    
    setTimeout(() => {
        $w('#errorMessage').hide();
    }, 5000);
}

function showMessage(message, type = 'info') {
    const messageElement = $w('#messageToast');
    messageElement.text = message;
    messageElement.className = `message-${type}`;
    messageElement.show();
    
    setTimeout(() => {
        messageElement.hide();
    }, 3000);
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
