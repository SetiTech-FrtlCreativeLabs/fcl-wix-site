// Product Page - Product details and cart functionality
// Copy this code to the Product Detail page in Wix Studio

import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
    initializeProductPage();
});

function initializeProductPage() {
    const productSku = getProductSkuFromUrl();
    
    if (productSku) {
        loadProductDetails(productSku);
    } else {
        showError('Product not found');
    }
    
    setupCartFunctionality();
    setupCheckoutFlow();
    setup3DPreview();
}

function getProductSkuFromUrl() {
    const url = wixLocation.url;
    const match = url.match(/\/product\/([^\/]+)/);
    return match ? match[1] : null;
}

async function loadProductDetails(sku) {
    try {
        const product = await wixData.query('Products')
            .eq('sku', sku)
            .find();
        
        if (product.items.length === 0) {
            showError('Product not found');
            return;
        }
        
        const productData = product.items[0];
        updateProductDisplay(productData);
        
        await loadRelatedInitiative(productData.initiativeId);
        
    } catch (error) {
        console.error('Error loading product details:', error);
        showError('Failed to load product details');
    }
}

function updateProductDisplay(product) {
    $w('#productTitle').text = product.title;
    $w('#productPrice').text = `$${(product.price / 100).toFixed(2)}`;
    $w('#productDescription').text = product.description;
    $w('#productSKU').text = `SKU: ${product.sku}`;
    
    updateProductImages(product.images);
    updateInventoryStatus(product.inventoryCount);
    updateCryptoPaymentOption(product.cryptoEnabled);
    setupQuantitySelector(product.inventoryCount);
}

function updateProductImages(images) {
    if (images && images.length > 0) {
        $w('#productMainImage').src = images[0];
        
        $w('#productImageGallery').data = images;
        
        $w('#productImageGallery').onItemReady(($item, itemData) => {
            $item('#galleryImage').src = itemData;
            $item('#galleryImage').onClick(() => {
                $w('#productMainImage').src = itemData;
            });
        });
    }
}

function updateInventoryStatus(inventoryCount) {
    const inventoryElement = $w('#inventoryStatus');
    
    if (inventoryCount > 10) {
        inventoryElement.text = 'In Stock';
        inventoryElement.className = 'inventory-in-stock';
    } else if (inventoryCount > 0) {
        inventoryElement.text = `Only ${inventoryCount} left`;
        inventoryElement.className = 'inventory-low';
    } else {
        inventoryElement.text = 'Out of Stock';
        inventoryElement.className = 'inventory-out';
        $w('#addToCartButton').disable();
    }
}

function updateCryptoPaymentOption(cryptoEnabled) {
    if (cryptoEnabled) {
        $w('#cryptoPaymentOption').show();
    } else {
        $w('#cryptoPaymentOption').hide();
    }
}

function setupQuantitySelector(maxQuantity) {
    let quantity = 1;
    
    $w('#quantityMinus').onClick(() => {
        if (quantity > 1) {
            quantity--;
            $w('#quantityDisplay').text = quantity;
        }
    });
    
    $w('#quantityPlus').onClick(() => {
        if (quantity < maxQuantity) {
            quantity++;
            $w('#quantityDisplay').text = quantity;
        }
    });
    
    $w('#quantityDisplay').onChange(() => {
        quantity = parseInt($w('#quantityDisplay').value) || 1;
        if (quantity > maxQuantity) {
            quantity = maxQuantity;
            $w('#quantityDisplay').value = quantity;
        }
    });
}

async function loadRelatedInitiative(initiativeId) {
    try {
        const initiative = await wixData.query('Initiatives')
            .eq('slug', initiativeId)
            .find();
        
        if (initiative.items.length > 0) {
            const initiativeData = initiative.items[0];
            $w('#relatedInitiativeTitle').text = initiativeData.title;
            $w('#relatedInitiativeDescription').text = initiativeData.summary;
            $w('#relatedInitiativeImage').src = initiativeData.heroImage;
            
            $w('#relatedInitiativeCard').onClick(() => {
                wixLocation.to(`/tech/${initiativeData.slug}`);
            });
        }
    } catch (error) {
        console.error('Error loading related initiative:', error);
    }
}

function setupCartFunctionality() {
    $w('#addToCartButton').onClick(async () => {
        await addToCart();
    });
    
    $w('#buyNowButton').onClick(async () => {
        await buyNow();
    });
}

async function addToCart() {
    try {
        const productSku = getProductSkuFromUrl();
        const quantity = parseInt($w('#quantityDisplay').value) || 1;
        
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        const existingItem = cart.find(item => item.sku === productSku);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            const product = await wixData.query('Products')
                .eq('sku', productSku)
                .find();
            
            if (product.items.length > 0) {
                cart.push({
                    sku: productSku,
                    title: product.items[0].title,
                    price: product.items[0].price,
                    quantity: quantity,
                    image: product.items[0].images[0]
                });
            }
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showMessage('Product added to cart!', 'success');
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showMessage('Failed to add product to cart', 'error');
    }
}

async function buyNow() {
    try {
        const productSku = getProductSkuFromUrl();
        const quantity = parseInt($w('#quantityDisplay').value) || 1;
        
        const product = await wixData.query('Products')
            .eq('sku', productSku)
            .find();
        
        if (product.items.length === 0) {
            showError('Product not found');
            return;
        }
        
        const productData = product.items[0];
        
        const cart = [{
            sku: productSku,
            title: productData.title,
            price: productData.price,
            quantity: quantity,
            image: productData.images[0]
        }];
        
        localStorage.setItem('cart', JSON.stringify(cart));
        wixLocation.to('/checkout');
        
    } catch (error) {
        console.error('Error with buy now:', error);
        showMessage('Failed to proceed to checkout', 'error');
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    $w('#cartCount').text = totalItems;
    
    if (totalItems > 0) {
        $w('#cartCount').show();
    } else {
        $w('#cartCount').hide();
    }
}

function setupCheckoutFlow() {
    $w('#stripePaymentOption').onClick(() => {
        selectPaymentMethod('stripe');
    });
    
    $w('#cryptoPaymentOption').onClick(() => {
        selectPaymentMethod('crypto');
    });
}

function selectPaymentMethod(method) {
    $w('#stripePaymentOption').className = method === 'stripe' ? 'payment-option-selected' : 'payment-option';
    $w('#cryptoPaymentOption').className = method === 'crypto' ? 'payment-option-selected' : 'payment-option';
    
    localStorage.setItem('selectedPaymentMethod', method);
}

function setup3DPreview() {
    const has3DModel = $w('#product3DModel').src;
    
    if (has3DModel) {
        initialize3DViewer();
    } else {
        $w('#product3DPreview').hide();
    }
}

function initialize3DViewer() {
    $w('#product3DPreview').show();
    
    $w('#rotate3DButton').onClick(() => {
        console.log('Rotating 3D model');
    });
    
    $w('#zoom3DButton').onClick(() => {
        console.log('Zooming 3D model');
    });
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

