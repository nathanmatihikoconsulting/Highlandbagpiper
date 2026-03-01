import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { FileUpload } from "./FileUpload";

export function BagpiperProfile() {
  const profile = useQuery(api.bagpipers.getMyProfile);
  const createProfile = useMutation(api.bagpipers.createProfile);
  const updateProfile = useMutation(api.bagpipers.updateProfile);
  const generateUploadUrl = useMutation(api.bagpipers.generateUploadUrl);
  const updateProfileImage = useMutation(api.bagpipers.updateProfileImage);

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "files">("profile");
  const [formData, setFormData] = useState<{
    name: string;
    bio: string;
    location: string;
    city: string;
    country: string;
    zipCode: string;
    phone: string;
    hourlyRate: number;
    minimumBooking: number;
    travelRadius: number;
    youtubeVideos: string[];
    specialties: string[];
  }>({
    name: "",
    bio: "",
    location: "",
    city: "",
    country: "",
    zipCode: "",
    phone: "",
    hourlyRate: 150,
    minimumBooking: 2,
    travelRadius: 50,
    youtubeVideos: [""],
    specialties: [],
  });

  const imageInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        name: profile.name,
        bio: profile.bio,
        location: profile.location,
        city: profile.city,
        country: profile.country,
        zipCode: profile.zipCode,
        phone: profile.phone,
        hourlyRate: profile.hourlyRate,
        minimumBooking: profile.minimumBooking,
        travelRadius: profile.travelRadius,
        youtubeVideos: profile.youtubeVideos.length > 0 ? profile.youtubeVideos : [""],
        specialties: profile.specialties,
      });
    }
  }, [profile, isEditing]);

  const specialtyOptions = [
    "Weddings",
    "Funerals",
    "Corporate Events",
    "Parades",
    "Graduations",
    "Military Ceremonies",
    "Highland Games",
    "Burns Night",
  ];

  const countries = [
    "New Zealand",
    "Australia", 
    "England",
    "Scotland",
    "Wales",
    "Ireland",
    "Canada",
    "USA",
    "Argentina",
    "Belgium",
    "Brazil",
    "Chile",
    "Denmark",
    "France",
    "Germany",
    "Italy",
    "Japan",
    "Netherlands",
    "Norway",
    "South Africa",
    "Spain",
    "Sweden",
    "Switzerland",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const videoIds = formData.youtubeVideos
        .filter(video => video.trim())
        .map(video => {
          // Extract video ID from YouTube URL
          const match = video.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
          return match ? match[1] : video;
        });

      const profileData = {
        ...formData,
        youtubeVideos: videoIds,
      };

      if (profile) {
        await updateProfile({
          bagpiperId: profile._id,
          ...profileData,
        });
        toast.success("Profile updated successfully!");
      } else {
        await createProfile(profileData);
        toast.success("Profile created successfully!");
      }
      
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save profile");
      console.error(error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    try {
      const postUrl = await generateUploadUrl();
      
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      const json = await result.json();
      if (!result.ok) {
        throw new Error(`Upload failed: ${JSON.stringify(json)}`);
      }
      
      const { storageId } = json;
      await updateProfileImage({
        bagpiperId: profile._id,
        storageId,
      });
      
      toast.success("Profile image updated!");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    }
  };

  const addVideoField = () => {
    setFormData({
      ...formData,
      youtubeVideos: [...formData.youtubeVideos, ""],
    });
  };

  const removeVideoField = (index: number) => {
    setFormData({
      ...formData,
      youtubeVideos: formData.youtubeVideos.filter((_, i) => i !== index),
    });
  };

  const toggleSpecialty = (specialty: string) => {
    const newSpecialties = formData.specialties.includes(specialty)
      ? formData.specialties.filter(s => s !== specialty)
      : [...formData.specialties, specialty];
    
    setFormData({ ...formData, specialties: newSpecialties });
  };

  if (profile === undefined) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!profile && !isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Create Your Bagpiper Profile
          </h2>
          <p className="text-gray-600 mb-6">
            Set up your profile to start receiving booking requests from customers.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {profile ? "Edit Profile" : "Create Profile"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                required
                rows={4}
                placeholder="Tell customers about your experience, style, and what makes you unique..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location/Address *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  placeholder="Full address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP/Postal Code *
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate ($) *
                </label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                  required
                  min="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Booking (hours) *
                </label>
                <input
                  type="number"
                  value={formData.minimumBooking}
                  onChange={(e) => setFormData({ ...formData, minimumBooking: Number(e.target.value) })}
                  required
                  min="1"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Travel Radius (miles) *
              </label>
              <input
                type="number"
                value={formData.travelRadius}
                onChange={(e) => setFormData({ ...formData, travelRadius: Number(e.target.value) })}
                required
                min="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {specialtyOptions.map((specialty) => (
                  <label key={specialty} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(specialty)}
                      onChange={() => toggleSpecialty(specialty)}
                      className="mr-2"
                    />
                    <span className="text-sm">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Performance Videos
              </label>
              {formData.youtubeVideos.map((video, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={video}
                    onChange={(e) => {
                      const newVideos = [...formData.youtubeVideos];
                      newVideos[index] = e.target.value;
                      setFormData({ ...formData, youtubeVideos: newVideos });
                    }}
                    placeholder="YouTube video URL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {formData.youtubeVideos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVideoField(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addVideoField}
                className="text-green-600 hover:text-green-700 text-sm"
              >
                + Add another video
              </button>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                {profile ? "Update Profile" : "Create Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "profile"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab("files")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "files"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Files & Media
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <div className="relative inline-block">
                      {profile?.profileImageUrl ? (
                        <img
                          src={profile.profileImageUrl}
                          alt={profile.name}
                          className="w-48 h-64 rounded-lg object-cover mx-auto shadow-md"
                        />
                      ) : (
                        <div className="w-48 h-64 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mx-auto shadow-md">
                          <span className="text-6xl">🎵</span>
                        </div>
                      )}
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        className="absolute bottom-2 right-2 bg-green-600 text-white rounded-full p-2 hover:bg-green-700 transition-colors shadow-lg"
                      >
                        📷
                      </button>
                    </div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <h3 className="text-xl font-semibold mt-4">{profile?.name}</h3>
                    <p className="text-gray-600">{profile?.city}, {profile?.country}</p>
                    {profile?.averageRating && (
                      <div className="flex justify-center items-center gap-2 mt-2">
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span
                              key={i}
                              className={`text-lg ${
                                i < Math.floor(profile.averageRating!) ? "text-yellow-400" : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({profile.totalReviews} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                    <p className="text-gray-700">{profile?.bio}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                      <p className="text-gray-700">{profile?.phone}</p>
                      <p className="text-gray-700">{profile?.location}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Pricing</h4>
                      <p className="text-2xl font-bold text-green-600">
                        ${profile?.hourlyRate}/hour
                      </p>
                      <p className="text-gray-600">
                        Minimum: {profile?.minimumBooking} hours
                      </p>
                      <p className="text-gray-600">
                        Travel radius: {profile?.travelRadius} miles
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile?.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {profile?.youtubeVideos && profile.youtubeVideos.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Performance Videos</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.youtubeVideos.map((videoId, index) => (
                          <div key={index} className="aspect-w-16 aspect-h-9">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title={`Performance ${index + 1}`}
                              className="w-full h-48 rounded-lg"
                              allowFullScreen
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "files" && profile && (
            <FileUpload bagpiperId={profile._id} />
          )}
        </div>
      </div>
    </div>
  );
}
