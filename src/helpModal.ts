import { marked } from 'marked';
import readmeContent from '../README.md?raw';

export function initializeHelpModal(): void {
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const closeModal = document.getElementById('close-modal');
  const modalContent = helpModal?.querySelector('.modal-body');

  if (!helpBtn || !helpModal || !closeModal || !modalContent) {
    console.error('Help modal elements not found');
    return;
  }

  // Convert markdown to HTML
  const htmlContent = marked.parse(readmeContent);
  modalContent.innerHTML = htmlContent as string;

  helpBtn.addEventListener('click', () => {
    helpModal.classList.add('active');
  });

  closeModal.addEventListener('click', () => {
    helpModal.classList.remove('active');
  });

  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.classList.remove('active');
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && helpModal.classList.contains('active')) {
      helpModal.classList.remove('active');
    }
  });
}
