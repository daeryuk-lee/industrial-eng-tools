import React, { useEffect, useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const InteractiveMap = ({ highlightCode, mode }) => {
  const [geoData, setGeoData] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

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

  // Auto-zoom lorsqu'un code change
  useEffect(() => {
    if (highlightCode && geoData && svgRef.current) {
      // Attendre un court instant que le rendu soit stable
      setTimeout(() => {
        const element = document.getElementById(`path-${highlightCode}`);
        if (element) {
          const bbox = element.getBBox();
          const svgBBox = svgRef.current.getBBox();
          
          // Calculer le centre et le facteur de zoom
          const centerX = bbox.x + bbox.width / 2;
          const centerY = bbox.y + bbox.height / 2;
          
          // Zoom adaptatif selon la taille de l'élément
          const scale = Math.min(4, Math.max(1.5, 300 / Math.max(bbox.width, bbox.height)));
          
          setZoom(scale);
          // Le décalage doit tenir compte de la viewBox
          const viewWidth = mode === 'france' ? 600 : mode === 'usa' ? 600 : 800;
          const viewHeight = mode === 'france' ? 600 : mode === 'usa' ? 350 : 450;
          
          setOffset({
            x: (viewWidth / 2) - centerX * scale,
            y: (viewHeight / 2) - centerY * scale
          });
        }
      }, 100);
    } else {
      resetZoom();
    }
  }, [highlightCode, geoData, mode]);

  const resetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  if (!geoData) return <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>🌍 Chargement de la carte...</div>;

  const project = (coords) => {
    if (mode === 'france') return [(coords[0] + 5) * 40, (52 - coords[1]) * 60];
    if (mode === 'usa') return [(coords[0] + 130) * 6, (50 - coords[1]) * 8];
    return [(coords[0] + 180) * (800 / 360), (90 - coords[1]) * (450 / 180)];
  };

  const viewBox = mode === 'france' ? "0 0 600 600" : mode === 'usa' ? "0 0 600 350" : "0 0 800 450";

  return (
    <div style={{ position: 'relative', background: '#f1f5f9', borderRadius: '16px', overflow: 'hidden', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.05)', border: '2px solid #e2e8f0' }}>
      {/* Contrôles de zoom */}
      <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
        <button onClick={() => setZoom(z => Math.min(z + 0.5, 8))} className="btn" style={{ padding: '8px', background: 'white', border: '1px solid #ddd', boxShadow: 'var(--shadow)' }}><ZoomIn size={18} /></button>
        <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="btn" style={{ padding: '8px', background: 'white', border: '1px solid #ddd', boxShadow: 'var(--shadow)' }}><ZoomOut size={18} /></button>
        <button onClick={resetZoom} className="btn" style={{ padding: '8px', background: 'white', border: '1px solid #ddd', boxShadow: 'var(--shadow)' }}><Maximize size={18} /></button>
      </div>

      <svg 
        ref={svgRef}
        viewBox={viewBox} 
        style={{ width: '100%', height: '400px', cursor: 'grab' }}
      >
        <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`} style={{ transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          {geoData.features.map((feature, i) => {
            const props = feature.properties;
            const id = feature.id || props.code || props.iso_a3 || props.name;
            const isHighlighted = highlightCode && (
              id === highlightCode || 
              props.iso_a3 === highlightCode || 
              props.code === highlightCode ||
              props.name === highlightCode
            );

            return (
              <path
                key={i}
                id={`path-${id}`}
                d={renderPath(feature.geometry, project)}
                fill={isHighlighted ? 'var(--primary)' : '#cbd5e1'}
                stroke={isHighlighted ? "#fff" : "#f8fafc"}
                strokeWidth={isHighlighted ? (2 / zoom) : (0.5 / zoom)}
                style={{ transition: 'fill 0.3s, stroke-width 0.3s' }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

const renderPath = (geometry, project) => {
  if (!geometry) return "";
  const renderPolygon = (coords) => {
    const points = Array.isArray(coords[0][0]) ? coords[0] : coords;
    return "M" + points.map(c => project(c).join(",")).join("L") + "Z";
  };
  if (geometry.type === "Polygon") return renderPolygon(geometry.coordinates);
  if (geometry.type === "MultiPolygon") return geometry.coordinates.map(poly => renderPolygon(poly)).join(" ");
  return "";
};

export default InteractiveMap;
