import React, { useEffect, useState } from 'react';

const InteractiveMap = ({ highlightCode, mode }) => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    let url = '';
    if (mode === 'france') {
      url = 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson';
    } else if (mode === 'usa') {
      url = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';
    } else {
      url = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(e => console.error("Erreur chargement carte", e));
  }, [mode]);

  if (!geoData) return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌍 Chargement...</div>;

  const project = (coords) => {
    if (mode === 'france') {
      return [(coords[0] + 5) * 40, (52 - coords[1]) * 60];
    }
    if (mode === 'usa') {
      // Ajustement pour les USA
      return [(coords[0] + 130) * 6, (50 - coords[1]) * 8];
    }
    return [(coords[0] + 180) * (800 / 360), (90 - coords[1]) * (450 / 180)];
  };

  return (
    <div style={{ background: '#e2e8f0', borderRadius: '12px', padding: '10px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)' }}>
      <svg viewBox={mode === 'france' ? "0 0 600 600" : mode === 'usa' ? "0 0 600 350" : "0 0 800 450"} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {geoData.features.map((feature, i) => {
          const props = feature.properties;
          const id = feature.id || props.code || props.iso_a3 || props.name;
          
          // Logique de correspondance flexible
          const isHighlighted = highlightCode && (
            id === highlightCode || 
            props.iso_a3 === highlightCode || 
            props.code === highlightCode ||
            props.name === highlightCode
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

const renderPath = (geometry, project) => {
  if (!geometry) return "";
  
  const renderPolygon = (coords) => {
    // Gestion des GeoJSON qui imbriquent parfois différemment les coordonnées
    const points = Array.isArray(coords[0][0]) ? coords[0] : coords;
    return "M" + points.map(c => project(c).join(",")).join("L") + "Z";
  };

  if (geometry.type === "Polygon") {
    return renderPolygon(geometry.coordinates);
  } else if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map(poly => renderPolygon(poly)).join(" ");
  }
  return "";
};

export default InteractiveMap;
