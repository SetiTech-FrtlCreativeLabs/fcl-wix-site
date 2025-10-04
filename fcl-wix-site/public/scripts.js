// Frtl Creative Labs - Global JavaScript Functions

// Global utility functions
window.FCL = {
    // Cart management
    cart: {
        get: function() {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        },
        
        add: function(product) {
            let cart = this.get();
            const existingItem = cart.find(item => item.sku === product.sku);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    sku: product.sku,
                    title: product.title,
                    price: product.price,
                    quantity: 1,
                    image: product.images[0]
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            this.updateCount();
            return cart;
        },
        
        remove: function(sku) {
            let cart = this.get();
            cart = cart.filter(item => item.sku !== sku);
            localStorage.setItem('cart', JSON.stringify(cart));
            this.updateCount();
            return cart;
        },
        
        updateQuantity: function(sku, quantity) {
            let cart = this.get();
            const item = cart.find(item => item.sku === sku);
            
            if (item) {
                if (quantity <= 0) {
                    return this.remove(sku);
                } else {
                    item.quantity = quantity;
                }
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            this.updateCount();
            return cart;
        },
        
        clear: function() {
            localStorage.removeItem('cart');
            this.updateCount();
        },
        
        getTotal: function() {
            const cart = this.get();
            return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        },
        
        getItemCount: function() {
            const cart = this.get();
            return cart.reduce((count, item) => count + item.quantity, 0);
        },
        
        updateCount: function() {
            const count = this.getItemCount();
            const cartCountElements = document.querySelectorAll('.cart-count');
            
            cartCountElements.forEach(element => {
                element.textContent = count;
                element.style.display = count > 0 ? 'block' : 'none';
            });
        }
    },
    
    // User preferences
    preferences: {
        get: function(key) {
            const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            return prefs[key];
        },
        
        set: function(key, value) {
            const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            prefs[key] = value;
            localStorage.setItem('userPreferences', JSON.stringify(prefs));
        },
        
        getAll: function() {
            return JSON.parse(localStorage.getItem('userPreferences') || '{}');
        }
    },
    
    // API helpers
    api: {
        get: async function(url) {
            try {
                const response = await fetch(url);
                return await response.json();
            } catch (error) {
                console.error('API GET Error:', error);
                throw error;
            }
        },
        
        post: async function(url, data) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                return await response.json();
            } catch (error) {
                console.error('API POST Error:', error);
                throw error;
            }
        }
    },
    
    // UI helpers
    ui: {
        showMessage: function(message, type = 'info') {
            const messageElement = document.getElementById('messageToast');
            if (messageElement) {
                messageElement.textContent = message;
                messageElement.className = `message message-${type}`;
                messageElement.style.display = 'block';
                
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 3000);
            }
        },
        
        showLoading: function(element) {
            if (element) {
                element.innerHTML = '<div class="loading"></div>';
                element.disabled = true;
            }
        },
        
        hideLoading: function(element, originalText) {
            if (element) {
                element.innerHTML = originalText;
                element.disabled = false;
            }
        },
        
        formatPrice: function(cents) {
            return `$${(cents / 100).toFixed(2)}`;
        },
        
        formatDate: function(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    },
    
    // Validation helpers
    validation: {
        email: function(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        phone: function(phone) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            return phoneRegex.test(phone.replace(/\s/g, ''));
        },
        
        required: function(value) {
            return value && value.trim().length > 0;
        },
        
        minLength: function(value, min) {
            return value && value.length >= min;
        },
        
        maxLength: function(value, max) {
            return value && value.length <= max;
        }
    },
    
    // Animation helpers
    animation: {
        fadeIn: function(element, duration = 300) {
            element.style.opacity = '0';
            element.style.display = 'block';
            
            let start = performance.now();
            
            function animate(timestamp) {
                let progress = (timestamp - start) / duration;
                
                if (progress < 1) {
                    element.style.opacity = progress;
                    requestAnimationFrame(animate);
                } else {
                    element.style.opacity = '1';
                }
            }
            
            requestAnimationFrame(animate);
        },
        
        fadeOut: function(element, duration = 300) {
            let start = performance.now();
            let startOpacity = parseFloat(getComputedStyle(element).opacity);
            
            function animate(timestamp) {
                let progress = (timestamp - start) / duration;
                
                if (progress < 1) {
                    element.style.opacity = startOpacity * (1 - progress);
                    requestAnimationFrame(animate);
                } else {
                    element.style.opacity = '0';
                    element.style.display = 'none';
                }
            }
            
            requestAnimationFrame(animate);
        },
        
        slideDown: function(element, duration = 300) {
            element.style.height = '0';
            element.style.overflow = 'hidden';
            element.style.display = 'block';
            
            let targetHeight = element.scrollHeight;
            let start = performance.now();
            
            function animate(timestamp) {
                let progress = (timestamp - start) / duration;
                
                if (progress < 1) {
                    element.style.height = (targetHeight * progress) + 'px';
                    requestAnimationFrame(animate);
                } else {
                    element.style.height = targetHeight + 'px';
                    element.style.overflow = 'visible';
                }
            }
            
            requestAnimationFrame(animate);
        },
        
        slideUp: function(element, duration = 300) {
            let startHeight = element.offsetHeight;
            let start = performance.now();
            
            element.style.overflow = 'hidden';
            
            function animate(timestamp) {
                let progress = (timestamp - start) / duration;
                
                if (progress < 1) {
                    element.style.height = (startHeight * (1 - progress)) + 'px';
                    requestAnimationFrame(animate);
                } else {
                    element.style.height = '0';
                    element.style.display = 'none';
                    element.style.overflow = 'visible';
                }
            }
            
            requestAnimationFrame(animate);
        }
    },
    
    // Scroll helpers
    scroll: {
        to: function(element, offset = 0) {
            const targetPosition = element.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        },
        
        toTop: function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    },
    
    // Local storage helpers
    storage: {
        get: function(key) {
            try {
                return JSON.parse(localStorage.getItem(key));
            } catch (error) {
                return localStorage.getItem(key);
            }
        },
        
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                localStorage.setItem(key, value);
            }
        },
        
        remove: function(key) {
            localStorage.removeItem(key);
        },
        
        clear: function() {
            localStorage.clear();
        }
    }
};

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    FCL.cart.updateCount();
    
    // Setup global event listeners
    setupGlobalEventListeners();
});

function setupGlobalEventListeners() {
    // Add to cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-add-to-cart]')) {
            e.preventDefault();
            const productData = JSON.parse(e.target.dataset.product);
            FCL.cart.add(productData);
            FCL.ui.showMessage('Product added to cart!', 'success');
        }
    });
    
    // Remove from cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-remove-from-cart]')) {
            e.preventDefault();
            const sku = e.target.dataset.sku;
            FCL.cart.remove(sku);
            FCL.ui.showMessage('Product removed from cart', 'info');
        }
    });
    
    // Update quantity inputs
    document.addEventListener('change', function(e) {
        if (e.target.matches('[data-update-quantity]')) {
            const sku = e.target.dataset.sku;
            const quantity = parseInt(e.target.value);
            FCL.cart.updateQuantity(sku, quantity);
        }
    });
    
    // Form validation
    document.addEventListener('submit', function(e) {
        if (e.target.matches('[data-validate]')) {
            if (!validateForm(e.target)) {
                e.preventDefault();
            }
        }
    });
    
    // Smooth scroll for anchor links
    document.addEventListener('click', function(e) {
        if (e.target.matches('a[href^="#"]')) {
            e.preventDefault();
            const target = document.querySelector(e.target.getAttribute('href'));
            if (target) {
                FCL.scroll.to(target, 80);
            }
        }
    });
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!FCL.validation.required(field.value)) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(field);
        }
        
        // Email validation
        if (field.type === 'email' && field.value && !FCL.validation.email(field.value)) {
            showFieldError(field, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Phone validation
        if (field.type === 'tel' && field.value && !FCL.validation.phone(field.value)) {
            showFieldError(field, 'Please enter a valid phone number');
            isValid = false;
        }
    });
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('form-control-error');
    
    let errorElement = field.parentNode.querySelector('.form-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function clearFieldError(field) {
    field.classList.remove('form-control-error');
    
    const errorElement = field.parentNode.querySelector('.form-error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// Utility function to load external scripts
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Utility function to copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        return navigator.clipboard.writeText(text);
    } else {
        return new Promise((resolve, reject) => {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                resolve();
            } catch (error) {
                reject(error);
            }
            
            document.body.removeChild(textArea);
        });
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FCL;
}
