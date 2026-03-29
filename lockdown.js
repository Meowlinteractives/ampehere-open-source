// LOCKDOWN CONTROL
// Set to true to enable lockdown mode, false to disable
const LOCKDOWN_ENABLED = false; // <--- CHANGE THIS TO true/false

// Don't edit below this line
(function() {
  // Store lockdown state in window for other scripts to access
  window.LOCKDOWN_ENABLED = LOCKDOWN_ENABLED;
  
  // Log state (visible in console if someone manages to open it)
  console.log(`Ampehere lockdown: ${LOCKDOWN_ENABLED ? 'ACTIVE' : 'inactive'}`);
})();