// src/pages/worker/WorkerMapView.jsx
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext";
import { useWorkerTasks } from "../../hooks/useWorkerTasks";
import { FaDirections } from "react-icons/fa";

const STATUS_COLORS = {
  assigned: "#3B82F6",
  in_progress: "#F97316",
  done: "#22C55E",
};

// Component to fly the map to the worker's GPS position
function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

export default function WorkerMapView() {
  const { user } = useAuth();
  const { tasks, loading } = useWorkerTasks(user?.uid);
  const [workerPos, setWorkerPos] = useState(null);

  // Get worker's current GPS location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setWorkerPos([pos.coords.latitude, pos.coords.longitude]),
        () => setWorkerPos([28.6139, 77.209]) // fallback: Delhi
      );
    } else {
      setWorkerPos([28.6139, 77.209]);
    }
  }, []);

  if (loading || !workerPos)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
      </div>
    );

  const mappableTasks = tasks.filter(
    (t) => t.report?.location?.lat != null && t.report?.location?.lng != null
  );

  const googleMapsURL = (lat, lng) =>
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Map View</h1>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-sm">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            {status.replace("_", " ")}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-amber-500" />
          Your location
        </span>
      </div>

      <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg">
        <MapContainer
          center={workerPos}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          />
          <FlyToLocation position={workerPos} />

          {/* Worker's current position */}
          <CircleMarker
            center={workerPos}
            radius={10}
            pathOptions={{
              color: "#F59E0B",
              fillColor: "#F59E0B",
              fillOpacity: 0.8,
              weight: 3,
            }}
          >
            <Popup>📍 Your current location</Popup>
          </CircleMarker>

          {/* Task markers */}
          {mappableTasks.map((task) => {
            const loc = task.report.location;
            const color = STATUS_COLORS[task.status] || "#6B7280";
            return (
              <CircleMarker
                key={task.id}
                center={[loc.lat, loc.lng]}
                radius={8}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.7,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-sm min-w-[180px]">
                    <p className="font-semibold">
                      {task.report.title || "Task"}
                    </p>
                    <p className="text-gray-600">
                      Category: {task.report.category || "—"}
                    </p>
                    <p className="text-gray-600">
                      Status:{" "}
                      <span className="font-medium">
                        {task.status?.replace("_", " ")}
                      </span>
                    </p>
                    {loc.address && (
                      <p className="text-gray-500 text-xs mt-1">
                        {loc.address}
                      </p>
                    )}
                    <a
                      href={googleMapsURL(loc.lat, loc.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:underline text-xs font-medium"
                    >
                      <FaDirections /> Navigate
                    </a>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {mappableTasks.length === 0 && (
        <p className="text-gray-400 text-sm text-center mt-4">
          No geotagged tasks to display.
        </p>
      )}
    </div>
  );
}
