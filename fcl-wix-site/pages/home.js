// Home Page - Main homepage functionality
// Copy this code to the Home page in Wix Studio

import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
    initializeHomePage();
});

function initializeHomePage() {
    loadHomePageContent();
    setupNavigationHandlers();
    loadFeaturedContent();
    setupNewsletterSubscription();
    addScrollAnimations();
}

async function loadHomePageContent() {
    try {
        const homeSettings = await wixData.query('SiteSettings')
            .eq('key', 'homepage')
            .find();
        
        if (homeSettings.items.length > 0) {
            const homeData = JSON.parse(homeSettings.items[0].value);
            
            if (homeData.hero) {
                $w('#homeHeroTitle').text = homeData.hero.title || 'Welcome to Frtl Creative Labs';
                $w('#homeHeroSubtitle').text = homeData.hero.subtitle || 'Innovation meets creativity';
                if (homeData.hero.ctaText) {
                    $w('#homeHeroCTA').text = homeData.hero.ctaText;
                }
            }
            
            if (homeData.whoIsFCL) {
                $w('#whoIsFCLTitle').text = homeData.whoIsFCL.title || 'Who is Frtl Creative Labs?';
                $w('#whoIsFCLDescription').text = homeData.whoIsFCL.description || 'We are innovators...';
            }
        }
    } catch (error) {
        console.error('Error loading homepage content:', error);
        setDefaultHomeContent();
    }
}

function setDefaultHomeContent() {
    $w('#homeHeroTitle').text = 'Welcome to Frtl Creative Labs';
    $w('#homeHeroSubtitle').text = 'Innovation meets creativity in the future of technology';
    $w('#homeHeroCTA').text = 'Explore Our Tech';
    $w('#whoIsFCLTitle').text = 'Who is Frtl Creative Labs?';
    $w('#whoIsFCLDescription').text = 'We are innovators, creators, and visionaries building the future of technology.';
}

function setupNavigationHandlers() {
    $w('#homeHeroCTA').onClick(() => {
        wixLocation.to('/fcl-tech');
    });
    
    $w('#whoIsFCLCTA').onClick(() => {
        wixLocation.to('/who-is-fcl');
    });
    
    $w('#viewAllTechButton').onClick(() => {
        wixLocation.to('/fcl-tech');
    });
    
    $w('#viewAllProductsButton').onClick(() => {
        wixLocation.to('/one2one');
    });
}

async function loadFeaturedContent() {
    await loadFeaturedTech();
    await loadFeaturedProducts();
}

async function loadFeaturedTech() {
    try {
        const initiatives = await wixData.query('Initiatives')
            .eq('featured', true)
            .ascending('order')
            .limit(3)
            .find();
        
        if (initiatives.items.length > 0) {
            initiatives.items.forEach((initiative, index) => {
                const tileIndex = index + 1;
                $(`#techTile${tileIndex}Title`).text = initiative.title;
                $(`#techTile${tileIndex}Description`).text = initiative.summary;
                $(`#techTile${tileIndex}Image`).src = initiative.heroImage;
                
                $(`#techTile${tileIndex}`).onClick(() => {
                    wixLocation.to(`/tech/${initiative.slug}`);
                });
            });
        }
    } catch (error) {
        console.error('Error loading featured tech:', error);
    }
}

async function loadFeaturedProducts() {
    try {
        const products = await wixData.query('Products')
            .eq('isActive', true)
            .limit(6)
            .find();
        
        if (products.items.length > 0) {
            $w('#featuredProductsRepeater').data = products.items;
            
            $w('#featuredProductsRepeater').onItemReady(($item, itemData) => {
                $item('#productCard').onClick(() => {
                    wixLocation.to(`/product/${itemData.sku}`);
                });
                
                $item('#productTitle').text = itemData.title;
                $item('#productPrice').text = `$${(itemData.price / 100).toFixed(2)}`;
                $item('#productImage').src = itemData.images[0];
            });
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

function setupNewsletterSubscription() {
    $w('#newsletterForm').onSubmit(async (event) => {
        event.preventDefault();
        
        const email = $w('#newsletterEmail').value;
        
        if (!email || !isValidEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        try {
            $w('#newsletterSubmit').text = 'Subscribing...';
            $w('#newsletterSubmit').disable();
            
            await saveNewsletterSubscription(email);
            
            showMessage('Thank you for subscribing!', 'success');
            $w('#newsletterEmail').value = '';
            
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            showMessage('Subscription failed. Please try again.', 'error');
        } finally {
            $w('#newsletterSubmit').text = 'Subscribe';
            $w('#newsletterSubmit').enable();
        }
    });
}

async function saveNewsletterSubscription(email) {
    console.log('Newsletter subscription:', email);
    // Implement newsletter subscription logic
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

function addScrollAnimations() {
    $w.onScroll(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        animateOnScroll('#techTilesContainer', scrollY, windowHeight);
        animateOnScroll('#featuredProductsContainer', scrollY, windowHeight);
        animateOnScroll('#newsletterSection', scrollY, windowHeight);
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

