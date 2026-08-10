import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

// Global OTP verification state
let otpVerificationPending = false;
let currentDeleteOperation = null;

// Event emitter for OTP dialog
const otpEventListeners = [];

export const onOtpRequired = (callback) => {
    otpEventListeners.push(callback);
    return () => {
        const index = otpEventListeners.indexOf(callback);
        if (index > -1) otpEventListeners.indexOf.splice(index, 1);
    };
};

const emitOtpRequired = (data) => {
    otpEventListeners.forEach(listener => listener(data));
};

// Send OTP to admin phone
export const sendDeleteOtp = async () => {
    const adminPhone = '8969737537';
    
    try {
        const response = await fetch(apiUrl + '/api/admin/send-delete-otp', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phone: adminPhone,
                action: 'delete'
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending OTP:', error);
        return { error: true, message: 'Failed to send OTP' };
    }
};

// Verify OTP
export const verifyDeleteOtp = async (otp) => {
    const adminPhone = '8969737537';
    
    try {
        const response = await fetch(apiUrl + '/api/admin/verify-delete-otp', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phone: adminPhone,
                otp: otp
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return { error: true, message: 'OTP verification failed' };
    }
};

// Execute pending delete operation after OTP verification
export const executePendingDelete = async () => {
    if (!currentDeleteOperation) return null;
    
    const operation = currentDeleteOperation;
    currentDeleteOperation = null;
    otpVerificationPending = false;
    
    return operation.execute();
};

// Cancel pending delete operation
export const cancelPendingDelete = () => {
    currentDeleteOperation = null;
    otpVerificationPending = false;
};

// Wrapper for deleteData with OTP verification
export const deleteDataWithOtp = (url, itemName = 'this item') => {
    return new Promise((resolve, reject) => {
        // Store the delete operation
        currentDeleteOperation = {
            url,
            itemName,
            type: 'single',
            execute: async () => {
                const params = {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json',
                    }
                };
                
                try {
                    const { data } = await axios.delete(apiUrl + url, params);
                    return data;
                } catch (error) {
                    throw error;
                }
            },
            resolve,
            reject
        };
        
        otpVerificationPending = true;
        
        // Emit event to show OTP dialog
        emitOtpRequired({
            itemName,
            itemCount: 1,
            type: 'single'
        });
    });
};

// Wrapper for deleteMultipleData with OTP verification
export const deleteMultipleDataWithOtp = (url, data, itemCount = 0, itemName = 'items') => {
    return new Promise((resolve, reject) => {
        // Store the delete operation
        currentDeleteOperation = {
            url,
            data,
            itemName,
            itemCount,
            type: 'multiple',
            execute: async () => {
                const params = {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json',
                    }
                };
                
                try {
                    const response = await axios.delete(apiUrl + url, {
                        ...params,
                        data: data.data
                    });
                    return response.data;
                } catch (error) {
                    throw error;
                }
            },
            resolve,
            reject
        };
        
        otpVerificationPending = true;
        
        // Emit event to show OTP dialog
        emitOtpRequired({
            itemName,
            itemCount,
            type: 'multiple'
        });
    });
};

// Get current pending operation info
export const getPendingOperation = () => {
    return currentDeleteOperation ? {
        itemName: currentDeleteOperation.itemName,
        itemCount: currentDeleteOperation.itemCount || 1,
        type: currentDeleteOperation.type
    } : null;
};

export const isOtpVerificationPending = () => otpVerificationPending;
