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

### 2. Browse the Built-In Data

The app automatically loads the bundled sample files (`geo_part01.geojson`, `geo_part02.geojson`, `geo_part03.geojson`).
Once they finish loading, pan and zoom the map or click on any polygon to view its attributes in the sidebar.

## Color Coding

| Color | Meaning |
|-------|---------|
| 🔵 Blue | Normal polygon (no #N/A values) |
| 🔴 Red | Polygon with #N/A value in selected MunRoll column |

## Sample Data

Three GeoJSON files (`geo_part01.geojson`, `geo_part02.geojson`, `geo_part03.geojson`) are bundled for testing. They combine
into a single dataset when the app loads so you can explore the entire sample at once.

## File Structure

```
rebelgis/
├── index.html          # Main HTML file
├── app.js              # JavaScript application logic
├── styles.css          # Styling and layout
├── geo_part01.geojson  # Sample data (part 1)
├── geo_part02.geojson  # Sample data (part 2)
├── geo_part03.geojson  # Sample data (part 3)
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
