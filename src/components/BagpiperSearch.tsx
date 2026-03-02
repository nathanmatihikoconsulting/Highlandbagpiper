import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BagpiperCard } from "./BagpiperCard";

export function BagpiperSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [specialty, setSpecialty] = useState("");

  const bagpipers = useQuery(api.bagpipers.searchBagpipers, {
    searchTerm: searchTerm || undefined,
    city: city || undefined,
    country: country || undefined,
    specialty: specialty || undefined,
  });

  const locations = useQuery(api.bagpipers.getLocations);

  const specialties = [
    "Weddings",
    "Funerals",
    "Corporate Events",
    "Parades",
    "Graduations",
    "Military Ceremonies",
    "Highland Games",
    "Burns Night",
  ];

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white text-charcoal";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-2xl font-heading font-semibold mb-6 text-charcoal">Find Bagpipers</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Search by name
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Bagpiper name..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City..."
              className={inputClass}
              list="city-options"
            />
            <datalist id="city-options">
              {locations?.cities.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={inputClass}
            >
              <option value="">All countries</option>
              {locations?.countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Specialty
            </label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className={inputClass}
            >
              <option value="">All specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bagpipers === undefined ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : bagpipers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No bagpipers found matching your criteria.
          </div>
        ) : (
          bagpipers.map((bagpiper) => (
            <BagpiperCard key={bagpiper._id} bagpiper={bagpiper} />
          ))
        )}
      </div>
    </div>
  );
}
