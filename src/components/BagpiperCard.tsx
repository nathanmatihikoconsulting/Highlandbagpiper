import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { BookingModal } from "./BookingModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BagpiperCardProps {
  bagpiper: {
    _id: Id<"bagpipers">;
    name: string;
    bio: string;
    location: string;
    city: string;
    country: string;
    hourlyRate: number;
    minimumBooking: number;
    travelRadius: number;
    profileImageUrl: string | null;
    youtubeVideos: string[];
    specialties: string[];
    averageRating?: number;
    totalReviews: number;
  };
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`text-base ${i < Math.floor(rating) ? "text-yellow-500" : "text-gray-300"}`}>★</span>
  ));
}

export function BagpiperCard({ bagpiper }: BagpiperCardProps) {
  const [showBooking, setShowBooking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="bg-gray-100">
          {bagpiper.profileImageUrl ? (
            <img src={bagpiper.profileImageUrl} alt={bagpiper.name} className="w-full h-64 object-cover object-top" />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-primary/10 to-teal/10 flex items-center justify-center">
              <span className="text-4xl opacity-30">♪</span>
            </div>
          )}
        </div>

        <CardContent className="p-5">
          <h3 className="text-xl font-heading font-semibold text-charcoal mb-1">{bagpiper.name}</h3>
          <p className="text-muted-foreground text-sm mb-2">{bagpiper.city}, {bagpiper.country}</p>

          {bagpiper.averageRating && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">{renderStars(bagpiper.averageRating)}</div>
              <span className="text-sm text-muted-foreground">({bagpiper.totalReviews})</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{bagpiper.bio}</p>

          <div className="flex flex-wrap gap-1 mb-4">
            {bagpiper.specialties.slice(0, 2).map((s) => (
              <Badge key={s} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{s}</Badge>
            ))}
            {bagpiper.specialties.length > 2 && (
              <Badge variant="outline" className="text-muted-foreground">+{bagpiper.specialties.length - 2} more</Badge>
            )}
          </div>

          <p className="text-lg font-semibold text-primary mb-4">
            ${bagpiper.hourlyRate}/hour
            <span className="text-sm font-normal text-muted-foreground ml-1">({bagpiper.minimumBooking}h min)</span>
          </p>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/5" onClick={() => setShowDetails(true)}>
              View Details
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary-hover text-white" onClick={() => setShowBooking(true)}>
              Book Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {showBooking && <BookingModal bagpiper={bagpiper} onClose={() => setShowBooking(false)} />}

      <BagpiperDetailsModal
        bagpiper={bagpiper}
        open={showDetails}
        onClose={() => setShowDetails(false)}
        onBook={() => { setShowDetails(false); setShowBooking(true); }}
      />
    </>
  );
}

function BagpiperDetailsModal({
  bagpiper, open, onClose, onBook,
}: {
  bagpiper: BagpiperCardProps["bagpiper"];
  open: boolean;
  onClose: () => void;
  onBook: () => void;
}) {
  const files = useQuery(api.files.getBagpiperFiles, { bagpiperId: bagpiper._id, publicOnly: true });
  const reviews = useQuery(api.reviews.getBagpiperReviews, { bagpiperId: bagpiper._id });

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
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-charcoal">{bagpiper.name}</DialogTitle>
        </DialogHeader>

        {bagpiper.profileImageUrl && (
          <img src={bagpiper.profileImageUrl} alt={bagpiper.name} className="w-full max-w-sm h-80 object-cover rounded-lg mx-auto" />
        )}

        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">{bagpiper.city}, {bagpiper.country}</p>

          {bagpiper.averageRating && (
            <div>
              <h3 className="font-semibold text-charcoal mb-1">Rating</h3>
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(bagpiper.averageRating)}</div>
                <span className="text-muted-foreground text-sm">{bagpiper.averageRating.toFixed(1)} ({bagpiper.totalReviews} reviews)</span>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-charcoal mb-1">About</h3>
            <p className="text-muted-foreground text-sm">{bagpiper.bio}</p>
          </div>

          <div>
            <h3 className="font-semibold text-charcoal mb-2">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {bagpiper.specialties.map((s) => (
                <Badge key={s} variant="secondary" className="bg-primary/10 text-primary">{s}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-charcoal mb-1">Pricing</h3>
            <p className="text-2xl font-heading font-bold text-primary">${bagpiper.hourlyRate}/hour</p>
            <p className="text-muted-foreground text-sm">Minimum booking: {bagpiper.minimumBooking} hours</p>
          </div>

          {bagpiper.youtubeVideos.length > 0 && (
            <div>
              <h3 className="font-semibold text-charcoal mb-2">Performance Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bagpiper.youtubeVideos.map((videoId, index) => (
                  <iframe key={index} src={`https://www.youtube.com/embed/${videoId}`} title={`Performance ${index + 1}`} className="w-full h-48 rounded-lg" allowFullScreen />
                ))}
              </div>
            </div>
          )}

          {files && files.length > 0 && (
            <div>
              <h3 className="font-semibold text-charcoal mb-2">Additional Files</h3>
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

          {reviews && reviews.length > 0 && (
            <div>
              <h3 className="font-semibold text-charcoal mb-3">
                Reviews ({reviews.length})
              </h3>
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
                      {review.createdAt ? ` · ${new Date(review.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}` : ""}
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
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
          <Button className="flex-1 bg-primary hover:bg-primary-hover text-white" onClick={onBook}>Book Now</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
