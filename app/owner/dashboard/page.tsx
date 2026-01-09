"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function OwnerDashboard() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    location: "",
    price: "",
    property_type: "",
    tenant_preference: "",
    contact_number: ""
  });
  const [newImages, setNewImages] = useState<FileList | null>(null);
  const [deletingImages, setDeletingImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Initialize theme
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

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Fetch owner's rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        window.location.href = "/auth";
        return;
      }

      const { data, error } = await supabase
        .from("rooms")
        .select("*, room_images(id, image_url)")
        .eq("owner_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
      } else {
        setRooms(data || []);
      }
      setLoading(false);
    };

    if (darkMode !== null) {
      fetchRooms();
    }
  }, [darkMode]);

  // Start editing
  const startEdit = (room: any) => {
    setEditingRoom(room);
    setEditForm({
      title: room.title,
      location: room.location,
      price: room.price,
      property_type: room.property_type,
      tenant_preference: room.tenant_preference,
      contact_number: room.contact_number
    });
    setNewImages(null);
    setDeletingImages([]);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingRoom(null);
    setEditForm({
      title: "",
      location: "",
      price: "",
      property_type: "",
      tenant_preference: "",
      contact_number: ""
    });
    setNewImages(null);
    setDeletingImages([]);
  };

  // Mark image for deletion
  const toggleImageDeletion = (imageId: string) => {
    setDeletingImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  // Save edited room
  const saveEdit = async () => {
    if (!editingRoom) return;

    setUploadingImages(true);

    // 1. Update room details
    const { error: updateError } = await supabase
      .from("rooms")
      .update({
        title: editForm.title.trim(),
        location: editForm.location.trim(),
        price: editForm.price,
        property_type: editForm.property_type,
        tenant_preference: editForm.tenant_preference,
        contact_number: editForm.contact_number.trim()
      })
      .eq("id", editingRoom.id);

    if (updateError) {
      alert(updateError.message);
      setUploadingImages(false);
      return;
    }

    // 2. Delete marked images
    if (deletingImages.length > 0) {
      const { error: deleteError } = await supabase
        .from("room_images")
        .delete()
        .in("id", deletingImages);

      if (deleteError) {
        alert("Error deleting images: " + deleteError.message);
      }
    }

    // 3. Upload new images
    if (newImages && newImages.length > 0) {
      const imageRecords: any[] = [];

      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        const filePath = `${editingRoom.id}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("room-images")
          .upload(filePath, file);

        if (uploadError) {
          alert("Error uploading image: " + uploadError.message);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("room-images")
          .getPublicUrl(filePath);

        imageRecords.push({
          room_id: editingRoom.id,
          image_url: urlData.publicUrl,
        });
      }

      if (imageRecords.length > 0) {
        const { error: imageError } = await supabase
          .from("room_images")
          .insert(imageRecords);

        if (imageError) {
          alert("Error saving image URLs: " + imageError.message);
        }
      }
    }

    // 4. Refresh the room data
    const { data: updatedRoom } = await supabase
      .from("rooms")
      .select("*, room_images(id, image_url)")
      .eq("id", editingRoom.id)
      .single();

    // Update local state
    setRooms(prev => prev.map(room => 
      room.id === editingRoom.id 
        ? updatedRoom
        : room
    ));

    setUploadingImages(false);
    alert("Room updated successfully!");
    cancelEdit();
  };

  // Delete room
  const deleteRoom = async (roomId: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this room?");
    if (!confirmDelete) return;

    await supabase.from("rooms").delete().eq("id", roomId);
    setRooms((prev) => prev.filter((room) => room.id !== roomId));
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (darkMode === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} text-sm font-medium mb-2 inline-block`}>
                ← Back to Home
              </Link>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>My Rooms</h1>
            </div>

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
                href="/owner/add-room"
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-black hover:bg-gray-900 text-white'
                }`}
              >
                + Add Room
              </Link>
              
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rooms List */}
        {rooms.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl shadow-md`}>
            <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>You haven't added any rooms yet.</p>
            <Link href="/owner/add-room" className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium">
              Add your first room →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border rounded-xl shadow-md overflow-hidden`}
              >
                {editingRoom?.id === room.id ? (
                  // Edit Mode
                  <div className="p-6">
                    <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Edit Room Details</h3>
                    
                    {/* Room Images Section */}
                    <div className="mb-6">
                      <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Current Images (Click to mark for deletion)
                      </label>
                      
                      {room.room_images?.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {room.room_images.map((img: any) => (
                            <div
                              key={img.id}
                              onClick={() => toggleImageDeletion(img.id)}
                              className={`relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
                                deletingImages.includes(img.id)
                                  ? 'border-red-500 opacity-50'
                                  : darkMode
                                    ? 'border-slate-700 hover:border-blue-500'
                                    : 'border-slate-200 hover:border-blue-400'
                              }`}
                            >
                              <img
                                src={img.image_url}
                                alt="Room"
                                className="w-full h-32 object-cover"
                              />
                              {deletingImages.includes(img.id) && (
                                <div className="absolute inset-0 bg-red-600/70 flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">✗ Delete</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          No images yet
                        </p>
                      )}

                      <div className={`border-2 border-dashed rounded-lg p-4 ${
                        darkMode 
                          ? 'border-slate-600 hover:border-slate-500' 
                          : 'border-slate-300 hover:border-slate-400'
                      } transition-colors`}>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => setNewImages(e.target.files)}
                          className={`w-full cursor-pointer ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                        />
                        <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {newImages && newImages.length > 0 
                            ? `${newImages.length} new image(s) selected`
                            : 'Add new images (optional)'}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Title
                        </label>
                        <input
                          value={editForm.title}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-slate-800 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Location
                        </label>
                        <input
                          value={editForm.location}
                          onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-slate-800 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-slate-800 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Property Type
                        </label>
                        <select
                          value={editForm.property_type}
                          onChange={(e) => setEditForm({...editForm, property_type: e.target.value})}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-slate-800 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="1BHK">1 BHK</option>
                          <option value="2BHK">2 BHK</option>
                          <option value="3BHK">3 BHK</option>
                          <option value="1Bed">1 Bed</option>
                          <option value="2Bed">2 Bed</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Tenant Preference
                        </label>
                        <select
                          value={editForm.tenant_preference}
                          onChange={(e) => setEditForm({...editForm, tenant_preference: e.target.value})}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-slate-800 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="Bachelor">Bachelor</option>
                          <option value="Family">Family</option>
                          <option value="Girls">Girls</option>
                          <option value="Working">Working Professional</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Contact Number
                        </label>
                        <input
                          value={editForm.contact_number}
                          onChange={(e) => setEditForm({...editForm, contact_number: e.target.value})}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode 
                              ? 'bg-slate-800 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={saveEdit}
                        disabled={uploadingImages}
                        className={`bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors ${
                          uploadingImages ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingImages ? '⏳ Saving...' : '✓ Save Changes'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={uploadingImages}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                          darkMode 
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600' 
                            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
                        } ${uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex gap-4 p-6">
                    {/* Image */}
                    {room.room_images?.length > 0 ? (
                      <div className="w-48 flex-shrink-0">
                        <img
                          src={room.room_images[0].image_url}
                          alt="Room"
                          className="w-full h-36 object-cover rounded-lg"
                        />
                        {room.room_images.length > 1 && (
                          <p className={`text-xs mt-1 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            +{room.room_images.length - 1} more
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className={`w-48 h-36 ${darkMode ? 'bg-slate-800' : 'bg-gray-200'} flex items-center justify-center text-sm rounded-lg flex-shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        No Image
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1">
                      <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{room.title}</h2>
                      <p className={`text-sm mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        📍 {room.location}
                      </p>
                      <p className={`text-2xl font-bold mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        ₹{room.price}
                      </p>
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
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        📞 {room.contact_number}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => startEdit(room)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          darkMode 
                            ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-600' 
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        ✎ Edit
                      </button>
                      <button
                        onClick={() => deleteRoom(room.id)}
                        className="px-4 py-2 rounded-lg font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
