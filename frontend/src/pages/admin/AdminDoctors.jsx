import { useEffect, useState, useMemo } from 'react';
import { AdminNavBar, StatCard } from '../../components/shared';
import { getAllDoctorsAdmin, verifyDoctor } from '../../api/doctorApi';
import { Search, Star, Calendar, MapPin, Check, X, Loader2, AlertCircle, UserCheck } from 'lucide-react';

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('');
    const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, active: 0 });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async (q = '') => {
        try {
            setLoading(true);
            const response = await getAllDoctorsAdmin();
            const data = response.data;

            setDoctors(data);
            setStats({
                total: data.length,
                verified: data.filter(d => d.verified).length,
                pending: data.filter(d => !d.verified).length,
                active: data.filter(d => d.status === 'active').length,
            });
        } catch (err) {
            console.error('Fetch doctors error:', err);
            setError('Unable to load doctors. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const specialties = useMemo(() => {
        return [...new Set(doctors.map(d => d.specialty))].sort();
    }, [doctors]);

    const filteredDoctors = useMemo(() => {
        return doctors.filter(doctor => {
            const matchesSearch = doctor.name?.toLowerCase().includes(search.toLowerCase()) ||
                doctor.specialty?.toLowerCase().includes(search.toLowerCase()) ||
                doctor.licenseNumber?.toLowerCase().includes(search.toLowerCase());
            const matchesSpecialty = !specialtyFilter || doctor.specialty === specialtyFilter;
            return matchesSearch && matchesSpecialty;
        });
    }, [doctors, search, specialtyFilter]);

    // ✅ Toggle doctor verification status
    const handleVerifyDoctor = async (id, currentVerified) => {
        try {
            const newStatus = !currentVerified; // ✅ Toggle logic
            await verifyDoctor(id, newStatus);  // ✅ Pass to API
            fetchDoctors(search);               // ✅ Refresh UI
        } catch (err) {
            alert('Failed to update verification status');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminNavBar requireAuth={false} />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#122056] italic">Doctor Management</h1>
                    <p className="text-gray-500 mt-1">Manage and verify healthcare professionals</p>
                </div>

                {/* Stats Cards */}
                <div className="flex gap-4 mb-8 flex-wrap">
                    <StatCard label="Total" value={stats.total} />
                    <StatCard label="Verified" value={stats.verified} color="text-green-600" />
                    <StatCard label="Pending" value={stats.pending} color="text-yellow-600" />
                    <StatCard label="Active" value={stats.active} color="text-blue-600" />
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white rounded-2xl shadow p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, specialty, or license..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#122056]/20 focus:border-[#122056]"
                            />
                        </div>
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

                {/* Doctors Table */}
                <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin mb-3 text-[#122056]" size={40} />
                            <p className="text-gray-600">Loading doctors...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-red-600 bg-red-50 rounded-2xl">
                            <AlertCircle size={40} className="mb-3" />
                            <p className="font-medium">{error}</p>
                            <button onClick={() => fetchDoctors(search)} className="mt-4 px-6 py-2 bg-white border border-red-300 rounded-lg hover:bg-red-100 transition">
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-[#122056] text-white">
                                    <tr>
                                        <th className="text-left px-6 py-3">Doctor</th>
                                        <th className="text-left px-6 py-3">Specialty</th>
                                        <th className="text-left px-6 py-3">License</th>
                                        <th className="text-left px-6 py-3">Status</th>
                                        <th className="text-left px-6 py-3">Verified</th>
                                        <th className="text-left px-6 py-3">Joined</th>
                                        <th className="text-left px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDoctors.map((doctor, index) => (
                                        <tr key={doctor._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                            {/* Doctor Name & Avatar */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#122056] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                        {doctor.name?.charAt(0) || 'D'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[#122056]">{doctor.name}</p>
                                                        <p className="text-xs text-gray-500">{doctor.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Specialty */}
                                            <td className="px-6 py-4">
                                                <span className="text-gray-700">{doctor.specialty || 'Not set'}</span>
                                            </td>

                                            {/* License */}
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {doctor.licenseNumber || 'N/A'}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${doctor.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {doctor.status}
                                                </span>
                                            </td>

                                            {/* Verified Status */}
                                            <td className="px-6 py-4">
                                                {doctor.verified ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold">
                                                        <Check size={12} /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-yellow-600 text-xs font-semibold">
                                                        <X size={12} /> Pending
                                                    </span>
                                                )}
                                            </td>

                                            {/* Joined Date */}
                                            <td className="px-6 py-4 text-gray-500">
                                                {formatDate(doctor.createdAt)}
                                            </td>

                                            {/* ✅ Actions Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {/* ✅ VERIFY BUTTON - Only show for pending doctors */}
                                                    {!doctor.verified && (
                                                        <button
                                                            onClick={() => handleVerifyDoctor(doctor._id, doctor.verified)}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-100 border border-yellow-200 text-yellow-700 text-xs font-semibold hover:bg-yellow-200 transition"
                                                            title="Verify this doctor"
                                                        >
                                                            <UserCheck size={14} />
                                                            Verify
                                                        </button>
                                                    )}

                                                    {/* ✅ UNVERIFY BUTTON - Only show for verified doctors */}
                                                    {doctor.verified && (
                                                        <button
                                                            onClick={() => handleVerifyDoctor(doctor._id, doctor.verified)}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 border border-green-200 text-green-700 text-xs font-semibold hover:bg-green-200 transition"
                                                            title="Unverify this doctor"
                                                        >
                                                            <Check size={14} />
                                                            Verified
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDoctors;