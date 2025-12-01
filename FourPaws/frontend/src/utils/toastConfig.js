import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configure toast defaults
toast.configure({
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  role: 'alert',
  closeButton: true,
  // Ensure toast is accessible
  className: 'toast-accessible',
  bodyClassName: 'toast-body-accessible',
  toastClassName: 'toast-container-accessible',
  // Prevent aria-hidden on parent elements
  containerId: 'toast-container',
  // Enable focus management
  enableFocus: true,
  // Don't close on escape key to prevent focus issues
  closeOnEscape: false,
  // Disable auto focus on close button
  autoFocus: false
});

export const showSuccess = (message) => {
  toast.success(message, {
    className: 'toast-success',
    'aria-live': 'assertive',
    'data-testid': 'toast-success'
  });};

export const showError = (message) => {
  toast.error(message, {
    className: 'toast-error',
    'aria-live': 'assertive',
    'data-testid': 'toast-error'
  });};

export const showWarning = (message) => {
  toast.warning(message, {
    className: 'toast-warning',
    'aria-live': 'assertive',
    'data-testid': 'toast-warning'
  });};

export const showInfo = (message) => {
  toast.info(message, {
    className: 'toast-info',
    'aria-live': 'polite',
    'data-testid': 'toast-info'
  });};

export default toast;
