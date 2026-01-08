"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AddRoom() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get logged-in user once
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    };
    getUser();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!userId) {
      alert("Please login again");
      return;
    }

    setLoading(true);
    const form = e.target;

    // 1️⃣ Insert room
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({
        owner_id: userId,
        title: form.title.value,
        location: form.location.value,
        price: form.price.value,
        property_type: form.property_type.value,
        tenant_preference: form.tenant_preference.value,
        contact_number: form.contact_number.value,
      })
      .select()
      .single();

    if (roomError) {
      alert(roomError.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Upload images
    const files = form.images.files;

    if (!files || files.length === 0) {
      alert("Please select at least one image");
      setLoading(false);
      return;
    }

    const imageRecords: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `${room.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("room-images")
        .upload(filePath, file);

      if (uploadError) {
        alert(uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("room-images")
        .getPublicUrl(filePath);

      imageRecords.push({
        room_id: room.id,
        image_url: urlData.publicUrl,
      });
    }

    // 3️⃣ Insert image URLs into DB
    const { error: imageError } = await supabase
      .from("room_images")
      .insert(imageRecords);

    if (imageError) {
      alert(imageError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    alert("Room added successfully with images!");
    form.reset();
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Home
        </Link>

        <Link
          href="/owner/dashboard"
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          My Rooms
        </Link>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Add Room</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="title" placeholder="Title" className="input" required />
          <input
            name="location"
            placeholder="Location"
            className="input"
            required
          />
          <input
            name="price"
            type="number"
            placeholder="Rent Price"
            className="input"
            required
          />
          <input
            name="property_type"
            placeholder="Property Type"
            className="input"
            required
          />
          <input
            name="tenant_preference"
            placeholder="Tenant Preference"
            className="input"
            required
          />
          <input
            name="contact_number"
            placeholder="Contact Number"
            className="input"
            required
          />

          {/* IMAGE INPUT (IMPORTANT) */}
          <input
            type="file"
            name="images"
            multiple
            accept="image/*"
            className="w-full"
            required
          />

          <button
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded w-full"
          >
            {loading ? "Adding..." : "Add Room"}
          </button>
        </form>
      </div>
    </div>
  );
}
