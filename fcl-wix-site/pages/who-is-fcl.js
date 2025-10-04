// Who is FCL Page - Company information and team
import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
    initializeWhoIsFCLPage();
});

function initializeWhoIsFCLPage() {
    loadCompanyInfo();
    loadTeamMembers();
    setupContactCTA();
    addScrollAnimations();
}

async function loadCompanyInfo() {
    try {
        const companySettings = await wixData.query('SiteSettings')
            .eq('key', 'company')
            .find();
        
        if (companySettings.items.length > 0) {
            const companyData = JSON.parse(companySettings.items[0].value);
            displayCompanyInfo(companyData);
        } else {
            setDefaultCompanyInfo();
        }
        
    } catch (error) {
        console.error('Error loading company info:', error);
        setDefaultCompanyInfo();
    }
}

function displayCompanyInfo(companyData) {
    if (companyData.name) {
        $w('#companyName').text = companyData.name;
    }
    
    if (companyData.tagline) {
        $w('#companyTagline').text = companyData.tagline;
    }
    
    if (companyData.mission) {
        $w('#companyMission').text = companyData.mission;
    }
    
    if (companyData.founded) {
        $w('#companyFounded').text = `Founded ${companyData.founded}`;
    }
    
    if (companyData.location) {
        $w('#companyLocation').text = companyData.location;
    }
}

function setDefaultCompanyInfo() {
    $w('#companyName').text = 'Frtl Creative Labs';
    $w('#companyTagline').text = 'Innovation meets creativity';
    $w('#companyMission').text = 'Building the future of technology through innovative solutions';
    $w('#companyFounded').text = 'Founded 2024';
    $w('#companyLocation').text = 'Tech City, USA';
}

function loadTeamMembers() {
    // This would load from a TeamMembers collection
    // For now, we'll use static data
    const teamMembers = [
        {
            name: 'John Smith',
            title: 'CEO & Founder',
            bio: 'Visionary leader with 15+ years in tech innovation.',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
            social: {
                linkedin: 'https://linkedin.com/in/johnsmith',
                twitter: 'https://twitter.com/johnsmith'
            }
        },
        {
            name: 'Sarah Johnson',
            title: 'CTO',
            bio: 'Technical architect specializing in quantum computing.',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
            social: {
                linkedin: 'https://linkedin.com/in/sarahjohnson',
                twitter: 'https://twitter.com/sarahjohnson'
            }
        },
        {
            name: 'Mike Chen',
            title: 'Lead Developer',
            bio: 'Full-stack developer with expertise in blockchain technology.',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
            social: {
                linkedin: 'https://linkedin.com/in/mikechen',
                github: 'https://github.com/mikechen'
            }
        }
    ];
    
    displayTeamMembers(teamMembers);
}

function displayTeamMembers(teamMembers) {
    $w('#teamRepeater').data = teamMembers;
    
    $w('#teamRepeater').onItemReady(($item, memberData) => {
        $item('#memberName').text = memberData.name;
        $item('#memberTitle').text = memberData.title;
        $item('#memberBio').text = memberData.bio;
        $item('#memberImage').src = memberData.image;
        
        // Setup social links
        if (memberData.social.linkedin) {
            $item('#memberLinkedIn').href = memberData.social.linkedin;
            $item('#memberLinkedIn').show();
        } else {
            $item('#memberLinkedIn').hide();
        }
        
        if (memberData.social.twitter) {
            $item('#memberTwitter').href = memberData.social.twitter;
            $item('#memberTwitter').show();
        } else {
            $item('#memberTwitter').hide();
        }
        
        if (memberData.social.github) {
            $item('#memberGitHub').href = memberData.social.github;
            $item('#memberGitHub').show();
        } else {
            $item('#memberGitHub').hide();
        }
        
        // Setup hover effects
        $item('#memberCard').onMouseEnter(() => {
            $item('#memberCard').style.transform = 'translateY(-5px)';
            $item('#memberCard').style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        });
        
        $item('#memberCard').onMouseLeave(() => {
            $item('#memberCard').style.transform = 'translateY(0)';
            $item('#memberCard').style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
        });
    });
}

function setupContactCTA() {
    $w('#contactCTAButton').onClick(() => {
        wixLocation.to('/contact');
    });
    
    $w('#learnMoreButton').onClick(() => {
        wixLocation.to('/fcl-tech');
    });
}

function addScrollAnimations() {
    $w.onScroll(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Animate sections on scroll
        animateOnScroll('#companyInfo', scrollY, windowHeight);
        animateOnScroll('#teamSection', scrollY, windowHeight);
        animateOnScroll('#valuesSection', scrollY, windowHeight);
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

// Load company values
function loadCompanyValues() {
    const values = [
        {
            title: 'Innovation',
            description: 'We push the boundaries of what\'s possible in technology.',
            icon: '🚀'
        },
        {
            title: 'Creativity',
            description: 'We approach problems with fresh perspectives and creative solutions.',
            icon: '🎨'
        },
        {
            title: 'Collaboration',
            description: 'We believe in the power of teamwork and shared knowledge.',
            icon: '🤝'
        },
        {
            title: 'Excellence',
            description: 'We strive for the highest quality in everything we do.',
            icon: '⭐'
        }
    ];
    
    displayCompanyValues(values);
}

function displayCompanyValues(values) {
    $w('#valuesRepeater').data = values;
    
    $w('#valuesRepeater').onItemReady(($item, valueData) => {
        $item('#valueIcon').text = valueData.icon;
        $item('#valueTitle').text = valueData.title;
        $item('#valueDescription').text = valueData.description;
        
        // Setup hover effects
        $item('#valueCard').onMouseEnter(() => {
            $item('#valueCard').style.transform = 'scale(1.05)';
            $item('#valueCard').style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        });
        
        $item('#valueCard').onMouseLeave(() => {
            $item('#valueCard').style.transform = 'scale(1)';
            $item('#valueCard').style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
        });
    });
}

// Initialize company values
loadCompanyValues();
