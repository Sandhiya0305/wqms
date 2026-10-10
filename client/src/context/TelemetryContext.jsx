import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const TelemetryContext = createContext(null);

export function TelemetryProvider({ children }) {
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState('STATION_RIVER_01');
  const [latestTelemetry, setLatestTelemetry] = useState({});
  const [stationHistories, setStationHistories] = useState({});
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [riskScores, setRiskScores] = useState([]);
  const [simulationStatus, setSimulationStatus] = useState({ isRunning: true, playbackSpeed: 1, activeScenarios: [] });
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Fetch initial REST data
  const fetchInitialData = useCallback(async () => {
    try {
      const [stRes, telRes, alRes, riskRes, simRes] = await Promise.all([
        fetch('/api/v1/stations').then(r => r.json()),
        fetch('/api/v1/telemetry/latest').then(r => r.json()),
        fetch('/api/v1/alerts?active=true').then(r => r.json()),
        fetch('/api/v1/risk').then(r => r.json()),
        fetch('/api/v1/simulation/status').then(r => r.json())
      ]);

      if (stRes.success) setStations(stRes.data);
      
      if (telRes.success) {
        const telMap = {};
        telRes.data.forEach(t => { telMap[t.station_id] = t; });
        setLatestTelemetry(telMap);
      }

      if (alRes.success) setActiveAlerts(alRes.data);
      if (riskRes.success) setRiskScores(riskRes.data);
      if (simRes.success) setSimulationStatus(simRes.data);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  }, []);

  // Fetch history for selected station
  const fetchStationHistory = useCallback(async (stationId, limit = 50) => {
    try {
      const res = await fetch(`/api/v1/stations/${stationId}/history?limit=${limit}`);
      const json = await res.json();
      if (json.success) {
        setStationHistories(prev => ({
          ...prev,
          [stationId]: json.data
        }));
      }
    } catch (err) {
      console.error(`Error loading history for ${stationId}:`, err);
    }
  }, []);

  // WebSocket Connection
  useEffect(() => {
    fetchInitialData();

    function connectWebSocket() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('[WebSocket] Connected to AquaIntel Stream');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'INITIAL_SNAPSHOT') {
            if (msg.data.stations) setStations(msg.data.stations);
            if (msg.data.latestTelemetry) {
              const telMap = {};
              msg.data.latestTelemetry.forEach(t => { telMap[t.station_id] = t; });
              setLatestTelemetry(telMap);
            }
            if (msg.data.activeAlerts) setActiveAlerts(msg.data.activeAlerts);
            if (msg.data.riskScores) setRiskScores(msg.data.riskScores);
          }

          if (msg.type === 'TELEMETRY_UPDATE') {
            const { reading, wqi, risk } = msg.data;
            const stId = reading.station_id;

            setLatestTelemetry(prev => ({
              ...prev,
              [stId]: reading
            }));

            // Append to local history for real-time chart scrolling
            setStationHistories(prev => {
              const currentHistory = prev[stId] || [];
              const updated = [...currentHistory, reading].slice(-60);
              return { ...prev, [stId]: updated };
            });

            // Update risk score
            if (risk) {
              setRiskScores(prev => {
                const idx = prev.findIndex(r => r.station_id === stId);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], ...risk };
                  return updated;
                }
                return [...prev, risk];
              });
            }

            setLastUpdated(new Date());
          }

          if (msg.type === 'ALERT_RAISED') {
            setActiveAlerts(prev => [msg.data, ...prev.filter(a => a.id !== msg.data.id)]);
          }

          if (msg.type === 'SIMULATION_STATUS') {
            setSimulationStatus(msg.data);
          }
        } catch (err) {
          console.error('[WebSocket] Parse error:', err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        console.log('[WebSocket] Disconnected. Retrying in 3 seconds...');
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (err) => {
        ws.close();
      };
    }

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [fetchInitialData]);

  // Load history whenever selected station changes
  useEffect(() => {
    if (selectedStationId) {
      fetchStationHistory(selectedStationId, 50);
    }
  }, [selectedStationId, fetchStationHistory]);

  // Actions
  const acknowledgeAlert = async (alertId) => {
    try {
      await fetch(`/api/v1/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledged_by: 'Control Room Officer' })
      });
      setActiveAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a));
    } catch (e) {
      console.error(e);
    }
  };

  const resolveAlert = async (alertId, notes) => {
    try {
      await fetch(`/api/v1/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution_notes: notes || 'Verified and rectified by field operations.', resolved_by: 'Operator #41' })
      });
      setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSimulation = async () => {
    const endpoint = simulationStatus.isRunning ? '/api/v1/simulation/stop' : '/api/v1/simulation/start';
    const res = await fetch(endpoint, { method: 'POST' }).then(r => r.json());
    if (res.success) setSimulationStatus(res.data);
  };

  const setSimulationSpeed = async (multiplier) => {
    const res = await fetch('/api/v1/simulation/speed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ multiplier })
    }).then(r => r.json());
    if (res.success) setSimulationStatus(res.data);
  };

  const triggerScenario = async (scenario) => {
    const res = await fetch('/api/v1/simulation/inject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    }).then(r => r.json());
    if (res.success) setSimulationStatus(res.data);
  };

  const submitCitizenReport = async (reportData) => {
    const res = await fetch('/api/v1/citizen/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    return res.json();
  };

  return (
    <TelemetryContext.Provider value={{
      stations,
      selectedStationId,
      setSelectedStationId,
      latestTelemetry,
      stationHistories,
      activeAlerts,
      riskScores,
      simulationStatus,
      connected,
      lastUpdated,
      acknowledgeAlert,
      resolveAlert,
      toggleSimulation,
      setSimulationSpeed,
      triggerScenario,
      submitCitizenReport,
      fetchStationHistory
    }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error('useTelemetry must be used within a TelemetryProvider');
  return ctx;
}
