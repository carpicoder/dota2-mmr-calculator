// Global state
let appState = {
    hasExpeditionPack: null,
    inventory: {},
    craftedItems: {}, // Track which items user has crafted
    materials: {},
    materialColors: {}, // Material color map
    sets: [],
    selectedItems: [],
    craftingResults: [],
    rarityMap: {},
    itemsDataMap: new Map() // Store item data by itemId
};

// DOM Elements
const expeditionPackSection = document.getElementById('expeditionPackSection');
const expeditionPackStatus = document.getElementById('expeditionPackStatus');
const expeditionStatusText = document.getElementById('expeditionStatusText');
const btnChangeExpedition = document.getElementById('btnChangeExpedition');
const mainContent = document.getElementById('mainContent');
const btnExpeditionYes = document.getElementById('btnExpeditionYes');
const btnExpeditionNo = document.getElementById('btnExpeditionNo');
const setsContainer = document.getElementById('setsContainer');
const selectedItemsSection = document.getElementById('selectedItemsSection');
const selectedItemsList = document.getElementById('selectedItemsList');
const resultsSection = document.getElementById('resultsSection');
const resultsContainer = document.getElementById('resultsContainer');
const resultsLegend = document.getElementById('resultsLegend');
const btnCalculate = document.getElementById('btnCalculate');
const btnResetSelection = document.getElementById('btnResetSelection');
const inventoryForm = document.getElementById('inventoryForm');
const btnSaveInventory = document.getElementById('btnSaveInventory');
const collectionForm = document.getElementById('collectionForm');
const btnSaveCollection = document.getElementById('btnSaveCollection');

// Initialize app
async function init() {
    loadFromLocalStorage();
    await loadMaterials();
    await loadSets();
    
    if (appState.hasExpeditionPack !== null) {
        showMainContent();
    }
    
    setupEventListeners();
    generateInventoryForm();
    generateCollectionForm();
}

// Load materials data
async function loadMaterials() {
    try {
        const response = await fetch('./data/materials.json');
        const data = await response.json();
        appState.materials = data;
        appState.materialColors = {};
        
        // Create rarity map and color map for quick lookup
        for (const [rarity, materials] of Object.entries(data)) {
            for (const [materialName, materialData] of Object.entries(materials)) {
                appState.rarityMap[materialName] = rarity;
                if (materialData.color) {
                    appState.materialColors[materialName] = materialData.color;
                }
            }
        }
    } catch (error) {
        console.error('Error loading materials:', error);
    }
}

// Load all sets
async function loadSets() {
    try {
        const sets = [];
        
        // Load Palico Courier
        const palicoResponse = await fetch('./data/palico-courier.json');
        sets.push(await palicoResponse.json());
        
        // Load Sniper
        const sniperResponse = await fetch('./data/sniper.json');
        sets.push(await sniperResponse.json());
        
        // Load Techies
        const techiesResponse = await fetch('./data/techies.json');
        sets.push(await techiesResponse.json());
        
        // Load Anti-Mage
        const antiMageResponse = await fetch('./data/anti-mage.json');
        sets.push(await antiMageResponse.json());
        
        // Load Dragon Knight
        const dragonKnightResponse = await fetch('./data/dragon-knight.json');
        sets.push(await dragonKnightResponse.json());
        
        // Load Beastmaster
        const beastmasterResponse = await fetch('./data/beastmaster.json');
        sets.push(await beastmasterResponse.json());
        
        // Load Windranger
        const windrangerResponse = await fetch('./data/windranger.json');
        sets.push(await windrangerResponse.json());
        
        // Load Poogie (always last)
        const poogieResponse = await fetch('./data/poogie.json');
        sets.push(await poogieResponse.json());
        
        appState.sets = sets;
        renderSets();
    } catch (error) {
        console.error('Error loading sets:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    btnExpeditionYes.addEventListener('click', () => {
        gtag('event', 'expedition_pack_selected', {'event_category': 'User Setup', 'event_label': 'Yes', 'value': 1});
        setExpeditionPack(true);
    });
    btnExpeditionNo.addEventListener('click', () => {
        gtag('event', 'expedition_pack_selected', {'event_category': 'User Setup', 'event_label': 'No', 'value': 0});
        setExpeditionPack(false);
    });
    btnChangeExpedition.addEventListener('click', () => {
        gtag('event', 'expedition_pack_changed', {'event_category': 'User Setup', 'event_label': 'Changed Expedition Pack'});
        changeExpeditionPack();
    });
    btnCalculate.addEventListener('click', () => {
        gtag('event', 'calculate_crafting_plan', {'event_category': 'Crafting', 'event_label': 'Calculate Button', 'value': appState.selectedItems.length});
        calculateCraftingPlan();
    });
    btnResetSelection.addEventListener('click', () => {
        gtag('event', 'reset_selection', {'event_category': 'Crafting', 'event_label': 'Clear All Button'});
        resetSelection();
    });
    btnSaveInventory.addEventListener('click', () => {
        gtag('event', 'save_inventory', {'event_category': 'Inventory', 'event_label': 'Save Inventory'});
        saveInventory();
    });
    btnSaveCollection.addEventListener('click', () => {
        gtag('event', 'save_collection', {'event_category': 'Collection', 'event_label': 'Save Collection'});
        saveCollection();
    });
    
    // Track modal opens
    document.querySelector('[data-bs-target="#inventoryModal"]').addEventListener('click', () => {
        gtag('event', 'open_inventory_modal', {'event_category': 'Inventory', 'event_label': 'Open Materials Inventory'});
    });
    document.querySelector('[data-bs-target="#collectionModal"]').addEventListener('click', () => {
        gtag('event', 'open_collection_modal', {'event_category': 'Collection', 'event_label': 'Open My Collection'});
    });
}

// Set expedition pack status
function setExpeditionPack(hasIt) {
    appState.hasExpeditionPack = hasIt;
    
    // Always mark Palico Courier Base as crafted
    appState.craftedItems['palico-courier-base'] = true;
    
    // Always mark Poogie Memorial Stripes as crafted if has expedition pack
    if (hasIt) {
        appState.craftedItems['poogie-memorial-stripes'] = true;
    }
    
    saveToLocalStorage();
    showMainContent();
}

// Change expedition pack
function changeExpeditionPack() {
    appState.hasExpeditionPack = null;
    appState.selectedItems = [];
    appState.craftingResults = [];
    // Clear selected items and results from localStorage, but keep inventory
    localStorage.removeItem('mh_selectedItems');
    localStorage.removeItem('mh_craftingResults');
    localStorage.removeItem('mh_hasExpeditionPack');
    expeditionPackStatus.classList.add('hidden');
    expeditionPackSection.classList.remove('hidden');
    selectedItemsSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
}

// Show main content
function showMainContent() {
    expeditionPackSection.classList.add('hidden');
    expeditionPackStatus.classList.remove('hidden');
    expeditionStatusText.textContent = appState.hasExpeditionPack 
        ? '🔓 You have the Expedition Pack' 
        : '🔒 You don\'t have the Expedition Pack';
    mainContent.classList.remove('hidden');
    
    // Ensure base items are always marked as crafted
    appState.craftedItems['palico-courier-base'] = true;
    if (appState.hasExpeditionPack) {
        appState.craftedItems['poogie-memorial-stripes'] = true;
    }
    
    // Generate collection form when sets are loaded
    if (appState.sets.length > 0) {
        generateCollectionForm();
    }
    
    renderSets();
    
    // Restore selected items and results if they exist
    if (appState.selectedItems.length > 0) {
        updateSelectedItemsDisplay();
    }
    
    if (appState.craftingResults.length > 0) {
        resultsSection.classList.remove('hidden');
        renderResults(appState.craftingResults);
    }
}

// Generate inventory form
function generateInventoryForm() {
    inventoryForm.innerHTML = '';
    
    for (const [rarity, materials] of Object.entries(appState.materials)) {
        const section = document.createElement('div');
        section.className = 'mb-4';
        
        const rarityClass = rarity.replace(' ', '-');
        section.innerHTML = `
            <h6 class="text-uppercase mb-2">
                <span class="badge rarity-${rarityClass}">${rarity}</span>
            </h6>
        `;
        
        // Get material names from the new structure
        const materialNames = Object.keys(materials);
        
        materialNames.forEach((material, index) => {
            const group = document.createElement('div');
            group.className = 'inventory-input-group d-flex align-items-center';
            
            const value = appState.inventory[material] !== undefined ? appState.inventory[material] : 0;
            
            group.innerHTML = `
                <label class="me-auto d-flex align-items-center">
                    ${createMaterialIcon(material)}
                    ${material}
                </label>
                <input 
                    type="number" 
                    class="form-control form-control-sm" 
                    min="0" 
                    value="${value}"
                    data-material="${material}"
                    id="inv-${material.replace(/[^a-zA-Z0-9]/g, '-')}"
                />
            `;
            
            section.appendChild(group);
            
            // Add enter key navigation
            const input = group.querySelector('input');
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const allInputs = Array.from(inventoryForm.querySelectorAll('input'));
                    const currentIndex = allInputs.indexOf(input);
                    if (currentIndex < allInputs.length - 1) {
                        allInputs[currentIndex + 1].focus();
                        allInputs[currentIndex + 1].select();
                    }
                }
            });
        });
        
        inventoryForm.appendChild(section);
    }
}

// Generate collection form
function generateCollectionForm() {
    if (!appState.sets.length || appState.hasExpeditionPack === null) return;
    
    collectionForm.innerHTML = '';
    
    appState.sets.forEach(set => {
        // Skip Poogie entirely if user doesn't have Expedition Pack
        if (set.id === 'poogie' && !appState.hasExpeditionPack) {
            return;
        }
        
        const section = document.createElement('div');
        section.className = 'mb-4';
        
        section.innerHTML = `<h6 class="text-uppercase mb-2">${set.name}</h6>`;
        
        let hasVisibleItems = false;
        
        if (set.type === 'hero_set') {
            // Hero sets - show with expandable parts
            set.sets.forEach((subset, subsetIndex) => {
                if (!appState.hasExpeditionPack && subset.requiresExpedition && subset.id !== 'base') {
                    return;
                }
                
                hasVisibleItems = true;
                const setId = `${set.id}-${subset.id}`;
                const collapseId = `collapse-${set.id}-${subset.id}`;
                
                // Check if all parts are crafted
                const allPartsCrafted = subset.parts.every(part => {
                    const partId = `${setId}-${part.id}`;
                    return appState.craftedItems[partId];
                });
                
                // Create set header with checkbox and expand button
                const setHeader = document.createElement('div');
                setHeader.className = 'collection-set-header';
                setHeader.dataset.setId = setId;
                
                // Image path
                const imagePath = `img/sets/${set.id}/${subset.id}.png`;
                
                setHeader.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center gap-2">
                        <img src="${imagePath}" alt="${subset.name}" class="set-thumbnail" style="height: 40px;">
                        <div class="form-check flex-grow-1">
                            <input class="form-check-input set-checkbox" type="checkbox" value="${setId}" id="craft-set-${setId}" ${allPartsCrafted ? 'checked' : ''} data-set-id="${setId}">
                            <label class="form-check-label" for="craft-set-${setId}">
                                ${subset.name}
                            </label>
                        </div>
                        <button class="btn btn-sm btn-outline-secondary expand-button" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
                            <span class="expand-icon">▼</span>
                        </button>
                    </div>
                `;
                section.appendChild(setHeader);
                
                // Create collapsible parts section
                const partsSection = document.createElement('div');
                partsSection.className = 'collapse collection-parts';
                partsSection.id = collapseId;
                
                subset.parts.forEach(part => {
                    const partId = `${setId}-${part.id}`;
                    const isPartChecked = appState.craftedItems[partId] || false;
                    
                    const partItem = document.createElement('div');
                    partItem.className = 'collection-item';
                    partItem.innerHTML = `
                        <div class="form-check">
                            <input class="form-check-input part-checkbox" type="checkbox" value="${partId}" id="craft-${partId}" ${isPartChecked ? 'checked' : ''} data-set-id="${setId}">
                            <label class="form-check-label" for="craft-${partId}">
                                ${part.name}
                            </label>
                        </div>
                    `;
                    partsSection.appendChild(partItem);
                });
                
                section.appendChild(partsSection);
            });
        } else {
            // Courier or Pet styles
            const items = set.styles || set.sets;
            items.forEach(item => {
                if (!appState.hasExpeditionPack && item.requiresExpedition && item.id !== 'base') {
                    return;
                }
                
                hasVisibleItems = true;
                const itemId = `${set.id}-${item.id}`;
                
                // Palico Courier Base is always crafted
                const isPalicoBase = set.id === 'palico-courier' && item.id === 'base';
                // Poogie Memorial Stripes is always crafted if has expedition pack
                const isPoogieBase = set.id === 'poogie' && item.id === 'memorial-stripes' && appState.hasExpeditionPack;
                
                const isAlwaysCrafted = isPalicoBase || isPoogieBase;
                const isChecked = isAlwaysCrafted || appState.craftedItems[itemId] || false;
                
                const itemEl = document.createElement('div');
                itemEl.className = 'collection-item';
                
                let noteText = '';
                if (isAlwaysCrafted) {
                    noteText = ' <small class="text-muted">(Always owned)</small>';
                }
                
                // Image path
                const imagePath = `img/sets/${set.id}/${item.id}.png`;
                
                itemEl.innerHTML = `
                    <div class="d-flex align-items-center gap-2">
                        <img src="${imagePath}" alt="${item.name}" class="set-thumbnail" style="height: 40px;">
                        <div class="form-check flex-grow-1">
                            <input class="form-check-input" type="checkbox" value="${itemId}" id="craft-${itemId}" ${isChecked ? 'checked' : ''} ${isAlwaysCrafted ? 'disabled' : ''}>
                            <label class="form-check-label" for="craft-${itemId}">
                                ${item.name}${noteText}
                            </label>
                        </div>
                    </div>
                `;
                section.appendChild(itemEl);
            });
        }
        
        // Only append section if it has visible items
        if (hasVisibleItems) {
            collectionForm.appendChild(section);
        }
    });
    
    // Setup click handlers for collection items
    setupCollectionClickHandlers();
}

// Setup collection item click handlers
function setupCollectionClickHandlers() {
    const collectionItems = collectionForm.querySelectorAll('.collection-item');
    collectionItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Don't toggle if clicking directly on the checkbox or label
            if (e.target.type === 'checkbox' || e.target.tagName === 'LABEL') {
                return;
            }
            
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox && !checkbox.disabled) {
                checkbox.checked = !checkbox.checked;
                
                // If it's a part checkbox, update the set checkbox
                if (checkbox.classList.contains('part-checkbox')) {
                    updateSetCheckbox(checkbox.dataset.setId);
                }
            }
        });
    });
    
    // Set header click handlers - toggle set checkbox when clicking anywhere except expand button
    const setHeaders = collectionForm.querySelectorAll('.collection-set-header');
    setHeaders.forEach(header => {
        header.addEventListener('click', (e) => {
            // Don't toggle if clicking on expand button or checkbox/label directly
            if (e.target.closest('.expand-button') || 
                e.target.type === 'checkbox' || 
                e.target.tagName === 'LABEL') {
                return;
            }
            
            const setId = header.dataset.setId;
            const checkbox = header.querySelector('.set-checkbox');
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                
                // Trigger change event to update parts
                const changeEvent = new Event('change', { bubbles: true });
                checkbox.dispatchEvent(changeEvent);
            }
        });
    });
    
    // Set checkbox handlers - select/deselect all parts
    const setCheckboxes = collectionForm.querySelectorAll('.set-checkbox');
    setCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const setId = checkbox.dataset.setId;
            const isChecked = checkbox.checked;
            
            // Update all part checkboxes
            const partCheckboxes = collectionForm.querySelectorAll(`.part-checkbox[data-set-id="${setId}"]`);
            partCheckboxes.forEach(partCheckbox => {
                partCheckbox.checked = isChecked;
            });
        });
    });
    
    // Part checkbox handlers - update set checkbox
    const partCheckboxes = collectionForm.querySelectorAll('.part-checkbox');
    partCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            updateSetCheckbox(checkbox.dataset.setId);
        });
    });
}

// Update set checkbox based on parts status
function updateSetCheckbox(setId) {
    const setCheckbox = collectionForm.querySelector(`.set-checkbox[data-set-id="${setId}"]`);
    const partCheckboxes = collectionForm.querySelectorAll(`.part-checkbox[data-set-id="${setId}"]`);
    
    if (setCheckbox && partCheckboxes.length > 0) {
        const allChecked = Array.from(partCheckboxes).every(cb => cb.checked);
        setCheckbox.checked = allChecked;
    }
}

// Save collection
function saveCollection() {
    // Only save part checkboxes (not set checkboxes)
    const partCheckboxes = collectionForm.querySelectorAll('.part-checkbox');
    const simpleCheckboxes = collectionForm.querySelectorAll('.collection-item input[type="checkbox"]:not(.part-checkbox):not(.set-checkbox)');
    
    appState.craftedItems = {};
    
    // Save hero set parts
    partCheckboxes.forEach(checkbox => {
        appState.craftedItems[checkbox.value] = checkbox.checked;
    });
    
    // Save simple items (courier, poogie)
    simpleCheckboxes.forEach(checkbox => {
        appState.craftedItems[checkbox.value] = checkbox.checked;
    });
    
    // Always mark Palico Courier Base as crafted
    appState.craftedItems['palico-courier-base'] = true;
    
    // Always mark Poogie Memorial Stripes as crafted if has expedition pack
    if (appState.hasExpeditionPack) {
        appState.craftedItems['poogie-memorial-stripes'] = true;
    }
    
    // Clear all selected items when updating collection
    appState.selectedItems = [];
    appState.craftingResults = [];
    
    saveToLocalStorage();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('collectionModal'));
    modal.hide();
    
    // Re-render sets to show crafted items
    renderSets();
    
    // Update UI to show no selected items
    updateSelectedItemsDisplay();
    resultsSection.classList.add('hidden');
}

// Save inventory
function saveInventory() {
    const inputs = inventoryForm.querySelectorAll('input');
    inputs.forEach(input => {
        const material = input.dataset.material;
        const value = parseInt(input.value) || 0;
        appState.inventory[material] = value;
    });
    
    saveToLocalStorage();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('inventoryModal'));
    modal.hide();
    
    // Update UI
    if (appState.selectedItems.length > 0) {
        calculateCraftingPlan();
    }
}

// Render sets
function renderSets() {
    if (!appState.sets.length || appState.hasExpeditionPack === null) return;
    
    setsContainer.innerHTML = '';
    
    const accordionId = 'setsAccordion';
    const accordion = document.createElement('div');
    accordion.className = 'accordion';
    accordion.id = accordionId;
    
    appState.sets.forEach((set, setIndex) => {
        let itemsHtml = '';
        
        if (set.type === 'hero_set') {
            // Hero sets - show complete sets as selectable items
            set.sets.forEach(subset => {
                if (!appState.hasExpeditionPack && subset.requiresExpedition && subset.id !== 'base') {
                    return;
                }
                
                // Create a card for the complete set
                itemsHtml += createCompleteSetCard(subset, set.id, set.name);
            });
        } else {
            // Courier or Pet (simple styles)
            const items = set.styles || set.sets;
            items.forEach(item => {
                // Skip items that require Expedition Pack if user doesn't have it
                // Exception: Palico Courier Base doesn't require expedition pack
                if (!appState.hasExpeditionPack && item.requiresExpedition && item.id !== 'base') {
                    return;
                }
                itemsHtml += createSimpleItemCard(item, set.id, null);
            });
        }
        
        // Only add accordion if there are items to show
        if (itemsHtml.trim()) {
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item bg-dark-subtle';
            accordionItem.innerHTML = `
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${setIndex}">
                        ${set.name}
                    </button>
                </h2>
                <div id="collapse${setIndex}" class="accordion-collapse collapse" data-bs-parent="#${accordionId}">
                    <div class="accordion-body">
                        ${itemsHtml}
                    </div>
                </div>
            `;
            
            accordion.appendChild(accordionItem);
        }
    });
    
    setsContainer.appendChild(accordion);
    
    // Add click listeners to items
    document.querySelectorAll('.item-simple-card').forEach(item => {
        item.addEventListener('click', () => toggleItemSelection(item));
    });
}

// Create complete set card HTML (for hero sets)
function createCompleteSetCard(subset, setId, setName) {
    const itemId = `${setId}-${subset.id}`;
    const isSelected = appState.selectedItems.some(i => i.itemId === itemId);
    
    // Check if all parts are crafted
    const allPartsCrafted = subset.parts.every(part => {
        const partId = `${itemId}-${part.id}`;
        return appState.craftedItems[partId];
    });
    
    // Check how many parts are crafted
    const craftedPartsCount = subset.parts.filter(part => {
        const partId = `${itemId}-${part.id}`;
        return appState.craftedItems[partId];
    }).length;
    
    let cardClass = '';
    let badge = '';
    
    if (allPartsCrafted) {
        cardClass = 'item-crafted';
        badge = '<span class="badge bg-success">✓ All Crafted</span>';
    } else if (craftedPartsCount > 0) {
        badge = `<span class="badge bg-info text-dark">${craftedPartsCount}/${subset.parts.length} Crafted</span>`;
    } else if (isSelected) {
        cardClass = 'selected';
        badge = '<span class="badge bg-primary">✓ Selected</span>';
    }
    
    // Store complete set data in map
    appState.itemsDataMap.set(itemId, {
        ...subset,
        setId,
        setName,
        isCompleteSet: true
    });
    
    const partsCount = subset.parts ? subset.parts.length : 0;
    const partsText = partsCount > 0 ? ` <small class="text-muted">(${partsCount} parts)</small>` : '';
    
    // Image path
    const imagePath = `img/sets/${setId}/${subset.id}.png`;
    
    return `
        <div class="item-simple-card ${cardClass}" data-item-id="${itemId}" data-crafted="${allPartsCrafted ? 'true' : 'false'}">
            <div class="d-flex align-items-center gap-3">
                <img src="${imagePath}" alt="${subset.name}" class="set-thumbnail">
                <div class="flex-grow-1 d-flex justify-content-between align-items-center">
                    <span>${subset.name}${partsText}</span>
                    ${badge}
                </div>
            </div>
        </div>
    `;
}

// Create simple item card HTML (name only, no materials shown) - for courier/pet
function createSimpleItemCard(item, setId, subsetId) {
    const itemId = `${setId}-${subsetId ? subsetId + '-' : ''}${item.id}`;
    const isSelected = appState.selectedItems.some(i => i.itemId === itemId);
    const isCrafted = appState.craftedItems[itemId];
    
    let cardClass = '';
    let badge = '';
    
    if (isCrafted) {
        cardClass = 'item-crafted';
        badge = '<span class="badge bg-success">✓ Crafted</span>';
    } else if (isSelected) {
        cardClass = 'selected';
        badge = '<span class="badge bg-primary">✓ Selected</span>';
    }
    
    // Get set name
    const setData = appState.sets.find(s => s.id === setId);
    const setName = setData ? setData.name : '';
    
    // Store item data in map with set name
    appState.itemsDataMap.set(itemId, {...item, setId, subsetId, setName});
    
    const note = item.note ? ` <small class="text-muted">(${item.note})</small>` : '';
    const hasNoMaterials = !item.materials || Object.keys(item.materials).length === 0;
    const nameDisplay = hasNoMaterials ? `<span class="text-muted">${item.name}</span>` : item.name;
    
    // Image path
    const imagePath = `img/sets/${setId}/${item.id}.png`;
    
    return `
        <div class="item-simple-card ${cardClass}" data-item-id="${itemId}" data-crafted="${isCrafted ? 'true' : 'false'}">
            <div class="d-flex align-items-center gap-3">
                <img src="${imagePath}" alt="${item.name}" class="set-thumbnail">
                <div class="flex-grow-1 d-flex justify-content-between align-items-center">
                    <span>${nameDisplay}${note}</span>
                    ${badge}
                </div>
            </div>
        </div>
    `;
}

// Toggle item selection
function toggleItemSelection(itemElement) {
    const itemId = itemElement.dataset.itemId;
    const isCrafted = itemElement.dataset.crafted === 'true';
    
    // Don't allow selection of crafted items
    if (isCrafted) {
        return;
    }
    
    const itemData = appState.itemsDataMap.get(itemId);
    
    if (!itemData) {
        console.error('Item data not found for:', itemId);
        return;
    }
    
    const existingIndex = appState.selectedItems.findIndex(i => i.itemId === itemId);
    
    if (existingIndex >= 0) {
        appState.selectedItems.splice(existingIndex, 1);
        itemElement.classList.remove('selected');
        // Update badge
        const badge = itemElement.querySelector('.badge');
        if (badge) badge.remove();
        gtag('event', 'item_deselected', {'event_category': 'Item Selection', 'event_label': itemData.item, 'value': 0});
    } else {
        appState.selectedItems.push({
            itemId,
            ...itemData,
            priority: appState.selectedItems.length
        });
        itemElement.classList.add('selected');
        // Add badge
        const badge = document.createElement('span');
        badge.className = 'badge bg-primary';
        badge.textContent = '✓ Selected';
        itemElement.querySelector('.d-flex').appendChild(badge);
        gtag('event', 'item_selected', {'event_category': 'Item Selection', 'event_label': itemData.item, 'value': 1});
    }
    
    updateSelectedItemsDisplay();
    saveToLocalStorage();
}

// Remove item from selection
function removeItemFromSelection(itemId) {
    const index = appState.selectedItems.findIndex(i => i.itemId === itemId);
    if (index >= 0) {
        appState.selectedItems.splice(index, 1);
        updateSelectedItemsDisplay();
        renderSets(); // Re-render to update selection state
        saveToLocalStorage();
    }
}

// Reset all selections
function resetSelection() {
    appState.selectedItems = [];
    appState.craftingResults = [];
    updateSelectedItemsDisplay();
    renderSets();
    resultsSection.classList.add('hidden');
    saveToLocalStorage();
}

// Update selected items display
function updateSelectedItemsDisplay() {
    if (appState.selectedItems.length === 0) {
        selectedItemsSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        return;
    }
    
    selectedItemsSection.classList.remove('hidden');
    selectedItemsList.innerHTML = '';
    
    appState.selectedItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'col-12';
        card.dataset.itemId = item.itemId;
        
        const hasNoMaterials = !item.materials || Object.keys(item.materials).length === 0;
        const cardClass = hasNoMaterials ? 'bg-dark-subtle' : 'bg-secondary-subtle';
        const itemNote = item.note ? ` <small class="text-muted">(${item.note})</small>` : '';
        
        // Get image path - extract item id from itemId
        let imagePath = '';
        let imageHtml = '';
        if (item.itemId && item.setId) {
            const itemIdParts = item.itemId.split('-');
            const setIdParts = item.setId.split('-');
            const imageId = itemIdParts.slice(setIdParts.length).join('-');
            imagePath = `img/sets/${item.setId}/${imageId}.png`;
            imageHtml = `<img src="${imagePath}" alt="${item.name}" class="set-thumbnail" style="height: 50px;">`;
        }
        
        card.innerHTML = `
            <div class="card ${cardClass}">
                <div class="card-body p-2 px-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center gap-2">
                            ${imageHtml}
                            <span class="badge priority-badge bg-primary">Priority ${index + 1}</span>
                            <span class="badge bg-info text-dark">${item.setName || 'Unknown'}</span>
                            <h6 class="mb-0">${item.name}${itemNote}</h6>
                        </div>
                        <div>
                            <span class="sortable-handle me-2">⠿</span>
                            <span class="remove-item-btn" data-item-id="${item.itemId}" title="Remove">✕</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        selectedItemsList.appendChild(card);
    });
    
    // Add remove listeners
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeItemFromSelection(btn.dataset.itemId);
        });
    });
    
    // Initialize Sortable
    new Sortable(selectedItemsList, {
        animation: 150,
        handle: '.sortable-handle',
        onEnd: function(evt) {
            // Update priority based on new order
            const newOrder = Array.from(selectedItemsList.children).map(el => el.dataset.itemId);
            appState.selectedItems = newOrder.map(itemId => 
                appState.selectedItems.find(item => item.itemId === itemId)
            );
            updateSelectedItemsDisplay();
            saveToLocalStorage();
        }
    });
}

// Calculate crafting plan
function calculateCraftingPlan() {
    resultsSection.classList.remove('hidden');
    resultsContainer.innerHTML = '';
    
    // Clone inventory to simulate crafting
    let currentInventory = { ...appState.inventory };
    const results = [];
    appState.craftingResults = []; // Reset results
    
    appState.selectedItems.forEach((item, index) => {
        const result = {
            item: item.name,
            setName: item.setName || 'Unknown',
            setId: item.setId,
            itemId: item.itemId,
            priority: index + 1,
            status: 'can-craft',
            message: '',
            exchanges: [],
            note: item.note || '',
            parts: [] // For complete sets
        };
        
        // Handle complete sets (hero sets with multiple parts)
        if (item.isCompleteSet && item.parts) {
            result.isCompleteSet = true;
            
            // Process each part of the set
            item.parts.forEach(part => {
                const partId = `${item.setId}-${item.id}-${part.id}`;
                const isPartCrafted = appState.craftedItems[partId];
                
                const partResult = {
                    name: part.name,
                    status: isPartCrafted ? 'already-crafted' : 'can-craft',
                    exchanges: [],
                    missing: {},
                    crafted: isPartCrafted
                };
                
                // Skip crafted parts
                if (isPartCrafted) {
                    result.parts.push(partResult);
                    return;
                }
                
                const materials = part.materials || {};
                const missing = {};
                
                // Check what's missing for this part
                for (const [material, needed] of Object.entries(materials)) {
                    const have = currentInventory[material] || 0;
                    if (have < needed) {
                        missing[material] = needed - have;
                        partResult.status = 'cannot-craft';
                    }
                }
                
                if (Object.keys(missing).length === 0) {
                    // Can craft this part!
                    // Deduct materials from inventory
                    for (const [material, needed] of Object.entries(materials)) {
                        currentInventory[material] = (currentInventory[material] || 0) - needed;
                    }
                } else {
                    // Try to find exchanges for this part
                    const exchangePlan = findExchanges(currentInventory, missing);
                    
                    if (exchangePlan.possible) {
                        partResult.status = 'can-exchange';
                        partResult.exchanges = exchangePlan.exchanges;
                        
                        // Apply exchanges and deduct materials
                        exchangePlan.exchanges.forEach(exchange => {
                            exchange.from.forEach(mat => {
                                currentInventory[mat.material] -= mat.quantity;
                            });
                            currentInventory[exchange.to.material] += exchange.to.quantity;
                        });
                        
                        for (const [material, needed] of Object.entries(materials)) {
                            currentInventory[material] = (currentInventory[material] || 0) - needed;
                        }
                    } else {
                        partResult.missing = missing;
                    }
                }
                
                result.parts.push(partResult);
                
                // Update overall status (only for non-crafted parts)
                if (partResult.status === 'cannot-craft') {
                    result.status = 'cannot-craft';
                } else if (partResult.status === 'can-exchange' && result.status !== 'cannot-craft') {
                    result.status = 'can-exchange';
                }
            });
            
            results.push(result);
            return;
        }
        
        // Handle single items (courier, pet styles)
        const materials = item.materials || {};
        
        // Check if item has no materials (already unlocked)
        if (Object.keys(materials).length === 0) {
            result.status = 'already-unlocked';
            result.message = item.note || 'Already unlocked';
            results.push(result);
            return;
        }
        
        const missing = {};
        
        // Check what's missing
        for (const [material, needed] of Object.entries(materials)) {
            const have = currentInventory[material] || 0;
            if (have < needed) {
                missing[material] = needed - have;
                result.status = 'cannot-craft';
            }
        }
        
        if (Object.keys(missing).length === 0) {
            // Can craft!
            result.message = 'You can craft this item!';
            // Deduct materials from inventory
            for (const [material, needed] of Object.entries(materials)) {
                currentInventory[material] = (currentInventory[material] || 0) - needed;
            }
        } else {
            // Try to find exchanges
            const exchangePlan = findExchanges(currentInventory, missing);
            
            if (exchangePlan.possible) {
                result.status = 'can-exchange';
                result.message = 'You can craft this with exchanges:';
                result.exchanges = exchangePlan.exchanges;
                
                // Apply exchanges and deduct materials
                exchangePlan.exchanges.forEach(exchange => {
                    exchange.from.forEach(mat => {
                        currentInventory[mat.material] -= mat.quantity;
                    });
                    currentInventory[exchange.to.material] += exchange.to.quantity;
                });
                
                for (const [material, needed] of Object.entries(materials)) {
                    currentInventory[material] = (currentInventory[material] || 0) - needed;
                }
            } else {
                result.message = 'You need to collect more materials:';
                result.missing = missing;
            }
        }
        
        results.push(result);
    });
    
    appState.craftingResults = results;
    renderResults(results);
    saveToLocalStorage();
}

// Find optimal exchanges
function findExchanges(inventory, missing) {
    const exchanges = [];
    let tempInventory = { ...inventory };
    
    for (const [neededMaterial, neededQty] of Object.entries(missing)) {
        const materialRarity = appState.rarityMap[neededMaterial];
        let stillNeeded = neededQty;
        
        // Try same-type exchanges first (3:1)
        const sameTypeMaterials = Object.keys(appState.materials[materialRarity] || {}).filter(m => 
            m !== neededMaterial && (tempInventory[m] || 0) >= 3
        );
        
        while (stillNeeded > 0 && sameTypeMaterials.length > 0) {
            const sourceMaterial = sameTypeMaterials[0];
            const available = Math.floor((tempInventory[sourceMaterial] || 0) / 3);
            const toExchange = Math.min(available, stillNeeded);
            
            if (toExchange > 0) {
                exchanges.push({
                    type: 'same-rarity',
                    from: [{ material: sourceMaterial, quantity: toExchange * 3 }],
                    to: { material: neededMaterial, quantity: toExchange }
                });
                
                tempInventory[sourceMaterial] -= toExchange * 3;
                tempInventory[neededMaterial] = (tempInventory[neededMaterial] || 0) + toExchange;
                stillNeeded -= toExchange;
            }
            
            sameTypeMaterials.shift();
        }
        
        // Try lower rarity exchanges (6:1) - can combine different materials
        if (stillNeeded > 0) {
            const lowerRarity = getLowerRarity(materialRarity);
            if (lowerRarity) {
                while (stillNeeded > 0) {
                    // Get all available materials from lower rarity
                    const availableMaterials = Object.keys(appState.materials[lowerRarity] || {})
                        .filter(m => (tempInventory[m] || 0) > 0)
                        .map(m => ({ material: m, quantity: tempInventory[m] || 0 }))
                        .sort((a, b) => b.quantity - a.quantity); // Sort by quantity (highest first)
                    
                    if (availableMaterials.length === 0) break;
                    
                    // Calculate total available
                    const totalAvailable = availableMaterials.reduce((sum, item) => sum + item.quantity, 0);
                    if (totalAvailable < 6) break;
                    
                    // Collect materials to reach 6 units
                    const materialsToUse = [];
                    let collected = 0;
                    
                    for (const item of availableMaterials) {
                        if (collected >= 6) break;
                        const needed = 6 - collected;
                        const toTake = Math.min(item.quantity, needed);
                        materialsToUse.push({ material: item.material, quantity: toTake });
                        collected += toTake;
                    }
                    
                    if (collected === 6) {
                        exchanges.push({
                            type: 'higher-rarity',
                            from: materialsToUse,
                            to: { material: neededMaterial, quantity: 1 }
                        });
                        
                        // Update temp inventory
                        materialsToUse.forEach(item => {
                            tempInventory[item.material] -= item.quantity;
                        });
                        tempInventory[neededMaterial] = (tempInventory[neededMaterial] || 0) + 1;
                        stillNeeded -= 1;
                    } else {
                        break;
                    }
                }
            }
        }
        
        if (stillNeeded > 0) {
            return { possible: false };
        }
    }
    
    return { possible: true, exchanges };
}

// Get lower rarity
function getLowerRarity(rarity) {
    const rarities = ['common', 'uncommon', 'rare', 'super rare'];
    const index = rarities.indexOf(rarity);
    return index > 0 ? rarities[index - 1] : null;
}

// Exchange and craft an item
function exchangeAndCraft(resultIndex) {
    const result = appState.craftingResults[resultIndex];
    if (!result) return;
    
    // Only allow crafting for can-craft or can-exchange status
    if (result.status !== 'can-craft' && result.status !== 'can-exchange') {
        return;
    }
    
    // Apply exchanges to actual inventory
    if (result.isCompleteSet && result.parts) {
        // Handle complete sets - craft all non-crafted parts
        result.parts.forEach(part => {
            if (part.crafted) return; // Skip already crafted parts
            
            // Apply exchanges for this part
            if (part.exchanges && part.exchanges.length > 0) {
                part.exchanges.forEach(exchange => {
                    exchange.from.forEach(mat => {
                        appState.inventory[mat.material] = (appState.inventory[mat.material] || 0) - mat.quantity;
                    });
                    appState.inventory[exchange.to.material] = (appState.inventory[exchange.to.material] || 0) + exchange.to.quantity;
                });
            }
            
            // Deduct materials for crafting this part
            const itemData = appState.itemsDataMap.get(result.itemId);
            if (itemData && itemData.parts) {
                const partData = itemData.parts.find(p => p.name === part.name);
                if (partData && partData.materials) {
                    for (const [material, needed] of Object.entries(partData.materials)) {
                        appState.inventory[material] = (appState.inventory[material] || 0) - needed;
                        if (appState.inventory[material] < 0) appState.inventory[material] = 0;
                    }
                }
            }
            
            // Mark part as crafted
            const partId = `${result.itemId}-${part.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
            appState.craftedItems[partId] = true;
        });
        
        // Try to find the correct part IDs by looking at the item data
        const itemData = appState.itemsDataMap.get(result.itemId);
        if (itemData && itemData.parts) {
            itemData.parts.forEach(partData => {
                const partId = `${result.itemId}-${partData.id}`;
                // Check if this part was processed
                const partResult = result.parts.find(p => p.name === partData.name);
                if (partResult && !partResult.crafted && (partResult.status === 'can-craft' || partResult.status === 'can-exchange')) {
                    appState.craftedItems[partId] = true;
                }
            });
        }
    } else {
        // Handle simple items
        // Apply exchanges
        if (result.exchanges && result.exchanges.length > 0) {
            result.exchanges.forEach(exchange => {
                exchange.from.forEach(mat => {
                    appState.inventory[mat.material] = (appState.inventory[mat.material] || 0) - mat.quantity;
                });
                appState.inventory[exchange.to.material] = (appState.inventory[exchange.to.material] || 0) + exchange.to.quantity;
            });
        }
        
        // Deduct materials for crafting
        const itemData = appState.itemsDataMap.get(result.itemId);
        if (itemData && itemData.materials) {
            for (const [material, needed] of Object.entries(itemData.materials)) {
                appState.inventory[material] = (appState.inventory[material] || 0) - needed;
                if (appState.inventory[material] < 0) appState.inventory[material] = 0;
            }
        }
        
        // Mark item as crafted
        appState.craftedItems[result.itemId] = true;
    }
    
    // Remove from selected items
    const selectedIndex = appState.selectedItems.findIndex(i => i.itemId === result.itemId);
    if (selectedIndex >= 0) {
        appState.selectedItems.splice(selectedIndex, 1);
    }
    
    // Save to localStorage (but don't save craftingResults yet, we'll recalculate)
    saveToLocalStorage();
    
    // Update inventory form if modal is open
    generateInventoryForm();
    
    // Re-render everything
    renderSets();
    
    // Recalculate crafting plan if there are still selected items
    if (appState.selectedItems.length > 0) {
        updateSelectedItemsDisplay();
        calculateCraftingPlan();
    } else {
        // No more items selected
        selectedItemsSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        appState.craftingResults = [];
        saveToLocalStorage();
    }
}

// Render results
function renderResults(results) {
    resultsContainer.innerHTML = '';
    
    // Check if any result is a complete set to show legend
    const hasCompleteSets = results.some(r => r.isCompleteSet);
    if (hasCompleteSets) {
        resultsLegend.classList.remove('hidden');
    } else {
        resultsLegend.classList.add('hidden');
    }
    
    // Create row for columns
    const row = document.createElement('div');
    row.className = 'row g-3';
    
    results.forEach((result, resultIndex) => {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6';
        
        const card = document.createElement('div');
        card.className = 'card h-100';
        
        let statusClass = '';
        let statusBadge = '';
        let showCraftButton = false;
        
        if (result.status === 'already-unlocked') {
            statusClass = 'border-info';
            statusBadge = '<span class="badge bg-info text-dark">Already Unlocked</span>';
        } else if (result.status === 'can-craft') {
            statusClass = 'status-can-craft';
            statusBadge = '<span class="badge bg-success">Can Craft</span>';
            showCraftButton = true;
        } else if (result.status === 'can-exchange') {
            statusClass = 'status-can-exchange';
            statusBadge = '<span class="badge bg-warning text-dark">Can Craft with Exchanges</span>';
            showCraftButton = true;
        } else {
            statusClass = 'status-cannot-craft';
            statusBadge = '<span class="badge bg-danger">Cannot Craft Yet</span>';
        }
        
        let contentHtml = '';
        
        if (result.status === 'already-unlocked') {
            contentHtml = `<div class="alert alert-info py-2 px-2 mb-0"><p class="mb-0 small">${result.message}</p></div>`;
        } else if (result.isCompleteSet && result.parts) {
            // Show breakdown by parts for complete sets
            contentHtml = '<div class="mb-2">';
            result.parts.forEach(part => {
                let partStatusBadge = '';
                if (part.status === 'already-crafted') {
                    partStatusBadge = '<span class="badge bg-secondary">Already Crafted</span>';
                } else if (part.status === 'can-craft') {
                    partStatusBadge = '<span class="badge bg-success">✓</span>';
                } else if (part.status === 'can-exchange') {
                    partStatusBadge = '<span class="badge bg-warning text-dark">⇄</span>';
                } else {
                    partStatusBadge = '<span class="badge bg-danger">✗</span>';
                }
                
                const partOpacity = part.crafted ? 'opacity-50' : '';
                
                contentHtml += `<div class="mb-2 pb-2 border-bottom ${partOpacity}">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                        <strong class="small">${part.name}</strong>
                        ${partStatusBadge}
                    </div>`;
                
                if (!part.crafted) {
                    if (part.exchanges && part.exchanges.length > 0) {
                        contentHtml += '<ul class="mb-0 small exchange-list">';
                        part.exchanges.forEach(ex => {
                            const isThreeToOne = ex.type === 'same-rarity';
                            
                            if (isThreeToOne) {
                                // Same rarity (3:1) - each material exchanges separately
                                ex.from.forEach(fromItem => {
                                    const numExchanges = fromItem.quantity / 3;
                                    if (numExchanges === 1) {
                                        contentHtml += `<li class="small text-warning">${createMaterialIcon(fromItem.material, 'small')}${fromItem.material} x3 → ${createMaterialIcon(ex.to.material, 'small')}${ex.to.material} x1</li>`;
                                    } else {
                                        contentHtml += `<li class="small text-warning">${createMaterialIcon(fromItem.material, 'small')}${fromItem.material} x3 → ${createMaterialIcon(ex.to.material, 'small')}${ex.to.material} x1 <span class="badge bg-secondary">×${numExchanges}</span></li>`;
                                    }
                                });
                            } else {
                                // Higher rarity (6:1) - can combine different materials
                                const fromParts = ex.from.map(f => `${createMaterialIcon(f.material, 'small')}${f.material} x${f.quantity}`).join(' + ');
                                contentHtml += `<li class="small text-warning">${fromParts} → ${createMaterialIcon(ex.to.material, 'small')}${ex.to.material} x1</li>`;
                            }
                        });
                        contentHtml += '</ul>';
                    }
                    
                    if (part.missing && Object.keys(part.missing).length > 0) {
                        contentHtml += '<ul class="mb-0 small ps-3 text-danger">';
                        for (const [mat, qty] of Object.entries(part.missing)) {
                            contentHtml += `<li class="small">Missing: ${createMaterialIcon(mat, 'small')}${mat} x${qty}</li>`;
                        }
                        contentHtml += '</ul>';
                    }
                }
                
                contentHtml += '</div>';
            });
            contentHtml += '</div>';
        } else {
            contentHtml = `<p class="mb-2 small">${result.message}</p>`;
            
            if (result.exchanges && result.exchanges.length > 0) {
                contentHtml += '<div class="alert alert-warning py-2 px-2 mb-2"><strong class="small">Exchanges:</strong><ul class="mb-0 mt-1 small exchange-list">';
                result.exchanges.forEach(ex => {
                    const isThreeToOne = ex.type === 'same-rarity';
                    
                    if (isThreeToOne) {
                        // Same rarity (3:1) - each material exchanges separately
                        ex.from.forEach(fromItem => {
                            const numExchanges = fromItem.quantity / 3;
                            if (numExchanges === 1) {
                                contentHtml += `<li class="small">${createMaterialIcon(fromItem.material, 'small')}${fromItem.material} x3 → ${createMaterialIcon(ex.to.material, 'small')}${ex.to.material} x1</li>`;
                            } else {
                                contentHtml += `<li class="small">${createMaterialIcon(fromItem.material, 'small')}${fromItem.material} x3 → ${createMaterialIcon(ex.to.material, 'small')}${ex.to.material} x1 <span class="badge bg-secondary">×${numExchanges}</span></li>`;
                            }
                        });
                    } else {
                        // Higher rarity (6:1) - can combine different materials
                        const fromParts = ex.from.map(f => `${createMaterialIcon(f.material, 'small')}${f.material} x${f.quantity}`).join(' + ');
                        contentHtml += `<li class="small">${fromParts} → ${createMaterialIcon(ex.to.material, 'small')}${ex.to.material} x1</li>`;
                    }
                });
                contentHtml += '</ul></div>';
            }
            
            if (result.missing) {
                contentHtml += '<div class="alert alert-danger py-2 px-2 mb-0"><strong class="small">Missing:</strong><ul class="mb-0 mt-1 small ps-3">';
                for (const [mat, qty] of Object.entries(result.missing)) {
                    contentHtml += `<li class="small">${createMaterialIcon(mat, 'small')}${mat} x${qty}</li>`;
                }
                contentHtml += '</ul></div>';
            }
        }
        
        // Get image path for the result item
        let resultImagePath = '';
        if (result.itemId && result.setId) {
            // Extract the item id (last part after setId prefix)
            const itemIdParts = result.itemId.split('-');
            const setIdParts = result.setId.split('-');
            const imageId = itemIdParts.slice(setIdParts.length).join('-');
            resultImagePath = `img/sets/${result.setId}/${imageId}.png`;
        }
        
        const imageHtml = resultImagePath ? `<img src="${resultImagePath}" alt="${result.item}" class="set-thumbnail" style="height: 50px;">` : '';
        
        // Craft button HTML
        const craftButtonHtml = showCraftButton ? `
            <div class="mt-3 pt-2 border-top">
                <button class="btn btn-sm btn-success w-100 craft-item-btn" data-result-index="${resultIndex}">
                    <strong>✓ Exchanged & Crafted</strong>
                </button>
            </div>
        ` : '';
        
        card.innerHTML = `
            <div class="card-body ${statusClass} p-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="flex-grow-1">
                        <div class="mb-1">
                            <span class="badge bg-primary me-1">${result.priority}</span>
                            <span class="badge bg-info text-dark">${result.setName}</span>
                        </div>
                        <h6 class="mb-0 fw-bold">${result.item}</h6>
                    </div>
                    <div class="ms-2">
                        ${statusBadge}
                    </div>
                </div>
                ${imageHtml ? `<div class="mb-2">${imageHtml}</div>` : ''}
                ${contentHtml}
                ${craftButtonHtml}
            </div>
        `;
        
        col.appendChild(card);
        row.appendChild(col);
    });
    
    resultsContainer.appendChild(row);
    
    // Add click listeners to craft buttons
    document.querySelectorAll('.craft-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const resultIndex = parseInt(btn.dataset.resultIndex);
            const result = appState.craftingResults[resultIndex];
            gtag('event', 'exchange_and_craft', {'event_category': 'Crafting', 'event_label': result.item, 'value': 1});
            exchangeAndCraft(resultIndex);
        });
    });
}

// LocalStorage functions
function saveToLocalStorage() {
    localStorage.setItem('mh_hasExpeditionPack', JSON.stringify(appState.hasExpeditionPack));
    localStorage.setItem('mh_inventory', JSON.stringify(appState.inventory));
    localStorage.setItem('mh_craftedItems', JSON.stringify(appState.craftedItems));
    localStorage.setItem('mh_selectedItems', JSON.stringify(appState.selectedItems));
    localStorage.setItem('mh_craftingResults', JSON.stringify(appState.craftingResults));
}

function loadFromLocalStorage() {
    const hasExpeditionPack = localStorage.getItem('mh_hasExpeditionPack');
    if (hasExpeditionPack !== null) {
        appState.hasExpeditionPack = JSON.parse(hasExpeditionPack);
    }
    
    const inventory = localStorage.getItem('mh_inventory');
    if (inventory) {
        appState.inventory = JSON.parse(inventory);
    }
    
    const craftedItems = localStorage.getItem('mh_craftedItems');
    if (craftedItems) {
        appState.craftedItems = JSON.parse(craftedItems);
    }
    
    // Always ensure Palico Courier Base is crafted
    appState.craftedItems['palico-courier-base'] = true;
    
    // Always ensure Poogie Memorial Stripes is crafted if has expedition pack
    if (appState.hasExpeditionPack) {
        appState.craftedItems['poogie-memorial-stripes'] = true;
    }
    
    const selectedItems = localStorage.getItem('mh_selectedItems');
    if (selectedItems) {
        appState.selectedItems = JSON.parse(selectedItems);
    }
    
    const craftingResults = localStorage.getItem('mh_craftingResults');
    if (craftingResults) {
        appState.craftingResults = JSON.parse(craftingResults);
    }
}

// Get material icon path
function getMaterialIcon(materialName) {
    return `./img/materials/${materialName}.svg`;
}

// Create material icon HTML
function createMaterialIcon(materialName, size = 'normal') {
    const sizeClass = size === 'small' ? 'material-icon-small' : 'material-icon';
    const rarity = appState.rarityMap[materialName];
    const color = appState.materialColors[materialName];
    
    let style = '';
    if (rarity === 'super rare' || rarity === 'rare') {
        let effectColor, r, g, b;
        
        // Super rare always uses violet, rare uses their specific color
        if (rarity === 'super rare') {
            effectColor = '#5603fc'; // BlueViolet
            r = 86;
            g = 3;
            b = 252;
        } else if (color) {
            effectColor = color;
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        }
        
        if (effectColor) {
            const intensity = rarity === 'super rare' ? 0.7 : 0.5;
            const glowIntensity = rarity === 'super rare' ? 0.9 : 0.7;
            
            style = `style="
                box-shadow: 0 0 8px rgba(${r}, ${g}, ${b}, ${intensity});
                border-color: ${effectColor};
                animation: shimmer-${materialName.replace(/[^a-zA-Z0-9]/g, '-')} 3s infinite;
            "`;
            
            // Inject keyframe animation if not already done
            injectMaterialAnimation(materialName, r, g, b, intensity, glowIntensity);
        }
    }
    
    return `<img src="${getMaterialIcon(materialName)}" class="${sizeClass}" ${style} alt="${materialName}" onerror="this.style.display='none'">`;
}

// Inject custom animation for each material
const injectedAnimations = new Set();
function injectMaterialAnimation(materialName, r, g, b, intensity, glowIntensity) {
    const animName = `shimmer-${materialName.replace(/[^a-zA-Z0-9]/g, '-')}`;
    
    if (injectedAnimations.has(animName)) return;
    injectedAnimations.add(animName);
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ${animName} {
            0%, 100% {
                box-shadow: 0 0 8px rgba(${r}, ${g}, ${b}, ${intensity});
            }
            50% {
                box-shadow: 0 0 15px rgba(${r}, ${g}, ${b}, ${glowIntensity}), 0 0 20px rgba(${r}, ${g}, ${b}, ${intensity});
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

