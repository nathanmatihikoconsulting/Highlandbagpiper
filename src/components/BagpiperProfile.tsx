import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useLocation } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { FileUpload } from "./FileUpload";
import { PhotoCropModal } from "./PhotoCropModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function StripeConnectSection({ profile }: { profile: any }) {
  const createConnectAccountLink = useAction(api.stripe.createConnectAccountLink);
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const origin = window.location.origin;
      const returnUrl = `${origin}/profile?stripe=connected`;
      const refreshUrl = `${origin}/profile?stripe=refresh`;
      const { url } = await createConnectAccountLink({ returnUrl, refreshUrl });
      window.location.href = url;
    } catch (err: any) {
      toast.error(err.message ?? "Failed to start Stripe setup");
      setLoading(false);
    }
  };

  if (!profile) return null;

  const isConnected = profile.stripeChargesEnabled;
  const isPending = profile.stripeAccountId && !isConnected;

  // Show success toast when redirected back from Stripe
  useEffect(() => {
    if (location.search.includes("stripe=connected")) {
      toast.success("Stripe account connected! You can now receive payments.");
    }
  }, [location.search]);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold text-charcoal mb-1">Payment Setup</h2>
        <p className="text-sm text-muted-foreground">
          Connect your Stripe account to receive deposit and final payments directly from customers.
        </p>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <span className="text-2xl">✓</span>
          <div>
            <p className="font-semibold text-emerald-700">Stripe Connected</p>
            <p className="text-sm text-emerald-600">You can receive payments from customers.</p>
          </div>
        </div>
      ) : isPending ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-semibold text-amber-700">Onboarding in progress</p>
              <p className="text-sm text-amber-600">Complete your Stripe setup to start accepting payments.</p>
            </div>
          </div>
          <Button
            onClick={handleConnect}
            disabled={loading}
            className="bg-primary hover:bg-primary-hover text-white"
          >
            {loading ? "Loading…" : "Continue Stripe Setup"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 border rounded-lg p-4 text-sm text-muted-foreground space-y-1">
            <p>• Receive 25% deposits when customers accept your quote</p>
            <p>• Receive the remaining 75% after the event</p>
            <p>• Highland Bagpiper retains a 5% platform fee</p>
          </div>
          <Button
            onClick={handleConnect}
            disabled={loading}
            className="bg-primary hover:bg-primary-hover text-white"
          >
            {loading ? "Loading…" : "Connect with Stripe"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Powered by Stripe — your bank details are never stored by Highland Bagpiper.
          </p>
        </div>
      )}
    </div>
  );
}

export function BagpiperProfile() {
  const profile = useQuery(api.bagpipers.getMyProfile);
  const createProfile = useMutation(api.bagpipers.createProfile);
  const updateProfile = useMutation(api.bagpipers.updateProfile);
  const generateUploadUrl = useMutation(api.bagpipers.generateUploadUrl);
  const updateProfileImage = useMutation(api.bagpipers.updateProfileImage);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    bio: string;
    location: string;
    city: string;
    country: string;
    zipCode: string;
    phone: string;
    email: string;
    currency: string;
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
    email: "",
    currency: "NZD",
    hourlyRate: 150,
    minimumBooking: 2,
    travelRadius: 50,
    youtubeVideos: [""],
    specialties: [],
  });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

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
        email: profile.email ?? "",
        currency: (profile as any).currency ?? "NZD",
        hourlyRate: profile.hourlyRate,
        minimumBooking: profile.minimumBooking,
        travelRadius: profile.travelRadius,
        youtubeVideos: profile.youtubeVideos.length > 0 ? profile.youtubeVideos : [""],
        specialties: profile.specialties,
      });
    }
  }, [profile, isEditing]);

  const specialtyOptions = [
    "Weddings", "Funerals", "Corporate Events", "Parades",
    "Graduations", "Military Ceremonies", "Highland Games", "Burns Night",
  ];

  const countries = [
    "New Zealand", "Australia", "England", "Scotland", "Wales", "Ireland",
    "Canada", "USA", "Argentina", "Belgium", "Brazil", "Chile", "Denmark",
    "France", "Germany", "Italy", "Japan", "Netherlands", "Norway",
    "South Africa", "Spain", "Sweden", "Switzerland",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const videoIds = formData.youtubeVideos
        .filter(video => video.trim())
        .map(video => {
          const match = video.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
          return match ? match[1] : video;
        });

      const profileData = { ...formData, youtubeVideos: videoIds };

      if (profile) {
        await updateProfile({ bagpiperId: profile._id, ...profileData });
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

  /** Step 1: file chosen → show crop modal */
  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected if cancelled
    event.target.value = "";
    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  /** Step 2: user confirms crop → upload the cropped blob */
  const handleCropConfirm = async (blob: Blob) => {
    setCropImageSrc(null);
    if (!profile) return;
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });
      const json = await result.json();
      if (!result.ok) throw new Error(`Upload failed: ${JSON.stringify(json)}`);
      await updateProfileImage({ bagpiperId: profile._id, storageId: json.storageId });
      toast.success("Profile photo updated!");
    } catch {
      toast.error("Failed to upload photo");
    }
  };

  const addVideoField = () =>
    setFormData({ ...formData, youtubeVideos: [...formData.youtubeVideos, ""] });

  const removeVideoField = (index: number) =>
    setFormData({ ...formData, youtubeVideos: formData.youtubeVideos.filter((_, i) => i !== index) });

  const toggleSpecialty = (specialty: string) => {
    const newSpecialties = formData.specialties.includes(specialty)
      ? formData.specialties.filter(s => s !== specialty)
      : [...formData.specialties, specialty];
    setFormData({ ...formData, specialties: newSpecialties });
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  if (profile === undefined) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!profile && !isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">
              Create Your Bagpiper Profile
            </h2>
            <p className="text-muted-foreground mb-6">
              Set up your profile to start receiving booking requests from customers.
            </p>
            <Button className="bg-primary hover:bg-primary-hover text-white" onClick={() => setIsEditing(true)}>
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-6">
              {profile ? "Edit Profile" : "Create Profile"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Name *</Label>
                  <Input type="text" value={formData.name} onChange={set("name")} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone *</Label>
                  <Input type="tel" value={formData.phone} onChange={set("phone")} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Booking contact email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={set("email")}
                    required
                    placeholder="email address for booking notifications"
                  />
                  <p className="text-xs text-muted-foreground">
                    You will be emailed at this address when you receive a new enquiry.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>Preferred Currency *</Label>
                  <Select value={formData.currency} onValueChange={(v) => setFormData((p) => ({ ...p, currency: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {["NZD", "AUD", "USD", "GBP", "EUR"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Currency used in your quotes.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Bio *</Label>
                <Textarea
                  value={formData.bio}
                  onChange={set("bio")}
                  required
                  rows={4}
                  placeholder="Tell customers about your experience, style, and what makes you unique..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Location/Address *</Label>
                  <Input type="text" value={formData.location} onChange={set("location")} required placeholder="Full address" />
                </div>
                <div className="space-y-1.5">
                  <Label>City *</Label>
                  <Input type="text" value={formData.city} onChange={set("city")} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Country *</Label>
                  <Select value={formData.country} onValueChange={(v) => setFormData((p) => ({ ...p, country: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>ZIP/Postal Code *</Label>
                  <Input type="text" value={formData.zipCode} onChange={set("zipCode")} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Hourly Rate ($) *</Label>
                  <Input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData((p) => ({ ...p, hourlyRate: Number(e.target.value) }))}
                    required min="50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Minimum Booking (hours) *</Label>
                  <Input
                    type="number"
                    value={formData.minimumBooking}
                    onChange={(e) => setFormData((p) => ({ ...p, minimumBooking: Number(e.target.value) }))}
                    required min="1" step="0.5"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Travel Radius (kms) *</Label>
                <Input
                  type="number"
                  value={formData.travelRadius}
                  onChange={(e) => setFormData((p) => ({ ...p, travelRadius: Number(e.target.value) }))}
                  required min="10"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Specialties *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {specialtyOptions.map((specialty) => (
                    <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={() => toggleSpecialty(specialty)}
                        className="accent-primary"
                      />
                      <span className="text-sm">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>YouTube Performance Videos</Label>
                {formData.youtubeVideos.map((video, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      type="url"
                      value={video}
                      onChange={(e) => {
                        const newVideos = [...formData.youtubeVideos];
                        newVideos[index] = e.target.value;
                        setFormData({ ...formData, youtubeVideos: newVideos });
                      }}
                      placeholder="YouTube video URL"
                    />
                    {formData.youtubeVideos.length > 1 && (
                      <Button type="button" variant="outline" onClick={() => removeVideoField(index)}
                        className="text-destructive hover:text-destructive">
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVideoField}
                  className="text-primary hover:text-primary/80 text-sm"
                >
                  + Add another video
                </button>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary-hover text-white">
                  {profile ? "Update Profile" : "Create Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
    {cropImageSrc && (
      <PhotoCropModal
        imageSrc={cropImageSrc}
        onConfirm={handleCropConfirm}
        onCancel={() => setCropImageSrc(null)}
      />
    )}
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <Tabs defaultValue="profile">
          <div className="border-b px-6 pt-4">
            <TabsList className="bg-transparent p-0 h-auto gap-0">
              <TabsTrigger
                value="profile"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none px-4 pb-3"
              >
                Profile Information
              </TabsTrigger>
              <TabsTrigger
                value="files"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none px-4 pb-3"
              >
                Files & Media
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none px-4 pb-3"
              >
                Payments
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="p-6 mt-0">
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-heading text-2xl font-semibold text-charcoal">My Profile</h2>
              <Button className="bg-primary hover:bg-primary-hover text-white" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
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
                      <div className="w-48 h-64 rounded-lg bg-gradient-to-br from-primary/10 to-teal/10 flex items-center justify-center mx-auto shadow-md">
                        <span className="text-4xl opacity-30">♪</span>
                      </div>
                    )}
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-primary text-white rounded-full p-2 hover:bg-primary-hover transition-colors shadow-lg"
                    >
                      📷
                    </button>
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <h3 className="font-heading text-xl font-semibold text-charcoal mt-4">{profile?.name}</h3>
                  <p className="text-muted-foreground text-sm">{profile?.city}, {profile?.country}</p>
                  {profile?.averageRating && (
                    <div className="flex justify-center items-center gap-2 mt-2">
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={`text-base ${i < Math.floor(profile.averageRating!) ? "text-yellow-500" : "text-gray-300"}`}>★</span>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">({profile.totalReviews} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h4 className="font-semibold text-charcoal mb-2">About</h4>
                  <p className="text-muted-foreground text-sm">{profile?.bio}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-charcoal mb-2">Contact</h4>
                    <p className="text-sm text-muted-foreground">{profile?.phone}</p>
                    {profile?.email && (
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{profile?.location}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal mb-2">Pricing</h4>
                    <p className="text-2xl font-heading font-bold text-primary">${profile?.hourlyRate}/hour</p>
                    <p className="text-sm text-muted-foreground">Minimum: {profile?.minimumBooking} hours</p>
                    <p className="text-sm text-muted-foreground">Travel radius: {profile?.travelRadius} kms</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-charcoal mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="bg-primary/10 text-primary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {profile?.youtubeVideos && profile.youtubeVideos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-charcoal mb-2">Performance Videos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.youtubeVideos.map((videoId, index) => (
                        <iframe
                          key={index}
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={`Performance ${index + 1}`}
                          className="w-full h-48 rounded-lg"
                          allowFullScreen
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="p-6 mt-0">
            {profile && <FileUpload bagpiperId={profile._id} />}
          </TabsContent>

          <TabsContent value="payments" className="p-6 mt-0">
            <StripeConnectSection profile={profile} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
    </>
  );
}
