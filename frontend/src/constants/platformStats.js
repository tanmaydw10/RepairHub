/**
 * RepairHub Centralized Platform Statistics
 * Configured with live/default metrics for India operations.
 * Easily connected with backend /api/repairer/dashboard/stats or database.
 */

export const DEFAULT_PLATFORM_STATS = [
  {
    id: 'techniciansAvailable',
    value: '25',
    label: 'Technicians Available',
    subtext: 'Online Now'
  },
  {
    id: 'technicianRating',
    value: '4.8 / 5',
    label: 'Technician Ratings',
    subtext: 'Average Rating'
  },
  {
    id: 'customerRating',
    value: '4.9 / 5',
    label: 'Customer Rating',
    subtext: 'Verified Reviews'
  },
  {
    id: 'fixRate',
    value: '99.2%',
    label: 'Successful Fix Rate',
    subtext: 'Diagnostics & Fixes'
  },
  {
    id: 'serviceWarranty',
    value: '90 Days',
    label: 'Service Warranty',
    subtext: 'Pan-India Assurance'
  },
  {
    id: 'quickResponse',
    value: '< 30 Mins',
    label: 'Quick Response',
    subtext: 'Doorstep Pickup'
  },
  {
    id: 'serviceCoverage',
    value: 'PAN India',
    label: 'Service Coverage',
    subtext: '45+ Major Cities'
  }
];

/**
 * Merge live API data with platform statistics defaults if available
 */
export function getPlatformStats(apiStats = null) {
  if (!apiStats) return DEFAULT_PLATFORM_STATS;

  return DEFAULT_PLATFORM_STATS.map((stat) => {
    if (stat.id === 'techniciansAvailable' && apiStats.techniciansAvailable) {
      return { ...stat, value: String(apiStats.techniciansAvailable) };
    }
    if (stat.id === 'technicianRating' && apiStats.averageTechnicianRating) {
      return { ...stat, value: `${apiStats.averageTechnicianRating} / 5` };
    }
    if (stat.id === 'customerRating' && apiStats.averageRating) {
      return { ...stat, value: `${apiStats.averageRating} / 5` };
    }
    return stat;
  });
}
