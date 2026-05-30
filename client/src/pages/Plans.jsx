import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { setSubscription } from '../redux/slices/subscriptionSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { Check, Flame, Shield, Zap, Sparkles } from 'lucide-react';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingPlanId, setSubmittingPlanId] = useState(null);
  const [toast, setToast] = useState(null);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { currentPlan } = useSelector((state) => state.subscription);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/plans');
        setPlans(res.data);
      } catch (err) {
        setToast({ type: 'error', message: 'Failed to load subscription plans.' });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      setToast({ type: 'info', message: 'Please log in or register to subscribe.' });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    setSubmittingPlanId(plan._id);

    try {
      const orderRes = await api.post(`/subscribe/order/${plan._id}`);
      const { razorpayEnabled, orderId, amount, currency, keyId } = orderRes.data;

      if (razorpayEnabled) {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: 'SubDash SaaS',
          description: `Subscribe to ${plan.name} Plan`,
          order_id: orderId,
          handler: async (response) => {
            try {
              const verifyRes = await api.post(`/subscribe/${plan._id}`, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              dispatch(setSubscription(verifyRes.data.subscription));
              setToast({ type: 'success', message: `Successfully subscribed to ${plan.name}!` });
              setTimeout(() => navigate('/dashboard'), 2000);
            } catch (err) {
              setToast({ type: 'error', message: err.response?.data?.message || 'Payment verification failed.' });
            } finally {
              setSubmittingPlanId(null);
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: '#8b5cf6',
          },
          modal: {
            ondismiss: () => {
              setSubmittingPlanId(null);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setToast({ type: 'info', message: 'Razorpay keys not configured. Simulating payment...' });
        
        setTimeout(async () => {
          try {
            const verifyRes = await api.post(`/subscribe/${plan._id}`, {
              razorpayOrderId: orderId,
              razorpayPaymentId: `mock_pay_${Date.now()}`,
            });

            dispatch(setSubscription(verifyRes.data.subscription));
            setToast({ type: 'success', message: `Payment simulated! Subscribed to ${plan.name}!` });
            setTimeout(() => navigate('/dashboard'), 2000);
          } catch (err) {
            setToast({ type: 'error', message: 'Activation failed.' });
          } finally {
            setSubmittingPlanId(null);
          }
        }, 1500);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Unable to initiate subscription.' });
      setSubmittingPlanId(null);
    }
  };

  const getPlanIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'basic':
        return <Zap className="w-6 h-6 text-blue-500" />;
      case 'pro':
        return <Flame className="w-6 h-6 text-orange-500" />;
      case 'premium':
        return <Sparkles className="w-6 h-6 text-purple-500" />;
      case 'enterprise':
        return <Shield className="w-6 h-6 text-green-500" />;
      default:
        return <Check className="w-6 h-6 text-primary-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-gray-850 dark:text-white tracking-tight mb-4 sm:text-5xl">
          Choose the right plan for your business
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Supercharge your administration. Upgrade, downgrade, or cancel at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = currentPlan?.planId?._id === plan._id;
          const isSubmitting = submittingPlanId === plan._id;
          
          return (
            <div
              key={plan._id}
              className={`relative flex flex-col justify-between p-6 bg-white dark:bg-gray-850 border rounded-3xl transition-all hover:-translate-y-1.5 duration-300 shadow-md ${
                isCurrent
                  ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-primary-500/5'
                  : 'border-gray-100 dark:border-gray-800'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  Active Plan
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {plan.name}
                  </span>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    {getPlanIcon(plan.name)}
                  </div>
                </div>

                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-extrabold text-gray-850 dark:text-white">
                    ₹{plan.price}
                  </span>
                  <span className="text-sm font-semibold text-gray-450 dark:text-gray-500 ml-2">
                    / {plan.duration} days
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-650 dark:text-gray-400">
                      <div className="p-0.5 bg-primary-50 dark:bg-primary-950/20 text-primary-650 dark:text-primary-400 rounded-md mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isSubmitting || isCurrent}
                className={`w-full py-3 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-default'
                    : 'bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white shadow-md active:scale-95'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isCurrent ? (
                  'Active Plan'
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </div>
          );
        })}
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

export default Plans;
