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

export function BookingModal({ bagpiper, onClose }: BookingModalProps) {
  const [formData, setFormData] = useState({
    eventType: "",
    eventDate: "",
    eventTime: "",
    duration: bagpiper.minimumBooking,
    location: "",
    specialRequests: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });

  const createBooking = useMutation(api.bookings.createBooking);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBooking({ bagpiperId: bagpiper._id, ...formData });
      toast.success("Booking request submitted successfully!");
      onClose();
    } catch {
      toast.error("Failed to submit booking request");
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const subtotal = bagpiper.hourlyRate * formData.duration;
  const platformFee = subtotal * 0.05;
  const total = subtotal + platformFee;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Book {bagpiper.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Event Type *</Label>
              <Select value={formData.eventType} onValueChange={(v) => setFormData((p) => ({ ...p, eventType: v }))}>
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
              <Input type="date" value={formData.eventDate} onChange={set("eventDate")} required min={new Date().toISOString().split("T")[0]} />
            </div>

            <div className="space-y-1.5">
              <Label>Event Time *</Label>
              <Input type="time" value={formData.eventTime} onChange={set("eventTime")} required />
            </div>

            <div className="space-y-1.5">
              <Label>Duration (hours) *</Label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData((p) => ({ ...p, duration: Number(e.target.value) }))}
                required min={bagpiper.minimumBooking} step="0.5"
              />
              <p className="text-xs text-muted-foreground">Minimum: {bagpiper.minimumBooking} hours</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Event Location *</Label>
            <Textarea value={formData.location} onChange={set("location")} required rows={2} placeholder="Full address of the event venue" />
          </div>

          <div className="space-y-1.5">
            <Label>Special Requests</Label>
            <Textarea value={formData.specialRequests} onChange={set("specialRequests")} rows={3} placeholder="Any special songs, timing requirements, or other details..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Your Name *</Label>
              <Input type="text" value={formData.customerName} onChange={set("customerName")} required />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={formData.customerEmail} onChange={set("customerEmail")} required />
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input type="tel" value={formData.customerPhone} onChange={set("customerPhone")} required />
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold text-charcoal mb-2">Booking Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Performance ({formData.duration}h × ${bagpiper.hourlyRate}/hr)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Platform fee (5%)</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t pt-2 mt-1">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary-hover text-white">Submit Booking Request</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
