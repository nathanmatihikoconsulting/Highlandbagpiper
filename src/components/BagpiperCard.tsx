import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { BookingModal } from "./BookingModal";

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

export function BagpiperCard({ bagpiper }: BagpiperCardProps) {
  const [showBooking, setShowBooking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
          {bagpiper.profileImageUrl ? (
            <img
              src={bagpiper.profileImageUrl}
              alt={bagpiper.name}
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <span className="text-4xl">🎵</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {bagpiper.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-2">
            {bagpiper.city}, {bagpiper.country}
          </p>

          {bagpiper.averageRating && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {renderStars(bagpiper.averageRating)}
              </div>
              <span className="text-sm text-gray-600">
                ({bagpiper.totalReviews} reviews)
              </span>
            </div>
          )}

          <p className="text-gray-700 text-sm mb-3 line-clamp-2">
            {bagpiper.bio}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {bagpiper.specialties.slice(0, 2).map((specialty) => (
              <span
                key={specialty}
                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
              >
                {specialty}
              </span>
            ))}
            {bagpiper.specialties.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{bagpiper.specialties.length - 2} more
              </span>
            )}
          </div>

          <div className="text-lg font-semibold text-green-600 mb-3">
            ${bagpiper.hourlyRate}/hour
            <span className="text-sm text-gray-500 font-normal">
              ({bagpiper.minimumBooking}h min)
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 px-3 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors text-sm"
            >
              View Details
            </button>
            <button
              onClick={() => setShowBooking(true)}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal
          bagpiper={bagpiper}
          onClose={() => setShowBooking(false)}
        />
      )}

      {showDetails && (
        <BagpiperDetailsModal
          bagpiper={bagpiper}
          onClose={() => setShowDetails(false)}
          onBook={() => {
            setShowDetails(false);
            setShowBooking(true);
          }}
        />
      )}
    </>
  );
}

function BagpiperDetailsModal({ 
  bagpiper, 
  onClose, 
  onBook 
}: { 
  bagpiper: BagpiperCardProps["bagpiper"];
  onClose: () => void;
  onBook: () => void;
}) {
  const files = useQuery(api.files.getBagpiperFiles, { 
    bagpiperId: bagpiper._id, 
    publicOnly: true 
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "audio": return "🎵";
      case "certificate": return "🏆";
      case "document": return "📄";
      case "image": return "🖼️";
      default: return "📁";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{bagpiper.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {bagpiper.profileImageUrl && (
            <img
              src={bagpiper.profileImageUrl}
              alt={bagpiper.name}
              className="w-full max-w-sm h-80 object-cover rounded-lg mb-4 mx-auto"
            />
          )}

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-700">
                {bagpiper.location} • Travel radius: {bagpiper.travelRadius} miles
              </p>
            </div>

            {bagpiper.averageRating && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Rating</h3>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(bagpiper.averageRating)}
                  </div>
                  <span className="text-gray-600">
                    {bagpiper.averageRating.toFixed(1)} ({bagpiper.totalReviews} reviews)
                  </span>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-700">{bagpiper.bio}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {bagpiper.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Pricing</h3>
              <p className="text-2xl font-bold text-green-600">
                ${bagpiper.hourlyRate}/hour
              </p>
              <p className="text-gray-600">
                Minimum booking: {bagpiper.minimumBooking} hours
              </p>
            </div>

            {bagpiper.youtubeVideos.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Performance Videos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bagpiper.youtubeVideos.map((videoId, index) => (
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

            {files && files.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Additional Files</h3>
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getFileIcon(file.fileType)}</span>
                        <div>
                          <p className="font-medium text-gray-900">{file.fileName}</p>
                          {file.description && (
                            <p className="text-sm text-gray-600">{file.description}</p>
                          )}
                        </div>
                      </div>
                      {file.url && (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          View
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onBook}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
