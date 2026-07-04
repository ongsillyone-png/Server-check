// Main frontend application JS - Phase 8: Mobile Responsive

document.addEventListener('DOMContentLoaded', () => {
  console.log('Server Check application initialized.');

  // Auto-close dismissible alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });

  // Active sidebar link: close sidebar on mobile after navigation
  const sidebarLinks = document.querySelectorAll('#sidebarMenu .nav-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        closeSidebar();
      }
    });
  });
});

// ============================================================
// MOBILE SIDEBAR TOGGLE
// ============================================================

/**
 * Toggle sidebar open/closed on mobile
 */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar) return;

  const isOpen = sidebar.classList.contains('sidebar-open');
  if (isOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function openSidebar() {
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.add('sidebar-open');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('sidebar-open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Close sidebar with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSidebar();
  }
});

// Close sidebar when window resizes to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth >= 768) {
    closeSidebar();
  }
});

// ============================================================
// HELPER: formatThaiDate for EJS template helpers
// (Some views reference this as a global window function)
// ============================================================
function formatThaiDate(dateStr, includeTime) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d)) return '-';
    const opts = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Bangkok'
    };
    if (includeTime) {
      opts.hour = '2-digit';
      opts.minute = '2-digit';
    }
    return d.toLocaleDateString('th-TH', opts);
  } catch {
    return dateStr;
  }
}
