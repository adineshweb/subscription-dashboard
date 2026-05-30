import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { updateUserSuccess } from '../redux/slices/authSlice';
import Toast from '../components/Toast';
import { User, Mail, Lock, ShieldAlert, Sparkles, KeyRound } from 'lucide-react';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
    },
  });

  const newPasswordVal = watch('newPassword');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
      };

      if (data.newPassword) {
        payload.currentPassword = data.currentPassword;
        payload.newPassword = data.newPassword;
      }

      const res = await api.put('/user/profile', payload);
      dispatch(updateUserSuccess(res.data.user));
      setToast({ type: 'success', message: 'Profile updated successfully!' });
      
      // Clear password fields
      reset({
        name: res.data.user.name,
        email: res.data.user.email,
        currentPassword: '',
        newPassword: '',
      });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Modify your profile details and update security configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Sidebar card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-md text-center h-fit">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black text-3xl mb-4">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{user?.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-500 truncate mb-4">{user?.email}</p>
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400">
            {user?.role?.toUpperCase()}
          </span>
        </div>

        {/* Edit Fields Form */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                <User className="w-4 h-4 text-gray-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm dark:text-white"
                placeholder="Name"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm dark:text-white"
                placeholder="Email"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{errors.email.message}</p>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
                <KeyRound className="w-4 h-4 text-primary-500" />
                Change Password (optional)
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-500 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    {...register('currentPassword', {
                      required: {
                        value: !!newPasswordVal,
                        message: 'Current password is required to change password',
                      },
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm dark:text-white"
                    placeholder="••••••••"
                  />
                  {errors.currentPassword && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">{errors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-500 mb-1.5">New Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    {...register('newPassword', {
                      minLength: {
                        value: 8,
                        message: 'New password must be at least 8 characters',
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                        message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                      }
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm dark:text-white"
                    placeholder="••••••••"
                  />
                  {errors.newPassword && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">{errors.newPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-primary-500/10 active:scale-95 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
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

export default Profile;
