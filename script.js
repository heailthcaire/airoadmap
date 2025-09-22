// Simple, working script for the AI Roadmap website
document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Navigation
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', String(!expanded));
            navMenu.classList.toggle('open');
        });
    }

    // Load contributors if we're on the contributors page
    const contributorsList = document.getElementById('contributors-list');
    if (contributorsList) {
        loadContributors();
    }

    // Setup sample modal functionality if on contribute page
    if (document.getElementById('sample-modal')) {
        setupSampleModal();
    }

    // Handle forms
    setupForms();

    // Handle PDF downloads
    setupPdfDownloads();
});

// Sample data storage
let sampleData = null;

// Load samples from JSON file
function loadSamples() {
    if (sampleData) return Promise.resolve(sampleData);
    
    return fetch('samples.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load samples');
            return response.json();
        })
        .then(data => {
            sampleData = data.samples || data;
            return sampleData;
        })
        .catch(error => {
            console.error('Error loading samples:', error);
            // Return fallback samples
            sampleData = getFallbackSamples();
            return sampleData;
        });
}

// Fallback samples if JSON loading fails
function getFallbackSamples() {
    return {
        'quick-insights': {
            title: 'Quick Insights Sample',
            modalContent: '<h4>Quick Insight Sample</h4><p>Sample content for quick insights.</p>',
            downloadFilename: 'Quick_Insights_Template.txt',
            downloadContent: 'QUICK INSIGHTS TEMPLATE\n\nYour insight:\n[Write here]\n\nContact: contribute@example.com'
        },
        'short-story': {
            title: 'Short Story Sample', 
            modalContent: '<h4>Short Story Sample</h4><p>Sample content for short story.</p>',
            downloadFilename: 'Short_Story_Template.txt',
            downloadContent: 'SHORT STORY TEMPLATE\n\nYour story:\n[Write here]\n\nContact: contribute@example.com'
        }
    };
}

// Sample Modal Functionality
function setupSampleModal() {
    const modal = document.getElementById('sample-modal');
    const modalTitle = document.getElementById('sample-modal-title');
    const modalBody = document.getElementById('sample-modal-body');
    
    if (!modal || !modalTitle || !modalBody) return;

    // Handle view sample buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('sample-view-btn')) {
            const sampleKey = e.target.getAttribute('data-sample-key');
            openSampleModal(sampleKey);
        }
        
        if (e.target.classList.contains('sample-download-btn')) {
            const sampleKey = e.target.getAttribute('data-sample-key');
            downloadSample(sampleKey);
        }
        
        if (e.target.hasAttribute('data-close-modal')) {
            closeSampleModal();
        }
    });

    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
            closeSampleModal();
        }
    });
}

function openSampleModal(sampleKey) {
    const modal = document.getElementById('sample-modal');
    const modalTitle = document.getElementById('sample-modal-title');
    const modalBody = document.getElementById('sample-modal-body');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    loadSamples().then(samples => {
        const sample = samples[sampleKey];
        
        if (sample) {
            modalTitle.textContent = sample.title || 'Sample';
            modalBody.innerHTML = sample.modalContent || '<p>Sample content not available.</p>';
        } else {
            modalTitle.textContent = 'Sample Not Found';
            modalBody.innerHTML = '<p>Sorry, this sample is not available yet.</p>';
        }
        
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        const closeButton = modal.querySelector('[data-close-modal]');
        if (closeButton) closeButton.focus();
    });
}

function closeSampleModal() {
    const modal = document.getElementById('sample-modal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
    }
}

function downloadSample(sampleKey) {
    loadSamples().then(samples => {
        const sample = samples[sampleKey];
        
        if (!sample) {
            alert('Sample template not available yet. Please contact us directly.');
            return;
        }
        
        // Create and trigger download
        const blob = new Blob([sample.downloadContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = sample.downloadFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// Load and display contributors
function loadContributors() {
    const loading = document.getElementById('contributors-loading');
    const container = document.getElementById('contributors-list');
    
    if (!container) return;

    // Show loading
    if (loading) loading.textContent = 'Loading contributors...';
    
    fetch('contributors.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load contributors');
            return response.json();
        })
        .then(contributors => {
            displayContributors(contributors, container);
            if (loading) loading.style.display = 'none';
        })
        .catch(error => {
            console.error('Error loading contributors:', error);
            if (loading) loading.textContent = 'Unable to load contributors at this time.';
            displaySampleContributors(container);
        });
}

// Display contributors from JSON data
function displayContributors(contributors, container) {
    if (!Array.isArray(contributors) || contributors.length === 0) {
        container.innerHTML = '<p>No contributors available.</p>';
        return;
    }

    const html = contributors.map(contributor => {
        const name = contributor.name || 'Name not provided';
        const title = contributor.title || '';
        const company = contributor.company || '';
        const location = contributor.location || '';
        const website = contributor.website || '';
        const linkedin = contributor.linkedin || '';
        const contributions = Array.isArray(contributor.contributions) ? contributor.contributions : [];
        
        // Create photo element - use CSS avatar instead of external service
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        let photoElement;
        if (contributor.photo) {
            photoElement = `<img src="${contributor.photo}" alt="${name}" class="contributor-photo" loading="lazy">`;
        } else {
            photoElement = `<div class="contributor-photo contributor-avatar">${initials}</div>`;
        }
        
        // Create links
        const links = [];
        if (website) links.push(`<a href="${website}" target="_blank" rel="noopener">Website</a>`);
        if (linkedin) links.push(`<a href="${linkedin}" target="_blank" rel="noopener">LinkedIn</a>`);
        
        // Create contribution tags
        const tags = contributions.map(c => `<span class="contribution-tag">${c}</span>`).join('| ');
        
        return `
            <div class="contributor">
                ${photoElement}
                <div class="contributor-info">
                    <h4>${name}</h4>
                    <p class="contributor-title">${title}${company ? `, ${company}` : ''}</p>
                    ${location ? `<p class="contributor-location">${location}</p>` : ''}
                    ${contributor.bio ? `<p class="contributor-bio">${contributor.bio}</p>` : ''}
                    ${tags ? `<div class="contributor-tags">${tags}</div>` : ''}
                    ${links.length ? `<div class="contributor-links">${links.join(' ')}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Fallback sample contributors if JSON fails
function displaySampleContributors(container) {
    const sampleHtml = `
        <div class="contributor">
            <div class="contributor-photo contributor-avatar">HL</div>
            <div class="contributor-info">
                <h4>Harry Los Doe</h4>
                <p class="contributor-title">President Crispi Division, Acme Corp</p>
                <p class="contributor-location">NY, USA</p>
                <div class="contributor-tags">
                    <span class="contribution-tag">Short Story</span>
                    <span class="contribution-tag">Quick Insights</span>
                </div>
            </div>
        </div>
        <div class="contributor">
            <div class="contributor-photo contributor-avatar">JD</div>
            <div class="contributor-info">
                <h4>Jane Doe</h4>
                <p class="contributor-title">VP AI Strategy, Acme Corp</p>
                <p class="contributor-location">NY, USA</p>
                <div class="contributor-tags">
                    <span class="contribution-tag">Short Story</span>
                    <span class="contribution-tag">Quick Insights</span>
                </div>
                <div class="contributor-links">
                    <a href="https://www.linkedin.com/in/janedoe" target="_blank" rel="noopener">LinkedIn</a>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = sampleHtml;
}

// Handle form submissions
function setupForms() {
    // Contributor form
    const contributorForm = document.getElementById('contributor-form');
    if (contributorForm) {
        contributorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showMessage(contributorForm, 'Thank you for your interest! We will get back to you within 2 business days.', 'success');
            contributorForm.reset();
        });
    }

    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showMessage(contactForm, 'Thank you for your message! We will respond based on our stated response times.', 'success');
            contactForm.reset();
        });
    }
}

// Show success/error messages
function showMessage(form, text, type) {
    // Remove any existing message
    const existingMessage = form.parentNode.querySelector('.form-message');
    if (existingMessage) existingMessage.remove();
    
    // Create new message
    const message = document.createElement('div');
    message.className = `form-message ${type}`;
    message.style.cssText = `
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 4px;
        ${type === 'success' ? 
            'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' :
            'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
        }
    `;
    message.textContent = text;
    
    // Insert before form
    form.parentNode.insertBefore(message, form);
    
    // Remove after 5 seconds
    setTimeout(() => message.remove(), 5000);
    
    // Scroll to message
    message.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Handle PDF downloads
function setupPdfDownloads() {
    const pdfButtons = document.querySelectorAll('.pdf-download-btn');
    console.log('Found PDF buttons:', pdfButtons.length);
    
    pdfButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const filename = this.getAttribute('data-filename'); // Move this line UP
            // console.log('PDF button clicked:', filename); // Now this line can use filename
            if (filename) {
                downloadPdf(filename);
            }
        });
    });
}

function downloadPdf(filename) {
    const link = document.createElement('a');
    link.href = filename;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}