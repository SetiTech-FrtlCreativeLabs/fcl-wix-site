// Tech Detail Page - Individual tech initiative details
// Copy this code to the Tech Detail page in Wix Studio

import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
    initializeTechDetailPage();
});

function initializeTechDetailPage() {
    const techSlug = getTechSlugFromUrl();
    
    if (techSlug) {
        loadTechDetails(techSlug);
    } else {
        showError('Tech initiative not found');
    }
    
    setupRelatedProducts();
    setupSocialSharing();
    addScrollAnimations();
}

function getTechSlugFromUrl() {
    const url = wixLocation.url;
    const match = url.match(/\/tech\/([^\/]+)/);
    return match ? match[1] : null;
}

async function loadTechDetails(slug) {
    try {
        const initiative = await wixData.query('Initiatives')
            .eq('slug', slug)
            .find();
        
        if (initiative.items.length === 0) {
            showError('Tech initiative not found');
            return;
        }
        
        const initiativeData = initiative.items[0];
        displayTechDetails(initiativeData);
        
        // Load related products
        await loadRelatedProducts(initiativeData.slug);
        
    } catch (error) {
        console.error('Error loading tech details:', error);
        showError('Failed to load tech details');
    }
}

function displayTechDetails(initiative) {
    // Update page title
    document.title = `${initiative.title} - Frtl Creative Labs`;
    
    // Update content
    $w('#techTitle').text = initiative.title;
    $w('#techSummary').text = initiative.summary;
    $w('#techDescription').text = initiative.longDescription;
    $w('#techHeroImage').src = initiative.heroImage;
    
    // Update gallery
    if (initiative.gallery && initiative.gallery.length > 0) {
        $w('#techGallery').data = initiative.gallery;
        
        $w('#techGallery').onItemReady(($item, imageUrl) => {
            $item('#galleryImage').src = imageUrl;
            $item('#galleryImage').onClick(() => {
                $w('#techHeroImage').src = imageUrl;
            });
        });
    } else {
        $w('#techGallery').hide();
    }
    
    // Update external docs link
    if (initiative.externalDocsLink) {
        $w('#externalDocsLink').href = initiative.externalDocsLink;
        $w('#externalDocsButton').show();
    } else {
        $w('#externalDocsButton').hide();
    }
    
    // Setup back button
    $w('#backButton').onClick(() => {
        wixLocation.to('/fcl-tech');
    });
}

async function loadRelatedProducts(initiativeSlug) {
    try {
        const products = await wixData.query('Products')
            .eq('initiativeId', initiativeSlug)
            .eq('isActive', true)
            .limit(6)
            .find();
        
        if (products.items.length > 0) {
            displayRelatedProducts(products.items);
        } else {
            $w('#relatedProductsSection').hide();
        }
        
    } catch (error) {
        console.error('Error loading related products:', error);
        $w('#relatedProductsSection').hide();
    }
}

function displayRelatedProducts(products) {
    $w('#relatedProductsRepeater').data = products;
    
    $w('#relatedProductsRepeater').onItemReady(($item, productData) => {
        $item('#relatedProductTitle').text = productData.title;
        $item('#relatedProductPrice').text = `$${(productData.price / 100).toFixed(2)}`;
        $item('#relatedProductImage').src = productData.images[0];
        
        // Setup click handler
        $item('#relatedProductCard').onClick(() => {
            wixLocation.to(`/product/${productData.sku}`);
        });
        
        // Setup add to cart button
        $item('#relatedProductAddToCart').onClick(async () => {
            await addToCart(productData);
        });
    });
}

async function addToCart(productData) {
    try {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        const existingItem = cart.find(item => item.sku === productData.sku);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                sku: productData.sku,
                title: productData.title,
                price: productData.price,
                quantity: 1,
                image: productData.images[0]
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showMessage('Product added to cart!', 'success');
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showMessage('Failed to add product to cart', 'error');
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

function setupRelatedProducts() {
    // View all products button
    $w('#viewAllProductsButton').onClick(() => {
        wixLocation.to('/one2one');
    });
}

function setupSocialSharing() {
    $w('#shareButton').onClick(() => {
        shareTechInitiative();
    });
    
    $w('#shareFacebook').onClick(() => {
        shareOnSocial('facebook');
    });
    
    $w('#shareTwitter').onClick(() => {
        shareOnSocial('twitter');
    });
    
    $w('#shareLinkedIn').onClick(() => {
        shareOnSocial('linkedin');
    });
}

function shareTechInitiative() {
    const title = $w('#techTitle').text;
    const url = window.location.href;
    const message = `Check out this amazing tech initiative: ${title}`;
    
    if (navigator.share) {
        navigator.share({
            title: title,
            text: message,
            url: url
        });
    } else {
        copyToClipboard(`${message} ${url}`);
        showMessage('Link copied to clipboard!', 'success');
    }
}

function shareOnSocial(platform) {
    const title = $w('#techTitle').text;
    const url = window.location.href;
    const message = `Check out this amazing tech initiative: ${title}`;
    
    let shareUrl = '';
    
    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
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

function addScrollAnimations() {
    $w.onScroll(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Animate sections on scroll
        animateOnScroll('#techDescription', scrollY, windowHeight);
        animateOnScroll('#techGallery', scrollY, windowHeight);
        animateOnScroll('#relatedProductsSection', scrollY, windowHeight);
    });
}

function animateOnScroll(selector, scrollY, windowHeight) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    const elementTop = element.offsetTop;
    const elementHeight = element.offsetHeight;
    const triggerPoint = elementTop - windowHeight + elementHeight * 0.2;
    
    if (scrollY > triggerPoint) {
        element.classList.add('animate-in');
    }
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
