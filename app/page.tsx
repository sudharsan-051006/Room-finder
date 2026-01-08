"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [tenantPref, setTenantPref] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // 🔹 carousel state → roomId : imageIndex
  const [imageIndex, setImageIndex] = useState<{ [key: string]: number }>({});

  /* ---------------- FETCH ROOMS ---------------- */
  const fetchRooms = async () => {
    let query = supabase
      .from("rooms")
      .select("*, room_images(image_url)")
      .order("created_at", { ascending: false });

    if (location) query = query.ilike("location", `%${location}%`);
    if (propertyType) query = query.eq("property_type", propertyType);
    if (tenantPref) query = query.eq("tenant_preference", tenantPref);
    if (maxPrice) query = query.lte("price", Number(maxPrice));

    const { data } = await query;
    setRooms(data || []);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  /* ---------------- CAROUSEL CONTROLS ---------------- */
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

  /* ---------------- UI ---------------- */
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

      {/* Filters */}
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <input
          placeholder="Search by location"
          className="input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          placeholder="Property Type (1 BHK)"
          className="input"
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
        />

        <input
          placeholder="Tenant Preference"
          className="input"
          value={tenantPref}
          onChange={(e) => setTenantPref(e.target.value)}
        />

        <input
          placeholder="Max Price"
          type="number"
          className="input"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      <button
        onClick={fetchRooms}
        className="bg-black text-white px-4 py-2 rounded mb-6"
      >
        Search
      </button>

      {/* Room Cards */}
      {rooms.length === 0 ? (
        <p>No rooms found.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="border rounded overflow-hidden">
              {/* IMAGE CAROUSEL */}
              {room.room_images?.length > 0 ? (
                <div className="relative h-48 w-full">
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
                      {/* Left */}
                      <button
                        onClick={() =>
                          prevImage(room.id, room.room_images.length)
                        }
                        className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/60 text-white px-2 py-1 rounded"
                      >
                        ‹
                      </button>

                      {/* Right */}
                      <button
                        onClick={() =>
                          nextImage(room.id, room.room_images.length)
                        }
                        className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/60 text-white px-2 py-1 rounded"
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
                <p className="mt-1 font-medium">₹{room.price}</p>
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
