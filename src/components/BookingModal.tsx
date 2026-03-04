import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BookingModalProps {
  bagpiper: {
    _id: Id<"bagpipers">;
    name: string;
    hourlyRate: number;
    minimumBooking: number;
  };
  onClose: () => void;
}

const eventTypes = [
  "Wedding", "Funeral", "Corporate Event", "Parade",
  "Graduation", "Military Ceremony", "Highland Games", "Burns Night", "Other",
];

const musicGenres = [
  "Traditional Scottish", "Celtic", "Military / Ceremonial", "Contemporary", "Mix / Unsure",
];

const dressOptions = [
  "Highland Dress (Kilt & Tartan)", "Modern / Formal", "No Preference",
];

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wide whitespace-nowrap">{title}</h3>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

export function BookingModal({ bagpiper, onClose }: BookingModalProps) {
  const createBooking = useMutation(api.bookings.createBooking);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    // Event
    eventType: "",
    eventDate: "",
    eventTime: "",
    duration: bagpiper.minimumBooking,
    // Venue
    location: "",
    venueName: "",
    indoorOutdoor: "",
    guestCount: "",
    // Music
    tuneRequests: "",
    musicGenre: "",
    musicNotes: "",
    // Dress
    dressPreference: "",
    // Special requests
    specialRequests: "",
    // Contact
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBooking({
        bagpiperId: bagpiper._id,
        eventType: form.eventType,
        eventDate: form.eventDate,
        eventTime: form.eventTime,
        duration: form.duration,
        location: form.location,
        specialRequests: form.specialRequests || undefined,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        venueName: form.venueName || undefined,
        guestCount: form.guestCount ? parseInt(form.guestCount) : undefined,
        indoorOutdoor: form.indoorOutdoor || undefined,
        tuneRequests: form.tuneRequests || undefined,
        musicGenre: form.musicGenre || undefined,
        musicNotes: form.musicNotes || undefined,
        dressPreference: form.dressPreference || undefined,
      });
      toast.success("Enquiry submitted! The piper will be in touch soon.");
      onClose();
    } catch {
      toast.error("Failed to submit enquiry");
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = bagpiper.hourlyRate * form.duration;
  const platformFee = subtotal * 0.05;
  const total = subtotal + platformFee;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Enquire — {bagpiper.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">Fill in as much detail as you can. The piper will review and send you a quote.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Event ── */}
          <SectionHeader title="Your Event" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Event Type *</Label>
              <Select value={form.eventType} onValueChange={(v) => set("eventType", v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Event Date *</Label>
              <Input type="date" value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} required min={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="space-y-1.5">
              <Label>Start Time *</Label>
              <Input type="time" value={form.eventTime} onChange={(e) => set("eventTime", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Duration (hours) *</Label>
              <Input
                type="number"
                value={form.duration}
                onChange={(e) => set("duration", Number(e.target.value))}
                required min={bagpiper.minimumBooking} step="0.5"
              />
              <p className="text-xs text-muted-foreground">Minimum: {bagpiper.minimumBooking} hours</p>
            </div>
          </div>

          {/* ── Venue ── */}
          <SectionHeader title="Venue" />
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Venue Name</Label>
                <Input placeholder="e.g. St Mary's Church" value={form.venueName} onChange={(e) => set("venueName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Indoor / Outdoor</Label>
                <Select value={form.indoorOutdoor} onValueChange={(v) => set("indoorOutdoor", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indoor">Indoor</SelectItem>
                    <SelectItem value="Outdoor">Outdoor</SelectItem>
                    <SelectItem value="Both">Both / Mixed</SelectItem>
                    <SelectItem value="Unsure">Unsure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label>Venue Address *</Label>
                <Textarea
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  required rows={2}
                  placeholder="Full address of the event venue"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Expected Guest Count</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 80"
                  value={form.guestCount}
                  onChange={(e) => set("guestCount", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Music ── */}
          <SectionHeader title="Music Preferences" />
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Requested Tunes</Label>
              <Textarea
                placeholder="e.g. Amazing Grace, Highland Cathedral, Flower of Scotland — one per line or comma-separated"
                value={form.tuneRequests}
                onChange={(e) => set("tuneRequests", e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Music Style / Genre</Label>
                <Select value={form.musicGenre} onValueChange={(v) => set("musicGenre", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style…" />
                  </SelectTrigger>
                  <SelectContent>
                    {musicGenres.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Additional Music Notes</Label>
                <Input
                  placeholder="e.g. Play quietly during ceremony"
                  value={form.musicNotes}
                  onChange={(e) => set("musicNotes", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Dress ── */}
          <SectionHeader title="Dress & Presentation" />
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Preferred Dress</Label>
                <Select value={form.dressPreference} onValueChange={(v) => set("dressPreference", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference…" />
                  </SelectTrigger>
                  <SelectContent>
                    {dressOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Any Other Requests</Label>
              <Textarea
                value={form.specialRequests}
                onChange={(e) => set("specialRequests", e.target.value)}
                rows={2}
                placeholder="Timing, processional cues, cultural considerations, etc."
              />
            </div>
          </div>

          {/* ── Contact ── */}
          <SectionHeader title="Your Contact Details" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input value={form.customerName} onChange={(e) => set("customerName", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input type="tel" value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} required />
            </div>
          </div>

          {/* ── Summary ── */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold text-charcoal mb-2">Estimated Cost</h3>
            <p className="text-xs text-muted-foreground mb-2">The piper will confirm the final price in their quote.</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Performance ({form.duration}h × ${bagpiper.hourlyRate}/hr)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Platform fee (5%)</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t pt-2 mt-1">
                <span>Estimated Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary-hover text-white" disabled={submitting}>
              {submitting ? "Submitting…" : "Send Enquiry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
