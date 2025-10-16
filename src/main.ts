import { UIController } from './UIController';
import { initializeHelpModal } from './helpModal';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new UIController();
  initializeHelpModal();
});
