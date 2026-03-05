import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`text-lg ${i < Math.floor(rating) ? "text-yellow-500" : "text-gray-300"}`}>★</span>
  ));
}

export function PiperProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const bagpiper = useQuery(
    api.bagpipers.getBagpiperById,
    id ? { bagpiperId: id as Id<"bagpipers"> } : "skip"
  );
  const files = useQuery(
    api.files.getBagpiperFiles,
    id ? { bagpiperId: id as Id<"bagpipers">, publicOnly: true } : "skip"
  );
  const reviews = useQuery(
    api.reviews.getBagpiperReviews,
    id ? { bagpiperId: id as Id<"bagpipers"> } : "skip"
  );

  if (bagpiper === undefined) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!bagpiper) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Piper not found.</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/")}>Browse pipers</Button>
      </div>
    );
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "audio": return "♪";
      case "certificate": return "★";
      case "document": return "▤";
      case "image": return "▨";
      default: return "▪";
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-charcoal mb-6 transition-colors"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-heading font-bold text-charcoal">{bagpiper.name}</h1>
            {bagpiper.verified && (
              <span className="bg-emerald-100 text-emerald-700 text-sm font-medium px-2.5 py-0.5 rounded-full border border-emerald-300">
                ✓ Verified
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{bagpiper.city}, {bagpiper.country}</p>
        </div>
      </div>

      {/* Profile image */}
      {bagpiper.profileImageUrl && (
        <img
          src={bagpiper.profileImageUrl}
          alt={bagpiper.name}
          className="w-full max-w-sm h-80 object-cover object-top rounded-xl mb-6 shadow-sm"
        />
      )}

      <div className="space-y-6">
        {/* Rating */}
        {bagpiper.averageRating && (
          <div>
            <h2 className="font-semibold text-charcoal mb-1">Rating</h2>
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(bagpiper.averageRating)}</div>
              <span className="text-muted-foreground text-sm">
                {bagpiper.averageRating.toFixed(1)} ({bagpiper.totalReviews} reviews)
              </span>
            </div>
          </div>
        )}

        {/* About */}
        <div>
          <h2 className="font-semibold text-charcoal mb-1">About</h2>
          <p className="text-muted-foreground leading-relaxed">{bagpiper.bio}</p>
        </div>

        {/* Specialties */}
        {bagpiper.specialties.length > 0 && (
          <div>
            <h2 className="font-semibold text-charcoal mb-2">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {bagpiper.specialties.map((s) => (
                <Badge key={s} variant="secondary" className="bg-primary/10 text-primary">{s}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div>
          <h2 className="font-semibold text-charcoal mb-1">Pricing</h2>
          <p className="text-3xl font-heading font-bold text-primary">${bagpiper.hourlyRate}/hour</p>
          <p className="text-muted-foreground text-sm">Minimum booking: {bagpiper.minimumBooking} hours</p>
        </div>

        {/* Videos */}
        {bagpiper.youtubeVideos.length > 0 && (
          <div>
            <h2 className="font-semibold text-charcoal mb-3">Performance Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bagpiper.youtubeVideos.map((videoId, index) => (
                <iframe
                  key={index}
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={`Performance ${index + 1}`}
                  className="w-full h-52 rounded-xl"
                  allowFullScreen
                />
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {files && files.length > 0 && (
          <div>
            <h2 className="font-semibold text-charcoal mb-2">Additional Files</h2>
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-primary">{getFileIcon(file.fileType)}</span>
                    <div>
                      <p className="font-medium text-sm text-charcoal">{file.fileName}</p>
                      {file.description && <p className="text-xs text-muted-foreground">{file.description}</p>}
                    </div>
                  </div>
                  {file.url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">View</a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <div>
            <h2 className="font-semibold text-charcoal mb-3">Reviews ({reviews.length})</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">{renderStars(review.rating)}</div>
                    {review.title && (
                      <span className="font-medium text-sm text-charcoal">{review.title}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {review.customerName}
                    {review.createdAt
                      ? ` · ${new Date(review.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`
                      : ""}
                  </p>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                  {review.response && (
                    <div className="mt-2 ml-3 pl-3 border-l-2 border-primary/30">
                      <p className="text-xs font-medium text-primary mb-0.5">Response from the piper</p>
                      <p className="text-sm text-gray-600 italic">{review.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Book now CTA */}
        <div className="pt-4 border-t">
          <Button
            className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white px-8 py-3 text-base"
            onClick={() => navigate("/")}
          >
            Book This Piper
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Sign in to send an enquiry to {bagpiper.name}
          </p>
        </div>
      </div>
    </div>
  );
}
