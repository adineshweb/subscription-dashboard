import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { setSubscription } from '../redux/slices/subscriptionSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { Check, Flame, Shield, Zap, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

const fallbackPlans = [
  {
    _id: 'mock_free_id',
    name: 'Free',
    description: 'Basic dashboard tracking and community features.',
    price: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['Dashboard Access', 'Community Support', 'Basic Analytics'],
    duration: 30,
    popular: false,
    active: true,
  },
  {
    _id: 'mock_starter_id',
    name: 'Starter',
    description: 'Great for individual freelancers and small startups.',
    price: 299,
    monthlyPrice: 299,
    yearlyPrice: 2990,
    features: ['Priority Email Support', 'Advanced Analytics', '1 Team Member'],
    duration: 30,
    popular: false,
    active: true,
  },
  {
    _id: 'mock_professional_id',
    name: 'Professional',
    description: 'Perfect for growing businesses and professional agencies.',
    price: 599,
    monthlyPrice: 599,
    yearlyPrice: 5990,
    features: ['24/7 Dedicated Support', 'Enterprise Analytics', 'Up to 5 Team Members', 'Custom Reports'],
    duration: 30,
    popular: true,
    active: true,
  },
  {
    _id: 'mock_enterprise_id',
    name: 'Enterprise',
    description: 'Tailored operations and support for large companies.',
    price: 1999,
    monthlyPrice: 1999,
    yearlyPrice: 19990,
    features: ['Unlimited Team Members', 'Dedicated Account Manager', 'Custom SLA & Integrations', 'Advanced Data Export'],
    duration: 90,
    popular: false,
    active: true,
  },
];

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' | 'yearly'
  const [submittingPlanId, setSubmittingPlanId] = useState(null);
  const [toast, setToast] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { currentPlan } = useSelector((state) => state.subscription);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/plans');
      if (res.data && res.data.length > 0) {
        setPlans(res.data);
        setIsUsingFallback(false);
      } else {
        // Empty array response fallback
        setPlans(fallbackPlans);
        setIsUsingFallback(true);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load plans.');
      setPlans(fallbackPlans);
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      // Check if plan is mock and warn user or allow mock activation
      const isMockPlan = plan._id.startsWith('mock_');
      let orderRes;
      
      if (isMockPlan) {
        // For mock plans, simulate backend order directly
        orderRes = {
          data: {
            razorpayEnabled: false,
            orderId: `mock_order_${Date.now()}`,
            amount: (billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice) * 100,
            currency: 'INR',
          }
        };
      } else {
        orderRes = await api.post(`/subscribe/order/${plan._id}`);
      }

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
        setToast({ type: 'info', message: 'Simulating payment checkout...' });
        
        setTimeout(async () => {
          try {
            let subscriptionData;
            if (isMockPlan) {
              // Simulate direct frontend mock subscription activation
              subscriptionData = {
                userId: user.id,
                planId: {
                  _id: plan._id,
                  name: plan.name,
                  price: billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice,
                  duration: plan.duration,
                },
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active',
              };
            } else {
              const verifyRes = await api.post(`/subscribe/${plan._id}`, {
                razorpayOrderId: orderId,
                razorpayPaymentId: `mock_pay_${Date.now()}`,
              });
              subscriptionData = verifyRes.data.subscription;
            }

            dispatch(setSubscription(subscriptionData));
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
      case 'free':
        return <Zap className="w-6 h-6 text-gray-400" />;
      case 'starter':
        return <Zap className="w-6 h-6 text-blue-500" />;
      case 'professional':
        return <Flame className="w-6 h-6 text-orange-500" />;
      case 'enterprise':
        return <Shield className="w-6 h-6 text-green-500" />;
      default:
        return <Check className="w-6 h-6 text-primary-500" />;
    }
  };

  if (loading && plans.length === 0) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          Loading subscription plans...
        </p>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Fallback Mode Notification */}
      {isUsingFallback && (
        <div className="max-w-4xl mx-auto mb-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 p-4 rounded-2xl flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <span>
              <strong>Note:</strong> Currently running in <strong>Offline/Simulated mode</strong>. Displays fallback plan templates.
            </span>
          </div>
          <button 
            onClick={fetchPlans} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-semibold text-xs active:scale-95"
          >
            <RefreshCw className="w-3 h-3" />
            Retry Connection
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 sm:text-5xl">
          Choose the right plan for your business
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Supercharge your administration. Upgrade, downgrade, or cancel at any time.
        </p>
      </div>

      {/* Monthly / Yearly Billing Toggle */}
      <div className="flex items-center justify-center gap-3 mb-16">
        <span className={`text-sm font-semibold transition-colors ${billingPeriod === 'monthly' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary-600 transition-colors duration-200 ease-in-out focus:outline-none"
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              billingPeriod === 'yearly' ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${billingPeriod === 'yearly' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
          Yearly 
          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 font-bold rounded-full text-2xs uppercase tracking-wider">
            Save 20%
          </span>
        </span>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = currentPlan?.planId?._id === plan._id;
          const isSubmitting = submittingPlanId === plan._id;
          
          // Compute prices
          const isYearly = billingPeriod === 'yearly';
          const displayPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const originalPrice = isYearly ? plan.monthlyPrice * 12 : plan.monthlyPrice;
          const monthlyEquivalent = isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;

          return (
            <div
              key={plan._id}
              className={`relative flex flex-col justify-between p-6 bg-white dark:bg-gray-800 border rounded-3xl transition-all hover:-translate-y-1.5 duration-300 shadow-md ${
                plan.popular
                  ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-primary-500/5'
                  : 'border-gray-100 dark:border-gray-800'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-600 text-white text-2xs font-extrabold rounded-full uppercase tracking-widest shadow-md">
                  Most Popular
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {plan.name}
                  </span>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    {getPlanIcon(plan.name)}
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 min-h-[36px] mb-6 leading-relaxed">
                  {plan.description}
                </p>

                <div className="flex flex-col mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">
                      ₹{displayPrice}
                    </span>
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 ml-2">
                      / {isYearly ? 'year' : `${plan.duration} days`}
                    </span>
                  </div>
                  {isYearly && plan.yearlyPrice > 0 && (
                    <span className="text-2xs text-primary-600 dark:text-primary-400 font-bold mt-1">
                      ₹{monthlyEquivalent}/mo equivalent (billed annually)
                    </span>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="p-0.5 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-md mt-0.5 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isSubmitting || isCurrent}
                className={`w-full py-3 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-default'
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
