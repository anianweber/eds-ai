// AI Button functionality for Sidekick Library
document.addEventListener('DOMContentLoaded', () => {
  // Create AI button and add it to the library interface
  function addAIButton() {
    // Find a suitable location to add the button
    const library = document.querySelector('sidekick-library');
    if (!library) {
      console.error('Sidekick library element not found');
      return;
    }

    // Create the AI button
    const aiButton = document.createElement('button');
    aiButton.id = 'ai-button';
    aiButton.className = 'ai-button';

    // Create AI icon (SVG)
    const aiIcon = `
<svg class="ai-button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M234.7 42.7L197 56.8c-3 1.1-5 4-5 7.2s2 6.1 5 7.2l37.7 14.1L248.8 123c1.1 3 4 5 7.2 5s6.1-2 7.2-5l14.1-37.7L315 71.2c3-1.1 5-4 5-7.2s-2-6.1-5-7.2L277.3 42.7 263.2 5c-1.1-3-4-5-7.2-5s-6.1 2-7.2 5L234.7 42.7zM46.1 395.4c-18.7 18.7-18.7 49.1 0 67.9l34.6 34.6c18.7 18.7 49.1 18.7 67.9 0L529.9 116.5c18.7-18.7 18.7-49.1 0-67.9L495.3 14.1c-18.7-18.7-49.1-18.7-67.9 0L46.1 395.4zM484.6 82.6l-105 105-23.3-23.3 105-105 23.3 23.3zM7.5 117.2C3 118.9 0 123.2 0 128s3 9.1 7.5 10.8L64 160l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L128 160l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L128 96 106.8 39.5C105.1 35 100.8 32 96 32s-9.1 3-10.8 7.5L64 96 7.5 117.2zm352 256c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L416 416l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L480 416l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L480 352l-21.2-56.5c-1.7-4.5-6-7.5-10.8-7.5s-9.1 3-10.8 7.5L416 352l-56.5 21.2z"/></svg>`

    // Add the icon to the button
    aiButton.setHTMLUnsafe(aiIcon);

    // Add click event to open the dialog
    aiButton.addEventListener('click', openAIDialog);

    // Add the button to the document
    document.body.appendChild(aiButton);
  }

  // Create and open the AI dialog
  function openAIDialog() {
    // Create dialog overlay
    const overlay = document.createElement('div');
    overlay.className = 'ai-overlay';

    // Create dialog container
    const dialog = document.createElement('div');
    dialog.className = 'ai-dialog';

    // Get the component path from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const componentPath = urlParams.get('path') || '';

    // Create dialog content
    dialog.innerHTML = `
      <h2>AI Assistant</h2>
      <div class="ai-mode-toggle">
        <span class="ai-toggle-label">Test</span>
        <label class="ai-toggle-switch">
          <input type="checkbox" id="mode-toggle" checked>
          <span class="ai-toggle-slider"></span>
        </label>
        <span class="ai-toggle-label">Production</span>
      </div>
      <form id="ai-form">
        <div class="ai-form-group">
          <label for="ticket-number" class="ai-form-label">Ticket Number (Branch Name)</label>
          <input type="text" id="ticket-number" name="ticketNumber" class="ai-form-input" required value="test-123">
        </div>

        <div class="ai-form-group">
          <label for="ticket-description" class="ai-form-label">Ticket Description</label>
          <textarea id="ticket-description" name="ticketDescription" rows="8" class="ai-form-textarea" required></textarea>
        </div>

        <div class="ai-form-group">
          <label for="component-path" class="ai-form-label">Component Path</label>
          <input type="text" id="component-path" name="componentPath" value="${componentPath}" class="ai-form-input" required>
        </div>

        <div class="ai-form-group">
          <label for="design-file" class="ai-form-label">Design</label>
          <input type="file" id="design-file" name="designFile" class="ai-form-input">
        </div>

        <div class="ai-form-group">
          <button type="button" class="ai-collapsible-button">Developer Notes</button>
          <div class="ai-collapsible-content">
            <textarea id="developer-notes" name="developerNotes" rows="5" class="ai-form-textarea"></textarea>
          </div>
        </div>

        <div class="ai-form-group">
          <button type="button" class="ai-collapsible-button">Reference Files</button>
          <div class="ai-collapsible-content">
            <div id="reference-files-container">
              <!-- Files will be added here dynamically -->
            </div>
            <div class="ai-link-input-group">
              <input type="text" id="new-link-input" class="ai-form-input" placeholder="Add a reference file (e.g., /path/to/resource)">
              <button type="button" id="add-link-button" class="ai-add-button">Add</button>
            </div>
          </div>
        </div>

        <div class="ai-form-actions">
          <button type="button" id="cancel-button" class="ai-cancel-button">Cancel</button>
          <button type="submit" id="submit-button" class="ai-submit-button">Submit</button>
        </div>
      </form>

      <div id="loading-spinner" class="ai-loading-spinner ai-hidden">
        <div class="ai-spinner"></div>
        <p>Processing your request...</p>
      </div>

      <div id="result-container" class="ai-result-container ai-hidden">
        <div id="result-content">
          <p>Your request has been processed. Click the link below:</p>
          <a id="result-link" href="#" target="_blank" class="ai-result-link"></a>
        </div>
        <div>
          <button type="button" id="back-button" class="ai-back-button">Back</button>
        </div>
      </div>
    `;

    // Add the dialog to the overlay
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Add event listeners
    document.getElementById('cancel-button').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    document.getElementById('ai-form').addEventListener('submit', (e) => {
      e.preventDefault();
      submitForm();
    });

    // Add back button event listener
    document.getElementById('back-button').addEventListener('click', () => {
      // Hide result container
      const resultContainer = document.getElementById('result-container');
      resultContainer.classList.remove('ai-visible');
      resultContainer.classList.add('ai-hidden');

      // Show form again
      const form = document.getElementById('ai-form');
      form.classList.remove('ai-hidden');
    });

    // Setup collapsible sections
    const collapsibleButtons = document.querySelectorAll('.ai-collapsible-button');
    collapsibleButtons.forEach(button => {
      button.addEventListener('click', function() {
        this.classList.toggle('active');
        const content = this.nextElementSibling;
        if (content.classList.contains('active')) {
          content.classList.remove('active');
          content.style.maxHeight = null;
        } else {
          content.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });

    // Setup reference files functionality
    const addLinkButton = document.getElementById('add-link-button');
    const newLinkInput = document.getElementById('new-link-input');
    const linksContainer = document.getElementById('reference-files-container');

    // Function to validate a link
    async function validateLink(link) {
      try {
        // Check if link starts with a slash to ensure it's relative
        if (!link.startsWith('/')) {
          link = '/' + link;
        }

        // Get the current origin
        const origin = window.location.origin;

        // Try to fetch the link
        const response = await fetch(origin + link, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        console.error('Error validating link:', error);
        return false;
      }
    }

    // Function to add a link programmatically
    const addLink = async (linkValue) => {
      // Create link item
      const linkItem = document.createElement('div');
      linkItem.className = 'ai-link-item';

      // Create link text element
      const linkText = document.createElement('span');
      linkText.className = 'ai-link-text';
      linkText.textContent = linkValue;

      // Create status element
      const linkStatus = document.createElement('span');
      linkStatus.className = 'ai-link-validating';
      linkStatus.textContent = 'Validating...';

      // Create remove button
      const removeButton = document.createElement('button');
      removeButton.className = 'ai-link-remove';
      removeButton.textContent = '×';
      removeButton.addEventListener('click', () => {
        linkItem.remove();
      });

      // Add elements to link item
      linkItem.appendChild(linkText);
      linkItem.appendChild(linkStatus);
      linkItem.appendChild(removeButton);

      // Add link item to container
      linksContainer.appendChild(linkItem);

      // Create hidden input for form submission
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = 'referenceFiles[]';
      hiddenInput.value = linkValue;
      linkItem.appendChild(hiddenInput);

      // Validate the link
      const isValid = await validateLink(linkValue);

      // Update status based on validation result
      if (isValid) {
        linkStatus.className = 'ai-link-valid';
        linkStatus.textContent = 'Valid';
      } else {
        linkStatus.className = 'ai-link-invalid';
        linkStatus.textContent = 'Invalid';
      }
    };

    // Add default links
    addLink('/scripts/aem.js');
    addLink('/scripts/scripts.js');
    addLink('/styles/styles.css');

    // Function to add a new link from input
    addLinkButton.addEventListener('click', async () => {
      const linkValue = newLinkInput.value.trim();
      if (!linkValue) return;

      await addLink(linkValue);

      // Clear input
      newLinkInput.value = '';
    });

    // Function to handle form submission
    function submitForm() {
      const form = document.getElementById('ai-form');
      const loadingSpinner = document.getElementById('loading-spinner');
      const resultContainer = document.getElementById('result-container');
      const resultLink = document.getElementById('result-link');
      const modeToggle = document.getElementById('mode-toggle');

      // Show loading spinner
      form.classList.add('ai-hidden');
      loadingSpinner.classList.remove('ai-hidden');
      loadingSpinner.classList.add('ai-visible');

      // Get form data
      const formData = new FormData(form);

      // Determine which URL to use based on toggle state
      const isProduction = modeToggle.checked;
      const webhookUrl = isProduction
        ? 'https://n8n.tdservice.cloud/webhook/eds-component-generator'
        : 'https://n8n.tdservice.cloud/webhook-test/eds-component-generator';

      // Call webhook
      fetch(webhookUrl, {
        method: 'POST',
        body: formData
      })
      .then(() => {
        // Hide loading spinner
        loadingSpinner.classList.remove('ai-visible');
        loadingSpinner.classList.add('ai-hidden');

        // Show result with link
        resultContainer.classList.remove('ai-hidden');
        resultContainer.classList.add('ai-visible');
        const link = `https://${formData.get("ticketNumber")}--eds-ai--anianweber.aem.page${formData.get("componentPath")}`
        resultLink.href = link;
        resultLink.textContent = link;
      })
      .catch(error => {
        console.error('Error:', error);
        loadingSpinner.classList.remove('ai-visible');
        loadingSpinner.classList.add('ai-hidden');
        resultContainer.classList.remove('ai-hidden');
        resultContainer.classList.add('ai-visible');

        // Update only the content part, preserving the back button
        const resultContent = document.getElementById('result-content');
        resultContent.innerHTML = '<p class="ai-error-message">An error occurred. Please try again.</p>';
      });
    }
  }

  // Initialize the AI button
  addAIButton();
});
