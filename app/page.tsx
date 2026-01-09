"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [imageIndex, setImageIndex] = useState<{ [key: string]: number }>({});

  const fetchRooms = async () => {
    const { data } = await supabase
      .from("rooms")
      .select("*, room_images(image_url)")
      .order("created_at", { ascending: false });

    setRooms(data || []);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

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

      {/* Rooms */}
      {rooms.length === 0 ? (
        <p>No rooms available.</p>
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
