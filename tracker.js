// Cognitive Load Tracker
// Sends interaction events to backend for analysis

const BACKEND_URL = 'http://localhost:8000';

// Track current section
let currentSection = 'personal';
let sectionStartTime = Date.now();
let idleTimer = null;
let idleThreshold = 5000; // 5 seconds of inactivity triggers idle event

// Initialize tracker
(function() {
    // Track initial page load
    trackEvent('page_load', { section: currentSection });
    
    // Set up idle detection
    setupIdleDetection();
    
    // Track clicks
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') {
            trackEvent('click', {
                section: currentSection,
                element: e.target.className || e.target.id || 'unknown'
            });
        }
    });
    
    // Track form errors (will be called from form.js)
    window.trackError = function(fieldName) {
        trackEvent('error', {
            section: currentSection,
            field: fieldName
        });
    };
    
    // Track time spent in section
    window.trackSectionTime = function(sectionId) {
        const timeSpent = Date.now() - sectionStartTime;
        trackEvent('time_spent', {
            section: sectionId,
            duration: Math.round(timeSpent / 1000) // Convert to seconds
        });
        sectionStartTime = Date.now();
    };
    
    // Track backtracking
    window.trackBacktrack = function(fromSection, toSection) {
        trackEvent('backtrack', {
            section: fromSection,
            from_section: fromSection,
            to_section: toSection
        });
    };
    
    // Update current section
    window.updateSection = function(sectionId) {
        if (currentSection !== sectionId) {
            // Track time spent in previous section
            trackSectionTime(currentSection);
            currentSection = sectionId;
        }
    };
})();

// Setup idle detection
function setupIdleDetection() {
    let lastActivity = Date.now();
    
    // Reset idle timer on any user activity
    const resetIdleTimer = () => {
        lastActivity = Date.now();
        if (idleTimer) {
            clearTimeout(idleTimer);
        }
        idleTimer = setTimeout(() => {
            const idleDuration = Date.now() - lastActivity;
            trackEvent('idle', {
                section: currentSection,
                duration: Math.round(idleDuration / 1000)
            });
        }, idleThreshold);
    };
    
    // Track various user activities
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetIdleTimer, { passive: true });
    });
    
    resetIdleTimer();
}

// Send event to backend
function trackEvent(eventType, data = {}) {
    // Map data fields to backend expected format
    const eventData = {
        event_type: eventType,
        timestamp: new Date().toISOString(),
        section: data.section || currentSection,
        element: data.element || null,
        field: data.field || null,
        duration: data.duration || null,
        from_section: data.from_section || null,
        to_section: data.to_section || null
    };
    
    // Remove null values
    Object.keys(eventData).forEach(key => {
        if (eventData[key] === null) {
            delete eventData[key];
        }
    });
    
    // Send to backend
    fetch(`${BACKEND_URL}/log-event`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
    }).catch(error => {
        // Silently fail - backend might not be running
        console.log('Tracker: Backend not available', error);
    });
}
