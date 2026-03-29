import React, { useEffect, useState, useRef, useMemo, memo } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

// Memoized Path component to prevent unnecessary re-renders of all paths
const MapPath = memo(({ d, fill, stroke, strokeWidth, isHighlighted }) => (
  <path
    d={d}
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    vectorEffect="non-scaling-stroke"
    style={{ 
        transition: 'fill 0.2s, stroke 0.2s',
        pointerEvents: 'none'
    }}
  />
));

const InteractiveMap = ({ highlightCode, mode, latlng }) => {
  const [geoData, setGeoData] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      // Use requestAnimationFrame for smoother dragging performance
      window.requestAnimationFrame(() => {
          setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
          });
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    let url = '';
    if (mode === 'france') {
      url = 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson';
    } else if (mode === 'usa') {
      url = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';
    } else if (mode === 'south_korea') {
      url = 'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_provinces_geo.json';
    } else if (mode === 'cameroon') {
      url = 'https://code.highcharts.com/mapdata/countries/cm/cm-all.geo.json';
    } else {
      url = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson';
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
          if (mode === 'south_korea') {
              const dokdo = {
                  type: "Feature",
                  properties: { name: "독도", name_eng: "Dokdo", name_full: "독도", code: "경상북도" },
                  geometry: {
                      type: "MultiPolygon",
                      coordinates: [[[[131.8, 37.3], [131.9, 37.3], [131.9, 37.2], [131.8, 37.2], [131.8, 37.3]]]]
                  }
              };
              data.features.push(dokdo);
              data.features.sort((a, b) => {
                  const nameA = a.properties.name || "";
                  const nameB = b.properties.name || "";
                  const isCityA = nameA.includes('시') || nameA.includes('특별시') || nameA.includes('광역시');
                  const isCityB = nameB.includes('시') || nameB.includes('특별시') || nameB.includes('광역시');
                  if (isCityA && !isCityB) return 1;
                  if (!isCityA && isCityB) return -1;
                  return 0;
              });
          }
          setGeoData(data);
      })
      .catch(e => console.error("Erreur chargement carte", e));
  }, [mode]);

  useEffect(() => {
    if (highlightCode && geoData && svgRef.current) {
      setTimeout(() => {
        const hNorm = highlightCode.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[-\s]/g, "");
        
        const element = Array.from(svgRef.current.querySelectorAll('path')).find(path => {
            const featureIdx = path.id?.split('-')[1];
            if (featureIdx === undefined || !geoData.features[featureIdx]) return false;
            const props = geoData.features[featureIdx].properties;
            const name = (props.name || props.NAME || props.NAME_1 || props.NAME_ENG || props.name_eng || props.name_2 || props.shapeName || props.SHAPENAME || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[-\s]/g, "");
            return name === hNorm || props.code === highlightCode || props.ISO === highlightCode || props.ISO_A3 === highlightCode || props.cca3 === highlightCode || props.NAME_1 === highlightCode || props.name_eng === highlightCode;
        });

        const viewWidth = (mode === 'france' || mode === 'south_korea' || mode === 'cameroon') ? 600 : mode === 'usa' ? 600 : 800;
        const viewHeight = (mode === 'france' || mode === 'south_korea' || mode === 'cameroon') ? 600 : mode === 'usa' ? 350 : 450;

        if (element) {
          const bbox = element.getBBox();
          const centerX = bbox.x + bbox.width / 2;
          const centerY = bbox.y + bbox.height / 2;
          
          const isSmall = bbox.width < 30 && bbox.height < 30;
          const scale = isSmall ? 15 : Math.min(25, Math.max(2, 400 / Math.max(bbox.width, bbox.height)));
          
          setZoom(scale);
          setOffset({
            x: (viewWidth / 2) - centerX * scale,
            y: (viewHeight / 2) - centerY * scale
          });
        } else if (latlng) {
            const [lat, lng] = latlng;
            const [projX, projY] = project([lng, lat]);
            setZoom(15);
            setOffset({
                x: (viewWidth / 2) - projX * 15,
                y: (viewHeight / 2) - projY * 15
            });
        }
      }, 100);
    } else if (!highlightCode) {
      resetZoom();
    }
  }, [highlightCode, geoData, mode, latlng]);

  const resetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const project = (coords) => {
    if (mode === 'france') return [(coords[0] + 5) * 40, (52 - coords[1]) * 60];
    if (mode === 'usa') return [(coords[0] + 130) * 6, (50 - coords[1]) * 8];
    if (mode === 'south_korea') return [(coords[0] - 124) * 65, (39.5 - coords[1]) * 90];
    if (mode === 'cameroon') {
        if (coords[0] > 180) return [(coords[0] - 2800) * 0.15, (3800 - coords[1]) * 0.12];
        return [(coords[0] - 8) * 60, (14 - coords[1]) * 45];
    }
    return [(coords[0] + 180) * (800 / 360), (90 - coords[1]) * (450 / 180)];
  };

  const viewBox = (mode === 'france' || mode === 'south_korea' || mode === 'cameroon') ? "0 0 600 600" : mode === 'usa' ? "0 0 600 350" : "0 0 800 450";

  const indicatorPos = useMemo(() => {
      if (!highlightCode || !geoData) return null;
      const isWorldMode = mode === 'flags' || mode === 'capitals' || mode === 'islands';
      if (isWorldMode && latlng) {
          const [projX, projY] = project([latlng[1], latlng[0]]);
          return { x: projX, y: projY };
      }
      return null;
  }, [highlightCode, geoData, mode, latlng]);

  const renderedPaths = useMemo(() => {
      if (!geoData) return null;
      return geoData.features.map((feature, i) => {
          const props = feature.properties;
          const name = props.name || props.NAME || props.NAME_1 || props.NAME_ENG || props.name_eng || props.name_2 || props.shapeName || props.SHAPENAME || "";
          const hNorm = (highlightCode || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[-\s]/g, "");
          const pNorm = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[-\s]/g, "");
          
          const isHighlighted = highlightCode && (
            pNorm === hNorm || 
            props.code === highlightCode || 
            props.ISO === highlightCode ||
            props.ISO_A3 === highlightCode ||
            props.cca3 === highlightCode ||
            props.NAME_1 === highlightCode ||
            props.name_eng === highlightCode
          );

          return (
            <path
              key={`${mode}-${i}`}
              id={`path-${i}`}
              d={renderPath(feature.geometry, project)}
              fill={isHighlighted ? 'var(--primary)' : 'var(--map-base)'}
              stroke={isHighlighted ? "#fff" : "var(--map-stroke)"}
              strokeWidth={isHighlighted ? 1.5 : 0.3}
              vectorEffect="non-scaling-stroke"
              style={{ pointerEvents: 'none' }}
            />
          );
      });
  }, [geoData, highlightCode, mode]);

  if (!geoData) return <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>🌍 Chargement de la carte...</div>;

  return (
    <div style={{ position: 'relative', background: 'var(--bg-app)', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--border)' }}>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .indicator-ring {
          animation: pulse-ring 2s infinite;
        }
      `}</style>
      <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
        <button onClick={() => setZoom(z => Math.min(z + 0.5, 30))} className="btn" style={{ padding: '8px', background: 'var(--bg-card)' }}><ZoomIn size={18} /></button>
        <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="btn" style={{ padding: '8px', background: 'var(--bg-card)' }}><ZoomOut size={18} /></button>
        <button onClick={resetZoom} className="btn" style={{ padding: '8px', background: 'var(--bg-card)' }}><Maximize size={18} /></button>
      </div>

      <svg 
        ref={svgRef}
        viewBox={viewBox} 
        style={{ width: '100%', height: '400px', cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default', touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`} style={{ transition: isDragging ? 'none' : 'transform 0.3s ease-out', willChange: 'transform' }}>
          {renderedPaths}
          
          {indicatorPos && (
              <g transform={`translate(${indicatorPos.x}, ${indicatorPos.y})`}>
                  <circle r={10 / zoom} className="indicator-ring" fill="var(--primary)" />
                  <circle r={4 / zoom} fill="var(--primary)" stroke="#fff" strokeWidth={1 / zoom} />
              </g>
          )}
        </g>
      </svg>
    </div>
  );
};

const renderPath = (geometry, project) => {
  if (!geometry) return "";
  const renderPolygon = (coords) => {
    if (!coords || coords.length === 0) return "";
    const points = Array.isArray(coords[0][0]) ? coords[0] : coords;
    // Round coordinates to 1 decimal place to reduce SVG path string size and improve performance
    return "M" + points.map(c => project(c).map(v => Math.round(v * 10) / 10).join(",")).join("L") + "Z";
  };
  if (geometry.type === "Polygon") return renderPolygon(geometry.coordinates);
  if (geometry.type === "MultiPolygon") return geometry.coordinates.map(poly => renderPolygon(poly)).join(" ");
  return "";
};

export default InteractiveMap;
