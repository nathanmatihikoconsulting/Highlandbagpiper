import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"bookings" | "reviews">("bookings");
  
  const myBookings = useQuery(api.bookings.getMyBookings);
  const bagpiperBookings = useQuery(api.bookings.getBagpiperBookings);
  const profile = useQuery(api.bagpipers.getMyProfile);
  
  const updateBookingStatus = useMutation(api.bookings.updateBookingStatus);

  const handleStatusUpdate = async (bookingId: any, status: any) => {
    try {
      await updateBookingStatus({ bookingId, status });
      toast.success("Booking status updated!");
    } catch (error) {
      toast.error("Failed to update booking status");
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "paid": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (myBookings === undefined || bagpiperBookings === undefined) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === "bookings"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              My Bookings ({myBookings.length})
            </button>
            {profile && (
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "reviews"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Received Bookings ({bagpiperBookings.length})
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "bookings" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
              
              {myBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No bookings yet. Browse bagpipers to make your first booking!
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {booking.bagpiper?.name}
                          </h3>
                          <p className="text-gray-600">{booking.eventType}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Date & Time:</span>
                          <p>{formatDate(booking.eventDate)} at {formatTime(booking.eventTime)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>
                          <p>{booking.duration} hours</p>
                        </div>
                        <div>
                          <span className="font-medium">Total:</span>
                          <p className="text-lg font-semibold text-green-600">
                            ${booking.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="font-medium text-sm">Location:</span>
                        <p className="text-sm text-gray-600">{booking.location}</p>
                      </div>
                      
                      {booking.specialRequests && (
                        <div className="mt-3">
                          <span className="font-medium text-sm">Special Requests:</span>
                          <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && profile && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Received Bookings</h2>
              
              {bagpiperBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No bookings received yet. Make sure your profile is complete to start receiving bookings!
                </div>
              ) : (
                <div className="space-y-4">
                  {bagpiperBookings.map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {booking.customerName}
                          </h3>
                          <p className="text-gray-600">{booking.eventType}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          {booking.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStatusUpdate(booking._id, "confirmed")}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                          {booking.status === "paid" && (
                            <button
                              onClick={() => handleStatusUpdate(booking._id, "completed")}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Date & Time:</span>
                          <p>{formatDate(booking.eventDate)} at {formatTime(booking.eventTime)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>
                          <p>{booking.duration} hours</p>
                        </div>
                        <div>
                          <span className="font-medium">Your Earnings:</span>
                          <p className="text-lg font-semibold text-green-600">
                            ${booking.bagpiperAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Location:</span>
                          <p className="text-gray-600">{booking.location}</p>
                        </div>
                        <div>
                          <span className="font-medium">Contact:</span>
                          <p className="text-gray-600">
                            {booking.customerEmail} • {booking.customerPhone}
                          </p>
                        </div>
                      </div>
                      
                      {booking.specialRequests && (
                        <div className="mt-3">
                          <span className="font-medium text-sm">Special Requests:</span>
                          <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
