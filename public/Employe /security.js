
function showSecurityAlert(message) {
  // Create toast if it doesn't exist
  let toast = document.querySelector('.security-alert');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'security-alert';
    toast.innerHTML = `
      <div class="security-alert-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <div class="security-alert-content">
        <h4>Action disabled</h4>
        <p>${message}</p>
      </div>
    `;
    document.body.appendChild(toast);
  } else {
    toast.querySelector('p').innerText = message;
  }

  // Show Toast
  toast.classList.add('show');

  // Hide after 3 seconds
  clearTimeout(window.securityToastTimeout);
  window.securityToastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// 1. Disable Right Click
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  showSecurityAlert('Right-clicking is disabled for security reasons.');
});

// 2. Disable Key Shortcuts (F12, Ctrl+Shift+I, Ctrl+U, etc.)
document.addEventListener('keydown', (e) => {
  // F12
  if (e.key === 'F12') {
    e.preventDefault();
    showSecurityAlert('Developer tools are disabled.');
  }

  // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
  if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
    e.preventDefault();
    showSecurityAlert('Inspecting elements is disabled.');
  }

  // Cmd+Opt+I (Mac)
  if (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i')) {
    e.preventDefault();
    showSecurityAlert('Inspecting elements is disabled.');
  }

  // Ctrl+U / Ctrl+S (View Source / Save)
  if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's')) {
    e.preventDefault();
    showSecurityAlert('Viewing source is disabled.');
  }

  // Cmd+U / Cmd+S (View Source / Save - Mac)
  if (e.metaKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's')) {
    e.preventDefault();
    showSecurityAlert('Viewing source is disabled.');
  }

  // Ctrl/Cmd + C (Copy)
  if ((e.ctrlKey || e.metaKey) && (e.key === 'C' || e.key === 'c')) {
    // We already have CSS for user-select: none, but this is an extra layer
    // Let's decide if we want to block the keyboard copy too
    // Note: blocking copy can be annoying, but the user asked for "action block right click and content copy"
    // So I'll show the alert.
    showSecurityAlert('Content copying is disabled.');
  }
});

// 3. Disable Drag and Drop (common way to copy/extract info)
document.addEventListener('dragstart', (e) => {
  e.preventDefault();
});
