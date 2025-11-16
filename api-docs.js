// API Documentation Renderer
// This script handles the rendering and interactivity of the API documentation

class ApiDocsRenderer {
    constructor() {
        this.apiList = document.getElementById('apiList');
        this.apiDocsContainer = document.getElementById('apiDocsContainer');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.searchInput = document.getElementById('searchInput');
        this.currentApi = null;
        
        this.init();
    }
    
    init() {
        this.renderApiList();
        this.setupSearch();
        this.setupUrlRouting();
    }
    
    // Render the sidebar API list
    renderApiList(filter = '') {
        this.apiList.innerHTML = '';
        
        const filteredApis = API_DOCS.filter(api => 
            api.name.toLowerCase().includes(filter.toLowerCase()) ||
            api.description.toLowerCase().includes(filter.toLowerCase())
        );
        
        filteredApis.forEach(api => {
            const li = document.createElement('li');
            li.className = 'api-item';
            
            const link = document.createElement('a');
            link.className = 'api-link';
            link.textContent = api.name;
            link.setAttribute('data-api', api.name);
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showApiDoc(api.name);
                this.updateUrl(api.name);
            });
            
            li.appendChild(link);
            this.apiList.appendChild(li);
        });
        
        if (filteredApis.length === 0) {
            this.apiList.innerHTML = '<p style="padding: 1rem; color: var(--on-surface-variant);">No APIs found</p>';
        }
    }
    
    // Setup search functionality
    setupSearch() {
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            this.renderApiList(query);
        });
    }
    
    // Setup URL routing (allows direct links to specific APIs)
    setupUrlRouting() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const api = API_DOCS.find(a => a.name === hash);
            if (api) {
                this.showApiDoc(hash);
            }
        }
        
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                this.showApiDoc(hash);
            }
        });
    }
    
    // Update URL without page reload
    updateUrl(apiName) {
        window.history.pushState(null, null, `#${apiName}`);
    }
    
    // Show API documentation
    showApiDoc(apiName) {
        const api = API_DOCS.find(a => a.name === apiName);
        if (!api) return;
        
        this.currentApi = apiName;
        this.welcomeScreen.style.display = 'none';
        
        // Update active state in sidebar
        document.querySelectorAll('.api-link').forEach(link => {
            if (link.getAttribute('data-api') === apiName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Render the API documentation
        this.apiDocsContainer.innerHTML = this.renderApiDocumentation(api);
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    // Render complete API documentation page
    renderApiDocumentation(api) {
        return `
            <div class="api-doc active">
                ${this.renderApiHeader(api)}
                ${this.renderMethods(api)}
            </div>
        `;
    }
    
    // Render API header section
    renderApiHeader(api) {
        return `
            <div class="api-header">
                <h2>${api.name}</h2>
                <p class="description">${api.description}</p>
                <div class="meta">
                    <div class="meta-item">
                        <span class="meta-label">Interface:</span>
                        <code>${api.interface}</code>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Package:</span>
                        <code>${api.package}</code>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Methods:</span>
                        <span>${api.methods.length}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Render methods section
    renderMethods(api) {
        if (!api.methods || api.methods.length === 0) {
            return '<p style="color: var(--on-surface-variant);">No methods documented</p>';
        }
        
        const methodsHtml = api.methods.map(method => this.renderMethod(method)).join('');
        
        return `
            <div class="methods-section">
                <h3 class="section-title">Methods</h3>
                ${methodsHtml}
            </div>
        `;
    }
    
    // Render individual method card
    renderMethod(method) {
        return `
            <div class="method-card">
                <div class="method-signature">
                    ${this.escapeHtml(method.signature)}
                </div>
                
                ${this.renderPermissionBadges(method.permissions)}
                
                <p class="method-description">${method.description}</p>
                
                ${this.renderParameters(method.parameters)}
                ${this.renderReturns(method.returns)}
                ${this.renderExample(method.example)}
            </div>
        `;
    }
    
    // Render permission badges
    renderPermissionBadges(permissions) {
        if (!permissions || permissions.length === 0) {
            return '';
        }
        
        const badges = permissions.map(perm => 
            `<span class="badge badge-permission">Requires: ${perm}</span>`
        ).join(' ');
        
        return `<div style="margin-bottom: 1rem;">${badges}</div>`;
    }
    
    // Render parameters section
    renderParameters(parameters) {
        if (!parameters || parameters.length === 0) {
            return '<p style="color: var(--on-surface-variant); font-size: 0.9rem; margin-top: 0.5rem;">No parameters</p>';
        }
        
        const paramsHtml = parameters.map(param => `
            <div class="param-item">
                <div>
                    <span class="param-name">${this.escapeHtml(param.name)}</span>
                    <span class="param-type"> : ${this.escapeHtml(param.type)}</span>
                </div>
                <div class="param-desc">${param.description}</div>
            </div>
        `).join('');
        
        return `
            <div class="parameters">
                <h4>Parameters</h4>
                ${paramsHtml}
            </div>
        `;
    }
    
    // Render returns section
    renderReturns(returns) {
        if (!returns) {
            return '';
        }
        
        return `
            <div class="returns">
                <h4>Returns</h4>
                <div class="return-item">
                    <span class="return-type">${this.escapeHtml(returns.type)}</span>
                    <div class="return-desc">${returns.description}</div>
                </div>
            </div>
        `;
    }
    
    // Render example section
    renderExample(example) {
        if (!example) {
            return '';
        }
        
        return `
            <div class="example">
                <h4>Example</h4>
                <pre>${this.escapeHtml(example)}</pre>
            </div>
        `;
    }
    
    // Utility: Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the documentation renderer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ApiDocsRenderer();
});