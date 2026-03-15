import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Save, LogOut, Search, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { AVATARS, getAvatar } from "@/lib/avatars";

const CAREER_OPTIONS = [
  // Technology
  "Machine Learning", "Web Development", "Data Science", "Cybersecurity", "Cloud Computing", 
  "UX Design", "DevOps", "Blockchain", "Game Development", "Mobile Development",
  // Healthcare & Medicine
  "Medicine", "Nursing", "Pharmacy", "Dentistry", "Psychology", "Physical Therapy", 
  "Public Health", "Biotechnology",
  // Business & Finance
  "Business Administration", "Finance", "Accounting", "Marketing", "Entrepreneurship",
  "Human Resources", "Supply Chain Management", "Economics",
  // Arts & Design
  "Graphic Design", "Fine Arts", "Music", "Film & Video", "Photography", 
  "Fashion Design", "Interior Design", "Architecture",
  // Sciences
  "Physics", "Chemistry", "Biology", "Mathematics", "Environmental Science",
  "Astronomy", "Geology",
  // Engineering
  "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", 
  "Chemical Engineering", "Aerospace Engineering", "Robotics",
  // Social Sciences & Humanities
  "Law", "Political Science", "Sociology", "History", "Philosophy", 
  "Literature", "Linguistics", "Anthropology",
  // Education
  "Elementary Education", "Secondary Education", "Higher Education", 
  "Special Education", "Educational Technology",
  // Media & Communication
  "Journalism", "Public Relations", "Digital Media", "Advertising",
  // Trades & Services
  "Culinary Arts", "Hospitality Management", "Automotive Technology", 
  "Construction", "Agriculture", "Veterinary Science",
  "Other"
];

export default function Profile() {
  const { user, token, logout, updateUser, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarId ?? 0);
  const [username, setUsername] = useState(user?.username ?? "");
  const [careerField, setCareerField] = useState(user?.careerField ?? "");
  const [careerSearch, setCareerSearch] = useState(user?.careerField ?? "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Filter career fields based on search
  const filteredCareers = CAREER_OPTIONS.filter(field =>
    field.toLowerCase().includes(careerSearch.toLowerCase())
  );

  if (!user) { setLocation("/login"); return null; }

  const currentAvatar = getAvatar(selectedAvatar);

  const handleSave = async () => {
    setError("");
    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatarId: selectedAvatar, username, careerField }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      updateUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => { logout(); setLocation("/"); };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold font-display text-white mb-8">Your Profile</h1>

          {/* Current Avatar Preview */}
          <div className="glass rounded-3xl p-8 border border-white/10 mb-6">
            <div className="flex items-center gap-6 mb-8">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${currentAvatar.bg} flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(168,85,247,0.4)] border-2 border-white/20`}>
                {currentAvatar.emoji}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{username}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-yellow-400 font-bold text-lg">⭐ {user.points}</span>
                  <span className="text-muted-foreground text-sm">points</span>
                </div>
              </div>
            </div>

            {/* Avatar Grid */}
            <div className="mb-6">
              <p className="text-sm text-gray-300 font-medium mb-3">Choose Avatar</p>
              <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
                {AVATARS.map(av => (
                  <button key={av.id} type="button" onClick={() => setSelectedAvatar(av.id)}
                    title={av.name}
                    className={`relative rounded-xl p-0.5 transition-all duration-150 ${selectedAvatar === av.id ? "ring-2 ring-primary scale-110" : "hover:scale-105"}`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${av.bg} flex items-center justify-center text-xl`}>
                      {av.emoji}
                    </div>
                    {selectedAvatar === av.id && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white text-[8px]">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Username */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 font-medium block mb-2">Username</label>
                <Input value={username} onChange={e => setUsername(e.target.value)} className="bg-white/5 border-white/10 focus-visible:ring-primary/50" />
              </div>
              <div>
                <label className="text-sm text-gray-300 font-medium block mb-2">Primary Career Field</label>
                
                {/* Searchable Dropdown for Career Fields */}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search career fields..."
                      value={careerSearch}
                      onChange={(e) => {
                        setCareerSearch(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="pl-10 pr-4 py-3 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary/50"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  
                  {/* Dropdown Results */}
                  {showDropdown && (
                    <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto glass rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl">
                      {filteredCareers.length > 0 ? (
                        filteredCareers.map((field) => (
                          <button
                            key={field}
                            type="button"
                            onClick={() => {
                              setCareerField(field);
                              setCareerSearch(field);
                              setShowDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-white/10 ${
                              careerField === field ? "bg-primary/20 text-primary" : "text-gray-300"
                            }`}
                          >
                            {field}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">No fields found</div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Selected Field Badge */}
                {careerField && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-gray-400">Selected:</span>
                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                      {careerField}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            {saved && <p className="text-green-400 text-sm mt-4">✓ Profile saved!</p>}

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1 rounded-xl gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button onClick={handleLogout} variant="outline" className="rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2">
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
