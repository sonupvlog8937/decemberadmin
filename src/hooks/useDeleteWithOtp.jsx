import { useState } from 'react';

/**
 * Custom hook for handling delete operations with OTP verification
 * Usage:
 * const { otpDialogOpen, deleteTarget, confirmDelete, handleOtpVerified, closeOtpDialog } = useDeleteWithOtp(onDeleteCallback);
 */
export const useDeleteWithOtp = (onDeleteCallback) => {
    const [otpDialogOpen, setOtpDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { id, name, multiple, count }

    const confirmDelete = (id, name, options = {}) => {
        const { multiple = false, count = 1 } = options;
        setDeleteTarget({ id, name, multiple, count });
        setOtpDialogOpen(true);
    };

    const handleOtpVerified = async () => {
        if (onDeleteCallback && deleteTarget) {
            await onDeleteCallback(deleteTarget);
        }
        setDeleteTarget(null);
    };

    const closeOtpDialog = () => {
        setOtpDialogOpen(false);
        setDeleteTarget(null);
    };

    return {
        otpDialogOpen,
        deleteTarget,
        confirmDelete,
        handleOtpVerified,
        closeOtpDialog,
    };
};

export default useDeleteWithOtp;
