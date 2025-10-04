// Contact Page - Contact form and information
// Copy this code to the Contact page in Wix Studio

import wixData from 'wix-data';

$w.onReady(function () {
    initializeContactPage();
});

function initializeContactPage() {
    loadContactInfo();
    setupContactForm();
    setupMap();
    addScrollAnimations();
}

async function loadContactInfo() {
    try {
        const contactSettings = await wixData.query('SiteSettings')
            .eq('key', 'contact')
            .find();
        
        if (contactSettings.items.length > 0) {
            const contactData = JSON.parse(contactSettings.items[0].value);
            displayContactInfo(contactData);
        } else {
            setDefaultContactInfo();
        }
        
    } catch (error) {
        console.error('Error loading contact info:', error);
        setDefaultContactInfo();
    }
}

function displayContactInfo(contactData) {
    if (contactData.email) {
        $w('#contactEmail').text = contactData.email;
        $w('#contactEmail').href = `mailto:${contactData.email}`;
    }
    
    if (contactData.phone) {
        $w('#contactPhone').text = contactData.phone;
        $w('#contactPhone').href = `tel:${contactData.phone}`;
    }
    
    if (contactData.address) {
        $w('#contactAddress').text = contactData.address;
    }
}

function setDefaultContactInfo() {
    $w('#contactEmail').text = 'contact@frtlcreativelabs.com';
    $w('#contactPhone').text = '+1 (555) 123-4567';
    $w('#contactAddress').text = '123 Innovation Drive, Tech City, TC 12345';
}

function setupContactForm() {
    $w('#contactForm').onSubmit(async (event) => {
        event.preventDefault();
        await submitContactForm();
    });
    
    setupFormValidation();
}

function setupFormValidation() {
    const fields = ['name', 'email', 'subject', 'message'];
    
    fields.forEach(fieldId => {
        $w(`#${fieldId}`).onChange(() => {
            validateField(fieldId);
        });
    });
}

function validateField(fieldId) {
    const field = $w(`#${fieldId}`);
    const value = field.value.trim();
    
    if (!value) {
        showFieldError(fieldId, 'This field is required');
        return false;
    }
    
    if (fieldId === 'email' && !isValidEmail(value)) {
        showFieldError(fieldId, 'Please enter a valid email address');
        return false;
    }
    
    clearFieldError(fieldId);
    return true;
}

function showFieldError(fieldId, message) {
    const field = $w(`#${fieldId}`);
    field.className = 'form-field-error';
    
    const errorElement = $w(`#${fieldId}Error`);
    if (errorElement) {
        errorElement.text = message;
        errorElement.show();
    }
}

function clearFieldError(fieldId) {
    const field = $w(`#${fieldId}`);
    field.className = 'form-field';
    
    const errorElement = $w(`#${fieldId}Error`);
    if (errorElement) {
        errorElement.hide();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function submitContactForm() {
    try {
        // Validate form
        if (!validateContactForm()) {
            return;
        }
        
        // Show loading state
        $w('#submitButton').text = 'Sending...';
        $w('#submitButton').disable();
        
        // Get form data
        const formData = {
            name: $w('#name').value,
            email: $w('#email').value,
            subject: $w('#subject').value,
            message: $w('#message').value,
            status: 'new',
            priority: 'normal',
            createdAt: new Date()
        };
        
        // Save to database
        await wixData.save('ContactMessages', formData);
        
        // Send email notification
        await sendContactNotification(formData);
        
        // Show success message
        showMessage('Thank you for your message! We\'ll get back to you soon.', 'success');
        
        // Reset form
        $w('#contactForm').reset();
        
    } catch (error) {
        console.error('Error submitting contact form:', error);
        showMessage('Failed to send message. Please try again.', 'error');
    } finally {
        $w('#submitButton').text = 'Send Message';
        $w('#submitButton').enable();
    }
}

function validateContactForm() {
    const requiredFields = ['name', 'email', 'message'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        if (!validateField(fieldId)) {
            isValid = false;
        }
    });
    
    return isValid;
}

async function sendContactNotification(formData) {
    try {
        const emailData = {
            to: 'admin@frtlcreativelabs.com',
            subject: `New Contact Form Submission: ${formData.subject}`,
            template: 'contact-notification',
            data: {
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message,
                timestamp: new Date().toLocaleString()
            }
        };
        
        await wixEmail.send(emailData);
        
    } catch (error) {
        console.error('Error sending contact notification:', error);
        // Don't throw error - form submission should still succeed
    }
}

function setupMap() {
    // Initialize map if needed
    // This would integrate with Google Maps or similar service
    console.log('Map setup - implement with your preferred mapping service');
}

function addScrollAnimations() {
    $w.onScroll(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Animate sections on scroll
        animateOnScroll('#contactInfo', scrollY, windowHeight);
        animateOnScroll('#contactForm', scrollY, windowHeight);
        animateOnScroll('#mapSection', scrollY, windowHeight);
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

function showMessage(message, type = 'info') {
    const messageElement = $w('#messageToast');
    messageElement.text = message;
    messageElement.className = `message-${type}`;
    messageElement.show();
    
    setTimeout(() => {
        messageElement.hide();
    }, 5000);
}

// Setup FAQ section if present
function setupFAQ() {
    $w('#faqRepeater').onItemReady(($item, faqData) => {
        $item('#faqQuestion').text = faqData.question;
        $item('#faqAnswer').text = faqData.answer;
        
        // Toggle FAQ answer
        $item('#faqQuestion').onClick(() => {
            const answer = $item('#faqAnswer');
            if (answer.style.display === 'none') {
                answer.show();
                $item('#faqIcon').text = '−';
            } else {
                answer.hide();
                $item('#faqIcon').text = '+';
            }
        });
    });
}

// Initialize FAQ if present
setupFAQ();
