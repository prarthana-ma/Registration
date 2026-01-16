// Form logic for multi-step form
let currentStep = 1;
const totalSteps = 4;

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    updateProgressBar();
    updateSection('personal');
});

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            // Track backtrack if going forward after errors
            if (currentStep > 1) {
                // This is normal progression, not backtrack
            }
            
            // Hide current step
            document.getElementById(`step-${currentStep}`).classList.remove('active');
            currentStep++;
            
            // Show next step
            document.getElementById(`step-${currentStep}`).classList.add('active');
            updateProgressBar();
            updateSectionForStep(currentStep);
            
            // Update review section if on step 4
            if (currentStep === 4) {
                updateReviewSection();
            }
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        const fromSection = getSectionForStep(currentStep);
        const toSection = getSectionForStep(currentStep - 1);
        
        // Track backtrack
        trackBacktrack(fromSection, toSection);
        
        // Hide current step
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        currentStep--;
        
        // Show previous step
        document.getElementById(`step-${currentStep}`).classList.add('active');
        updateProgressBar();
        updateSectionForStep(currentStep);
    }
}

function updateProgressBar() {
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function updateSectionForStep(step) {
    const sectionMap = {
        1: 'personal',
        2: 'address',
        3: 'preferences',
        4: 'review'
    };
    updateSection(sectionMap[step]);
}

function getSectionForStep(step) {
    const sectionMap = {
        1: 'personal',
        2: 'address',
        3: 'preferences',
        4: 'review'
    };
    return sectionMap[step];
}

function validateCurrentStep() {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
    
    if (currentStep === 1) {
        // Validate personal information
        const name = document.getElementById('name').value.trim();
        const dob = document.getElementById('dob').value;
        
        if (!name) {
            document.getElementById('error-name').textContent = 'Name is required';
            trackError('name');
            isValid = false;
        }
        
        if (!dob) {
            document.getElementById('error-dob').textContent = 'Date of birth is required';
            trackError('dob');
            isValid = false;
        }
    } else if (currentStep === 2) {
        // Validate address
        const street = document.getElementById('street').value.trim();
        const city = document.getElementById('city').value.trim();
        
        if (!street) {
            document.getElementById('error-street').textContent = 'Street address is required';
            trackError('street');
            isValid = false;
        }
        
        if (!city) {
            document.getElementById('error-city').textContent = 'City is required';
            trackError('city');
            isValid = false;
        }
    } else if (currentStep === 3) {
        // Validate preferences
        const notifications = document.querySelectorAll('input[name="notifications"]:checked');
        
        if (notifications.length === 0) {
            document.getElementById('error-notifications').textContent = 'Please select at least one notification option';
            trackError('notifications');
            isValid = false;
        }
    } else if (currentStep === 4) {
        // Validate terms
        const terms = document.getElementById('terms').checked;
        
        if (!terms) {
            document.getElementById('error-terms').textContent = 'You must agree to the terms';
            trackError('terms');
            isValid = false;
        }
    }
    
    return isValid;
}

function updateReviewSection() {
    document.getElementById('review-name').textContent = document.getElementById('name').value || 'Not provided';
    document.getElementById('review-dob').textContent = document.getElementById('dob').value || 'Not provided';
    document.getElementById('review-address').textContent = document.getElementById('street').value || 'Not provided';
    document.getElementById('review-city').textContent = document.getElementById('city').value || 'Not provided';
}

function submitForm() {
    if (validateCurrentStep()) {
        // Track final submission
        trackEvent('submit', { section: 'review' });
        
        // Hide form
        document.getElementById('step-4').classList.remove('active');
        
        // Show success message
        document.getElementById('success-message').style.display = 'block';
        
        // Track completion time
        trackSectionTime('review');
    }
}
