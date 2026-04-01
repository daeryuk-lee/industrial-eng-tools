import React, { useEffect, useState, useRef, useMemo, memo } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const MapPath = memo(({ d, fill, stroke, strokeWidth, onClick, id }) => (
  <path
    id={id}
    d={d}
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    vectorEffect="non-scaling-stroke"
    style={{ transition: 'fill 0.2s', cursor: 'pointer' }}
    onClick={onClick}
  />
));

const InteractiveMap = ({ highlightCode, mode, latlng, onZoneClick }) => {
  const [projectedFeatures, setProjectedFeatures] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const normalizeStr = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[-\s]/g, "");

  const project = (coords, currentMode) => {
    if (!coords) return [0, 0];
    if (currentMode === 'france') return [(coords[0] + 5) * 38 + 25, (51.2 - coords[1]) * 55 + 20];
    if (currentMode === 'usa') return [(coords[0] + 128) * 7, (49 - coords[1]) * 12];
    if (currentMode === 'south_korea') return [(coords[0] - 124) * 60 + 10, (39 - coords[1]) * 85 + 20];
    return [(coords[0] + 180) * (800 / 360), (90 - coords[1]) * (450 / 180)];
  };

  useEffect(() => {
    let url = '';
    if (mode === 'france') url = 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson';
    else if (mode === 'usa') url = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';
    else if (mode === 'south_korea') url = 'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_provinces_geo.json';
    else url = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson';
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
          let features = data.features;
          if (mode === 'south_korea') {
              features = [...features, {
                  type: "Feature",
                  properties: { name: "Dokdo", name_eng: "Dokdo", name_full: "독도", code: "dokdo" },
                  geometry: { type: "MultiPolygon", coordinates: [[[[131.85, 37.30], [132.05, 37.30], [132.05, 37.15], [131.85, 37.15], [131.85, 37.30]]]] }
              }];
          }

          // [초저지연 최적화] 모든 경로와 줌 데이터를 로드 시 1회 계산하여 메모리에 저장
          const processed = features.map(f => {
              let d = "";
              let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
              
              const updateBBox = (c) => {
                  const [px, py] = project(c, mode);
                  if (px < minX) minX = px; if (px > maxX) maxX = px;
                  if (py < minY) minY = py; if (py > maxY) maxY = py;
                  return `${Math.round(px*10)/10},${Math.round(py*10)/10}`;
              };

              if (f.geometry.type === 'Polygon') {
                  // Simplification légère des coordonnées pour la Corée uniquement si la forme est complexe
                  const coords = (mode === 'south_korea' && f.geometry.coordinates[0].length > 20) ? f.geometry.coordinates[0].filter((_, i) => i % 2 === 0) : f.geometry.coordinates[0];
                  d = `M ${coords.map(updateBBox).join(' L ')} Z`;
              } else {
                  d = f.geometry.coordinates.map(poly => {
                      const coords = (mode === 'south_korea' && poly[0].length > 20) ? poly[0].filter((_, i) => i % 2 === 0) : poly[0];
                      return `M ${coords.map(updateBBox).join(' L ')} Z`;
                  }).join(' ');
              }

              return { 
                  ...f, 
                  projectedPath: d, 
                  bbox: { x: minX, y: minY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 }
              };
          });
          setProjectedFeatures(processed);
      })
      .catch(e => console.error("Error", e));
  }, [mode]);

  useEffect(() => {
    if (highlightCode && projectedFeatures.length > 0) {
      const hNorm = normalizeStr(highlightCode);
      const isLocalMode = mode === 'france' || mode === 'south_korea';
      
      const feature = projectedFeatures.find(f => {
          const p = f.properties;
          return [p.code, p.ISO, p.ISO_A3, p.ISO_A3_EH, p.ADM0_A3, p.SOV_A3, p.cca3].some(c => c && String(c).toLowerCase() === highlightCode.toLowerCase()) ||
                 [p.name, p.NAME, p.NAME_1, p.name_eng, p.NL_NAME_1, p.NAME_FR, p.NAME_EN].some(n => n && normalizeStr(n) === hNorm);
      });

      if (feature && !isLocalMode) {
        const viewWidth = mode === 'usa' ? 600 : 800;
        const viewHeight = mode === 'usa' ? 350 : 450;
        let { cx, cy, w, h } = feature.bbox;
        
        // [Optimisation Kiribati/Antiméridien/NZ] Si le bbox est anormalement large, utiliser latlng
        if (w > viewWidth * 0.6 && latlng) {
            const [lat, lng] = latlng;
            const [px, py] = project([lng, lat], mode);
            cx = px; cy = py;
            w = 20; h = 20; // Forcer un zoom serré sur le point
        }

        // [미국 줌 최적화] 미국 퀴즈 배율 대폭 하향 (Max 2.0) pour dézoomer
        const scaleLimit = mode === 'usa' ? 2.0 : 8;
        const scale = Math.min(scaleLimit, Math.max(1.1, (viewHeight * 0.7) / Math.max(w, h)));
        
        setZoom(scale);
        setOffset({ x: (viewWidth / 2) - cx * scale, y: (viewHeight / 2) - cy * scale });
      } else if (!isLocalMode && latlng) {
        // [Fallback] Si le pays n'est pas trouvé par son polygone mais qu'on a des coordonnées
        const viewWidth = 800;
        const viewHeight = 450;
        const [lat, lng] = latlng;
        const [px, py] = project([lng, lat], mode);
        const scale = 5;
        setZoom(scale);
        setOffset({ x: (viewWidth / 2) - px * scale, y: (viewHeight / 2) - py * scale });
        } else {

        setZoom(1); setOffset({ x: 0, y: 0 });
      }
    } else {
      setZoom(1); setOffset({ x: 0, y: 0 });
    }
  }, [highlightCode, projectedFeatures, mode, latlng]);

  const viewBox = (mode === 'france' || mode === 'south_korea') ? "0 0 600 600" : mode === 'usa' ? "0 0 600 350" : "0 0 800 450";

  const renderedPaths = useMemo(() => {
    const hNorm = normalizeStr(highlightCode);
    return projectedFeatures.map((f, i) => {
      const p = f.properties;
      const isHighlighted = highlightCode && (
          [p.code, p.ISO, p.ISO_A3, p.ISO_A3_EH, p.ADM0_A3, p.SOV_A3, p.cca3].some(c => c && String(c).toLowerCase() === highlightCode.toLowerCase()) ||
          [p.name, p.NAME, p.NAME_1, p.name_eng, p.NL_NAME_1, p.NAME_FR, p.NAME_EN].some(n => n && normalizeStr(n) === hNorm) ||
          (p.code === 'dokdo' && highlightCode === '경상북도')
      );

      return (
        <MapPath
          key={`${mode}-${i}`}
          d={f.projectedPath}
          fill={isHighlighted ? 'var(--primary)' : '#e2e8f0'}
          stroke="#1e293b"
          strokeWidth={isHighlighted ? 2 : 1}
          onClick={() => onZoneClick && onZoneClick(p)}
        />
      );
    });
  }, [projectedFeatures, highlightCode, mode]);

  return (
    <div className="w-full h-full bg-blue-50 rounded-xl overflow-hidden shadow-inner relative">
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full touch-none"
        onMouseDown={(e) => { if(zoom > 1) { setIsDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); }}}
        onMouseMove={(e) => { if(isDragging) setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
          {renderedPaths}
          {highlightCode && latlng && (mode === 'islands' || (mode !== 'france' && mode !== 'south_korea' && mode !== 'usa')) && (
              <g className="pointer-events-none">
                  {(() => {
                      const [lat, lng] = latlng;
                      const [px, py] = project([lng, lat], mode);
                      return (
                          <>
                            <circle cx={px} cy={py} r={3 / zoom} fill="red" stroke="white" strokeWidth={1 / zoom} />
                            <circle cx={px} cy={py} r={6 / zoom} fill="rgba(255,0,0,0.3)" className="animate-ping" />
                          </>
                      );
                  })()}
              </g>
          )}
        </g>
      </svg>
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button onClick={() => setZoom(z => Math.min(z * 1.2, 10))} className="btn-icon bg-white/80 p-2 rounded-full shadow hover:bg-white"><ZoomIn size={20} /></button>
        <button onClick={() => setZoom(z => Math.max(z / 1.2, 0.5))} className="btn-icon bg-white/80 p-2 rounded-full shadow hover:bg-white"><ZoomOut size={20} /></button>
        <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} className="btn-icon bg-white/80 p-2 rounded-full shadow hover:bg-white"><Maximize size={20} /></button>
      </div>
    </div>
  );
};

export default InteractiveMap;
