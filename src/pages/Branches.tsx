import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, Phone, MapPin, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';
import {
  PARCEL_BRANCHES,
  PARCEL_SERVICES,
  ParcelServiceName,
  getStates,
  getCities,
  searchBranches,
} from '../data/parcelBranches';

export default function Branches() {
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 30;

  // Filtered states
  const availableStates = useMemo(() => {
    return getStates(selectedService === 'all' ? undefined : (selectedService as ParcelServiceName));
  }, [selectedService]);

  // Filtered cities
  const availableCities = useMemo(() => {
    return getCities(
      selectedService === 'all' ? undefined : (selectedService as ParcelServiceName),
      selectedState === 'all' ? undefined : selectedState
    );
  }, [selectedService, selectedState]);

  // Search and filter branches
  const results = useMemo(() => {
    return searchBranches({
      service: selectedService === 'all' ? undefined : selectedService,
      state: selectedState === 'all' ? undefined : selectedState,
      city: selectedCity === 'all' ? undefined : selectedCity,
      query: searchQuery,
      limit: 1500,
    });
  }, [selectedService, selectedState, selectedCity, searchQuery]);

  const totalResults = results.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const paginatedBranches = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return results.slice(start, start + itemsPerPage);
  }, [results, page, itemsPerPage]);

  const handleServiceChange = (srv: string) => {
    setSelectedService(srv);
    setSelectedState('all');
    setSelectedCity('all');
    setPage(1);
  };

  const handleStateChange = (st: string) => {
    setSelectedState(st);
    setSelectedCity('all');
    setPage(1);
  };

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e3b1e] border border-[#2d5c2d] text-[#a7f3d0] text-xs font-semibold uppercase tracking-wider mb-4">
            <Building2 className="w-3.5 h-3.5" />
            1,228+ Pickup Counters
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4">
            Parcel Service Branch Locator
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Due to the heavy weight of rice bags (25kg – 50kg), all customer consignments are dispatched to your nearest{' '}
            <strong className="text-[#d4a017]">mSs Parcel Service</strong> or{' '}
            <strong className="text-[#d4a017]">A1 Speed Parcel Service</strong> counter for safe collection.
          </p>
        </div>

        {/* Counter Network Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="card p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-[#d4a017] font-serif">686</p>
            <p className="text-xs text-gray-300 font-medium mt-1">mSs Parcel Counters</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-[#7ec07e] font-serif">542</p>
            <p className="text-xs text-gray-300 font-medium mt-1">A1 Speed Counters</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white font-serif">7+ States</p>
            <p className="text-xs text-gray-300 font-medium mt-1">South & West India</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-[#60a5fa] font-serif">Daily</p>
            <p className="text-xs text-gray-300 font-medium mt-1">Lorry Despatches</p>
          </div>
        </div>

        {/* Filters Card */}
        <div className="card p-4 sm:p-6 mb-8 space-y-4">
          {/* Service Provider Tabs */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-[#2d4a2d]">
            <button
              onClick={() => handleServiceChange('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedService === 'all'
                  ? 'bg-[#d4a017] text-[#0f1a0f]'
                  : 'bg-[#0f1a0f] text-gray-300 hover:text-white border border-[#2d4a2d]'
              }`}
            >
              All Services ({PARCEL_BRANCHES.length})
            </button>
            {PARCEL_SERVICES.map((srv) => (
              <button
                key={srv}
                onClick={() => handleServiceChange(srv)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedService === srv
                    ? 'bg-[#d4a017] text-[#0f1a0f]'
                    : 'bg-[#0f1a0f] text-gray-300 hover:text-white border border-[#2d4a2d]'
                }`}
              >
                {srv}
              </button>
            ))}
          </div>

          {/* Search bar and Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="label">Filter by State</label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="input bg-[#0f1a0f]"
              >
                <option value="all">All States</option>
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="label">Filter by City / District</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setPage(1);
                }}
                className="input bg-[#0f1a0f]"
              >
                <option value="all">All Cities / Districts</option>
                {availableCities.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="label">Instant Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Town, branch, address, Digi-PIN..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="input pl-10 bg-[#0f1a0f]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-4 px-1">
          <p>
            Showing <strong className="text-white">{paginatedBranches.length}</strong> of{' '}
            <strong className="text-[#d4a017]">{totalResults}</strong> parcel counters
          </p>
          {totalPages > 1 && (
            <p>
              Page {page} of {totalPages}
            </p>
          )}
        </div>

        {/* Branches Grid */}
        {paginatedBranches.length === 0 ? (
          <div className="card p-12 text-center max-w-lg mx-auto">
            <div className="text-5xl mb-3">📍</div>
            <h3 className="font-serif text-xl font-bold text-white mb-2">No counters found</h3>
            <p className="text-gray-400 text-sm mb-4">
              We couldn't find any branches matching your current filters.
            </p>
            <button
              onClick={() => {
                setSelectedService('all');
                setSelectedState('all');
                setSelectedCity('all');
                setSearchQuery('');
              }}
              className="btn-secondary"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedBranches.map((branch) => (
              <div
                key={branch.id}
                className="card p-5 flex flex-col justify-between hover:border-[#437543] transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        branch.service === 'mSs Parcel Service'
                          ? 'bg-[#d4a017]/15 text-[#f0c242] border border-[#d4a017]/30'
                          : 'bg-[#7ec07e]/15 text-[#7ec07e] border border-[#7ec07e]/30'
                      }`}
                    >
                      {branch.service}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400 bg-[#0f1a0f] px-2 py-0.5 rounded">
                      {branch.state}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-white group-hover:text-[#d4a017] transition-colors line-clamp-1">
                    {branch.branchName}
                  </h3>

                  <p className="text-gray-300 text-xs mt-2 line-clamp-3 leading-relaxed">
                    {branch.address}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1a2e1a] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-400">
                    <a
                      href={`tel:${branch.phone.split(',')[0].trim()}`}
                      className="flex items-center gap-1.5 text-[#d4a017] font-semibold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {branch.phone}
                    </a>
                    {branch.digiPin && (
                      <span className="bg-[#142314] text-[#93c5fd] font-mono px-2 py-0.5 rounded">
                        PIN: {branch.digiPin}
                      </span>
                    )}
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/shop"
                      className="btn-primary w-full justify-center text-xs py-2 gap-1.5"
                    >
                      Shop & Pick Up Here
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-[#142614] border border-[#2d4a2d] text-white text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs text-gray-400 px-3">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-[#142614] border border-[#2d4a2d] text-white text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
