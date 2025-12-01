import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useContext, useEffect, useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../../components/providers/AuthWrapper';

const CheckoutForm = ({ campaignId }) => {
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const stripe = useStripe();
  const elements = useElements();
  const axiosSecure = useAxiosSecure();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch the specific donation campaign by ID
    if (campaignId) {
      axiosSecure.get(`/donations/${campaignId}`)
        .then(response => {
          console.log('API Response:', response.data);
          if (response.data.success && response.data.data) {
            setDonation(response.data.data);
          } else {
            console.error("Failed to fetch donation campaign");
          }
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching donation campaign:", error);
          setLoading(false);
        });
    }
  }, [campaignId, axiosSecure]);
  
  console.log('activedonation', donation);
  const [values, setValues] = useState({
    donationAmount: 0,
  });

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  };
  
  console.log('donationnnnn', donation);
  
  useEffect(() => {
    if (donation && values.donationAmount > 0) {
      axiosSecure.post('/payments/create-payment-intent', {
        amount: parseFloat(values.donationAmount),
        currency: donation.currency || 'inr',
        donationCampaignId: donation._id,
        description: `Donation to ${donation.title || 'campaign'}`
      })
        .then(res => {
          console.log(res.data.clientSecret);
          setClientSecret(res.data.clientSecret);
        })
        .catch(error => {
          console.error("Error creating payment intent:", error);
        });
    }
  }, [axiosSecure, values.donationAmount, donation]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const card = elements.getElement(CardElement);

    if (card === null) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card,
    });

    if (error) {
      console.log('payment error', error);
      setError(error.message);
    } else {
      console.log('payment method', paymentMethod);
      setError('');
    }

    // Only proceed with payment confirmation if we have a donation and clientSecret
    if (donation && clientSecret) {
      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            email: user?.email || 'anonymous',
            name: user?.name || 'anonymous'
          }
        }
      });

      if (confirmError) {
        console.log('confirm error', confirmError);
        setError(confirmError.message);
      } else {
        console.log('payment intent', paymentIntent);
        if (paymentIntent.status === 'succeeded') {
          console.log('transaction id', paymentIntent.id);
          setTransactionId(paymentIntent.id);
          
          const paymentData = {
            paymentIntentId: paymentIntent.id,
            donationCampaignId: donation._id,
            amount: parseFloat(values.donationAmount),
            anonymous: false,
            message: `Donation of ${values.donationAmount} ${donation.currency || 'INR'}`
          };

          const res = await axiosSecure.post('/payments/confirm', paymentData);
          console.log('payment saved', res.data);

          if (res.data?.success) {
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Thank you for your donation!',
              showConfirmButton: false,
              timer: 1500
            });
            navigate('/dashboard/user-donations');
          }
        }
      }
    }
  };

  if (loading) {
    return <div>Loading donation campaign...</div>;
  }

  if (!donation) {
    return <div>Donation campaign not found.</div>;
  }

  const { title, description, image, targetAmount, currentAmount, currency = 'INR' } = donation;

  return (
    <div className="max-w-md mx-auto p-3">
      <style>{`
        .stripe-card-container {
          display: block;
          width: 100%;
          padding: 4px;
          border: 1px solid #d1d5db;
          border-radius: 2px;
          background-color: white;
          box-sizing: border-box;
        }
        
        .StripeElement {
          display: block;
          width: 100%;
          padding: 3px 0;
          border-radius: 2px;
          box-sizing: border-box;
          font-size: 14px;
        }
        
        .StripeElement--focus {
          outline: none;
          box-shadow: 0 0 0 1px #3b82f6;
          border-color: #3b82f6;
        }
        
        .StripeElement--invalid {
          border-color: #e41029;
        }
        
        .StripeElement--webkit-autofill {
          background-color: #fefde5 !important;
        }
        
        /* Ensure proper spacing between card fields */
        .StripeElement iframe {
          width: 100% !important;
        }
        
        /* Fix for card number and date overlapping */
        .__PrivateStripeElement iframe {
          height: auto !important;
        }
      `}</style>
      <div className="bg-white rounded-md shadow-sm p-3">
        <h2 className="text-lg font-bold mb-2">Payment Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="donationAmount">
              Donation Amount ({currency})
            </label>
            <input
              type="number"
              id="donationAmount"
              name="donationAmount"
              value={values.donationAmount}
              onChange={handleChange}
              min="1"
              step="0.01"
              className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-2">
            <label className="block text-gray-700 text-xs font-bold mb-1">
              Card Information
            </label>
            <div className="stripe-card-container">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                      lineHeight: '1.4em',
                      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
                      fontSmoothing: 'antialiased',
                      '::selection': {
                        backgroundColor: '#fce8e6',
                      },
                    },
                    invalid: {
                      color: '#e41029',
                      iconColor: '#e41029',
                    },
                  },
                  // Hide postal code field to reduce clutter
                  hidePostalCode: true,
                }}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-xs mb-2">{error}</div>}

          {transactionId && (
            <div className="text-green-500 text-xs mb-2">
              Transaction successful! Transaction ID: {transactionId}
            </div>
          )}

          <button
            type="submit"
            disabled={!stripe || !elements || !values.donationAmount || values.donationAmount <= 0}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            Donate {values.donationAmount} {currency}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;