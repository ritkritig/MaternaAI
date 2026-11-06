import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip as LeafletTooltip } from 'react-leaflet';
import {
  MapPin,
  Layers,
  Info,
  TrendingUp,
  AlertCircle,
  Building,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { fetchMapGeoJSON, fetchMapIndicators, fetchDistrictMapDetail } from '../services/api';

export const MapPage: React.FC = () => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [stateIndicators, setStateIndicators] = useState<any[]>([]);
  const [nationalMean, setNationalMean] = useState<number>(0);
  const [selectedIndicator, setSelectedIndicator] = useState<string>('anc4_or_more_pct');
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [districtDetail, setDistrictDetail] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const indicators = [
    { key: 'anc4_or_more_pct', label: 'Full Antenatal Care (4+ Visits)' },
    { key: 'institutional_delivery_pct', label: 'Institutional Delivery Rate' },
    { key: 'skilled_birth_attendance_pct', label: 'Skilled Birth Attendance' },
    { key: 'postnatal_care_pct', label: 'Postnatal Care within 48h' },
    { key: 'ifa_100_days_pct', label: 'Iron Folic Acid (100+ Days)' },
  ];

  useEffect(() => {
    loadMapData();
  }, [selectedIndicator]);

  useEffect(() => {
    if (selectedState) {
      loadStateDistrictDetails(selectedState);
    }
  }, [selectedState]);

  const loadMapData = async () => {
    try {
      setLoading(true);
      const [geo, indData] = await Promise.all([
        fetchMapGeoJSON(),
        fetchMapIndicators(selectedIndicator),
      ]);
      setGeoJsonData(geo);
      setStateIndicators(indData.states || []);
      setNationalMean(indData.national_mean || 0);
    } catch (err) {
      console.error('Failed to load map data', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStateDistrictDetails = async (stateName: string) => {
    try {
      setLoadingDetail(true);
      const detail = await fetchDistrictMapDetail(stateName);
      setDistrictDetail(detail);
    } catch (err) {
      console.error('Failed to load district details', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Color ramp based on coverage percentage:
  // >= 80%: Forest Green (#174C3C)
  // 65% - 79.9%: Forest Light (#236551)
  // 50% - 64.9%: Sage Dark (#85A992)
  // 40% - 49.9%: Lavender Dark (#978AC2)
  // < 40%: Soft Coral (#E88D7D)
  const getColor = (value: number) => {
    if (value >= 80) return '#174C3C';
    if (value >= 65) return '#236551';
    if (value >= 50) return '#85A992';
    if (value >= 40) return '#978AC2';
    return '#E88D7D';
  };

  const styleFeature = (feature: any) => {
    const stateName = feature.properties.name;
    const item = stateIndicators.find(
      (s) => s.state_name.toLowerCase() === stateName.toLowerCase()
    );
    const val = item ? item.value : 50;
    const isSelected = selectedState.toLowerCase() === stateName.toLowerCase();

    return {
      fillColor: getColor(val),
      weight: isSelected ? 3 : 1.5,
      opacity: 1,
      color: isSelected ? '#E88D7D' : '#FFFFFF',
      fillOpacity: isSelected ? 0.85 : 0.65,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const stateName = feature.properties.name;
    const item = stateIndicators.find(
      (s) => s.state_name.toLowerCase() === stateName.toLowerCase()
    );
    const val = item ? `${item.value}%` : 'N/A';

    layer.bindTooltip(
      `<strong>${stateName}</strong><br/>${val} (Coverage)`,
      { sticky: true, className: 'leaflet-tooltip-custom' }
    );

    layer.on({
      click: () => {
        setSelectedState(stateName);
      },
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.9, weight: 2 });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.65, weight: 1.5 });
      },
    });
  };

  const selectedStateItem = stateIndicators.find(
    (s) => s.state_name.toLowerCase() === selectedState.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-sage/20 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-forest-dark">
            Geospatial Healthcare Coverage Map
          </h2>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Choropleth mapping of maternal healthcare access across 36 Indian States &amp; UTs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs">
            <Layers className="w-3.5 h-3.5 text-forest" />
            <span className="font-medium text-charcoal">Map Indicator:</span>
            <select
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
              className="bg-warmIvory border border-sage/30 rounded-lg px-3 py-1.5 text-xs text-forest-dark font-medium focus:outline-none focus:ring-1 focus:ring-forest"
            >
              {indicators.map((ind) => (
                <option key={ind.key} value={ind.key}>
                  {ind.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs bg-forest-50 px-3 py-1.5 rounded-lg border border-sage/30 text-forest font-semibold">
            National Mean: {nationalMean}%
          </div>
        </div>
      </div>

      {/* Map + Detail Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-sage/20 shadow-subtle flex flex-col">
          <div className="relative h-[550px] w-full rounded-xl overflow-hidden border border-sage/20">
            {loading ? (
              <div className="h-full flex items-center justify-center bg-warmIvory text-charcoal-muted text-sm">
                Loading India Geospatial Data...
              </div>
            ) : (
              geoJsonData && (
                <MapContainer
                  center={[22.5, 82.5]}
                  zoom={4}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <GeoJSON
                    key={`${selectedIndicator}-${selectedState}`}
                    data={geoJsonData}
                    style={styleFeature}
                    onEachFeature={onEachFeature}
                  />
                </MapContainer>
              )
            )}

            {/* Map Legend */}
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-sage/30 shadow-card text-[11px] space-y-1.5 z-[1000]">
              <div className="font-heading font-bold text-forest-dark">Coverage %</div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: '#174C3C' }} />
                <span>80% – 100% (High)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: '#236551' }} />
                <span>65% – 79.9%</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: '#85A992' }} />
                <span>50% – 64.9% (Moderate)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: '#978AC2' }} />
                <span>40% – 49.9% (Vulnerable)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: '#E88D7D' }} />
                <span>&lt; 40% (Critical)</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-charcoal-muted px-1">
            <span>Click any state polygon to inspect district-level indicators.</span>
            <span>Geographical Resolution: State polygons + NFHS-5 District Aggregates</span>
          </div>
        </div>

        {/* Selected State & District Detail Panel */}
        <div className="bg-white p-6 rounded-2xl border border-sage/20 shadow-subtle flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-sage/20 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-forest tracking-wider">
                  Selected State
                </span>
                <h3 className="text-2xl font-heading font-extrabold text-forest-dark">
                  {selectedState}
                </h3>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  Reported {districtDetail?.total_districts || 0} administrative districts
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-forest-50 text-forest">
                <MapPin className="w-5 h-5" />
              </div>
            </div>

            {/* State Averages Card */}
            {selectedStateItem && (
              <div className="p-4 rounded-xl bg-warmIvory/80 border border-sage/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-charcoal">
                    {indicators.find((i) => i.key === selectedIndicator)?.label}
                  </span>
                  <span className="text-base font-heading font-bold text-forest-dark">
                    {selectedStateItem.value}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-charcoal-muted">
                  <span>Delta from National Mean:</span>
                  <span
                    className={`font-semibold ${
                      selectedStateItem.value >= nationalMean ? 'text-emerald-700' : 'text-coral'
                    }`}
                  >
                    {selectedStateItem.value >= nationalMean ? '+' : ''}
                    {(selectedStateItem.value - nationalMean).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* Districts List inside Selected State */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-heading font-bold text-forest-dark">
                <span>Districts ({districtDetail?.districts?.length || 0})</span>
                <span className="text-[10px] text-charcoal-muted font-normal">ANC4 / Delivery %</span>
              </div>

              {loadingDetail ? (
                <div className="text-center py-8 text-xs text-charcoal-muted">Loading districts...</div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {districtDetail?.districts?.slice(0, 15).map((d: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-warmIvory/50 hover:bg-forest-50/50 border border-sage/10 text-xs flex items-center justify-between transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-forest-dark block">{d.district_name}</span>
                        <span className="text-[10px] text-charcoal-muted">ID: {d.district_id}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-forest block">{d.anc4_or_more_pct}% ANC</span>
                        <span className="text-[10px] text-charcoal-muted">{d.institutional_delivery_pct}% Inst.</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Data Provenance Stamp */}
          <div className="p-3 bg-forest-50/70 rounded-xl border border-sage/20 text-[11px] text-charcoal-muted space-y-1">
            <div className="flex items-center space-x-1.5 text-forest font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
              <span>Geospatial Resolution &amp; Provenance</span>
            </div>
            <div>
              State/UT level boundary polygons mapped. District indicators displayed per selected state from active dataset.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
