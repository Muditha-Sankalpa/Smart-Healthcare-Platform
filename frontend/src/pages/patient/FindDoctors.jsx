import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientNavBar } from '../../components/shared';
import API from '../../api/axiosClient';
import { Search, MapPin, Star, Calendar, Loader2, AlertCircle } from 'lucide-react';

const FindDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // Call the PUBLIC endpoint to get all verified doctors
      const response = await API.get('/doctors/all');
      // Filter to show only verified & active doctors
      const available = response.data.filter(d => d.verified && d.status === 'active');
      setDoctors(available);
    } catch (err) {
      console.error('Fetch doctors error:', err);
      setError('Unable to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get unique specialties for filter dropdown
  const specialties = useMemo(() => {
    return [...new Set(doctors.map(d => d.specialty))].sort();
  }, [doctors]);

  // Filter doctors by search & specialty
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = doctor.name?.toLowerCase().includes(search.toLowerCase()) ||
                           doctor.specialty?.toLowerCase().includes(search.toLowerCase());
      const matchesSpecialty = !specialtyFilter || doctor.specialty === specialtyFilter;
      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, search, specialtyFilter]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientNavBar />
      
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#122056] italic">Find a Doctor</h1>
          <p className="text-gray-500 mt-1">Browse our verified healthcare professionals</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#122056]/20 focus:border-[#122056]"
              />
            </div>
            
            {/* Specialty Filter */}
            <div className="w-full md:w-64">
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#122056]/20 focus:border-[#122056] bg-white"
              >
                <option value="">All Specialties</option>
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          Showing <span className="font-semibold text-[#122056]">{filteredDoctors.length}</span> of {doctors.length} doctors
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin mb-3 text-[#122056]" size={40} />
            <p className="text-gray-600">Loading doctors...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-600 bg-red-50 rounded-2xl">
            <AlertCircle size={40} className="mb-3" />
            <p className="font-medium">{error}</p>
            <button onClick={fetchDoctors} className="mt-4 px-6 py-2 bg-white border border-red-300 rounded-lg hover:bg-red-100 transition">
              Try Again
            </button>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow">
            <Search size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-600">No doctors found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div key={doctor._id} className="bg-white rounded-2xl shadow border border-gray-200 p-6 hover:shadow-lg transition">
                {/* Doctor Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#122056] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {doctor.name?.charAt(0) || 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-[#122056] truncate">{doctor.name}</h3>
                    <p className="text-sm text-gray-500">{doctor.specialty}</p>
                    {doctor.verified && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Doctor Details */}
                <div className="space-y-3 mb-6">
                  {doctor.experience && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star size={14} className="text-yellow-500" />
                      <span>{doctor.experience} years experience</span>
                    </div>
                  )}
                  {doctor.consultationFee && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      <span>Consultation: <strong className="text-[#122056]">Rs. {doctor.consultationFee}</strong></span>
                    </div>
                  )}
                  {doctor.contactNumber && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      <span>{doctor.contactNumber}</span>
                    </div>
                  )}
                </div>

                {/* Availability Preview */}
                {doctor.availability?.some(a => a.isAvailable) && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Available Days:</p>
                    <div className="flex flex-wrap gap-1">
                      {doctor.availability
                        .filter(a => a.isAvailable)
                        .slice(0, 3)
                        .map(a => (
                          <span key={a.day} className="px-2 py-0.5 bg-white rounded text-xs text-blue-600 border border-blue-200">
                            {a.day.slice(0, 3)}
                          </span>
                        ))}
                      {doctor.availability.filter(a => a.isAvailable).length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-gray-500">+ more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Simple Info Note */}
                <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
                  Contact clinic directly to book
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FindDoctors;