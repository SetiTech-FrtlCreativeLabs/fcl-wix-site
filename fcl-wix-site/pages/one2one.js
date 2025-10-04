// One2One Marketplace Page - Product listing and search
// Copy this code to the One2One page in Wix Studio

import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
    initializeOne2OnePage();
});

function initializeOne2OnePage() {
    loadProducts();
    setupSearchAndFilters();
    setupPagination();
    setupSorting();
}

async function loadProducts(filters = {}, sortBy = 'title', sortOrder = 'asc', page = 1, limit = 12) {
    try {
        let query = wixData.query('Products')
            .eq('isActive', true);

        // Apply filters
        if (filters.initiativeId) {
            query = query.eq('initiativeId', filters.initiativeId);
        }

        if (filters.minPrice) {
            query = query.gte('price', filters.minPrice * 100);
        }

        if (filters.maxPrice) {
            query = query.lte('price', filters.maxPrice * 100);
        }

        if (filters.searchTerm) {
            query = query.contains('title', filters.searchTerm);
        }

        // Apply sorting
        if (sortOrder === 'asc') {
            query = query.ascending(sortBy);
        } else {
            query = query.descending(sortBy);
        }

        // Apply pagination
        const offset = (page - 1) * limit;
        query = query.skip(offset).limit(limit);

        const result = await query.find();
        
        displayProducts(result.items);
        updatePagination(result.totalCount, page, limit);
        
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products');
    }
}

function displayProducts(products) {
    if (products.length === 0) {
        showNoProducts();
        return;
    }

    $w('#productsRepeater').data = products;
    
    $w('#productsRepeater').onItemReady(($item, productData) => {
        $item('#productTitle').text = productData.title;
        $item('#productPrice').text = `$${(productData.price / 100).toFixed(2)}`;
        $item('#productImage').src = productData.images[0];
        $item('#productSKU').text = productData.sku;
        
        // Show inventory status
        if (productData.inventoryCount > 10) {
            $item('#inventoryStatus').text = 'In Stock';
            $item('#inventoryStatus').className = 'inventory-in-stock';
        } else if (productData.inventoryCount > 0) {
            $item('#inventoryStatus').text = `Only ${productData.inventoryCount} left`;
            $item('#inventoryStatus').className = 'inventory-low';
        } else {
            $item('#inventoryStatus').text = 'Out of Stock';
            $item('#inventoryStatus').className = 'inventory-out';
        }

        // Setup click handlers
        $item('#productCard').onClick(() => {
            wixLocation.to(`/product/${productData.sku}`);
        });

        $item('#quickViewButton').onClick(() => {
            showQuickView(productData);
        });

        $item('#addToCartButton').onClick(async () => {
            await addToCart(productData);
        });
    });
}

function setupSearchAndFilters() {
    // Search functionality
    $w('#searchInput').onChange(() => {
        const searchTerm = $w('#searchInput').value;
        applyFilters({ searchTerm });
    });

    // Initiative filter
    $w('#initiativeFilter').onChange(() => {
        const initiativeId = $w('#initiativeFilter').value;
        applyFilters({ initiativeId });
    });

    // Price range filter
    $w('#priceRangeMin').onChange(() => {
        const minPrice = parseInt($w('#priceRangeMin').value) || 0;
        const maxPrice = parseInt($w('#priceRangeMax').value) || 10000;
        applyFilters({ minPrice, maxPrice });
    });

    $w('#priceRangeMax').onChange(() => {
        const minPrice = parseInt($w('#priceRangeMin').value) || 0;
        const maxPrice = parseInt($w('#priceRangeMax').value) || 10000;
        applyFilters({ minPrice, maxPrice });
    });

    // Clear filters
    $w('#clearFiltersButton').onClick(() => {
        clearFilters();
    });
}

function setupPagination() {
    $w('#prevPageButton').onClick(() => {
        const currentPage = parseInt($w('#currentPage').text) || 1;
        if (currentPage > 1) {
            loadPage(currentPage - 1);
        }
    });

    $w('#nextPageButton').onClick(() => {
        const currentPage = parseInt($w('#currentPage').text) || 1;
        const totalPages = parseInt($w('#totalPages').text) || 1;
        if (currentPage < totalPages) {
            loadPage(currentPage + 1);
        }
    });
}

function setupSorting() {
    $w('#sortSelect').onChange(() => {
        const sortValue = $w('#sortSelect').value;
        const [sortBy, sortOrder] = sortValue.split('-');
        applySorting(sortBy, sortOrder);
    });
}

function applyFilters(filters) {
    const currentFilters = getCurrentFilters();
    const newFilters = { ...currentFilters, ...filters };
    
    // Store filters
    localStorage.setItem('one2oneFilters', JSON.stringify(newFilters));
    
    // Reload products
    loadProducts(newFilters);
}

function getCurrentFilters() {
    try {
        return JSON.parse(localStorage.getItem('one2oneFilters') || '{}');
    } catch (error) {
        return {};
    }
}

function clearFilters() {
    localStorage.removeItem('one2oneFilters');
    
    // Reset form elements
    $w('#searchInput').value = '';
    $w('#initiativeFilter').value = '';
    $w('#priceRangeMin').value = '';
    $w('#priceRangeMax').value = '';
    
    // Reload products
    loadProducts();
}

function applySorting(sortBy, sortOrder) {
    const filters = getCurrentFilters();
    loadProducts(filters, sortBy, sortOrder);
}

function loadPage(page) {
    const filters = getCurrentFilters();
    const sortValue = $w('#sortSelect').value;
    const [sortBy, sortOrder] = sortValue.split('-');
    
    loadProducts(filters, sortBy, sortOrder, page);
}

function updatePagination(totalCount, currentPage, limit) {
    const totalPages = Math.ceil(totalCount / limit);
    
    $w('#currentPage').text = currentPage;
    $w('#totalPages').text = totalPages;
    $w('#totalProducts').text = totalCount;
    
    // Enable/disable pagination buttons
    $w('#prevPageButton').enable(currentPage > 1);
    $w('#nextPageButton').enable(currentPage < totalPages);
    
    // Show/hide pagination
    $w('#paginationContainer').show(totalPages > 1);
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

function showQuickView(productData) {
    // Populate quick view modal
    $w('#quickViewTitle').text = productData.title;
    $w('#quickViewPrice').text = `$${(productData.price / 100).toFixed(2)}`;
    $w('#quickViewDescription').text = productData.description;
    $w('#quickViewImage').src = productData.images[0];
    
    // Show modal
    $w('#quickViewModal').show();
    
    // Setup modal actions
    $w('#quickViewCloseButton').onClick(() => {
        $w('#quickViewModal').hide();
    });
    
    $w('#quickViewAddToCartButton').onClick(async () => {
        await addToCart(productData);
        $w('#quickViewModal').hide();
    });
    
    $w('#quickViewViewDetailsButton').onClick(() => {
        $w('#quickViewModal').hide();
        wixLocation.to(`/product/${productData.sku}`);
    });
}

function showNoProducts() {
    $w('#noProductsMessage').show();
    $w('#productsRepeater').hide();
    $w('#paginationContainer').hide();
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

// Load initiatives for filter dropdown
async function loadInitiatives() {
    try {
        const initiatives = await wixData.query('Initiatives')
            .ascending('title')
            .find();
        
        $w('#initiativeFilter').options = [
            { label: 'All Initiatives', value: '' },
            ...initiatives.items.map(initiative => ({
                label: initiative.title,
                value: initiative.slug
            }))
        ];
    } catch (error) {
        console.error('Error loading initiatives:', error);
    }
}

// Initialize initiatives filter
loadInitiatives();
