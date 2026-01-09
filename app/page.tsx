"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔍 Search & filter states
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [tenantPref, setTenantPref] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // 🖼️ Carousel state
  const [imageIndex, setImageIndex] = useState<{ [key: string]: number }>({});

  /* ---------------- FETCH ROOMS ---------------- */
  const fetchRooms = async () => {
    setLoading(true);

    let query = supabase
      .from("rooms")
      .select("*, room_images(image_url)")
      .order("created_at", { ascending: false });

    if (location) {
      query = query.ilike("location", `%${location}%`);
    }

    if (propertyType) {
      query = query.eq("property_type", propertyType);
    }

    if (tenantPref) {
      query = query.eq("tenant_preference", tenantPref);
    }

    if (maxPrice) {
      query = query.lte("price", Number(maxPrice));
    }

    const { data } = await query;
    setRooms(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

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
    <main className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🏠 Room Finder</h1>

        <Link
          href="/auth"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Owner Login
        </Link>
      </div>

      {/* 🔍 SEARCH & FILTER BAR */}
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <input
          placeholder="Search by location"
          className="input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

      <select
        className="input bg-black text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
        value={propertyType}
        onChange={(e) => setPropertyType(e.target.value)}
      >
        <option value="" className="text-black">
          Property Type
        </option>
        <option value="1 BHK" className="text-black">
          1 BHK
        </option>
        <option value="2 BHK" className="text-black">
          2 BHK
        </option>
        <option value="3 BHK" className="text-black">
          3 BHK
        </option>
        <option value="1 Bed" className="text-black">
          1 Bed
        </option>
        <option value="2 Bed" className="text-black">
          2 Bed
        </option>
      </select>


        <select
          className="input"
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
          className="input"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      <button
        onClick={fetchRooms}
        className="bg-black text-white px-6 py-2 rounded mb-6"
      >
        Search
      </button>

      {/* ROOM LIST */}
      {loading ? (
        <p>Loading rooms...</p>
      ) : rooms.length === 0 ? (
        <p>No rooms found.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="border rounded overflow-hidden">
              {/* Image Carousel */}
              {room.room_images?.length > 0 ? (
                <div className="relative h-48">
                  <img
                    src={
                      room.room_images[
                        imageIndex[room.id] ?? 0
                      ].image_url
                    }
                    className="h-48 w-full object-cover"
                  />

                  {room.room_images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          prevImage(room.id, room.room_images.length)
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white px-2 rounded"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() =>
                          nextImage(room.id, room.room_images.length)
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white px-2 rounded"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  No Image
                </div>
              )}

              {/* Details */}
              <div className="p-4">
                <h2 className="font-semibold">{room.title}</h2>
                <p className="text-sm text-gray-600">{room.location}</p>
                <p className="font-medium">₹{room.price}</p>
                <p className="text-sm">
                  {room.property_type} | {room.tenant_preference}
                </p>
                <p className="mt-2 text-sm font-medium">
                  📞 {room.contact_number}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
