// Auto-generated branch database for mSs and A1 Speed Parcel Service
import rawBranches from './parcelBranches.json';

export interface ParcelBranch {
  id: string;
  service: 'mSs Parcel Service' | 'A1 Travels & Speed Parcel Service';
  region?: string;
  state: string;
  city: string;
  branchName: string;
  address: string;
  phone: string;
  digiPin?: string;
  contactPerson?: string;
}

export const PARCEL_BRANCHES: ParcelBranch[] = rawBranches as ParcelBranch[];

export const PARCEL_SERVICES = [
  'mSs Parcel Service',
  'A1 Travels & Speed Parcel Service'
] as const;

export type ParcelServiceName = typeof PARCEL_SERVICES[number];

export function getBranchesByService(service: ParcelServiceName): ParcelBranch[] {
  return PARCEL_BRANCHES.filter(b => b.service === service);
}

export function getStates(service?: ParcelServiceName): string[] {
  const list = service ? getBranchesByService(service) : PARCEL_BRANCHES;
  const states = Array.from(new Set(list.map(b => b.state).filter(Boolean)));
  return states.sort();
}

export function getCities(service?: ParcelServiceName, state?: string): string[] {
  let list = service ? getBranchesByService(service) : PARCEL_BRANCHES;
  if (state) {
    list = list.filter(b => b.state.toLowerCase() === state.toLowerCase());
  }
  const cities = Array.from(new Set(list.map(b => b.city).filter(Boolean)));
  return cities.sort();
}

export function searchBranches(params: {
  service?: string;
  state?: string;
  city?: string;
  query?: string;
  limit?: number;
}): ParcelBranch[] {
  const { service, state, city, query = '', limit = 100 } = params;
  const q = query.trim().toLowerCase();

  return PARCEL_BRANCHES.filter(b => {
    if (service && b.service !== service) return false;
    if (state && b.state.toLowerCase() !== state.toLowerCase()) return false;
    if (city && b.city.toLowerCase() !== city.toLowerCase()) return false;
    if (!q) return true;

    return (
      b.branchName.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.state.toLowerCase().includes(q) ||
      (b.region && b.region.toLowerCase().includes(q)) ||
      b.address.toLowerCase().includes(q) ||
      (b.digiPin && b.digiPin.toLowerCase().includes(q)) ||
      (b.phone && b.phone.includes(q))
    );
  }).slice(0, limit);
}
