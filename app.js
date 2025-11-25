// Global variables
let map;
let geojsonLayer;
let currentGeoJSON;
const munrollAddressField = 'MunRoll_Property Address';
const bundledGeojsonFiles = [
    'geo_part01.geojson',
    'geo_part02.geojson',
    'geo_part03.geojson'
];

// Initialize the map
function initMap() {
    map = L.map('map').setView([0, 0], 2);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

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
    const addressValue = feature.properties ? feature.properties[munrollAddressField] : undefined;
    const isMissingAddress = addressValue === undefined || addressValue === '' || isNAValue(addressValue);

    return {
        fillColor: isMissingAddress ? '#ff6b6b' : '#3388ff',
        weight: 2,
        opacity: 1,
        color: isMissingAddress ? '#cc0000' : '#0066cc',
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

function handleGeoJSONLoad(geojson) {
    currentGeoJSON = geojson;

    // Load to map
    loadGeoJSON(geojson);
}

async function loadBundledGeoJSON() {
    const loadedFeatures = [];
    const contentDiv = document.getElementById('attributeContent');
    contentDiv.innerHTML = '<p class="info-text">Loading bundled GeoJSON files...</p>';

    for (const filename of bundledGeojsonFiles) {
        try {
            const response = await fetch(filename);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename} (status ${response.status})`);
            }

            const geojson = await response.json();
            if (!Array.isArray(geojson.features)) {
                throw new Error(`${filename} is missing a features array`);
            }

            loadedFeatures.push(...geojson.features);
        } catch (error) {
            console.error('Error loading bundled GeoJSON:', error);
        }
    }

    if (loadedFeatures.length === 0) {
        const errorMessage = 'Unable to load bundled GeoJSON files.';
        contentDiv.innerHTML = `<p class="info-text">${errorMessage}</p>`;
        throw new Error(errorMessage);
    }

    const combinedGeojson = {
        type: 'FeatureCollection',
        features: loadedFeatures
    };

    contentDiv.innerHTML = '<p class="info-text">Click on a polygon to view its attributes</p>';
    handleGeoJSONLoad(combinedGeojson);
}

// Initialize map on page load
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadBundledGeoJSON();
});
