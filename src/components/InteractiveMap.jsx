import React, { useEffect, useState } from 'react';

const InteractiveMap = ({ highlightCode, mode }) => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    // Charger une carte simplifiée (TopoJSON/GeoJSON léger)
    const url = mode === 'france' 
      ? 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson'
      : 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
    
    fetch(url)
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(e => console.error("Erreur chargement carte", e));
  }, [mode]);

  if (!geoData) return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌍 Chargement...</div>;

  // Calcul simple de projection pour SVG (Mercator simplifiée)
  const project = (coords) => {
    if (mode === 'france') {
      // Ajustement pour la France
      return [(coords[0] + 5) * 40, (52 - coords[1]) * 60];
    }
    // Monde
    return [(coords[0] + 180) * (800 / 360), (90 - coords[1]) * (450 / 180)];
  };

  return (
    <div style={{ background: '#e2e8f0', borderRadius: '12px', padding: '10px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)' }}>
      <svg viewBox={mode === 'france' ? "0 0 600 600" : "0 0 800 450"} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {geoData.features.map((feature, i) => {
          const id = feature.id || feature.properties.code || feature.properties.iso_a3;
          const isHighlighted = highlightCode && (
            id === highlightCode || 
            feature.properties.iso_a3 === highlightCode || 
            feature.properties.code === highlightCode
          );

          return (
            <path
              key={i}
              d={renderPath(feature.geometry, project)}
              fill={isHighlighted ? 'var(--primary)' : '#cbd5e1'}
              stroke="#f8fafc"
              strokeWidth={isHighlighted ? "1.5" : "0.5"}
              style={{ transition: 'fill 0.3s' }}
            />
          );
        })}
      </svg>
    </div>
  );
};

// Fonction utilitaire pour dessiner les chemins GeoJSON
const renderPath = (geometry, project) => {
  if (!geometry) return "";
  const renderPolygon = (coords) => {
    return "M" + coords.map(c => project(c).join(",")).join("L") + "Z";
  };

  if (geometry.type === "Polygon") {
    return renderPolygon(geometry.coordinates[0]);
  } else if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map(poly => renderPolygon(poly[0])).join(" ");
  }
  return "";
};

export default InteractiveMap;
