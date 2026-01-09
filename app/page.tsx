"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

const ITEMS_PER_PAGE = 9;

export default function Home() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  // 🔍 Search & filter states
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [tenantPref, setTenantPref] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // 🖼️ Carousel state
  const [imageIndex, setImageIndex] = useState<{ [key: string]: number }>({});
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Initialize theme from system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      setDarkMode(true);
    } else if (savedTheme === 'light') {
      setDarkMode(false);
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(systemPrefersDark);
    }
  }, []);

  /* ---------------- FETCH ROOMS WITH PAGINATION ---------------- */
  const fetchRooms = async (page: number = 1) => {
    setLoading(true);
    setCurrentPage(page);

    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let countQuery = supabase
      .from("rooms")
      .select("*", { count: 'exact', head: true });

    let dataQuery = supabase
      .from("rooms")
      .select("*, room_images(image_url)")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (location) {
      const locationFilter = `%${location.trim()}%`;
      countQuery = countQuery.ilike("location", locationFilter);
      dataQuery = dataQuery.ilike("location", locationFilter);
    }

    if (propertyType) {
      countQuery = countQuery.ilike("property_type", propertyType);
      dataQuery = dataQuery.ilike("property_type", propertyType);
    }

    if (tenantPref) {
      countQuery = countQuery.ilike("tenant_preference", tenantPref);
      dataQuery = dataQuery.ilike("tenant_preference", tenantPref);
    }

    if (maxPrice) {
      countQuery = countQuery.lte("price", Number(maxPrice));
      dataQuery = dataQuery.lte("price", Number(maxPrice));
    }

    const { count } = await countQuery;
    const { data } = await dataQuery;

    setTotalCount(count || 0);
    setRooms(data || []);
    setLoading(false);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchRooms(1);
  }, []);


  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchRooms(1);
    }
  };

  // Open room details modal
  const openRoomDetails = (room: any) => {
    setSelectedRoom(room);
    setModalImageIndex(0);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  // Close room details modal
  const closeRoomDetails = () => {
    setSelectedRoom(null);
    document.body.style.overflow = 'auto';
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

  const nextModalImage = () => {
    if (selectedRoom?.room_images) {
      setModalImageIndex((prev) => (prev + 1) % selectedRoom.room_images.length);
    }
  };

  const prevModalImage = () => {
    if (selectedRoom?.room_images) {
      setModalImageIndex((prev) => 
        prev === 0 ? selectedRoom.room_images.length - 1 : prev - 1
      );
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (darkMode === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
        {/* Search & Filter Bar */}
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
              onClick={() => fetchRooms(1)}
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
                fetchRooms(1);
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

        {/* Results Count */}
        {!loading && totalCount > 0 && (
          <div className={`mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Showing {startItem}-{endItem} of {totalCount} rooms
          </div>
        )}

        {/* Room List */}
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
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div 
                  key={room.id} 
                  onClick={() => openRoomDetails(room)}
                  className={`${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'} rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all border cursor-pointer transform hover:scale-105`}
                >
                  {/* Image Carousel */}
                  {room.room_images?.length > 0 ? (
                    <div className={`relative h-56 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <img
                        src={room.room_images[imageIndex[room.id] ?? 0].image_url}
                        className="h-56 w-full object-cover"
                        alt={room.title}
                      />

                      {room.room_images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              prevImage(room.id, room.room_images.length);
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all z-10"
                          >
                            ‹
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextImage(room.id, room.room_images.length);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all z-10"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`mt-8 flex justify-center items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <button
                  onClick={() => fetchRooms(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === 1
                      ? darkMode
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : darkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
                  }`}
                >
                  ← Previous
                </button>

                <div className="flex gap-2">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => fetchRooms(page as number)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          currentPage === page
                            ? darkMode
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-white'
                            : darkMode
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() => fetchRooms(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === totalPages
                      ? darkMode
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : darkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
                  }`}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Room Details Modal */}
      {selectedRoom && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={closeRoomDetails}
        >
          <div 
            className={`${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="sticky top-0 z-10 flex justify-end p-4 bg-gradient-to-b from-black/50 to-transparent">
              <button
                onClick={closeRoomDetails}
                className="bg-white/90 hover:bg-white text-slate-800 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl transition-all"
              >
                ✕
              </button>
            </div>

            {/* Image Gallery */}
            {selectedRoom.room_images?.length > 0 ? (
              <div className="relative -mt-14">
                <img
                  src={selectedRoom.room_images[modalImageIndex].image_url}
                  className="w-full h-96 object-cover"
                  alt={selectedRoom.title}
                />
                {selectedRoom.room_images.length > 1 && (
                  <>
                    <button
                      onClick={prevModalImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextModalImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full">
                      {modalImageIndex + 1} / {selectedRoom.room_images.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className={`h-96 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} flex items-center justify-center`}>
                <span className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No Image Available</span>
              </div>
            )}

            {/* Room Details */}
            <div className="p-8">
              <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {selectedRoom.title}
              </h1>

              <div className={`flex items-center gap-2 mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="text-xl">📍</span>
                <p className="text-lg">{selectedRoom.location}</p>
              </div>

              <div className="mb-6">
                <p className={`text-4xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  ₹{selectedRoom.price}<span className="text-lg font-normal">/month</span>
                </p>
              </div>

              <div className="flex gap-3 mb-6 flex-wrap">
                <span className={`px-4 py-2 rounded-lg font-medium ${
                  darkMode 
                    ? 'bg-slate-800 text-slate-300' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {selectedRoom.property_type}
                </span>
                <span className={`px-4 py-2 rounded-lg font-medium ${
                  darkMode 
                    ? 'bg-blue-900/50 text-blue-300' 
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {selectedRoom.tenant_preference}
                </span>
              </div>

              {selectedRoom.description && (
                <div className="mb-6">
                  <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    Description
                  </h2>
                  <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {selectedRoom.description}
                  </p>
                </div>
              )}

              <div className={`pt-6 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Contact Information
                </h2>
                <div className={`flex items-center gap-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span className="text-2xl">📞</span>
                  <a 
                    href={`tel:${selectedRoom.contact_number}`}
                    className="text-xl font-semibold hover:text-blue-600 transition-colors"
                  >
                    {selectedRoom.contact_number}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
