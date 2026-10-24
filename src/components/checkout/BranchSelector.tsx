import { useState, useMemo } from 'react';
import { Search, MapPin, Phone, Building2, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  PARCEL_SERVICES,
  ParcelBranch,
  ParcelServiceName,
  getStates,
  getCities,
  searchBranches,
} from '../../data/parcelBranches';

interface BranchSelectorProps {
  selectedBranch: ParcelBranch | null;
  onSelectBranch: (branch: ParcelBranch) => void;
  receiverName: string;
  setReceiverName: (val: string) => void;
  receiverPhone: string;
  setReceiverPhone: (val: string) => void;
  alternatePhone: string;
  setAlternatePhone: (val: string) => void;
  receiverEmail: string;
  setReceiverEmail: (val: string) => void;
}

export default function BranchSelector({
  selectedBranch,
  onSelectBranch,
  receiverName,
  setReceiverName,
  receiverPhone,
  setReceiverPhone,
  alternatePhone,
  setAlternatePhone,
  receiverEmail,
  setReceiverEmail,
}: BranchSelectorProps) {
  const [selectedService, setSelectedService] = useState<ParcelServiceName>(PARCEL_SERVICES[0]);
  const [selectedState, setSelectedState] = useState<string>('Tamil Nadu');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Available states for chosen service
  const availableStates = useMemo(() => {
    return getStates(selectedService);
  }, [selectedService]);

  // Available cities for chosen service + state
  const availableCities = useMemo(() => {
    return getCities(selectedService, selectedState);
  }, [selectedService, selectedState]);

  // Filtered branches list
  const filteredBranches = useMemo(() => {
    return searchBranches({
      service: selectedService,
      state: selectedState,
      city: selectedCity,
      query: searchQuery,
      limit: 100,
    });
  }, [selectedService, selectedState, selectedCity, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Notice Banner: No Home Delivery */}
      <div className="bg-[#fefce8] border-2 border-[#d4a017] rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-[#d4a017]/20 flex items-center justify-center shrink-0 text-[#b7860e]">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-[#1c1917] text-base sm:text-lg flex items-center gap-2">
            <span>Parcel Counter Pickup Only</span>
            <span className="text-xs bg-[#d4a017] text-[#1c1917] font-sans font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              No Home Delivery
            </span>
          </h3>
          <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
            Due to the heavy weight of rice bags (25kg – 50kg), all consignments are dispatched via{' '}
            <strong className="text-[#b7860e]">mSs Parcel Service</strong> or{' '}
            <strong className="text-[#b7860e]">A1 Speed Parcel Service</strong>. Please choose your nearest counter below where you will collect your parcel.
          </p>
        </div>
      </div>

      {/* Step 1: Select Service Provider */}
      <div className="card p-4 sm:p-6 space-y-4 bg-white">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-serif font-bold text-xl text-[#1c1917] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#d4a017]" />
            1. Select Parcel Service Provider
          </h2>
          <span className="text-xs text-stone-500 font-medium">1,228+ branches across South & West India</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PARCEL_SERVICES.map((srv) => {
            const isSelected = selectedService === srv;
            return (
              <button
                key={srv}
                type="button"
                onClick={() => {
                  setSelectedService(srv);
                  setSelectedCity('');
                }}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'border-[#d4a017] bg-[#fefce8] shadow-sm ring-1 ring-[#d4a017]'
                    : 'border-[#e8e2d5] bg-white hover:border-[#d4a017]/70 hover:bg-[#faf8f5]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-serif font-bold text-base text-[#1c1917]">{srv}</span>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-[#d4a017] text-[#1c1917] flex items-center justify-center font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600">
                  {srv === 'mSs Parcel Service'
                    ? '686 branches • Tamil Nadu, Andhra, Karnataka, Kerala, Telangana, Puducherry'
                    : '542 branches • Tamil Nadu, Kerala, Karnataka, Andhra, Gujarat, Maharashtra'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Search & Filter Branch */}
      <div className="card p-4 sm:p-6 space-y-4 bg-white">
        <h2 className="font-serif font-bold text-xl text-[#1c1917] flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#d4a017]" />
          2. Locate Nearest Counter
        </h2>

        {/* State and City Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Select State</label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity('');
              }}
              className="input bg-white text-[#1c1917]"
            >
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Select City / Area (Optional)</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input bg-white text-[#1c1917]"
            >
              <option value="">All Cities / Areas in {selectedState}</option>
              {availableCities.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search branch name, town, street, phone, or Digi-PIN (e.g. Sowcarpet, Madurai, Erode)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 hover:text-[#1c1917]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results List */}
        <div>
          <div className="flex items-center justify-between text-xs text-stone-600 mb-2 font-medium">
            <span>Showing {filteredBranches.length} available counters in {selectedState}</span>
            {selectedBranch && (
              <span className="text-[#166534] flex items-center gap-1 font-semibold">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Branch selected
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
            {filteredBranches.length === 0 ? (
              <div className="p-8 text-center bg-[#faf8f5] rounded-xl border border-dashed border-[#e8e2d5]">
                <p className="text-stone-600 text-sm">No branches found matching your search.</p>
                <p className="text-stone-400 text-xs mt-1">Try clearing filters or searching another area.</p>
              </div>
            ) : (
              filteredBranches.map((b) => {
                const isChosen = selectedBranch?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => onSelectBranch(b)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isChosen
                        ? 'border-[#d4a017] bg-[#fefce8] ring-1 ring-[#d4a017] shadow-sm'
                        : 'border-[#e8e2d5] bg-white hover:border-[#d4a017]/70 hover:bg-[#faf8f5]'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[#1c1917] text-sm sm:text-base">
                          {b.branchName}
                        </span>
                        <span className="text-[11px] bg-[#ecfdf5] text-[#166534] border border-[#a7f3d0] px-2 py-0.5 rounded font-mono font-semibold">
                          {b.city}
                        </span>
                        {b.digiPin && (
                          <span className="text-[11px] bg-[#fef3c7] text-[#926b09] border border-[#fde68a] px-2 py-0.5 rounded font-mono font-semibold">
                            PIN: {b.digiPin}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-2">{b.address}</p>
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <a
                          href={`tel:${b.phone.split(',')[0].trim()}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-[#b7860e] font-semibold hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          {b.phone}
                        </a>
                        {b.contactPerson && (
                          <span className="text-stone-400">• Contact: {b.contactPerson}</span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBranch(b);
                        }}
                        className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                          isChosen
                            ? 'bg-[#d4a017] text-[#1c1917] shadow-sm'
                            : 'bg-[#faf8f5] text-stone-700 border border-[#e8e2d5] hover:border-[#d4a017] hover:bg-white'
                        }`}
                      >
                        {isChosen ? '✓ Selected' : 'Select Counter'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Branch Highlight Summary */}
        {selectedBranch && (
          <div className="mt-4 p-4 rounded-xl bg-[#f0fdf4] border-2 border-[#86efac] flex items-start gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-[#166534] text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm space-y-0.5">
              <p className="font-bold text-[#166534]">
                Pickup Confirmed: {selectedBranch.service} — {selectedBranch.branchName}
              </p>
              <p className="text-stone-700">{selectedBranch.address}</p>
              <p className="text-stone-600">
                Phone: <strong className="text-[#1c1917]">{selectedBranch.phone}</strong>
                {selectedBranch.digiPin && <> • Digi-PIN: <strong className="text-[#1c1917]">{selectedBranch.digiPin}</strong></>}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Receiver Details Form */}
      <div className="card p-4 sm:p-6 space-y-4 bg-white">
        <h2 className="font-serif font-bold text-xl text-[#1c1917] flex items-center gap-2">
          <Phone className="w-5 h-5 text-[#d4a017]" />
          3. Receiver Contact Details
        </h2>
        <p className="text-xs text-stone-600">
          The parcel service counter will call / SMS this person when the lorry arrives with your rice bags.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Receiver Name (Person collecting parcel) *</label>
            <input
              type="text"
              placeholder="Full name as on ID"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              className="input bg-white"
              required
            />
          </div>

          <div>
            <label className="label">Mobile Number (Mandatory for Parcel Call/SMS) *</label>
            <input
              type="tel"
              placeholder="10-digit mobile number (Mandatory)"
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value.replace(/[^\d+]/g, ''))}
              maxLength={13}
              className="input bg-white font-mono"
              required
            />
          </div>

          <div>
            <label className="label">Alternate Contact Phone (Optional)</label>
            <input
              type="tel"
              placeholder="Secondary contact number"
              value={alternatePhone}
              onChange={(e) => setAlternatePhone(e.target.value.replace(/[^\d+]/g, ''))}
              className="input bg-white font-mono"
            />
          </div>

          <div>
            <label className="label">
              Email Address <span className="text-stone-500 font-normal">(Optional — for waybill & invoice)</span>
            </label>
            <input
              type="email"
              placeholder="your-email@example.com (Optional)"
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
              className="input bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
