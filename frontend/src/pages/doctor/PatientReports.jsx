import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorNavBar } from '../../components/shared';
import API from '../../api/axiosClient';
import { FileText, Calendar, Download, Search, Loader2, AlertCircle, User } from 'lucide-react';

const PatientReports = () => {
  const navigate = useNavigate();
  const [searchPatientId, setSearchPatientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);

  const handleSearch = async () => {
    if (!searchPatientId.trim()) {
      setError('Please enter a patient ID');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Call Doctor Service endpoint that fetches from Patient Service
      const response = await API.get(`/doctors/patient/${searchPatientId}/reports`);
      
      setPatient(response.data.patient);
      setReports(response.data.reports || []);
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response?.status === 404) {
        setError('Patient not found');
      } else if (err.response?.status === 403) {
        setError('Access denied: You do not have permission to view this patient\'s records');
      } else {
        setError('Failed to load patient reports');
      }
      setPatient(null);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('video')) return '🎬';
    return '📁';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorNavBar />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#122056]">View Patient Medical Reports</h1>
            <p className="text-gray-500">Search and review patient-uploaded medical documents</p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient User ID
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Enter patient user ID (from Auth Service)"
                  value={searchPatientId}
                  onChange={(e) => setSearchPatientId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#122056]/20 focus:border-[#122056]"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-[#122056] text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                Search
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              💡 Tip: Get patient ID from Appointments page or Patient Service
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && !patient && (
            <div className="bg-white rounded-2xl shadow p-8 text-center">
              <Loader2 className="animate-spin mx-auto mb-3 text-[#122056]" size={32} />
              <p className="text-gray-600">Fetching patient reports...</p>
            </div>
          )}

          {/* Patient Info + Reports */}
          {patient && !loading && (
            <div className="space-y-6">
              {/* Patient Info Card */}
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#122056] flex items-center justify-center text-white text-2xl font-bold">
                    {patient.name?.charAt(0) || 'P'}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#122056]">{patient.name}</h2>
                    <p className="text-gray-500 text-sm">Patient ID: {searchPatientId?.slice(0, 12)}...</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <span className="text-gray-400 block">Contact</span>
                      <span className="font-medium">{patient.contactNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Email</span>
                      <span className="font-medium">{patient.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reports List */}
              <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#122056] flex items-center gap-2">
                    <FileText size={20} />
                    Medical Reports ({reports.length})
                  </h2>
                </div>
                
                {reports.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FileText size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">No medical reports found</p>
                    <p className="text-sm">This patient hasn't uploaded any reports yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {reports.map((report) => (
                      <div key={report._id} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{getFileIcon(report.fileType)}</span>
                              <div>
                                <h3 className="font-semibold text-lg text-[#122056]">
                                  {report.fileName || 'Medical Report'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Type: {report.fileType || 'Unknown'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                <span>Uploaded: {formatDate(report.uploadedAt)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {report.fileUrl && (
                            <a
                              href={report.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#122056] text-white text-sm font-semibold hover:opacity-90 transition"
                            >
                              <Download size={16} />
                              View
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Initial State */}
          {!patient && !loading && !error && (
            <div className="bg-white rounded-2xl shadow p-12 text-center">
              <FileText size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Search for a Patient</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Enter a patient's user ID above to view their uploaded medical reports, lab results, and diagnostic images.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientReports;