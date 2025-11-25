// Global variables
let map;
let geojsonLayer;
let currentGeoJSON;
let munrollColumns = [];
let selectedMunrollColumn = '';
const sampleDatasets = [
    {
        name: 'Sample municipal rolls',
        file: 'sample_data.geojson'
    }
];

// Initialize the map
function initMap() {
    map = L.map('map').setView([0, 0], 2);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    updateStatus('Map initialized. Please load a GeoJSON file.');
}

// Populate bundled dataset selector
function initDatasetSelector() {
    const selector = document.getElementById('datasetSelector');
    selector.innerHTML = '';

    if (sampleDatasets.length === 0) {
        selector.disabled = true;
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'No bundled data available';
        selector.appendChild(placeholder);
        return;
    }

    sampleDatasets.forEach(dataset => {
        const option = document.createElement('option');
        option.value = dataset.file;
        option.textContent = dataset.name;
        selector.appendChild(option);
    });

    selector.disabled = false;
}

// Update status message
function updateStatus(message, type = '') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = type;
}

// Find all columns starting with 'MunRoll' in the GeoJSON
function findMunrollColumns(geojson) {
    const columns = new Set();

    if (geojson.features && geojson.features.length > 0) {
        geojson.features.forEach(feature => {
            if (feature.properties) {
                Object.keys(feature.properties).forEach(key => {
                    if (key.startsWith('MunRoll')) {
                        columns.add(key);
                    }
                });
            }
        });
    }

    return Array.from(columns).sort();
}

// Check if a value is #N/A
function isNAValue(value) {
    if (value === null || value === undefined) {
        return false;
    }
    const strValue = String(value).trim();
    return strValue === '#N/A' ||
           strValue === '#N/A' ||
           strValue.toUpperCase() === '#N/A' ||
           strValue === 'N/A' ||
           strValue.toUpperCase() === 'N/A';
}

// Style function for polygons
function styleFeature(feature) {
    const hasNA = selectedMunrollColumn &&
                  feature.properties &&
                  isNAValue(feature.properties[selectedMunrollColumn]);

    return {
        fillColor: hasNA ? '#ff6b6b' : '#3388ff',
        weight: 2,
        opacity: 1,
        color: hasNA ? '#cc0000' : '#0066cc',
        dashArray: '',
        fillOpacity: 0.6
    };
}

// Highlight feature on hover
function highlightFeature(e) {
    const layer = e.target;

    layer.setStyle({
        weight: 4,
        opacity: 1,
        fillOpacity: 0.8
    });

    layer.bringToFront();
}

// Reset highlight
function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
}

// Display attributes in sidebar
function displayAttributes(properties) {
    const contentDiv = document.getElementById('attributeContent');
    contentDiv.innerHTML = '';

    if (!properties || Object.keys(properties).length === 0) {
        contentDiv.innerHTML = '<p class="info-text">No attributes found</p>';
        return;
    }

    Object.keys(properties).sort().forEach(key => {
        const value = properties[key];
        const isNA = isNAValue(value);
        const isMunRoll = key.startsWith('MunRoll');

        const itemDiv = document.createElement('div');
        itemDiv.className = 'attribute-item' + (isNA && isMunRoll ? ' na-value' : '');

        const keyDiv = document.createElement('div');
        keyDiv.className = 'attribute-key';
        keyDiv.textContent = key;

        const valueDiv = document.createElement('div');
        valueDiv.className = 'attribute-value' + (isNA ? ' na' : '');
        valueDiv.textContent = value !== null && value !== undefined ? value : 'null';

        itemDiv.appendChild(keyDiv);
        itemDiv.appendChild(valueDiv);
        contentDiv.appendChild(itemDiv);
    });
}

// Handle feature click
function onFeatureClick(e) {
    const feature = e.target.feature;
    displayAttributes(feature.properties);

    // Create popup content
    let popupContent = '<div class="popup-title">Feature Attributes</div>';

    if (feature.properties) {
        const props = feature.properties;
        const keys = Object.keys(props).slice(0, 5); // Show first 5 properties

        keys.forEach(key => {
            const value = props[key];
            const isNA = isNAValue(value);
            popupContent += `<strong>${key}:</strong> `;
            popupContent += isNA ?
                `<span style="color: #ff6b6b; font-weight: bold;">${value}</span><br>` :
                `${value}<br>`;
        });

        if (Object.keys(props).length > 5) {
            popupContent += `<em>...and ${Object.keys(props).length - 5} more attributes</em>`;
        }
    }

    e.target.bindPopup(popupContent).openPopup();
}

// Attach events to features
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: onFeatureClick
    });
}

// Load GeoJSON to map
function loadGeoJSON(geojson) {
    // Remove existing layer
    if (geojsonLayer) {
        map.removeLayer(geojsonLayer);
    }

    // Add new layer
    geojsonLayer = L.geoJSON(geojson, {
        style: styleFeature,
        onEachFeature: onEachFeature
    }).addTo(map);

    // Fit map to bounds
    if (geojsonLayer.getBounds().isValid()) {
        map.fitBounds(geojsonLayer.getBounds());
    }
}

// Fetch a bundled dataset and render it
async function fetchAndLoadDataset(datasetPath, label) {
    updateStatus(`Loading ${label}...`);

    try {
        const response = await fetch(datasetPath);
        if (!response.ok) {
            throw new Error(`Failed to load ${label} (status ${response.status})`);
        }

        const geojson = await response.json();
        handleGeoJSONLoad(geojson, label);
    } catch (error) {
        console.error('Error fetching dataset:', error);
        updateStatus(`Error loading ${label}: ${error.message}`, 'error');
    }
}

function summarizeLoad(geojson) {
    const featureCount = geojson.features?.length || 0;
    const munrollInfo = munrollColumns.length > 0
        ? ` Found ${munrollColumns.length} MunRoll column(s).`
        : ' No MunRoll columns found.';

    let naSummary = '';
    if (selectedMunrollColumn) {
        const naCount = geojson.features.filter(f =>
            f.properties && isNAValue(f.properties[selectedMunrollColumn])
        ).length;

        if (naCount > 0) {
            naSummary = ` ${naCount} feature(s) with #N/A in ${selectedMunrollColumn}.`;
        }
    }

    return `Successfully loaded ${featureCount} feature(s).${munrollInfo}${naSummary}`;
}

function handleGeoJSONLoad(geojson, sourceLabel) {
    currentGeoJSON = geojson;

    // Find MunRoll columns
    munrollColumns = findMunrollColumns(geojson);
    updateMunrollSelector(munrollColumns);

    // Load to map
    loadGeoJSON(geojson);
    updateStatus(`${sourceLabel}: ${summarizeLoad(geojson)}`, 'success');
}

// Update MunRoll selector
function updateMunrollSelector(columns) {
    const selector = document.getElementById('munrollSelector');
    selector.innerHTML = '<option value="">Select MunRoll Column</option>';

    columns.forEach(col => {
        const option = document.createElement('option');
        option.value = col;
        option.textContent = col;
        selector.appendChild(option);
    });

    if (columns.length > 0) {
        selector.disabled = false;
        // Auto-select first column
        selector.value = columns[0];
        selectedMunrollColumn = columns[0];
    } else {
        selector.disabled = true;
        selectedMunrollColumn = '';
    }
}

// Handle MunRoll column selection change
document.getElementById('munrollSelector').addEventListener('change', (e) => {
    selectedMunrollColumn = e.target.value;

    if (currentGeoJSON) {
        loadGeoJSON(currentGeoJSON);
        updateStatus(`Displaying polygons colored by ${selectedMunrollColumn || 'default'}`, 'success');
    }
});

// Handle bundled dataset selection
document.getElementById('datasetSelector').addEventListener('change', (e) => {
    const selectedFile = e.target.value;
    const dataset = sampleDatasets.find(d => d.file === selectedFile);

    if (dataset) {
        fetchAndLoadDataset(dataset.file, dataset.name);
    }
});

// Handle file input
document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (!file) {
        return;
    }

    updateStatus('Loading file...', '');

    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const geojson = JSON.parse(event.target.result);

            // Validate GeoJSON
            if (!geojson.type || !geojson.features) {
                throw new Error('Invalid GeoJSON format');
            }

            handleGeoJSONLoad(geojson, 'Custom upload');

        } catch (error) {
            updateStatus(`Error loading file: ${error.message}`, 'error');
            console.error('Error parsing GeoJSON:', error);
        }
    };

    reader.onerror = () => {
        updateStatus('Error reading file', 'error');
    };

    reader.readAsText(file);
});

// Initialize map on page load
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initDatasetSelector();

    // Load the first bundled dataset by default
    if (sampleDatasets.length > 0) {
        document.getElementById('datasetSelector').value = sampleDatasets[0].file;
        fetchAndLoadDataset(sampleDatasets[0].file, sampleDatasets[0].name);
    }
});
