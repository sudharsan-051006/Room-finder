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

  /* ---------------- FETCH ROOMS WITH CASE-INSENSITIVE SEARCH ---------------- */
  const fetchRooms = async () => {
    setLoading(true);

    let query = supabase
      .from("rooms")
      .select("*, room_images(image_url)")
      .order("created_at", { ascending: false });

    // Case-insensitive location search using ilike
    if (location) {
      query = query.ilike("location", `%${location.trim()}%`);
    }

    // Case-insensitive property type search
    if (propertyType) {
      query = query.ilike("property_type", propertyType);
    }

    // Case-insensitive tenant preference search
    if (tenantPref) {
      query = query.ilike("tenant_preference", tenantPref);
    }

    // Price filter
    if (maxPrice) {
      query = query.lte("price", Number(maxPrice));
    }

    const { data } = await query;
    setRooms(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
  };

  // Handle Enter key press for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchRooms();
    }
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

  return (
    <main className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
              <span className="text-4xl">🏠</span>
              Room Finder
            </h1>

            <div className="flex items-center gap-4">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-lg transition-all ${
                  darkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                aria-label="Toggle theme"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              <Link
                href="/auth"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                Owner Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 🔍 SEARCH & FILTER BAR */}
        <div className={`${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'} rounded-xl shadow-md p-6 mb-8 border`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-700'} mb-4`}>Find Your Perfect Room</h2>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <input
              placeholder="Search by location"
              className={`px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                darkMode 
                  ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
              }`}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
            />

            <select
              className={`px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer ${
                darkMode 
                  ? 'bg-slate-800 border-slate-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="">Property Type</option>
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="1Bed">1 Bed</option>
              <option value="2Bed">2 Bed</option>
            </select>

            <select
              className={`px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer ${
                darkMode 
                  ? 'bg-slate-800 border-slate-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
              value={tenantPref}
              onChange={(e) => setTenantPref(e.target.value)}
            >
              <option value="">Tenant Preference</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Family">Family</option>
              <option value="Girls">Girls</option>
              <option value="Working">Working</option>
            </select>

            <input
              type="number"
              placeholder="Max Price"
              className={`px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                darkMode 
                  ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
              }`}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchRooms}
              className={`px-8 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
            >
              🔍 Search Rooms
            </button>
            
            <button
              onClick={() => {
                setLocation("");
                setPropertyType("");
                setTenantPref("");
                setMaxPrice("");
                fetchRooms();
              }}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
              }`}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* ROOM LIST */}
        {loading ? (
          <div className="text-center py-12">
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
            <p className={`mt-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl shadow-md`}>
            <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>No rooms found matching your criteria.</p>
            <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className={`${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'} rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border`}>
                {/* Image Carousel */}
                {room.room_images?.length > 0 ? (
                  <div className={`relative h-56 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <img
                      src={
                        room.room_images[
                          imageIndex[room.id] ?? 0
                        ].image_url
                      }
                      className="h-56 w-full object-cover"
                      alt={room.title}
                    />

                    {room.room_images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            prevImage(room.id, room.room_images.length)
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() =>
                            nextImage(room.id, room.room_images.length)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all"
                        >
                          ›
                        </button>
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          {(imageIndex[room.id] ?? 0) + 1} / {room.room_images.length}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className={`h-56 ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-700' : 'bg-gradient-to-br from-slate-200 to-slate-300'} flex items-center justify-center`}>
                    <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No Image</span>
                  </div>
                )}

                {/* Details */}
                <div className="p-5">
                  <h2 className={`font-bold text-lg mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{room.title}</h2>
                  <p className={`text-sm mb-3 flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>📍</span> {room.location}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>₹{room.price}</p>
                  </div>
                  
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      darkMode 
                        ? 'bg-slate-800 text-slate-300' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {room.property_type}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      darkMode 
                        ? 'bg-blue-900/50 text-blue-300' 
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {room.tenant_preference}
                    </span>
                  </div>
                  
                  <div className={`pt-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <p className={`text-sm font-semibold flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span>📞</span> {room.contact_number}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
