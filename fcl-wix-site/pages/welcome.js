// Welcome Page - Splash page functionality
// Copy this code to the Welcome page in Wix Studio

import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
    initializeWelcomePage();
});

function initializeWelcomePage() {
    loadHeroContent();
    setupEnterButton();
    setupHeroBackground();
    addScrollAnimations();
}

async function loadHeroContent() {
    try {
        const heroSettings = await wixData.query('SiteSettings')
            .eq('key', 'hero')
            .find();
        
        if (heroSettings.items.length > 0) {
            const heroData = JSON.parse(heroSettings.items[0].value);
            
            if (heroData.headline) {
                $w('#heroHeadline').text = heroData.headline;
            }
            
            if (heroData.subheadline) {
                $w('#heroSubheadline').text = heroData.subheadline;
            }
            
            if (heroData.backgroundType === 'video' && heroData.videoUrl) {
                $w('#heroVideo').src = heroData.videoUrl;
                $w('#heroVideo').show();
                $w('#heroImage').hide();
            } else if (heroData.backgroundType === 'image' && heroData.imageUrl) {
                $w('#heroImage').src = heroData.imageUrl;
                $w('#heroImage').show();
                $w('#heroVideo').hide();
            }
        }
    } catch (error) {
        console.error('Error loading hero content:', error);
        setDefaultHeroContent();
    }
}

function setDefaultHeroContent() {
    $w('#heroHeadline').text = 'Welcome to Frtl Creative Labs';
    $w('#heroSubheadline').text = 'Innovation meets creativity in the future of technology';
}

function setupEnterButton() {
    $w('#enterButton').onClick(() => {
        $w('#enterButton').text = 'Entering...';
        $w('#enterButton').disable();
        
        $w('#welcomeContainer').style.transition = 'opacity 0.5s ease-out';
        $w('#welcomeContainer').style.opacity = '0';
        
        setTimeout(() => {
            wixLocation.to('/home');
        }, 500);
    });
}

function setupHeroBackground() {
    $w('#heroVideo').onReady(() => {
        $w('#heroVideo').muted = true;
        $w('#heroVideo').autoplay = true;
        $w('#heroVideo').loop = true;
    });
    
    $w('#heroImage').onError(() => {
        console.log('Hero image failed to load, using default');
        $w('#heroImage').src = 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop';
    });
}

function addScrollAnimations() {
    $w.onScroll(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        if (scrollY < windowHeight) {
            const parallaxOffset = scrollY * 0.5;
            $w('#heroContent').style.transform = `translateY(${parallaxOffset}px)`;
        }
        
        const fadeStart = windowHeight * 0.3;
        if (scrollY > fadeStart) {
            const opacity = Math.max(0, 1 - (scrollY - fadeStart) / (windowHeight * 0.7));
            $w('#heroContent').style.opacity = opacity;
        }
    });
}

$w.onKeyPress((event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        $w('#enterButton').click();
    }
});

