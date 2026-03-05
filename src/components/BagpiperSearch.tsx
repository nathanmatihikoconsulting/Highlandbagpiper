import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BagpiperCard } from "./BagpiperCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function BagpiperSearch({ onSignInRequired }: { onSignInRequired?: () => void } = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const bagpipers = useQuery(api.bagpipers.searchBagpipers, {
    searchTerm: searchTerm || undefined,
    city: city || undefined,
    country: country !== "all" ? country || undefined : undefined,
    verifiedOnly: verifiedOnly || undefined,
  });

  const locations = useQuery(api.bagpipers.getLocations);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Piper name</Label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Bagpiper name..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>City</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City..."
                list="city-options"
              />
              <datalist id="city-options">
                {locations?.cities.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <Label>Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  {locations?.countries.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Verified only toggle */}
          <div className="mt-4 flex items-center gap-2">
            <input
              id="verified-only"
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-primary"
            />
            <label htmlFor="verified-only" className="text-sm text-muted-foreground cursor-pointer select-none">
              Show verified pipers only
              <span className="ml-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium px-1.5 py-0.5 rounded-full border border-emerald-300">✓ Verified</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bagpipers === undefined ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="w-full h-64" />
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))
        ) : bagpipers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No bagpipers found matching your criteria.
          </div>
        ) : (
          bagpipers.map((bagpiper) => <BagpiperCard key={bagpiper._id} bagpiper={bagpiper} onSignInRequired={onSignInRequired} />)
        )}
      </div>
    </div>
  );
}
