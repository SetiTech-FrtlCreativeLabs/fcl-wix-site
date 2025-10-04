// FCL Tech Page - Tech initiatives showcase
// Copy this code to the FCL Tech page in Wix Studio

import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
    initializeFCLTechPage();
});

function initializeFCLTechPage() {
    loadTechInitiatives();
    setupFilters();
    setupSearch();
    addScrollAnimations();
}

async function loadTechInitiatives() {
    try {
        const initiatives = await wixData.query('Initiatives')
            .ascending('order')
            .find();
        
        if (initiatives.items.length > 0) {
            displayInitiatives(initiatives.items);
        } else {
            showNoInitiatives();
        }
        
    } catch (error) {
        console.error('Error loading tech initiatives:', error);
        showError('Failed to load tech initiatives');
    }
}

function displayInitiatives(initiatives) {
    $w('#initiativesRepeater').data = initiatives;
    
    $w('#initiativesRepeater').onItemReady(($item, initiativeData) => {
        $item('#initiativeTitle').text = initiativeData.title;
        $item('#initiativeSummary').text = initiativeData.summary;
        $item('#initiativeImage').src = initiativeData.heroImage;
        
        // Setup click handler
        $item('#initiativeCard').onClick(() => {
            wixLocation.to(`/tech/${initiativeData.slug}`);
        });
        
        // Setup hover effects
        $item('#initiativeCard').onMouseEnter(() => {
            $item('#initiativeCard').style.transform = 'translateY(-5px)';
            $item('#initiativeCard').style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        });
        
        $item('#initiativeCard').onMouseLeave(() => {
            $item('#initiativeCard').style.transform = 'translateY(0)';
            $item('#initiativeCard').style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
        });
        
        // Setup learn more button
        $item('#learnMoreButton').onClick(() => {
            wixLocation.to(`/tech/${initiativeData.slug}`);
        });
    });
}

function setupFilters() {
    // Category filter
    $w('#categoryFilter').onChange(() => {
        const category = $w('#categoryFilter').value;
        filterInitiatives({ category });
    });
    
    // Featured filter
    $w('#featuredFilter').onChange(() => {
        const featured = $w('#featuredFilter').value === 'featured';
        filterInitiatives({ featured });
    });
    
    // Clear filters
    $w('#clearFiltersButton').onClick(() => {
        clearFilters();
    });
}

function setupSearch() {
    $w('#searchInput').onChange(() => {
        const searchTerm = $w('#searchInput').value;
        searchInitiatives(searchTerm);
    });
    
    $w('#searchButton').onClick(() => {
        const searchTerm = $w('#searchInput').value;
        searchInitiatives(searchTerm);
    });
}

async function filterInitiatives(filters) {
    try {
        let query = wixData.query('Initiatives');
        
        if (filters.featured) {
            query = query.eq('featured', true);
        }
        
        if (filters.category) {
            // Add category filtering logic if needed
        }
        
        const initiatives = await query.ascending('order').find();
        displayInitiatives(initiatives.items);
        
    } catch (error) {
        console.error('Error filtering initiatives:', error);
    }
}

async function searchInitiatives(searchTerm) {
    try {
        if (!searchTerm.trim()) {
            loadTechInitiatives();
            return;
        }
        
        const initiatives = await wixData.query('Initiatives')
            .contains('title', searchTerm)
            .or()
            .contains('summary', searchTerm)
            .ascending('order')
            .find();
        
        displayInitiatives(initiatives.items);
        
    } catch (error) {
        console.error('Error searching initiatives:', error);
    }
}

function clearFilters() {
    $w('#categoryFilter').value = '';
    $w('#featuredFilter').value = '';
    $w('#searchInput').value = '';
    loadTechInitiatives();
}

function addScrollAnimations() {
    $w.onScroll(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Animate initiative cards on scroll
        animateOnScroll('#initiativesRepeater', scrollY, windowHeight);
    });
}

function animateOnScroll(selector, scrollY, windowHeight) {
    const elements = document.querySelectorAll(`${selector} .initiative-card`);
    
    elements.forEach(element => {
        const elementTop = element.offsetTop;
        const elementHeight = element.offsetHeight;
        const triggerPoint = elementTop - windowHeight + elementHeight * 0.2;
        
        if (scrollY > triggerPoint) {
            element.classList.add('animate-in');
        }
    });
}

function showNoInitiatives() {
    $w('#noInitiativesMessage').show();
    $w('#initiativesRepeater').hide();
}

function showError(message) {
    $w('#errorMessage').text = message;
    $w('#errorMessage').show();
    
    setTimeout(() => {
        $w('#errorMessage').hide();
    }, 5000);
}

// Load featured initiatives for homepage
async function loadFeaturedInitiatives() {
    try {
        const featuredInitiatives = await wixData.query('Initiatives')
            .eq('featured', true)
            .ascending('order')
            .limit(3)
            .find();
        
        return featuredInitiatives.items;
    } catch (error) {
        console.error('Error loading featured initiatives:', error);
        return [];
    }
}
