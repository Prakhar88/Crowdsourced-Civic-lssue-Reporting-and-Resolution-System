// src/pages/cards/ReportsMap.jsx
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useReports } from "../../hooks/useReports";

const STATUS_COLORS = {
  pending: "#EF4444",      // red
  assigned: "#3B82F6",     // blue
  in_progress: "#F97316",  // orange
  resolved: "#22C55E",     // green
};

export default function ReportsMap({ className }) {
  const { reports, loading } = useReports();

  if (loading)
    return (
      <div
        className={`bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 ${className} flex items-center justify-center h-64`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );

  // Filter reports that have valid coordinates
  const mappable = reports.filter(
    (r) => r.location?.lat != null && r.location?.lng != null
  );

  return (
    <div
      className={`bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 ${className}`}
      style={{ height: "100%" }}
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-gray-700">City Reports Map</h2>
        <div className="flex gap-2 text-xs">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <span key={status} className="flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              {status.replace("_", " ")}
            </span>
          ))}
        </div>
      </div>

      <div className="h-64 md:h-[400px] w-full rounded-lg overflow-hidden">
        <MapContainer
          center={[28.6139, 77.209]}
          zoom={11}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          />
          {mappable.map((report) => (
            <CircleMarker
              key={report.id}
              center={[report.location.lat, report.location.lng]}
              radius={8}
              pathOptions={{
                color: STATUS_COLORS[report.status] || "#6B7280",
                fillColor: STATUS_COLORS[report.status] || "#6B7280",
                fillOpacity: 0.7,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{report.title}</p>
                  <p className="text-gray-600">
                    Category: {report.category || "—"}
                  </p>
                  <p className="text-gray-600">
                    Status:{" "}
                    <span className="font-medium">
                      {report.status?.replace("_", " ") || "unknown"}
                    </span>
                  </p>
                  {report.location?.address && (
                    <p className="text-gray-500 text-xs mt-1">
                      {report.location.address}
                    </p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {mappable.length === 0 && (
        <p className="text-gray-400 text-sm text-center mt-2">
          No geotagged reports to display.
        </p>
      )}
    </div>
  );
}
