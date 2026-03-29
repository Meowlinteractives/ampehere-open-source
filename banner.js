// banner.js - Edit THIS file to change banner, NOT the big index.html!

window.BANNER_CONFIG = {
    ENABLED: false,
    BACKGROUND_COLOR: '#1e3a5f',
    TEXT_COLOR: '#ffd966',
    TEXT: '',
    LINK_URL: '',
    LINK_TEXT: ''
};

// Auto-render banner when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderBanner);
} else {
    renderBanner();
}

function renderBanner() {
    const container = document.getElementById('bannerContainer');
    if (!container) return;
    
    const config = window.BANNER_CONFIG;
    if (!config || !config.ENABLED) {
        container.innerHTML = ''; // Keep empty if disabled
        return;
    }
    
    container.innerHTML = `
        <div class="site-banner" style="background-color: ${config.BACKGROUND_COLOR};">
            <div class="banner-content">
                <div class="banner-icon">!</div>
                <div class="banner-text" style="color: ${config.TEXT_COLOR};">${config.TEXT}</div>
                ${config.LINK_URL ? `<a href="${config.LINK_URL}" class="banner-link" style="background-color: ${config.TEXT_COLOR}; color: ${config.BACKGROUND_COLOR};">${config.LINK_TEXT}</a>` : ''}
            </div>
        </div>
    `;
}
