"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AddRoom() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [tenantPref, setTenantPref] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<FileList | null>(null);

  // Get logged-in user once
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    };
    getUser();

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

  const handleSubmit = async () => {
    if (!userId) {
      alert("Please login again");
      return;
    }

    if (!images || images.length === 0) {
      alert("Please select at least one image");
      return;
    }

    setLoading(true);

    // Normalize inputs
    const normalizedPropertyType = propertyType.trim();
    const normalizedTenantPref = tenantPref.trim();

    // 1️⃣ Insert room
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({
        owner_id: userId,
        title: title.trim(),
        location: location.trim(),
        price: price,
        property_type: normalizedPropertyType,
        tenant_preference: normalizedTenantPref,
        contact_number: contactNumber.trim(),
        description: description.trim() || null,
      })
      .select()
      .single();

    if (roomError) {
      alert(roomError.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Upload images
    const imageRecords: any[] = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
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
    
    // Reset form
    setTitle("");
    setLocation("");
    setPrice("");
    setPropertyType("");
    setTenantPref("");
    setContactNumber("");
    setDescription("");
    setImages(null);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} font-medium transition-colors`}>
              ← Back to Home
            </Link>

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
                href="/owner/dashboard"
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
                  darkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                    : 'bg-gray-800 hover:bg-gray-900 text-white'
                }`}
              >
                My Rooms
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className={`${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'} rounded-xl shadow-md p-8 border`}>
          <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Add New Room</h1>

          <div className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Room Title
              </label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Spacious 2BHK near IT Park" 
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
                required 
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Koramangala, Bangalore"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Monthly Rent (₹)
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                placeholder="15000"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                required
              >
                <option value="">Select property type</option>
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
                value={tenantPref}
                onChange={(e) => setTenantPref(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                required
              >
                <option value="">Select tenant preference</option>
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
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="9876543210"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Description <span className="text-xs text-slate-500">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Fully furnished with WiFi, parking available, close to metro station..."
                rows={4}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Room Images
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                darkMode 
                  ? 'border-slate-600 hover:border-slate-500' 
                  : 'border-slate-300 hover:border-slate-400'
              } transition-colors`}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImages(e.target.files)}
                  className={`w-full cursor-pointer ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                  required
                />
                <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Select multiple images (JPG, PNG)
                </p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-all shadow-md ${
                loading 
                  ? darkMode 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-black hover:bg-gray-900 text-white'
              }`}
            >
              {loading ? "Adding Room..." : "✓ Add Room"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
