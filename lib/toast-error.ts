import { ApiErrorResponse } from '@/types';
import toast from 'react-hot-toast';

export const returnErrorMessage = (error: ApiErrorResponse) => {
  const errorMsg = error?.response?.data?.message;
  if (Array.isArray(errorMsg)) {
    return errorMsg.join(', ');
  } else if (errorMsg) {
    return errorMsg;
  } else {
    return 'Something went wrong. Please try again.';
  }
}

export const handleApiError = (error: ApiErrorResponse) => {
  const errorMsg = error?.response?.data?.message;
  if (Array.isArray(errorMsg)) {
    toast.error(errorMsg.join(', '));
  } else if (errorMsg) {
    toast.error(errorMsg);
  } else {
    toast.error('Something went wrong. Please try again.');
  }
};

