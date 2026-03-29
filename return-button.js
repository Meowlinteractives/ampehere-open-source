// RETURN BUTTON FOR GAMES - ULTIMATE MOBILE FIX
(function() {
  console.log('🔍 Return button script loaded');
  
  // Don't show on main page
  if (window.location.pathname === '/' || 
      window.location.pathname === '/index.html' ||
      window.location.pathname.endsWith('ampehere/')) {
    console.log('📌 On main page - not showing button');
    return;
  }
  
  // Wait for page to load
  window.addEventListener('load', function() {
    console.log('✅ Adding return button to page');
    
    // Create a DIV container for better touch handling
    const buttonContainer = document.createElement('div');
    
    // Style the container
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.bottom = '20px';
    buttonContainer.style.right = '20px';
    buttonContainer.style.zIndex = '999999';
    buttonContainer.style.cursor = 'pointer';
    buttonContainer.style.touchAction = 'manipulation';
    buttonContainer.style.webkitTapHighlightColor = 'transparent';
    
    // Style the inner button
    buttonContainer.innerHTML = '⬅ BACK TO AMPEHERE';
    buttonContainer.style.backgroundColor = '#ff8c42';
    buttonContainer.style.color = '#1e3a5f';
    buttonContainer.style.fontFamily = "'Courier New', monospace";
    buttonContainer.style.fontWeight = '900';
    buttonContainer.style.fontSize = '1rem';
    buttonContainer.style.padding = '15px 25px'; // Larger padding for mobile
    buttonContainer.style.border = '4px solid #1e3a5f';
    buttonContainer.style.boxShadow = '6px 6px 0 #2c4c6b';
    buttonContainer.style.textDecoration = 'none';
    buttonContainer.style.textTransform = 'uppercase';
    buttonContainer.style.textAlign = 'center';
    buttonContainer.style.minWidth = '180px';
    buttonContainer.style.minHeight = '60px'; // Larger touch target
    buttonContainer.style.lineHeight = '1.5';
    buttonContainer.style.borderRadius = '0'; // Keep square style
    buttonContainer.style.userSelect = 'none';
    buttonContainer.style.pointerEvents = 'auto';
    
    // CRITICAL: Direct navigation function
    function goToAmpehere() {
      console.log('🎯 Navigating to Ampehere');
      window.location.href = '/';
    }
    
    // Add EVERY possible event listener to ensure it works
    buttonContainer.addEventListener('click', function(e) {
      e.preventDefault();
      goToAmpehere();
    });
    
    buttonContainer.addEventListener('touchstart', function(e) {
      e.preventDefault();
      // Visual feedback
      this.style.transform = 'translate(2px, 2px)';
      this.style.boxShadow = '3px 3px 0 #2c4c6b';
    });
    
    buttonContainer.addEventListener('touchend', function(e) {
      e.preventDefault();
      // Reset visual
      this.style.transform = 'translate(0, 0)';
      this.style.boxShadow = '6px 6px 0 #2c4c6b';
      // Navigate
      goToAmpehere();
    });
    
    buttonContainer.addEventListener('touchcancel', function(e) {
      e.preventDefault();
      this.style.transform = 'translate(0, 0)';
      this.style.boxShadow = '6px 6px 0 #2c4c6b';
    });
    
    // Mouse events for desktop
    buttonContainer.addEventListener('mousedown', function(e) {
      this.style.transform = 'translate(2px, 2px)';
      this.style.boxShadow = '3px 3px 0 #2c4c6b';
    });
    
    buttonContainer.addEventListener('mouseup', function(e) {
      this.style.transform = 'translate(0, 0)';
      this.style.boxShadow = '6px 6px 0 #2c4c6b';
    });
    
    buttonContainer.addEventListener('mouseleave', function(e) {
      this.style.transform = 'translate(0, 0)';
      this.style.boxShadow = '6px 6px 0 #2c4c6b';
    });
    
    // Add to page
    document.body.appendChild(buttonContainer);
    console.log('✅ Button added with ULTIMATE mobile fix!');
    
    // DEBUG: Log when button is tapped
    console.log('📱 Mobile device detected?', 'ontouchstart' in window);
  });
})();
