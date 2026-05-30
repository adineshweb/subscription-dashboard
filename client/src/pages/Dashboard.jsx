import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { fetchSubscriptionStart, fetchSubscriptionSuccess, fetchSubscriptionFailure } from '../redux/slices/subscriptionSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { Calendar, CreditCard, Clock, User, Sparkles, CheckCircle, Shield } from 'lucide-react';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentPlan, loading } = useSelector((state) => state.subscription);
  const [toast, setToast] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMySubscription = async () => {
      dispatch(fetchSubscriptionStart());
      try {
        const res = await api.get('/my-subscription');
        dispatch(fetchSubscriptionSuccess(res.data));
      } catch (err) {
        dispatch(fetchSubscriptionFailure(err.response?.data?.message || 'Failed to fetch subscription.'));
        setToast({ type: 'error', message: 'Failed to sync subscription details.' });
      }
    };

    fetchMySubscription();
  }, [dispatch]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDateStr) => {
    const diffTime = new Date(endDateStr) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getPercentageUsed = (startDateStr, endDateStr) => {
    const total = new Date(endDateStr) - new Date(startDateStr);
    const elapsed = new Date() - new Date(startDateStr);
    const percentage = Math.round((elapsed / total) * 100);
    return percentage > 100 ? 100 : (percentage < 0 ? 0 : percentage);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10">
          <Shield className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
            User Workspace
          </span>
          <h1 className="text-3xl font-extrabold mt-3 tracking-tight sm:text-4xl">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-primary-100 mt-2 text-sm sm:text-base max-w-xl">
            Monitor your subscription status, features log, billing intervals, and security profiles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Account Info */}
        <div className="bg-white dark:bg-gray-850 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-850 dark:text-white">Profile Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase">Name</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase">Email Address</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase">Role</p>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-750 dark:bg-primary-950/30 dark:text-primary-400 mt-1">
                {user?.role?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase">Member Since</p>
              <p className="text-sm font-semibold text-gray-850 dark:text-gray-200 mt-0.5">{formatDate(user?.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Subscription Plan details */}
        <div className="lg:col-span-2">
          {currentPlan ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Active Plan Stats */}
              <div className="bg-white dark:bg-gray-850 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 rounded-full text-xs font-bold uppercase">
                      {currentPlan.status}
                    </span>
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-855 dark:text-white">
                    {currentPlan.planId?.name} Plan
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Billed rate: ₹{currentPlan.planId?.price} for {currentPlan.planId?.duration} days
                  </p>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-2.5 text-sm text-gray-655 dark:text-gray-400">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <span>Start: {formatDate(currentPlan.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-655 dark:text-gray-400">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <span>End: {formatDate(currentPlan.endDate)}</span>
                  </div>
                </div>
              </div>

              {/* Progress & Analytics details */}
              <div className="bg-white dark:bg-gray-850 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary-50 dark:bg-primary-950/20 text-primary-500 dark:text-primary-400 rounded-xl">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-850 dark:text-white">Usage Meter</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-gray-500 dark:text-gray-450">Remaining Days</span>
                      <span className="text-gray-850 dark:text-white font-bold">
                        {getDaysRemaining(currentPlan.endDate)} / {currentPlan.planId?.duration} Days
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${100 - getPercentageUsed(currentPlan.startDate, currentPlan.endDate)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      Your plan is active and will auto-expire on the deadline date listed.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/plans')}
                  className="w-full mt-6 py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm border border-gray-200/50 dark:border-gray-700 transition-colors"
                >
                  Change / Upgrade Plan
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <EmptyState
                icon={CreditCard}
                title="No Active Subscription"
                description="You don't have an active package subscription. Unlock dashboard insights and SaaS features by choosing a plan."
                actionText="Explore Pricing Plans"
                onAction={() => navigate('/plans')}
              />
            </div>
          )}
        </div>
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

export default Dashboard;
