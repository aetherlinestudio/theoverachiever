// ==========================================
// AETHERLINE - RESOURCES & TOOLS MODULE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initResourcesEngine();
});

async function initResourcesEngine() {
  // DOM Elements
  const searchInput = document.querySelector('[data-resource-search]');
  const filterBtns = document.querySelectorAll('[data-resource-filter]');
  const gridContainer = document.querySelector('[data-resource-grid]');

  if (!gridContainer) return;

  // State Management
  const state = {
    currentCategory: 'all',
    searchQuery: '',
    resources: []
  };

  // Show Loading State
  gridContainer.innerHTML = `
    <div class="resources-loading-state">
      <p>loading resources...</p>
    </div>
  `;

  // Fetch Data from data.json
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error(`Failed to load data.json: ${response.status}`);
    }
    
    const data = await response.json();
    state.resources = data.resources || [];
  } catch (error) {
    console.error('aetherline resource engine error:', error);
    gridContainer.innerHTML = `
      <div class="resources-error-state">
        <p>unable to load resources at this time.</p>
      </div>
    `;
    return;
  }

  // Initialize Event Listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderResources(state, gridContainer);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      state.currentCategory = e.currentTarget.getAttribute('data-resource-filter');
      renderResources(state, gridContainer);
    });
  });

  // Initial Render after Fetch
  renderResources(state, gridContainer);
}

function renderResources(state, container) {
  const filtered = state.resources.filter(item => {
    const matchesCategory = state.currentCategory === 'all' || item.category === state.currentCategory;
    const matchesSearch = item.title.toLowerCase().includes(state.searchQuery) ||
                          item.description.toLowerCase().includes(state.searchQuery) ||
                          item.tags.some(tag => tag.toLowerCase().includes(state.searchQuery));
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="resources-empty-state">
        <p>no resources match your current filter criteria.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <article class="resource-card ${item.featured ? 'featured' : ''}" data-id="${item.id}">
      <div class="resource-card-header">
        <span class="resource-category">${item.category}</span>
        ${item.featured ? '<span class="badge-featured">featured</span>' : ''}
      </div>
      <h3 class="resource-title">${item.title}</h3>
      <p class="resource-description">${item.description}</p>
      <div class="resource-tags">
        ${item.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
      </div>
      <a href="${item.link}" class="resource-link" target="_blank" rel="noopener noreferrer">
        access resource
        <svg class="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 17L17 7M17 7H7M17 7V17"/>
        </svg>
      </a>
    </article>
  `).join('');
}
