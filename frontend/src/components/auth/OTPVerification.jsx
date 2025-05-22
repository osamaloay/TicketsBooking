import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import './AuthForms.css';

//oyp is sent when user registers, login and resets password
const OTPVerification = ({ email, type, onSuccess }) => {
  //function with parameters 
   // email os the user
   // type of verif ('register', 'login', 'forgot')
   // Callback function for successful verification

  const [otp, setOtp] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); //no ay 7aga 
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (type === 'register') { //register case
        response = await authService.verifyRegistrationOTP(email, otp);
        toast.success('Registration completed successfully!');
        navigate('/login');
      } 
      else if (type === 'login') {//login case
        response = await authService.verifyLoginOTP(email, otp);
        toast.success('Login successful!');
        if (onSuccess) {
          onSuccess(response);
        }
        navigate('/dashboard');
      } 
      else if (type === 'forgot') { //forgot password case
        response = await authService.verifyForgotPasswordOTP(email, otp);
        toast.success('Password reset successful!');
        navigate('/login');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };
   
  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      if (type === 'register') {
        await authService.register({ email });
      } else if (type === 'login') {
        await authService.login({ email });
      } else if (type === 'forgot') {
        await authService.forgotPassword(email);
      }
      toast.success('New OTP sent successfully!');
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-header">
        <h2>Verify OTP</h2>
        <p>Please enter the OTP sent to {email}</p>
      </div>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="otp">OTP</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => {
              // Only allow numbers
              const value = e.target.value.replace(/[^0-9]/g, '');
              setOtp(value);
            }}
            placeholder="Enter OTP"
            maxLength="6"
            disabled={isLoading}
            pattern="[0-9]*"
            inputMode="numeric"
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div className="form-footer">
          <button 
            type="button" 
            className="resend-button"
            onClick={handleResendOTP}
            disabled={isLoading}
          >
            Resend OTP
          </button>
        </div>
      </form>
    </div>
  );
};

export default OTPVerification; 