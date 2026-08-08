import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Profile, User } from "../types/index.js";
import { RadarChartComponent } from "../components/RadarChartComponent.js";
import { LogOut, UserCircle2, ArrowRight, Upload, Camera } from "lucide-react";

interface ProfilePageProps {
  user: User | null;
  storedProfile: Profile | null;
  alignmentScore: number | null;
  onLogout: () => void;
  onUserUpdate?: (user: User) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, storedProfile, alignmentScore, onLogout, onUserUpdate }) => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPG, PNG, GIF, etc.)");
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 5MB.");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 300; // 300x300 max avatar resolution
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setPhotoPreview(compressedDataUrl);
        } else {
          setPhotoPreview(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      alert("Failed to read the image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("peak_token");
      if (!token) {
        alert("You must be signed in to update your profile.");
        setSaving(false);
        return;
      }

      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio: bio.trim(),
          picture: photoPreview || user?.picture || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      // Update local user data via callback
      if (user && onUserUpdate) {
        const updatedUser: User = {
          ...user,
          bio: data.user.bio,
          picture: data.user.picture,
        };
        onUserUpdate(updatedUser);
        setBio(data.user.bio || "");
        setPhotoPreview(null); // Reset preview since it's now saved
      }
      
      setEditing(false);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      alert(error.message || "Failed to save profile changes. Please check your internet connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <UserCircle2 className="w-10 h-10 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-[20px] font-semibold text-neutral-900 mb-2">Not signed in</h2>
          <p className="text-[14px] text-neutral-500 mb-6">Sign in to view your profile and progress.</p>
          <button onClick={() => navigate("/auth")}
            className="px-6 h-11 bg-neutral-900 hover:bg-neutral-800 text-white text-[14px] font-medium rounded-lg transition-colors">
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(to right,#000 1px,transparent 1px),linear-gradient(to bottom,#000 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

      <div className="relative max-w-5xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="mb-12 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 h-6 rounded-full border border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-500 tracking-wide uppercase mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              Your profile
            </div>
            <h1 className="text-[36px] font-semibold tracking-[-0.02em] text-neutral-900">{user.name}</h1>
            <p className="text-[14px] text-neutral-500 mt-1">{user.email}</p>
          </div>
          <button onClick={() => { onLogout(); navigate("/auth"); }}
            className="inline-flex items-center gap-2 h-9 px-4 text-[13px] text-neutral-500 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-400 rounded-lg transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Identity card with photo upload */}
          <div className="border border-neutral-200 rounded-xl p-6 flex flex-col items-center text-center bg-white">
            <div className="relative group mb-4">
              {photoPreview || user?.picture ? (
                <img
                  src={photoPreview || user?.picture}
                  alt={user?.name || "Profile"}
                  className="w-20 h-20 rounded-full object-cover border-2 border-neutral-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[22px] font-semibold">
                  {initials}
                </div>
              )}
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-medium uppercase tracking-wider">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handlePhotoUpload(e);
                    // Automatically trigger edit mode when a photo is selected
                    setEditing(true);
                  }}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[16px] font-semibold text-neutral-900 mb-1">{user?.name}</p>
            <p className="text-[13px] text-neutral-400 mb-4">{user?.email}</p>
            
            {editing ? (
              <div className="w-full mb-6">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short bio about yourself..."
                  rows={3}
                  className="w-full px-3 py-2 text-[12px] text-neutral-900 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400 resize-none"
                />
              </div>
            ) : bio ? (
              <p className="text-[12px] text-neutral-600 leading-relaxed mb-6">{bio}</p>
            ) : null}

            <div className="w-full pt-5 border-t border-neutral-100">
              <p className="text-[11px] text-neutral-400 uppercase tracking-widest mb-1">Alignment score</p>
              <p className="text-[36px] font-bold text-neutral-900">{alignmentScore ?? 70}%</p>
            </div>

            {editing && (
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="mt-4 w-full h-9 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-[12px] font-medium rounded-lg transition-colors"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            )}
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="mt-4 w-full h-9 border border-neutral-200 hover:border-neutral-400 text-neutral-600 hover:text-neutral-900 text-[12px] font-medium rounded-lg transition-colors"
              >
                Edit profile
              </button>
            )}
          </div>

          {/* Aspirational traits */}
          <div className="lg:col-span-2 border border-neutral-200 rounded-xl p-6 bg-white">
            <h3 className="text-[15px] font-semibold text-neutral-900 mb-5">Aspirational identity</h3>
            {storedProfile ? (
              <>
                <div className="flex flex-wrap gap-2 mb-5">
                  {storedProfile.aspirationalTraits.map((t, i) => (
                    <span key={i} className="px-3 py-1 rounded-full border border-neutral-900 text-[12px] font-medium text-neutral-900">{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-neutral-50 border border-neutral-200 mb-4">
                  <span className="text-[13px] text-neutral-500">Current growth gap</span>
                  <span className="text-[13px] font-semibold text-neutral-900">{storedProfile.gapTheme}</span>
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400 uppercase tracking-widest mb-3">Behaviors to address</p>
                  <div className="flex flex-wrap gap-2">
                    {storedProfile.behaviorTraits.map((t, i) => (
                      <span key={i} className="px-3 py-1 rounded-full border border-neutral-200 text-[12px] text-neutral-500">{t}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-10 text-center">
                <p className="text-[14px] text-neutral-500 mb-5">Complete onboarding to generate your identity map.</p>
                <button onClick={() => navigate("/onboarding")}
                  className="inline-flex items-center gap-2 h-9 px-4 bg-neutral-900 text-white text-[13px] font-medium rounded-lg hover:bg-neutral-800 transition-colors">
                  Start onboarding <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Radar */}
        {storedProfile && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="border border-neutral-200 rounded-xl p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-neutral-900">Identity radar snapshot</h3>
              <span className="text-[12px] text-neutral-500">Alignment: {alignmentScore ?? 70}%</span>
            </div>
            <RadarChartComponent radarScores={storedProfile.radarScores} />
          </motion.div>
        )}
      </div>
    </div>
  );
};
