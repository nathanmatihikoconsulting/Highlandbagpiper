import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageThread } from "./MessageThread";

function getStatusClass(status: string) {
  switch (status) {
    case "pending":      return "border-yellow-400 text-yellow-700 bg-yellow-50";
    case "enquiry":      return "border-yellow-400 text-yellow-700 bg-yellow-50";
    case "quoted":       return "border-blue-300 text-blue-600 bg-blue-50";
    case "accepted":     return "border-teal text-teal bg-teal/10";
    case "confirmed":    return "border-blue-400 text-blue-700 bg-blue-50";
    case "deposit_paid": return "border-primary text-primary bg-primary/10";
    case "paid":         return "border-primary text-primary bg-primary/10";
    case "completed":    return "border-gray-400 text-gray-600 bg-gray-100";
    case "cancelled":    return "border-red-400 text-red-700 bg-red-50";
    case "disputed":     return "border-orange-400 text-orange-700 bg-orange-50";
    default:             return "";
  }
}

function formatDate(d: string) { return new Date(d).toLocaleDateString(); }
function formatTime(t: string) {
  return new Date(`2000-01-01T${t}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Shows unread dot on the Messages button if there are unread messages in this booking. */
function MessagesButton({
  bookingId,
  open,
  onToggle,
}: {
  bookingId: Id<"bookings">;
  open: boolean;
  onToggle: () => void;
}) {
  const messages = useQuery(api.messages.getMessages, { bookingId });
  const unread = messages?.filter((m) => !m.isOwn && !m.readAt).length ?? 0;

  return (
    <Button size="sm" variant="outline" onClick={onToggle} className="relative">
      {open ? "Hide Messages" : "Messages"}
      {!open && unread > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Button>
  );
}

export function Dashboard() {
  const myBookings = useQuery(api.bookings.getMyBookings);
  const bagpiperBookings = useQuery(api.bookings.getBagpiperBookings);
  const profile = useQuery(api.bagpipers.getMyProfile);
  const updateBookingStatus = useMutation(api.bookings.updateBookingStatus);

  const [openThreadId, setOpenThreadId] = useState<string | null>(null);

  const toggleThread = (bookingId: string) =>
    setOpenThreadId((prev) => (prev === bookingId ? null : bookingId));

  const handleStatusUpdate = async (bookingId: any, status: any) => {
    try {
      await updateBookingStatus({ bookingId, status });
      toast.success("Booking status updated!");
    } catch {
      toast.error("Failed to update booking status");
    }
  };

  if (myBookings === undefined || bagpiperBookings === undefined) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs defaultValue="bookings">
        <TabsList className="mb-4">
          <TabsTrigger value="bookings">My Bookings ({myBookings.length})</TabsTrigger>
          {profile && <TabsTrigger value="received">Received Bookings ({bagpiperBookings.length})</TabsTrigger>}
        </TabsList>

        {/* ── Customer bookings ── */}
        <TabsContent value="bookings">
          <div className="space-y-4">
            <h2 className="text-xl font-heading font-semibold text-charcoal">My Bookings</h2>
            {myBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No bookings yet. Browse bagpipers to make your first booking!
                </CardContent>
              </Card>
            ) : (
              myBookings.map((booking) => (
                <Card key={booking._id}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-heading font-semibold text-lg text-charcoal">{booking.bagpiper?.name}</h3>
                        <p className="text-muted-foreground text-sm">{booking.eventType}</p>
                      </div>
                      <Badge className={`capitalize ${getStatusClass(booking.status)}`} variant="outline">
                        {booking.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Date & Time</p>
                        <p className="text-muted-foreground">{formatDate(booking.eventDate)} at {formatTime(booking.eventTime)}</p>
                      </div>
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-muted-foreground">{booking.duration} hours</p>
                      </div>
                      <div>
                        <p className="font-medium">Total</p>
                        <p className="text-lg font-semibold text-primary">${booking.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="mt-3 text-sm">
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">{booking.location}</p>
                    </div>

                    {booking.specialRequests && (
                      <div className="mt-2 text-sm">
                        <p className="font-medium">Special Requests</p>
                        <p className="text-muted-foreground">{booking.specialRequests}</p>
                      </div>
                    )}

                    {/* Messages toggle */}
                    <div className="mt-4">
                      <MessagesButton
                        bookingId={booking._id}
                        open={openThreadId === booking._id}
                        onToggle={() => toggleThread(booking._id)}
                      />
                    </div>
                    {openThreadId === booking._id && (
                      <MessageThread bookingId={booking._id} />
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* ── Piper received bookings ── */}
        {profile && (
          <TabsContent value="received">
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-semibold text-charcoal">Received Bookings</h2>
              {bagpiperBookings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No bookings received yet. Make sure your profile is complete!
                  </CardContent>
                </Card>
              ) : (
                bagpiperBookings.map((booking) => (
                  <Card key={booking._id}>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-heading font-semibold text-lg text-charcoal">{booking.customerName}</h3>
                          <p className="text-muted-foreground text-sm">{booking.eventType}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <Badge className={`capitalize ${getStatusClass(booking.status)}`} variant="outline">
                            {booking.status.replace("_", " ")}
                          </Badge>
                          {booking.status === "pending" && (
                            <>
                              <Button size="sm" className="bg-primary hover:bg-primary-hover text-white" onClick={() => handleStatusUpdate(booking._id, "confirmed")}>Accept</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(booking._id, "cancelled")}>Decline</Button>
                            </>
                          )}
                          {booking.status === "paid" && (
                            <Button size="sm" variant="secondary" onClick={() => handleStatusUpdate(booking._id, "completed")}>Mark Complete</Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Date & Time</p>
                          <p className="text-muted-foreground">{formatDate(booking.eventDate)} at {formatTime(booking.eventTime)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Duration</p>
                          <p className="text-muted-foreground">{booking.duration} hours</p>
                        </div>
                        <div>
                          <p className="font-medium">Your Earnings</p>
                          <p className="text-lg font-semibold text-primary">${booking.bagpiperAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Location</p>
                          <p className="text-muted-foreground">{booking.location}</p>
                        </div>
                        <div>
                          <p className="font-medium">Contact</p>
                          <p className="text-muted-foreground">{booking.customerEmail} · {booking.customerPhone}</p>
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <div className="mt-2 text-sm">
                          <p className="font-medium">Special Requests</p>
                          <p className="text-muted-foreground">{booking.specialRequests}</p>
                        </div>
                      )}

                      {/* Messages toggle */}
                      <div className="mt-4">
                        <MessagesButton
                          bookingId={booking._id}
                          open={openThreadId === booking._id}
                          onToggle={() => toggleThread(booking._id)}
                        />
                      </div>
                      {openThreadId === booking._id && (
                        <MessageThread bookingId={booking._id} />
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
