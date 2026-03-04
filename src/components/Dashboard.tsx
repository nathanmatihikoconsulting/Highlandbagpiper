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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

/** Inline form for pipers to send or update a quote. */
function QuoteForm({
  bookingId,
  existing,
  onDone,
}: {
  bookingId: Id<"bookings">;
  existing?: any;
  onDone: () => void;
}) {
  const submitQuote = useMutation(api.bookings.submitQuote);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    performanceFee: existing?.performanceFee?.toString() ?? "",
    travelFee: existing?.travelFee?.toString() ?? "",
    accommodationFee: existing?.accommodationFee?.toString() ?? "",
    currency: existing?.currency ?? "NZD",
    notes: existing?.notes ?? "",
    validUntil: existing?.validUntil ?? "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const perf = parseFloat(form.performanceFee);
    if (isNaN(perf) || perf <= 0) {
      toast.error("Please enter a valid performance fee");
      return;
    }
    setSaving(true);
    try {
      await submitQuote({
        bookingId,
        performanceFee: perf,
        travelFee: form.travelFee ? parseFloat(form.travelFee) : undefined,
        accommodationFee: form.accommodationFee ? parseFloat(form.accommodationFee) : undefined,
        currency: form.currency,
        notes: form.notes || undefined,
        validUntil: form.validUntil || undefined,
      });
      toast.success("Quote sent to customer!");
      onDone();
    } catch {
      toast.error("Failed to send quote");
    } finally {
      setSaving(false);
    }
  };

  const perf = parseFloat(form.performanceFee) || 0;
  const travel = parseFloat(form.travelFee) || 0;
  const accomm = parseFloat(form.accommodationFee) || 0;
  const total = perf + travel + accomm;

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      <h4 className="font-semibold text-charcoal text-sm">
        {existing ? "Update Quote" : "Send Quote to Customer"}
      </h4>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Currency</Label>
          <select
            value={form.currency}
            onChange={(e) => set("currency", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-white px-2 text-sm"
          >
            {["NZD", "AUD", "USD", "GBP", "EUR"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Performance Fee *</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.performanceFee}
            onChange={(e) => set("performanceFee", e.target.value)}
            required
            className="bg-white"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Travel Fee</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.travelFee}
            onChange={(e) => set("travelFee", e.target.value)}
            className="bg-white"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Accommodation Fee</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.accommodationFee}
            onChange={(e) => set("accommodationFee", e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Notes for Customer</Label>
          <Textarea
            placeholder="Any additional details, inclusions, or terms…"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            className="bg-white text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Quote Valid Until</Label>
          <Input
            type="date"
            value={form.validUntil}
            onChange={(e) => set("validUntil", e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      {total > 0 && (
        <p className="text-sm font-semibold text-primary">
          Total: {form.currency} {total.toFixed(2)}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" className="bg-primary hover:bg-primary-hover text-white" disabled={saving}>
          {saving ? "Sending…" : existing ? "Update Quote" : "Send Quote"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/** Displays a received quote to the customer with Accept / Decline. */
function QuoteCard({ booking }: { booking: any }) {
  const respondToQuote = useMutation(api.bookings.respondToQuote);
  const [responding, setResponding] = useState<"accept" | "decline" | null>(null);
  const q = booking.quote;
  if (!q) return null;

  const respond = async (accept: boolean) => {
    setResponding(accept ? "accept" : "decline");
    try {
      await respondToQuote({ bookingId: booking._id, accept });
      toast.success(accept ? "Quote accepted!" : "Quote declined");
    } catch {
      toast.error("Failed to respond to quote");
    } finally {
      setResponding(null);
    }
  };

  return (
    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-charcoal text-sm mb-3">Quote from {booking.bagpiper?.name}</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
        <div>
          <p className="text-muted-foreground text-xs">Performance Fee</p>
          <p className="font-medium">{q.currency} {q.performanceFee.toFixed(2)}</p>
        </div>
        {q.travelFee > 0 && (
          <div>
            <p className="text-muted-foreground text-xs">Travel Fee</p>
            <p className="font-medium">{q.currency} {q.travelFee.toFixed(2)}</p>
          </div>
        )}
        {q.accommodationFee > 0 && (
          <div>
            <p className="text-muted-foreground text-xs">Accommodation</p>
            <p className="font-medium">{q.currency} {q.accommodationFee.toFixed(2)}</p>
          </div>
        )}
        <div>
          <p className="text-muted-foreground text-xs">Total</p>
          <p className="text-lg font-bold text-primary">{q.currency} {q.totalFee.toFixed(2)}</p>
        </div>
      </div>
      {q.notes && (
        <p className="text-sm text-gray-600 mb-3 italic">"{q.notes}"</p>
      )}
      {q.validUntil && (
        <p className="text-xs text-muted-foreground mb-3">Valid until {formatDate(q.validUntil)}</p>
      )}
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-primary hover:bg-primary-hover text-white"
          onClick={() => respond(true)}
          disabled={responding !== null}
        >
          {responding === "accept" ? "Accepting…" : "Accept Quote"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => respond(false)}
          disabled={responding !== null}
        >
          {responding === "decline" ? "Declining…" : "Decline"}
        </Button>
      </div>
    </div>
  );
}

export function Dashboard() {
  const myBookings = useQuery(api.bookings.getMyBookings);
  const bagpiperBookings = useQuery(api.bookings.getBagpiperBookings);
  const profile = useQuery(api.bagpipers.getMyProfile);
  const updateBookingStatus = useMutation(api.bookings.updateBookingStatus);

  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [openQuoteFormId, setOpenQuoteFormId] = useState<string | null>(null);

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
                        <p className="font-medium">Estimated Amount</p>
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

                    {/* Quote card — shown when piper has sent a quote */}
                    {booking.status === "quoted" && <QuoteCard booking={booking} />}

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
                bagpiperBookings.map((booking) => {
                  const canQuote = booking.status === "enquiry" || booking.status === "pending";
                  const isQuoted = booking.status === "quoted";
                  const quoteFormOpen = openQuoteFormId === booking._id;

                  return (
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

                            {/* Quote / re-quote button */}
                            {(canQuote || isQuoted) && (
                              <Button
                                size="sm"
                                variant={quoteFormOpen ? "outline" : "default"}
                                className={quoteFormOpen ? "" : "bg-primary hover:bg-primary-hover text-white"}
                                onClick={() => setOpenQuoteFormId(quoteFormOpen ? null : booking._id)}
                              >
                                {quoteFormOpen ? "Cancel" : isQuoted ? "Update Quote" : "Send Quote"}
                              </Button>
                            )}

                            {booking.status === "accepted" && (
                              <Button size="sm" variant="secondary" onClick={() => handleStatusUpdate(booking._id, "confirmed")}>
                                Confirm Booking
                              </Button>
                            )}
                            {booking.status === "paid" && (
                              <Button size="sm" variant="secondary" onClick={() => handleStatusUpdate(booking._id, "completed")}>
                                Mark Complete
                              </Button>
                            )}
                            {booking.status === "cancelled" && (
                              <Badge variant="outline" className="border-red-400 text-red-700 bg-red-50">Cancelled</Badge>
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
                            <p className="font-medium">
                              {isQuoted || booking.status === "accepted" ? "Quoted Amount" : "Est. Earnings"}
                            </p>
                            <p className="text-lg font-semibold text-primary">
                              {booking.quote
                                ? `${booking.quote.currency} ${booking.quote.totalFee.toFixed(2)}`
                                : `$${booking.bagpiperAmount.toFixed(2)}`}
                            </p>
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

                        {/* Existing quote summary (when quoted and form is closed) */}
                        {isQuoted && !quoteFormOpen && booking.quote && (
                          <div className="mt-3 text-sm bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="font-medium text-blue-700 mb-1">Quote sent — awaiting customer response</p>
                            <p className="text-muted-foreground">
                              {booking.quote.currency} {booking.quote.performanceFee.toFixed(2)} performance
                              {booking.quote.travelFee ? ` + ${booking.quote.travelFee.toFixed(2)} travel` : ""}
                              {booking.quote.accommodationFee ? ` + ${booking.quote.accommodationFee.toFixed(2)} accommodation` : ""}
                              {" = "}<strong>{booking.quote.totalFee.toFixed(2)} total</strong>
                            </p>
                            {booking.quote.notes && (
                              <p className="text-muted-foreground mt-1 italic">"{booking.quote.notes}"</p>
                            )}
                          </div>
                        )}

                        {/* Inline quote form */}
                        {quoteFormOpen && (
                          <QuoteForm
                            bookingId={booking._id}
                            existing={booking.quote}
                            onDone={() => setOpenQuoteFormId(null)}
                          />
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
                  );
                })
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
