import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { Search, Filter, ShieldCheck, TrendingUp, Users, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });
  const [analytics, setAnalytics] = useState({ totalActiveCount: 0, totalSubscriptionsCount: 0, totalMonthlyRevenue: 0 });

  // Fetch plans for dropdown filter
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/plans');
        setPlans(res.data);
      } catch (err) {
        console.error('Failed to load plans for filter:', err);
      }
    };
    fetchPlans();
  }, []);

  // Fetch subscriptions with current page, search, status, and plan filters
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/subscriptions', {
        params: {
          page,
          search,
          status,
          planId: planFilter,
          limit: 10,
        },
      });
      setSubscriptions(res.data.subscriptions);
      setPagination(res.data.pagination);
      setAnalytics(res.data.analytics);
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Access denied or server error.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, status, planFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSubscriptions();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8 py-4">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-850 dark:text-white tracking-tight">
          Admin Portal
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Review, query, and analyze overall system subscription records.
        </p>
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-850 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Active Subscriptions</p>
            <p className="text-2xl font-black text-gray-850 dark:text-white mt-1">{analytics.totalActiveCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-850 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Total Subscriptions</p>
            <p className="text-2xl font-black text-gray-850 dark:text-white mt-1">{analytics.totalSubscriptionsCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-850 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">MRR (Active revenue)</p>
            <p className="text-2xl font-black text-gray-850 dark:text-white mt-1">₹{analytics.totalMonthlyRevenue}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white dark:bg-gray-850 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-md">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-550 uppercase mb-2">Search User</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-805 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm dark:text-white"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-550 uppercase mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-805 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-550 uppercase mb-2">Plan</label>
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-805 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm dark:text-white"
            >
              <option value="">All Plans</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="py-20 text-center text-gray-450 dark:text-gray-500">
              No matching subscription logs found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/30 text-gray-450 dark:text-gray-500 font-bold border-b border-gray-100 dark:border-gray-800 uppercase text-xs">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Plan Name</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Start Date</th>
                  <th className="px-6 py-4">End Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {subscriptions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">
                      {sub.userId?.name || 'Deleted User'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {sub.userId?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-primary-600 dark:text-primary-400">{sub.planId?.name || 'Custom Plan'}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">
                      ₹{sub.planId?.price || '0'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {formatDate(sub.startDate)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {formatDate(sub.endDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          sub.status === 'active'
                            ? 'bg-green-55/10 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                            : 'bg-red-55/10 text-red-705 dark:bg-red-950/20 dark:text-red-400'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-800/10">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Showing page <strong className="text-gray-800 dark:text-gray-200">{page}</strong> of <strong className="text-gray-800 dark:text-gray-200">{pagination.pages}</strong>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-705 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-gray-500 dark:text-gray-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
                disabled={page === pagination.pages}
                className="p-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-705 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-gray-500 dark:text-gray-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AdminSubscriptions;
