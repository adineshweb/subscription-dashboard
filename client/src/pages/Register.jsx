import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../redux/slices/authSlice';
import api from '../services/api';
import Toast from '../components/Toast';
import { Shield, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const onSubmit = async (data) => {
    dispatch(authStart());
    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      dispatch(authSuccess(response.data));
      setToast({ type: 'success', message: 'Account created! Welcome to SubDash.' });
      setTimeout(() => {
        navigate('/plans');
      }, 1500);
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Try again.';
      dispatch(authFailure(msg));
      setToast({ type: 'error', message: msg });
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-6 sm:py-12">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl transition-all">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-2xl mb-3">
            <Shield className="w-8 h-8 fill-primary-600/10" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-850 dark:text-white">Create your account</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get started with Subscription Dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
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
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm pr-11"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary-500/10 active:scale-[0.98] mt-2 flex items-center justify-center text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
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

export default Register;
