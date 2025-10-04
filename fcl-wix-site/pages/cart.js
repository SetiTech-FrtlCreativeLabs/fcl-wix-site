// Cart Page - Shopping cart functionality
// Copy this code to the Cart page in Wix Studio

import wixLocation from 'wix-location';

$w.onReady(function () {
    initializeCartPage();
});

function initializeCartPage() {
    loadCartItems();
    setupCartInteractions();
    updateCartTotals();
}

function loadCartItems() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        if (cart.length === 0) {
            showEmptyCart();
            return;
        }
        
        $w('#cartItemsRepeater').data = cart;
        
        $w('#cartItemsRepeater').onItemReady(($item, itemData) => {
            setupCartItemInteractions($item, itemData);
        });
        
    } catch (error) {
        console.error('Error loading cart items:', error);
        showEmptyCart();
    }
}

function setupCartItemInteractions($item, itemData) {
    $item('#itemTitle').text = itemData.title;
    $item('#itemPrice').text = `$${(itemData.price / 100).toFixed(2)}`;
    $item('#itemQuantity').value = itemData.quantity;
    $item('#itemImage').src = itemData.image;
    $item('#itemTotal').text = `$${((itemData.price * itemData.quantity) / 100).toFixed(2)}`;
    
    $item('#quantityMinus').onClick(() => {
        updateItemQuantity(itemData.sku, itemData.quantity - 1);
    });
    
    $item('#quantityPlus').onClick(() => {
        updateItemQuantity(itemData.sku, itemData.quantity + 1);
    });
    
    $item('#itemQuantity').onChange(() => {
        const newQuantity = parseInt($item('#itemQuantity').value) || 1;
        updateItemQuantity(itemData.sku, newQuantity);
    });
    
    $item('#removeItem').onClick(() => {
        removeCartItem(itemData.sku);
    });
}

function updateItemQuantity(sku, newQuantity) {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const itemIndex = cart.findIndex(item => item.sku === sku);
        
        if (itemIndex === -1) return;
        
        if (newQuantity <= 0) {
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity = newQuantity;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartItems();
        updateCartTotals();
        
    } catch (error) {
        console.error('Error updating item quantity:', error);
    }
}

function removeCartItem(sku) {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const updatedCart = cart.filter(item => item.sku !== sku);
        
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        loadCartItems();
        updateCartTotals();
        
        showMessage('Item removed from cart', 'success');
        
    } catch (error) {
        console.error('Error removing item from cart:', error);
        showMessage('Failed to remove item', 'error');
    }
}

function updateCartTotals() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        if (cart.length === 0) {
            showEmptyCart();
            return;
        }
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = Math.round(subtotal * 0.08);
        const shipping = subtotal > 5000 ? 0 : 1000;
        const total = subtotal + tax + shipping;
        
        $w('#cartSubtotal').text = `$${(subtotal / 100).toFixed(2)}`;
        $w('#cartTax').text = `$${(tax / 100).toFixed(2)}`;
        $w('#cartShipping').text = shipping === 0 ? 'Free' : `$${(shipping / 100).toFixed(2)}`;
        $w('#cartTotal').text = `$${(total / 100).toFixed(2)}`;
        
        if (shipping === 0) {
            $w('#freeShippingMessage').show();
        } else {
            $w('#freeShippingMessage').hide();
        }
        
        if (cart.length > 0) {
            $w('#checkoutButton').enable();
        } else {
            $w('#checkoutButton').disable();
        }
        
    } catch (error) {
        console.error('Error updating cart totals:', error);
    }
}

function showEmptyCart() {
    $w('#emptyCartMessage').show();
    $w('#cartItemsContainer').hide();
    $w('#cartTotalsContainer').hide();
    $w('#checkoutButton').hide();
}

function setupCartInteractions() {
    $w('#continueShoppingButton').onClick(() => {
        wixLocation.to('/one2one');
    });
    
    $w('#checkoutButton').onClick(() => {
        proceedToCheckout();
    });
    
    $w('#clearCartButton').onClick(() => {
        clearCart();
    });
}

function proceedToCheckout() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        if (cart.length === 0) {
            showMessage('Your cart is empty', 'error');
            return;
        }
        
        wixLocation.to('/checkout');
        
    } catch (error) {
        console.error('Error proceeding to checkout:', error);
        showMessage('Failed to proceed to checkout', 'error');
    }
}

function clearCart() {
    try {
        if (confirm('Are you sure you want to clear your cart?')) {
            localStorage.removeItem('cart');
            loadCartItems();
            updateCartTotals();
            showMessage('Cart cleared', 'success');
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
        showMessage('Failed to clear cart', 'error');
    }
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

