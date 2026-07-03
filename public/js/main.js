// Main frontend application JS
document.addEventListener('DOMContentLoaded', () => {
  console.log('Server Check application initialized.');
  
  // Custom utility scripts (e.g. dynamic alert auto-closing)
  const alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });
});
