# RebelGIS - Polygon Viewer

A JavaScript-based WebGIS application for visualizing and analyzing polygon data with special highlighting for records containing #N/A values.

## Features

- 📍 Interactive map visualization using Leaflet.js
- 🗺️ Load and display GeoJSON polygon data
- 🎨 Automatic color coding for polygons with #N/A values
- 📊 View detailed attributes for each polygon
- 🔍 Filter by MunRoll columns (automatically detected)
- 💡 Hover effects and click interactions
- 📱 Responsive design for mobile and desktop

## How to Use

### 1. Open the Application

Simply open `index.html` in a web browser. You can:
- Double-click the file in your file explorer
- Or use a local server (recommended):
  ```bash
  python -m http.server 8000
  # Then visit http://localhost:8000
  ```

### 2. Load Your GeoJSON Data

1. Click the "Load GeoJSON File" button
2. Select your `.geojson` or `.json` file
3. The map will automatically display your polygons

### 3. View Attributes

- **Click** on any polygon to see its attributes in the sidebar
- A popup will also appear on the map with key properties
- All attributes are displayed in a scrollable panel

### 4. Filter by MunRoll Columns

- The application automatically detects columns starting with "MunRoll"
- Use the dropdown to select which MunRoll column to analyze
- Polygons with **#N/A** values will be colored **red**
- Normal polygons will be colored **blue**

## Color Coding

| Color | Meaning |
|-------|---------|
| 🔵 Blue | Normal polygon (no #N/A values) |
| 🔴 Red | Polygon with #N/A value in selected MunRoll column |

## Sample Data

A sample GeoJSON file (`sample_data.geojson`) is included for testing. It contains:
- 6 sample polygons
- 2 MunRoll columns (MunRoll_2020, MunRoll_2021)
- Several records with #N/A values
- Additional attributes (population, area)

## File Structure

```
rebelgis/
├── index.html          # Main HTML file
├── app.js              # JavaScript application logic
├── styles.css          # Styling and layout
├── sample_data.geojson # Sample data for testing
└── README.md           # This file
```

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for loading Leaflet.js and map tiles)
- GeoJSON file with polygon data

## GeoJSON Format

Your GeoJSON file should follow this structure:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "MunRoll_2020": "12345",
        "other_attribute": "value"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[lon, lat], [lon, lat], ...]]
      }
    }
  ]
}
```

## Technologies Used

- [Leaflet.js](https://leafletjs.com/) - Interactive mapping library
- [OpenStreetMap](https://www.openstreetmap.org/) - Base map tiles
- Vanilla JavaScript (ES6+)
- HTML5 & CSS3

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT
