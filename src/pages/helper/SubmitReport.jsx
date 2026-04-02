import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { createReport,analyzeReport } from "../../hooks/useReports";
import { uploadToSupabase } from "../../lib/utils";
import { supabase } from "../../lib/supabase";
import { CATEGORIES } from "../../lib/constants";
import useGeolocation from "../../hooks/useGeolocation";
import GeoCamera from "../../components/camera/GeoCamera";


export default function SubmitReport() {
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const { position, accuracy, error: geoError, loading: geoLoading } = useGeolocation();

  const [photo, setPhoto] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo || !position || !title || !category) {
      setError("Please fill in all required fields and capture a photo.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = await getToken();

      // Upload image
      const imageUrl = await uploadToSupabase(
        supabase,
        photo.blob,
        "report-images",
        "reports"
      );

      // Create report
      const createdReport = createReport(token, {
        title,
        description,
        category,
        image_url: imageUrl,
        lat: position.lat,
        lng: position.lng,
        reporter_id: user.id,
      });
      await analyzeReport(token, {
      reportId: createdReport.id,
      description,
      title,
      });
      navigate("/helper/my-reports");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
        <p className="text-gray-600">Capture a photo and describe the civic issue.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <div className="rounded-xl border bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Photo *
          </label>
          <GeoCamera
            onCapture={(p) => setPhoto(p)}
            onFileSelect={(p) => setPhoto(p)}
          />
          {photo?.url && (
            <img
              src={photo.url}
              alt="Preview"
              className="mt-3 h-48 w-full rounded-lg object-cover"
            />
          )}
        </div>

        {/* Location */}
        <div className="rounded-xl border bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Location
          </label>
          {geoLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Getting your location...
            </div>
          ) : geoError ? (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {geoError}
            </div>
          ) : position ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-emerald-600" />
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              {accuracy && accuracy > 100 && (
                <span className="text-amber-600">
                  (accuracy: ~{Math.round(accuracy)}m — consider moving outdoors)
                </span>
              )}
            </div>
          ) : null}
        </div>

        {/* Details */}
        <div className="space-y-4 rounded-xl border bg-white p-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Large pothole on Main Street"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </button>
      </form>
    </div>
  );
}
