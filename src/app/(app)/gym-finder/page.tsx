"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Dumbbell, Search, Loader2, Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Gym = {
  id: string;
  name: string;
  address: string;
  distance: string;
  lat: number;
  lon: number;
};

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchGyms(lat: number, lon: number): Promise<Gym[]> {
  const radius = 15000; // 15km
  // Broad tag set — catches fitness_centre, sports_centre, sport halls, gym amenity, sport=gym/fitness, CrossFit boxes, etc.
  const tagFilters = [
    `node["leisure"="fitness_centre"]`,
    `way["leisure"="fitness_centre"]`,
    `relation["leisure"="fitness_centre"]`,
    `node["leisure"="sports_centre"]`,
    `way["leisure"="sports_centre"]`,
    `node["leisure"="sports_hall"]`,
    `way["leisure"="sports_hall"]`,
    `node["amenity"="gym"]`,
    `way["amenity"="gym"]`,
    `node["sport"="fitness"]`,
    `node["sport"="gym"]`,
    `way["sport"="gym"]`,
    `node["building"="gym"]`,
  ].map((t) => `${t}(around:${radius},${lat},${lon})`).join(";");

  const query = `[out:json][timeout:30];(${tagFilters};);out center;`;

  // Run Overpass + Nominatim text searches in parallel
  const [overpassRes, ...nominatimResults] = await Promise.allSettled([
    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`).then((r) => r.json()),
    // Text searches for keywords that might not have the right OSM tag
    ...["gym", "fitness", "crossfit"].map((kw) =>
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${kw}&format=json&limit=20&bounded=1&viewbox=${lon - 0.15},${lat + 0.15},${lon + 0.15},${lat - 0.15}`,
        { headers: { "Accept-Language": "en" } }
      ).then((r) => r.json())
    ),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const makeGym = (id: string, name: string, addr: string, gLat: number, gLon: number): Gym => {
    const km = distanceKm(lat, lon, gLat, gLon);
    return { id, name, address: addr, distance: km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`, lat: gLat, lon: gLon };
  };

  const gyms: Gym[] = [];
  const seen = new Set<string>();

  // Overpass results
  if (overpassRes.status === "fulfilled") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const el of (overpassRes.value.elements ?? []) as any[]) {
      if (!el.tags?.name) continue;
      const gLat = el.lat ?? el.center?.lat;
      const gLon = el.lon ?? el.center?.lon;
      if (gLat == null) continue;
      const key = `${el.tags.name.toLowerCase()}|${gLat.toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const addr = [el.tags["addr:housenumber"], el.tags["addr:street"], el.tags["addr:city"]].filter(Boolean).join(" ") || "Address unavailable";
      gyms.push(makeGym(String(el.id), el.tags.name, addr, gLat, gLon));
    }
  }

  // Nominatim results
  for (const result of nominatimResults) {
    if (result.status !== "fulfilled") continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const place of (result.value ?? []) as any[]) {
      if (!place.display_name) continue;
      const gLat = parseFloat(place.lat);
      const gLon = parseFloat(place.lon);
      if (isNaN(gLat) || distanceKm(lat, lon, gLat, gLon) > 15) continue;
      const name = place.name || place.display_name.split(",")[0];
      const key = `${name.toLowerCase()}|${gLat.toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const addr = place.display_name.split(",").slice(1, 3).join(",").trim() || "Address unavailable";
      gyms.push(makeGym(place.place_id, name, addr, gLat, gLon));
    }
  }

  return gyms
    .sort((a, b) => distanceKm(lat, lon, a.lat, a.lon) - distanceKm(lat, lon, b.lat, b.lon))
    .slice(0, 25);
}

export default function GymFinderPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [filtered, setFiltered] = useState<Gym[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = () => {
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const results = await fetchGyms(pos.coords.latitude, pos.coords.longitude);
          setGyms(results);
          setFiltered(results);
        } catch {
          setError("Failed to load gyms. Try again.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location access denied. Please allow location to find nearby gyms.");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    if (gyms.length > 0) {
      const q = search.toLowerCase();
      setFiltered(q ? gyms.filter((g) => g.name.toLowerCase().includes(q) || g.address.toLowerCase().includes(q)) : gyms);
    }
  }, [search, gyms]);

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {gyms.length > 0 && (
        <Input
          placeholder="Search gyms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      )}

      {gyms.length === 0 && !loading && (
        <Card className="text-center py-12">
          <MapPin className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <p className="font-bold text-text-primary mb-1">Find Gyms Near You</p>
          <p className="text-sm text-text-secondary mb-4">
            {error ?? "Allow location access to see real gyms near you."}
          </p>
          <Button leftIcon={<Navigation className="h-4 w-4" />} onClick={getLocation}>
            Find Nearby Gyms
          </Button>
        </Card>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent-green" />
          <p className="text-sm text-text-muted">Finding gyms near you...</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((gym, i) => (
            <motion.div
              key={gym.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hoverable onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${gym.lat}&mlon=${gym.lon}&zoom=17`, "_blank")}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-primary truncate">{gym.name}</p>
                    <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{gym.address}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{gym.distance}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Dumbbell className="h-3 w-3" />
                  <span>Tap to view on map</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {gyms.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">OpenStreetMap + Nominatim · {filtered.length} gyms found</p>
          <Button variant="ghost" size="sm" onClick={getLocation}>Refresh</Button>
        </div>
      )}
    </div>
  );
}
