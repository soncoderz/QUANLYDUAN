import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clinicService } from '../../services';
import { useToast } from '../../context/ToastContext';
import {
    Search,
    MapPin,
    Phone,
    Star,
    Clock,
    Building2,
    Users,
    ChevronRight,
    Filter,
    X
} from 'lucide-react';

export default function Clinics() {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const { info } = useToast();

    const specialties = [
        { value: '', label: 'Tất cả chuyên khoa' },
        { value: 'internal_medicine', label: 'Nội khoa' },
        { value: 'cardiology', label: 'Tim mạch' },
        { value: 'neurology', label: 'Thần kinh' },
        { value: 'pediatrics', label: 'Nhi khoa' },
        { value: 'surgery', label: 'Ngoại khoa' },
        { value: 'orthopedics', label: 'Chỉnh hình' },
        { value: 'dermatology', label: 'Da liễu' },
        { value: 'ophthalmology', label: 'Mắt' },
    ];

    useEffect(() => {
        fetchClinics();
    }, [selectedSpecialty]);

    const fetchClinics = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedSpecialty) params.specialty = selectedSpecialty;

            const response = await clinicService.getClinics(params);
            if (response.success) {
                setClinics(response.data);
            }
        } catch (error) {
            console.error('Error fetching clinics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchClinics();
            return;
        }

        setLoading(true);
        try {
            const response = await clinicService.searchClinics({ query: searchQuery });
            if (response.success) {
                setClinics(response.data);
                info(`Tìm thấy ${response.data.length} phòng khám`);
            }
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSpecialtyLabel = (value) => {
        return specialties.find(s => s.value === value)?.label || value;
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedSpecialty('');
        fetchClinics();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Phòng khám</h1>
                <p className="text-gray-500">Tìm kiếm và đặt lịch khám tại các phòng khám uy tín</p>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Tìm theo tên, địa chỉ hoặc chuyên khoa..."
                            className="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                    </div>

                    {/* Filter Button - Mobile */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="sm:hidden inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                    >
                        <Filter className="w-5 h-5" />
                        Bộ lọc
                    </button>

                    {/* Specialty Select - Desktop */}
                    <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="hidden sm:block w-48 px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 bg-white appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-no-repeat bg-[right_16px_center] bg-[length:20px] pr-12 cursor-pointer"
                    >
                        {specialties.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleSearch}
                        className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <Search className="w-5 h-5" />
                        Tìm kiếm
                    </button>
                </div>

                {/* Mobile Filters */}
                {showFilters && (
                    <div className="sm:hidden mt-4 pt-4 border-t border-gray-100" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chuyên khoa
                        </label>
                        <select
                            value={selectedSpecialty}
                            onChange={(e) => setSelectedSpecialty(e.target.value)}
                            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 bg-white"
                        >
                            {specialties.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Active Filters */}
                {(searchQuery || selectedSpecialty) && (
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Bộ lọc:</span>
                        {searchQuery && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                                "{searchQuery}"
                                <button onClick={() => setSearchQuery('')}>
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {selectedSpecialty && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm">
                                {getSpecialtyLabel(selectedSpecialty)}
                                <button onClick={() => setSelectedSpecialty('')}>
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        <button
                            onClick={clearFilters}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Xóa tất cả
                        </button>
                    </div>
                )}
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Đang tìm kiếm...</p>
                    </div>
                </div>
            ) : clinics.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clinics.map((clinic, index) => (
                        <Link
                            key={clinic._id}
                            to={`/booking/${clinic._id}`}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden group"
                            style={{ animation: `fadeIn 0.4s ease-out ${index * 0.05}s forwards`, opacity: 0 }}
                        >
                            {/* Image Placeholder */}
                            <div className="h-40 bg-gradient-to-br from-blue-400 to-teal-400 relative">
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute top-4 right-4">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 text-amber-600 text-sm font-semibold">
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        {clinic.rating || 4.5}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-lg font-bold text-white line-clamp-1">{clinic.name}</h3>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{clinic.address}</span>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span>{clinic.phone}</span>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span>{clinic.totalReviews || 0} đánh giá</span>
                                    </div>
                                </div>

                                {/* Specialties */}
                                {clinic.specialty && clinic.specialty.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                                        {clinic.specialty.slice(0, 3).map((spec) => (
                                            <span
                                                key={spec}
                                                className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium"
                                            >
                                                {getSpecialtyLabel(spec)}
                                            </span>
                                        ))}
                                        {clinic.specialty.length > 3 && (
                                            <span className="px-2 py-1 text-gray-400 text-xs">
                                                +{clinic.specialty.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* CTA */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <span className="flex items-center justify-between text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                                        Đặt lịch khám
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Không tìm thấy phòng khám
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm
                    </p>
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            )}
        </div>
    );
}
