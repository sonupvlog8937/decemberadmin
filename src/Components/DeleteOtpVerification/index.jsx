import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Box,
    Typography,
    Alert
} from '@mui/material';
import { MdWarning, MdSecurity } from 'react-icons/md';
import { postData } from '../../utils/api';

const DeleteOtpVerification = ({ 
    open, 
    onClose, 
    onVerified, 
    itemName = "this item",
    itemCount = 1 
}) => {
    const [step, setStep] = useState('confirm'); // 'confirm' or 'otp'
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const adminPhone = '8969737537'; // Fixed admin phone number

    const handleSendOtp = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await postData('/api/admin/send-delete-otp', {
                phone: adminPhone,
                action: 'delete',
                itemName: itemName
            });

            if (response.error === false) {
                setOtpSent(true);
                setStep('otp');
            } else {
                setError(response.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Failed to send OTP. Please try again.');
            console.error('OTP send error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await postData('/api/admin/verify-delete-otp', {
                phone: adminPhone,
                otp: otp
            });

            if (response.error === false) {
                // OTP verified successfully
                onVerified();
                handleClose();
            } else {
                setError(response.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('OTP verification failed. Please try again.');
            console.error('OTP verification error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('confirm');
        setOtp('');
        setError('');
        setOtpSent(false);
        setLoading(false);
        onClose();
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtp(value);
        if (error) setError('');
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                style: {
                    borderRadius: 16,
                    padding: '8px'
                }
            }}
        >
            {step === 'confirm' ? (
                <>
                    <DialogTitle>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <span 
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: '#fee2e2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <MdWarning size={20} color="#dc2626" />
                            </span>
                            <Typography variant="h6" fontWeight={600}>
                                Confirm Delete
                            </Typography>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            {itemCount > 1 
                                ? `Are you sure you want to delete ${itemCount} selected items?`
                                : `Are you sure you want to delete "${itemName}"?`
                            }
                        </Typography>
                        <Alert severity="warning" icon={<MdSecurity />}>
                            For security, an OTP will be sent to <strong>{adminPhone}</strong> for verification.
                        </Alert>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleClose}
                            disabled={loading}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleSendOtp}
                            disabled={loading}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                                fontWeight: 600,
                                minWidth: 120
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
                        </Button>
                    </DialogActions>
                </>
            ) : (
                <>
                    <DialogTitle>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <span 
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: '#dbeafe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <MdSecurity size={20} color="#2563eb" />
                            </span>
                            <Typography variant="h6" fontWeight={600}>
                                Enter OTP
                            </Typography>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Please enter the 6-digit OTP sent to <strong>{adminPhone}</strong>
                        </Typography>
                        <TextField
                            fullWidth
                            label="Enter OTP"
                            value={otp}
                            onChange={handleOtpChange}
                            placeholder="000000"
                            inputProps={{
                                maxLength: 6,
                                style: {
                                    fontSize: '24px',
                                    letterSpacing: '8px',
                                    textAlign: 'center',
                                    fontWeight: 600
                                }
                            }}
                            error={!!error}
                            helperText={error}
                            autoFocus
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && otp.length === 6) {
                                    handleVerifyOtp();
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />
                        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                                Didn't receive OTP?
                            </Typography>
                            <Button
                                size="small"
                                onClick={handleSendOtp}
                                disabled={loading}
                                sx={{ textTransform: 'none' }}
                            >
                                Resend OTP
                            </Button>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleClose}
                            disabled={loading}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleVerifyOtp}
                            disabled={loading || otp.length !== 6}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                                fontWeight: 600,
                                minWidth: 120
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Delete'}
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};

export default DeleteOtpVerification;
