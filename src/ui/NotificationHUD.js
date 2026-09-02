/**
 * Aerospace Alert & Notification Deck
 */

export function notify(message, duration = 3800) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="color:var(--tech-cyan);">⚡ [ISTRAC UPLINK]</span>
      <span>${message}</span>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
