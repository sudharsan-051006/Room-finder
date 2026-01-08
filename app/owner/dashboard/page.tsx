"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function OwnerDashboard() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch owner's rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const { data: userData } = await supabase.auth.getUser();

      // If not logged in → redirect to auth
      if (!userData.user) {
        window.location.href = "/auth";
        return;
      }

      const { data, error } = await supabase
        .from("rooms")
        .select("*, room_images(image_url)")
        .eq("owner_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
      } else {
        setRooms(data || []);
      }

      setLoading(false);
    };

    fetchRooms();
  }, []);

  // Delete room
  const deleteRoom = async (roomId: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this room?");
    if (!confirmDelete) return;

    await supabase.from("rooms").delete().eq("id", roomId);
    setRooms((prev) => prev.filter((room) => room.id !== roomId));
  };

  // ✅ Correct logout (NO setUser here)
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return <p className="p-6">Loading your rooms...</p>;
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Rooms</h1>

        <div className="flex gap-3">
          <Link
            href="/owner/add-room"
            className="bg-black text-white px-4 py-2 rounded"
          >
            + Add Room
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Rooms List */}
      {rooms.length === 0 ? (
        <p className="text-gray-600">You haven’t added any rooms yet.</p>
      ) : (
        <div className="grid gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="border p-4 rounded flex gap-4 items-start"
            >
              {/* Image */}
              {room.room_images?.length > 0 ? (
                <img
                  src={room.room_images[0].image_url}
                  alt="Room"
                  className="w-32 h-24 object-cover rounded"
                />
              ) : (
                <div className="w-32 h-24 bg-gray-200 flex items-center justify-center text-sm">
                  No Image
                </div>
              )}

              {/* Details */}
              <div className="flex-1">
                <h2 className="font-semibold">{room.title}</h2>
                <p className="text-sm text-gray-600">
                  {room.location} • ₹{room.price}
                </p>
                <p className="text-sm">
                  {room.property_type} | {room.tenant_preference}
                </p>
              </div>

              {/* Actions */}
              <button
                onClick={() => deleteRoom(room.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
