"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // 🔍 Search & filter states
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [tenantPref, setTenantPref] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // 🖼️ Carousel state
  const [imageIndex, setImageIndex] = useState<{ [key: string]: number }>({});

  // 📄 Pagination
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  /* ---------------- FETCH ROOMS ---------------- */
  const fetchRooms = async () => {
    setLoading(true);

    let query = supabase
      .from("rooms")
      .select("*, room_images(image_url)")
      .order("created_at", { ascending: false });

    if (location) query = query.ilike("location", `%${location.trim()}%`);
    if (propertyType) query = query.ilike("property_type", propertyType);
    if (tenantPref) query = query.ilike("tenant_preference", tenantPref);
    if (maxPrice) query = query.lte("price", Number(maxPrice));

    const { data } = await query;

    setRooms(data || []);
    setCurrentPage(1); // reset pagination
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setDarkMode(true);
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("theme", !darkMode ? "dark" : "light");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") fetchRooms();
  };

  /* ---------------- CAROUSEL ---------------- */
  const nextImage = (roomId: string, total: number) => {
    setImageIndex((prev) => ({
      ...prev,
      [roomId]: ((prev[roomId] ?? 0) + 1) % total,
    }));
  };

  const prevImage = (roomId: string, total: number) => {
    setImageIndex((prev) => ({
      ...prev,
      [roomId]:
        (prev[roomId] ?? 0) === 0 ? total - 1 : (prev[roomId] ?? 0) - 1,
    }));
  };

  /* ---------------- PAGINATION LOGIC ---------------- */
  const totalPages = Math.ceil(rooms.length / ITEMS_PER_PAGE);
  const paginatedRooms = rooms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main
      className={`min-h-screen ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gradient-to-br from-slate-50 to-slate-100"
      }`}
    >
      {/* Header */}
      <div
        className={`${
          darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
        } shadow-sm border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1
            className={`text-3xl font-bold ${
              darkMode ? "text-white" : "text-slate-800"
            }`}
          >
            🏠 Room Finder
          </h1>

          <div className="flex gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <Link
              href="/auth"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Owner Login
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* SEARCH */}
        <div
          className={`${
            darkMode ? "bg-slate-900" : "bg-white"
          } p-6 rounded-xl shadow mb-8`}
        >
          <div className="grid md:grid-cols-4 gap-4">
            <input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input"
            />

            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="input"
            >
              <option value="">Property Type</option>
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
            </select>

            <select
              value={tenantPref}
              onChange={(e) => setTenantPref(e.target.value)}
              className="input"
            >
              <option value="">Tenant</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Family">Family</option>
            </select>

            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input"
            />
          </div>

          <button
            onClick={fetchRooms}
            className="mt-4 bg-slate-800 text-white px-6 py-2 rounded-lg"
          >
            Search
          </button>
        </div>

        {/* ROOMS */}
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedRooms.map((room) => (
                <div
                  key={room.id}
                  className={`rounded-xl shadow ${
                    darkMode ? "bg-slate-900" : "bg-white"
                  }`}
                >
                  {room.room_images?.length > 0 ? (
                    <div className="relative h-56">
                      <img
                        src={
                          room.room_images[
                            imageIndex[room.id] ?? 0
                          ].image_url
                        }
                        className="h-56 w-full object-cover"
                      />

                      {room.room_images.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              prevImage(room.id, room.room_images.length)
                            }
                            className="carousel-btn left-2"
                          >
                            ‹
                          </button>
                          <button
                            onClick={() =>
                              nextImage(room.id, room.room_images.length)
                            }
                            className="carousel-btn right-2"
                          >
                            ›
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="h-56 flex items-center justify-center">
                      No Image
                    </div>
                  )}

                  <div className="p-4">
                    <h2 className="font-bold">{room.title}</h2>
                    <p>📍 {room.location}</p>
                    <p className="text-blue-600 font-bold">₹{room.price}</p>
                    <p>{room.property_type}</p>
                    <p>{room.tenant_preference}</p>
                    <p>📞 {room.contact_number}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {rooms.length > ITEMS_PER_PAGE && (
              <div className="flex justify-center gap-2 mt-10">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={currentPage === i + 1 ? "font-bold" : ""}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
