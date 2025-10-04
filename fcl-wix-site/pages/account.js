// Account Page - User account management
import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
    initializeAccountPage();
});

function initializeAccountPage() {
    checkUserAuthentication();
    setupAccountTabs();
    setupAccountActions();
}

function checkUserAuthentication() {
    try {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            showLoginPrompt();
            return;
        }
        
        setupAuthenticatedUser(currentUser);
        
    } catch (error) {
        console.error('Error checking authentication:', error);
        showLoginPrompt();
    }
}

function getCurrentUser() {
    return null; // Implement with Wix Members
}

function showLoginPrompt() {
    $w('#loginPrompt').show();
    $w('#accountContent').hide();
    
    $w('#loginButton').onClick(() => {
        wixLocation.to('/login');
    });
    
    $w('#signupButton').onClick(() => {
        wixLocation.to('/signup');
    });
}

function setupAuthenticatedUser(user) {
    $w('#loginPrompt').hide();
    $w('#accountContent').show();
    
    loadUserProfile();
    loadOrderHistory();
    loadAccountSettings();
}

async function loadUserProfile() {
    try {
        const userId = getCurrentUserId();
        if (!userId) return;
        
        const profile = await fetchUserProfile(userId);
        
        if (profile) {
            displayUserProfile(profile);
        }
        
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

async function fetchUserProfile(userId) {
    try {
        const response = await fetch(`/_functions/getUserProfile?userId=${userId}`);
        const result = await response.json();
        
        if (result.success) {
            return result.profile;
        } else {
            throw new Error(result.message || 'Failed to fetch user profile');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

function displayUserProfile(profile) {
    $w('#userDisplayName').text = profile.displayName || 'User';
    $w('#userEmail').text = profile.email || '';
    $w('#userJoinDate').text = formatDate(profile.createdAt);
    $w('#userAvatar').src = profile.avatar || '/default-avatar.png';
}

async function loadOrderHistory() {
    try {
        const userId = getCurrentUserId();
        if (!userId) return;
        
        const orders = await fetchUserOrders(userId);
        
        if (orders && orders.length > 0) {
            displayOrderHistory(orders);
        } else {
            showEmptyOrderHistory();
        }
        
    } catch (error) {
        console.error('Error loading order history:', error);
    }
}

async function fetchUserOrders(userId) {
    try {
        const response = await fetch(`/_functions/getOrdersByUser?userId=${userId}`);
        const result = await response.json();
        
        if (result.success) {
            return result.orders;
        } else {
            throw new Error(result.message || 'Failed to fetch orders');
        }
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }
}

function displayOrderHistory(orders) {
    $w('#orderHistoryRepeater').data = orders;
    
    $w('#orderHistoryRepeater').onItemReady(($item, orderData) => {
        $item('#orderNumber').text = orderData.orderNumber;
        $item('#orderDate').text = formatDate(orderData.createdAt);
        $item('#orderTotal').text = `$${(orderData.total / 100).toFixed(2)}`;
        $item('#orderStatus').text = formatOrderStatus(orderData.status);
        $item('#orderItems').text = `${orderData.items.length} item(s)`;
        
        $item('#viewOrderButton').onClick(() => {
            viewOrderDetails(orderData.id);
        });
        
        $item('#trackOrderButton').onClick(() => {
            trackOrder(orderData.id);
        });
        
        $item('#reorderButton').onClick(() => {
            reorderItems(orderData.items);
        });
    });
}

function showEmptyOrderHistory() {
    $w('#emptyOrderHistory').show();
    $w('#orderHistoryRepeater').hide();
}

function loadAccountSettings() {
    loadUserPreferences();
    loadNotificationSettings();
    loadPrivacySettings();
}

function loadUserPreferences() {
    try {
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        
        $w('#newsletterSubscription').checked = preferences.newsletter || false;
        $w('#orderNotifications').checked = preferences.orderNotifications !== false;
        $w('#marketingEmails').checked = preferences.marketingEmails || false;
        
    } catch (error) {
        console.error('Error loading user preferences:', error);
    }
}

function loadNotificationSettings() {
    try {
        const notifications = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
        
        $w('#emailNotifications').checked = notifications.email !== false;
        $w('#smsNotifications').checked = notifications.sms || false;
        $w('#pushNotifications').checked = notifications.push || false;
        
    } catch (error) {
        console.error('Error loading notification settings:', error);
    }
}

function loadPrivacySettings() {
    try {
        const privacy = JSON.parse(localStorage.getItem('privacySettings') || '{}');
        
        $w('#profileVisibility').value = privacy.profileVisibility || 'private';
        $w('#dataSharing').checked = privacy.dataSharing || false;
        $w('#analyticsTracking').checked = privacy.analyticsTracking !== false;
        
    } catch (error) {
        console.error('Error loading privacy settings:', error);
    }
}

function setupAccountTabs() {
    $w('#profileTab').onClick(() => {
        showTab('profile');
    });
    
    $w('#ordersTab').onClick(() => {
        showTab('orders');
    });
    
    $w('#settingsTab').onClick(() => {
        showTab('settings');
    });
    
    showTab('profile');
}

function showTab(tabName) {
    $w('#profileContent').hide();
    $w('#ordersContent').hide();
    $w('#settingsContent').hide();
    
    $w('#profileTab').className = 'tab';
    $w('#ordersTab').className = 'tab';
    $w('#settingsTab').className = 'tab';
    
    switch (tabName) {
        case 'profile':
            $w('#profileContent').show();
            $w('#profileTab').className = 'tab active';
            break;
        case 'orders':
            $w('#ordersContent').show();
            $w('#ordersTab').className = 'tab active';
            break;
        case 'settings':
            $w('#settingsContent').show();
            $w('#settingsTab').className = 'tab active';
            break;
    }
}

function setupAccountActions() {
    setupProfileActions();
    setupOrderActions();
    setupSettingsActions();
}

function setupProfileActions() {
    $w('#editProfileButton').onClick(() => {
        editProfile();
    });
    
    $w('#changePasswordButton').onClick(() => {
        changePassword();
    });
    
    $w('#deleteAccountButton').onClick(() => {
        deleteAccount();
    });
}

function setupOrderActions() {
    $w('#orderFilter').onChange(() => {
        filterOrders();
    });
    
    $w('#orderSearch').onChange(() => {
        searchOrders();
    });
}

function setupSettingsActions() {
    $w('#savePreferencesButton').onClick(() => {
        saveUserPreferences();
    });
    
    $w('#saveNotificationsButton').onClick(() => {
        saveNotificationSettings();
    });
    
    $w('#savePrivacyButton').onClick(() => {
        savePrivacySettings();
    });
}

function editProfile() {
    $w('#profileForm').show();
    $w('#profileDisplay').hide();
    
    $w('#profileForm').onSubmit(async (event) => {
        event.preventDefault();
        await saveProfile();
    });
}

async function saveProfile() {
    try {
        const profileData = {
            displayName: $w('#displayNameInput').value,
            email: $w('#emailInput').value,
            phone: $w('#phoneInput').value,
            address: $w('#addressInput').value,
            city: $w('#cityInput').value,
            state: $w('#stateInput').value,
            zip: $w('#zipInput').value,
            country: $w('#countryInput').value
        };
        
        if (!validateProfileForm(profileData)) {
            return;
        }
        
        await updateUserProfile(profileData);
        
        loadUserProfile();
        
        showMessage('Profile updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving profile:', error);
        showMessage('Failed to update profile', 'error');
    }
}

function validateProfileForm(profileData) {
    if (!profileData.displayName.trim()) {
        showMessage('Display name is required', 'error');
        return false;
    }
    
    if (!profileData.email.trim() || !isValidEmail(profileData.email)) {
        showMessage('Valid email is required', 'error');
        return false;
    }
    
    return true;
}

async function updateUserProfile(profileData) {
    try {
        const userId = getCurrentUserId();
        
        const response = await fetch('/_functions/updateUserProfile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                profileData
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to update profile');
        }
        
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

function changePassword() {
    $w('#passwordChangeForm').show();
    
    $w('#passwordChangeForm').onSubmit(async (event) => {
        event.preventDefault();
        await changeUserPassword();
    });
}

async function changeUserPassword() {
    try {
        const currentPassword = $w('#currentPassword').value;
        const newPassword = $w('#newPassword').value;
        const confirmPassword = $w('#confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            showMessage('New passwords do not match', 'error');
            return;
        }
        
        if (newPassword.length < 8) {
            showMessage('Password must be at least 8 characters', 'error');
            return;
        }
        
        await updateUserPassword(currentPassword, newPassword);
        
        showMessage('Password changed successfully!', 'success');
        
        $w('#passwordChangeForm').hide();
        
    } catch (error) {
        console.error('Error changing password:', error);
        showMessage('Failed to change password', 'error');
    }
}

async function updateUserPassword(currentPassword, newPassword) {
    try {
        const userId = getCurrentUserId();
        
        const response = await fetch('/_functions/changePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                currentPassword,
                newPassword
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to change password');
        }
        
    } catch (error) {
        console.error('Error updating user password:', error);
        throw error;
    }
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('This will permanently delete your account and all associated data. Are you absolutely sure?')) {
            performAccountDeletion();
        }
    }
}

async function performAccountDeletion() {
    try {
        const userId = getCurrentUserId();
        
        const response = await fetch('/_functions/deleteAccount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            logoutUser();
            
            wixLocation.to('/');
            
            showMessage('Account deleted successfully', 'success');
        } else {
            throw new Error(result.message || 'Failed to delete account');
        }
        
    } catch (error) {
        console.error('Error deleting account:', error);
        showMessage('Failed to delete account', 'error');
    }
}

function logoutUser() {
    localStorage.removeItem('userData');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('notificationSettings');
    localStorage.removeItem('privacySettings');
    localStorage.removeItem('cart');
    
    wixLocation.to('/login');
}

function viewOrderDetails(orderId) {
    wixLocation.to(`/order-confirmation/${orderId}`);
}

function trackOrder(orderId) {
    wixLocation.to(`/track-order/${orderId}`);
}

function reorderItems(items) {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        items.forEach(item => {
            const existingItem = cart.find(cartItem => cartItem.sku === item.sku);
            
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                cart.push(item);
            }
        });
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        wixLocation.to('/cart');
        
        showMessage('Items added to cart!', 'success');
        
    } catch (error) {
        console.error('Error reordering items:', error);
        showMessage('Failed to reorder items', 'error');
    }
}

function filterOrders() {
    const filter = $w('#orderFilter').value;
    console.log('Filtering orders by:', filter);
}

function searchOrders() {
    const searchTerm = $w('#orderSearch').value;
    console.log('Searching orders for:', searchTerm);
}

function saveUserPreferences() {
    try {
        const preferences = {
            newsletter: $w('#newsletterSubscription').checked,
            orderNotifications: $w('#orderNotifications').checked,
            marketingEmails: $w('#marketingEmails').checked
        };
        
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        showMessage('Preferences saved!', 'success');
        
    } catch (error) {
        console.error('Error saving preferences:', error);
        showMessage('Failed to save preferences', 'error');
    }
}

function saveNotificationSettings() {
    try {
        const notifications = {
            email: $w('#emailNotifications').checked,
            sms: $w('#smsNotifications').checked,
            push: $w('#pushNotifications').checked
        };
        
        localStorage.setItem('notificationSettings', JSON.stringify(notifications));
        showMessage('Notification settings saved!', 'success');
        
    } catch (error) {
        console.error('Error saving notification settings:', error);
        showMessage('Failed to save notification settings', 'error');
    }
}

function savePrivacySettings() {
    try {
        const privacy = {
            profileVisibility: $w('#profileVisibility').value,
            dataSharing: $w('#dataSharing').checked,
            analyticsTracking: $w('#analyticsTracking').checked
        };
        
        localStorage.setItem('privacySettings', JSON.stringify(privacy));
        showMessage('Privacy settings saved!', 'success');
        
    } catch (error) {
        console.error('Error saving privacy settings:', error);
        showMessage('Failed to save privacy settings', 'error');
    }
}

function getCurrentUserId() {
    return null; // Implement user authentication
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatOrderStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'paid': 'Paid',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    
    return statusMap[status] || status;
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
