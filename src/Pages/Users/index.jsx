import React, { useContext, useEffect, useState } from 'react';
import {
    Button, Checkbox, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead,
    TablePagination, TableRow, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    Chip, Tooltip, IconButton, InputAdornment, Avatar, Fade, Skeleton,
} from '@mui/material';
import { MdLocalPhone, MdOutlineMarkEmailRead, MdRefresh, MdClose } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import { SlCalender } from 'react-icons/sl';
import { FaCheckDouble, FaUserShield, FaStore, FaUsers, FaUserPlus, FaTruckFast } from 'react-icons/fa6';
import { MdDeleteOutline, MdPersonOff, MdWarning } from 'react-icons/md';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import SearchBox from '../../Components/SearchBox';
import { MyContext } from '../../App';
import { deleteData, deleteMultipleData, editData, fetchDataFromApi, postData } from '../../utils/api';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const columns = [
    { id: 'user', label: 'USER', minWidth: 220 },
    { id: 'role', label: 'ROLE', minWidth: 120 },
    { id: 'status', label: 'STATUS', minWidth: 120 },
    { id: 'userPh', label: 'PHONE', minWidth: 140 },
    { id: 'verifyemail', label: 'EMAIL VERIFY', minWidth: 140 },
    { id: 'createdDate', label: 'CREATED', minWidth: 130 },
    { id: 'action', label: 'ACTION', minWidth: 100 },
];

const initialSellerForm = { name: '', email: '', password: '', mobile: '', role: 'SELLER', storeName: '', marketId: '' };

const ROLE_OPTIONS = [
    { value: 'USER', label: 'USER' },
    { value: 'SELLER', label: 'SELLER' },
    { value: 'GROCERY_SELLER', label: 'GROCERY SELLER' },
    { value: 'RESTAURANT_SELLER', label: 'RESTAURANT SELLER' },
    { value: 'FASHION_SELLER', label: 'FASHION SELLER' },
    { value: 'ELECTRONICS_SELLER', label: 'ELECTRONICS SELLER' },
    { value: 'MEDICAL_SELLER', label: 'MEDICAL SELLER' },
    { value: 'BEAUTY_SELLER', label: 'BEAUTY SELLER' },
    { value: 'HOME_KITCHEN_SELLER', label: 'HOME & KITCHEN SELLER' },
    { value: 'GIFTS_TOYS_SELLER', label: 'GIFTS & TOYS SELLER' },
    { value: 'BOOKS_STATIONERY_SELLER', label: 'BOOKS & STATIONERY SELLER' },
    { value: 'JEWELLERY_SELLER', label: 'JEWELLERY SELLER' },
    { value: 'HARDWARE_SELLER', label: 'HARDWARE SELLER' },
    { value: 'AUTOMOBILE_SELLER', label: 'AUTOMOBILE SELLER' },
    { value: 'DELIVERY_RIDER', label: 'DELIVERY RIDER' },
    { value: 'ADMIN', label: 'ADMIN' },
    { value: 'VICE_ADMIN', label: 'VICE ADMIN' },
];
const SELLER_ROLES = ['SELLER', 'GROCERY_SELLER', 'RESTAURANT_SELLER', 'FASHION_SELLER', 'ELECTRONICS_SELLER', 'MEDICAL_SELLER', 'BEAUTY_SELLER', 'HOME_KITCHEN_SELLER', 'GIFTS_TOYS_SELLER', 'BOOKS_STATIONERY_SELLER', 'JEWELLERY_SELLER', 'HARDWARE_SELLER', 'AUTOMOBILE_SELLER'];
const isSellerRole = (role) => SELLER_ROLES.includes(role);
const GO_MARKET_SELLER_ROLES = SELLER_ROLES.filter((r) => r !== 'SELLER');

const roleConfig = {
    ADMIN: { color: '#7c3aed', bg: '#ede9fe', icon: <FaUserShield size={11} /> },
    VICE_ADMIN: { color: '#4f46e5', bg: '#e0e7ff', icon: <FaUserShield size={11} /> },
    SELLER: { color: '#0369a1', bg: '#e0f2fe', icon: <FaStore size={11} /> },
    GROCERY_SELLER: { color: '#047857', bg: '#d1fae5', icon: <FaStore size={11} /> },
    RESTAURANT_SELLER: { color: '#c2410c', bg: '#ffedd5', icon: <FaStore size={11} /> },
    FASHION_SELLER: { color: '#ec4899', bg: '#fce7f3', icon: <FaStore size={11} /> },
    ELECTRONICS_SELLER: { color: '#3b82f6', bg: '#dbeafe', icon: <FaStore size={11} /> },
    MEDICAL_SELLER: { color: '#ef4444', bg: '#fee2e2', icon: <FaStore size={11} /> },
    BEAUTY_SELLER: { color: '#d946ef', bg: '#fae8ff', icon: <FaStore size={11} /> },
    HOME_KITCHEN_SELLER: { color: '#f59e0b', bg: '#fef3c7', icon: <FaStore size={11} /> },
    GIFTS_TOYS_SELLER: { color: '#f472b6', bg: '#fce7f3', icon: <FaStore size={11} /> },
    BOOKS_STATIONERY_SELLER: { color: '#8b5cf6', bg: '#ede9fe', icon: <FaStore size={11} /> },
    JEWELLERY_SELLER: { color: '#d97706', bg: '#fef3c7', icon: <FaStore size={11} /> },
    HARDWARE_SELLER: { color: '#6b7280', bg: '#f3f4f6', icon: <FaStore size={11} /> },
    AUTOMOBILE_SELLER: { color: '#14b8a6', bg: '#ccfbf1', icon: <FaStore size={11} /> },
    DELIVERY_RIDER: { color: '#0891b2', bg: '#cffafe', icon: <FaTruckFast size={11} /> },
    USER: { color: '#374151', bg: '#f3f4f6', icon: <FaUsers size={11} /> },
};

const statusConfig = {
    Active: { color: '#15803d', bg: '#dcfce7', dot: '#22c55e' },
    Inactive: { color: '#92400e', bg: '#fef3c7', dot: '#f59e0b' },
    Suspended: { color: '#991b1b', bg: '#fee2e2', dot: '#ef4444' },
};

const AVATAR_GRADS = [
    ['#6366f1', '#8b5cf6'], ['#ec4899', '#f97316'], ['#0ea5e9', '#10b981'],
    ['#f59e0b', '#ef4444'], ['#8b5cf6', '#ec4899'], ['#14b8a6', '#6366f1'],
];
const avatarGrad = (name = '') => {
    const [a, b] = AVATAR_GRADS[(name.charCodeAt(0) || 0) % AVATAR_GRADS.length];
    return `linear-gradient(135deg, ${a}, ${b})`;
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

.us{--ink:#1e1b4b; --mut:#6b7280; --soft:#9ca3af; --line:#e8eaf8;
  --ease:cubic-bezier(.22,1,.36,1); --spring:cubic-bezier(.34,1.45,.64,1);
  position:relative; font-family:'DM Sans',sans-serif; font-size:12px; color:var(--ink)}
.us *,.us *::before,.us *::after{box-sizing:border-box}
@media(prefers-reduced-motion:reduce){.us *,.us *::before,.us *::after{animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important}}

@keyframes usIn{from{opacity:0; transform:translateY(12px)}to{opacity:1; transform:none}}
@keyframes usFlow{to{background-position:200% 0}}
@keyframes usPop{from{opacity:0; transform:scale(.9)}to{opacity:1; transform:none}}
@keyframes usDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(18px,-20px)}}
@keyframes usPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.5)}50%{box-shadow:0 0 0 5px rgba(34,197,94,0)}}

/* header */
.us-head{position:relative; overflow:hidden; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px;
  padding:16px 20px; margin-bottom:14px; border-radius:20px; border:1px solid var(--line);
  background:linear-gradient(120deg,#eef2ff 0%,#fdf2f8 50%,#fff7ed 100%); box-shadow:0 10px 30px -14px rgba(99,102,241,.3);
  animation:usIn .5s var(--ease) both}
.us-head::before{content:''; position:absolute; left:0; top:0; right:0; height:3px;
  background:linear-gradient(90deg,#6366f1,#ec4899,#f59e0b,#10b981,#0ea5e9,#6366f1); background-size:200% 100%; animation:usFlow 6s linear infinite}
.us-head::after{content:''; position:absolute; right:-40px; bottom:-60px; width:160px; height:160px; border-radius:50%;
  background:radial-gradient(circle,rgba(236,72,153,.18),transparent 70%); animation:usDrift 10s ease-in-out infinite; pointer-events:none}
.us-head > *{position:relative; z-index:1}
.us-title{margin:0; font-family:'Sora',sans-serif; font-size:17px; font-weight:800; letter-spacing:-.02em;
  background:linear-gradient(90deg,#6366f1,#ec4899); -webkit-background-clip:text; background-clip:text; color:transparent}
.us-sub{margin:3px 0 0; font-size:11.5px; color:var(--mut)}
.us-ro{display:inline-flex; align-items:center; gap:6px; margin-top:8px; padding:3px 10px; background:#fef3c7; border:1px solid #fde68a; border-radius:99px; font-size:10.5px; color:#92400e; font-weight:600}
.us-actions{display:flex; align-items:center; gap:8px}
.us-btn{display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 14px; border:none; border-radius:10px; cursor:pointer;
  font:inherit; font-size:12px; font-weight:700; color:#fff; position:relative; overflow:hidden;
  background:linear-gradient(135deg,#6366f1,#ec4899); box-shadow:0 8px 18px -8px rgba(236,72,153,.6); transition:transform .2s var(--spring), box-shadow .2s}
.us-btn:hover{transform:translateY(-2px); box-shadow:0 12px 22px -8px rgba(236,72,153,.7)}
.us-btn:active{transform:scale(.97)}
.us-refresh{width:34px; height:34px; display:grid; place-items:center; border:1px solid #c7d2fe; border-radius:10px; background:#fff; color:#4f46e5; cursor:pointer; transition:all .25s var(--spring)}
.us-refresh:hover{background:#eef2ff; transform:rotate(180deg)}

/* stats */
.us-stats{display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:14px}
.us-stat{--c:#6366f1; --bg:#eef2ff; position:relative; overflow:hidden; display:flex; align-items:center; gap:12px; padding:13px 15px;
  background:#fff; border:1px solid var(--line); border-radius:16px; min-width:0; animation:usIn .5s var(--ease) both;
  transition:transform .3s var(--spring), box-shadow .3s, border-color .3s}
.us-stat::before{content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--c)}
.us-stat::after{content:''; position:absolute; right:-26px; bottom:-26px; width:80px; height:80px; border-radius:50%; background:var(--c); opacity:.08; transition:transform .5s var(--ease)}
.us-stat:hover{transform:translateY(-3px); border-color:var(--c); box-shadow:0 14px 26px -12px var(--c)}
.us-stat:hover::after{transform:scale(2)}
.us-stat-ic{width:38px; height:38px; border-radius:11px; display:grid; place-items:center; flex-shrink:0; font-size:16px; color:var(--c); background:var(--bg); transition:transform .3s var(--spring)}
.us-stat:hover .us-stat-ic{transform:rotate(-8deg) scale(1.1)}
.us-stat-n{font-family:'Sora',sans-serif; font-size:20px; font-weight:800; line-height:1}
.us-stat-l{font-size:11px; color:var(--mut); margin-top:4px; font-weight:600}

/* main card */
.us-card{background:#fff; border:1px solid var(--line); border-radius:20px; overflow:hidden; box-shadow:0 10px 30px -16px rgba(99,102,241,.25); animation:usIn .5s .1s var(--ease) both}
.us-bar{display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; padding:12px 16px; border-bottom:1px solid var(--line); background:linear-gradient(90deg,#fafaff,#fff)}
.us-search{width:260px; max-width:100%}
.us-sel{display:flex; align-items:center; gap:8px}

/* table (desktop) */
.us .MuiTableCell-root{font-family:'DM Sans',sans-serif; font-size:12px; border-bottom:1px solid #f1f2fb; padding:9px 12px}
.us .MuiTableCell-head{background:linear-gradient(90deg,#eef2ff,#fdf2f8) !important; color:#4f46e5 !important; font-size:10.5px !important; font-weight:700 !important; letter-spacing:.06em; border-bottom:1px solid #e0e7ff !important}
.us-row{--rc:#6366f1; animation:usIn .45s var(--ease) both; transition:background .2s}
.us-row > td:first-of-type{border-left:3px solid transparent; transition:border-color .2s}
.us-row:hover{background:linear-gradient(90deg,#f5f3ff,#fff1f2) !important}
.us-row:hover > td:first-of-type{border-left-color:var(--rc)}
.us-row.sel{background:#f5f3ff !important}
.us-row.sel > td:first-of-type{border-left-color:#7c3aed}
.us-u{display:flex; align-items:center; gap:10px}
.us-name{font-size:12.5px; font-weight:700}
.us-mail{display:flex; align-items:center; gap:3px; margin-top:1px; font-size:10.5px; color:var(--mut); word-break:break-all}
.us-pill{display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:99px; font-size:11px; font-weight:700}
.us-dot{width:7px; height:7px; border-radius:50%; flex-shrink:0; display:inline-block}
.us-dot.live{animation:usPulse 2s infinite}
.us-tag{display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:99px; font-size:10.5px; font-weight:700}
.us-ph{display:flex; align-items:center; gap:8px}
.us-ph span{display:flex; align-items:center; gap:5px; font-size:11.5px; font-weight:500}
.us-date{display:flex; align-items:center; gap:5px; font-size:11.5px; color:var(--mut)}
.us-empty{text-align:center; padding:44px 0; color:var(--soft)}
.us-empty svg{opacity:.35; margin-bottom:10px; animation:usDrift 4s ease-in-out infinite}

.us .MuiTablePagination-root{border-top:1px solid var(--line)}
.us .MuiTablePagination-root *{font-family:'DM Sans',sans-serif; font-size:11.5px}

/* tablet */
@media(max-width:900px){
  .us-stats{grid-template-columns:1fr 1fr}
}

/* MOBILE: table rows become cards (uses data-label on cells) */
@media(max-width:860px){
  .us-head{padding:14px; border-radius:16px}
  .us-actions{width:100%}
  .us-actions .us-btn{flex:1; justify-content:center}
  .us-bar{padding:10px 12px}
  .us-search{width:100%}
  .us-card{border-radius:16px}
  .us .MuiTableContainer-root{max-height:none !important; overflow:visible; padding:10px}
  .us .MuiTable-root,.us .MuiTableBody-root{display:block; width:100%}
  .us .MuiTableHead-root{display:none}
  .us-row{display:block; position:relative; margin-bottom:12px; padding:8px 14px 10px; background:#fff; border:1px solid var(--line); border-left:4px solid var(--rc); border-radius:16px; box-shadow:0 4px 14px rgba(99,102,241,.08)}
  .us-row.sel{border-color:#c4b5fd; border-left-color:#7c3aed}
  .us-row > td{display:block; position:relative; border:none !important; padding:7px 0 7px 88px !important; min-height:30px}
  .us-row > td + td{border-top:1px dashed #eef0fb !important}
  .us-row > td[data-label]::before{content:attr(data-label); position:absolute; left:0; top:9px; width:80px; font-size:9.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:#8b8fb8}
  .us-row > td[data-label="User"]{padding-left:0 !important; padding-right:36px !important}
  .us-row > td[data-label="User"]::before{display:none}
  .us-row > td.us-chk{position:absolute !important; top:6px; right:4px; padding:0 !important; min-height:0; border:none !important; width:auto}
  .us-row > td.us-chk::before{display:none}
  .us .MuiTablePagination-selectLabel,.us .MuiTablePagination-input{display:none}
  .us .MuiTablePagination-toolbar{padding-left:8px; padding-right:8px; justify-content:center; flex-wrap:wrap}
  .us .MuiTablePagination-spacer{display:none}
}
@media(max-width:480px){
  .us-stat{padding:11px 12px; gap:9px}
  .us-stat-ic{width:34px; height:34px}
  .us-stat-n{font-size:18px}
}
`;

// shared small field style for dialogs
const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px', fontSize: 12.5, background: '#fafaff', transition: 'box-shadow .2s, background .2s',
        '& fieldset': { borderColor: '#e7e9f8' },
        '&:hover fieldset': { borderColor: '#a5b4fc' },
        '&.Mui-focused': { background: '#fff', boxShadow: '0 0 0 3px rgba(139,92,246,.15)' },
        '&.Mui-focused fieldset': { borderColor: '#8b5cf6', borderWidth: 1.5 },
    },
    '& .MuiInputLabel-root': { fontSize: 12.5 },
    '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' },
    '& .MuiFormHelperText-root': { fontSize: 10.5, marginLeft: '4px' },
};
const menuItemSx = { fontSize: 12 };

const StatCard = ({ label: lbl, value, icon, color, bg, delay = 0 }) => (
    <div className="us-stat" style={{ '--c': color, '--bg': bg, animationDelay: `${delay}ms` }}>
        <div className="us-stat-ic">{icon}</div>
        <div style={{ minWidth: 0 }}>
            <div className="us-stat-n">{value ?? <Skeleton width={40} height={24} />}</div>
            <div className="us-stat-l">{lbl}</div>
        </div>
    </div>
);

export const Users = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [userData, setUserData] = useState({});
    const [userTotalData, setUserTotalData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortedIds, setSortedIds] = useState([]);
    const [sellerForm, setSellerForm] = useState(initialSellerForm);
    const [showPassword, setShowPassword] = useState(false);
    const [addSellerOpen, setAddSellerOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { id, name, multiple }
    const [formErrors, setFormErrors] = useState({});
    const [markets, setMarkets] = useState([]);

    const isGoMarketRole = GO_MARKET_SELLER_ROLES.includes(sellerForm.role);

    const context = useContext(MyContext);

    const getUsers = (pageNo, limit) => {
        setIsLoading(true);
        setPage(pageNo);
        fetchDataFromApi(`/api/user/getAllUsers?page=${pageNo + 1}&limit=${limit}`).then((res) => {
            setUserData(res);
            setUserTotalData(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        getUsers(page, rowsPerPage);
    }, [page, rowsPerPage]);

    useEffect(() => {
        if (searchQuery !== '') {
            const filteredItems = userTotalData?.totalUsers?.filter(
                (user) =>
                    user._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user?.role?.toLowerCase().includes(searchQuery.toLowerCase()),
            );
            setUserData({
                error: false,
                success: true,
                users: filteredItems,
                total: filteredItems?.length,
                page: Number(page),
                totalPages: Math.ceil((filteredItems?.length || 0) / rowsPerPage),
                totalUsersCount: userTotalData?.totalUsersCount,
            });
        } else {
            getUsers(page, rowsPerPage);
        }
    }, [searchQuery]);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        const updatedItems = userData?.users?.map((item) => ({ ...item, checked: isChecked }));
        setUserData({ ...userData, users: updatedItems });
        setSortedIds(isChecked ? updatedItems.map((item) => item._id) : []);
    };

    const handleCheckboxChange = (id) => {
        const updatedItems = userData?.users?.map((item) =>
            item._id === id ? { ...item, checked: !item.checked } : item,
        );
        setUserData({ ...userData, users: updatedItems });
        setSortedIds(updatedItems.filter((item) => item.checked).map((item) => item._id));
    };

    const confirmDelete = (id, name, multiple = false) => {
        setDeleteTarget({ id, name, multiple });
        setDeleteDialogOpen(true);
    };

    const handleConfirmedDelete = () => {
        if (deleteTarget?.multiple) {
            deleteMultipleData(`/api/user/deleteMultiple`, { data: { ids: sortedIds } }).then(() => {
                context.alertBox('success', `${sortedIds.length} users deleted`);
                setSortedIds([]);
                getUsers(page, rowsPerPage);
            });
        } else {
            deleteData(`/api/user/deleteUser/${deleteTarget.id}`).then(() => {
                context.alertBox('success', 'User deleted');
                getUsers(page, rowsPerPage);
            });
        }
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
    };

    const updateUserAccess = (targetUserId, payload) => {
        editData('/api/user/admin/user-access', { userId: targetUserId, ...payload })
            .then((res) => {
                if (res?.data || res?.success) {
                    context.alertBox('success', res?.message || 'Updated successfully');
                    getUsers(page, rowsPerPage);
                } else {
                    context.alertBox('error', res?.message || 'Failed to update');
                }
            })
            .catch(() => {
                context.alertBox('error', 'Failed to update user access');
            });
    };

    const validateSellerForm = () => {
        const errors = {};
        if (!sellerForm.name.trim()) errors.name = 'Name is required';
        if (!sellerForm.email.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellerForm.email)) errors.email = 'Invalid email';
        if (!sellerForm.password) errors.password = 'Password is required';
        else if (sellerForm.password.length < 6) errors.password = 'Min 6 characters';
        if (isGoMarketRole && !sellerForm.marketId) errors.marketId = 'Please select a market';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const createSeller = () => {
        if (!validateSellerForm()) return;
        postData('/api/user/create-seller', sellerForm).then((res) => {
            if (res?.success) {
                context.alertBox('success', res.message || 'Seller created successfully');
                setSellerForm(initialSellerForm);
                setFormErrors({});
                setAddSellerOpen(false);
                getUsers(page, rowsPerPage);
            } else {
                context.alertBox('error', res?.message || 'Unable to create seller');
            }
        });
    };

    const closeAddSeller = () => {
        setAddSellerOpen(false);
        setFormErrors({});
        setSellerForm(initialSellerForm);
    };

    // Stats derived
    const allUsers = userTotalData?.totalUsers || [];
    const totalCount = userTotalData?.totalUsersCount || 0;
    const adminCount = allUsers.filter((u) => u.role === 'ADMIN').length;
    const sellerCount = allUsers.filter((u) => isSellerRole(u.role)).length;
    const activeCount = allUsers.filter((u) => u.status === 'Active').length;

    const isViceAdmin = context?.userData?.role === 'VICE_ADMIN';
    const isReadOnly = isViceAdmin;

    if (context?.userData?.role !== 'ADMIN' && !isViceAdmin) {
        return (
            <div className="us">
                <style>{CSS}</style>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', background: '#fff', borderRadius: 20, border: '1px solid #e8eaf8', margin: '24px 0', textAlign: 'center', animation: 'usPop .4s both' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#fee2e2,#fce7f3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 26, color: '#e11d48' }}>
                        <MdPersonOff />
                    </div>
                    <h2 style={{ fontFamily: 'Sora,sans-serif', fontSize: 17, fontWeight: 800, margin: 0 }}>Access Restricted</h2>
                    <p style={{ fontSize: 12.5, color: '#6b7280', marginTop: 6, maxWidth: 320 }}>
                        Only administrators and vice administrators can access the Users panel.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="us">
            <style>{CSS}</style>

            {/* ── Header ── */}
            <div className="us-head">
                <div>
                    <h1 className="us-title">{isReadOnly ? 'Users Information (View Only)' : 'Users & Sellers'}</h1>
                    <p className="us-sub">
                        {isReadOnly
                            ? 'View user information including name, email, phone, and status'
                            : 'Manage user accounts, roles, and access permissions'}
                    </p>
                    {isReadOnly && (
                        <div className="us-ro">
                            <HiOutlineEyeOff size={13} /> Read-Only Access - You cannot edit or delete users
                        </div>
                    )}
                </div>
                <div className="us-actions">
                    <Tooltip title="Refresh list">
                        <button className="us-refresh" onClick={() => getUsers(page, rowsPerPage)} aria-label="Refresh">
                            <MdRefresh size={17} />
                        </button>
                    </Tooltip>
                    {!isReadOnly && (
                        <button className="us-btn" onClick={() => setAddSellerOpen(true)}>
                            <FaUserPlus size={13} /> Add Seller
                        </button>
                    )}
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="us-stats">
                <StatCard label="Total Users" value={totalCount} icon={<FaUsers />} color="#7c3aed" bg="#ede9fe" delay={0} />
                <StatCard label="Active Users" value={activeCount || '--'} icon={<FaCheckDouble />} color="#10b981" bg="#d1fae5" delay={70} />
                <StatCard label="Sellers" value={sellerCount || '--'} icon={<FaStore />} color="#0ea5e9" bg="#e0f2fe" delay={140} />
                <StatCard label="Admins" value={adminCount || '--'} icon={<FaUserShield />} color="#f59e0b" bg="#fef3c7" delay={210} />
            </div>

            {/* ── Main Card ── */}
            <div className="us-card">
                <div className="us-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 32 }}>
                        {!isReadOnly && sortedIds.length > 0 && (
                            <Fade in>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={`${sortedIds.length} selected`}
                                        size="small"
                                        sx={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', color: '#fff', fontWeight: 700, fontSize: 11 }}
                                    />
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        startIcon={<MdDeleteOutline size={15} />}
                                        onClick={() => confirmDelete(null, null, true)}
                                        sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11.5, borderRadius: '9px' }}
                                    >
                                        Delete Selected
                                    </Button>
                                </div>
                            </Fade>
                        )}
                    </div>
                    <div className="us-search">
                        <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                    </div>
                </div>

                <TableContainer sx={{ maxHeight: 540 }}>
                    <Table stickyHeader size="small" aria-label="users table">
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox" sx={{ pl: 2 }}>
                                    {!isReadOnly && (
                                        <Checkbox
                                            {...label}
                                            size="small"
                                            onChange={handleSelectAll}
                                            checked={userData?.users?.length > 0 ? userData?.users?.every((item) => item.checked) : false}
                                            indeterminate={sortedIds.length > 0 && sortedIds.length < (userData?.users?.length || 0)}
                                        />
                                    )}
                                </TableCell>
                                {columns.map((column) => (
                                    <TableCell key={column.id} sx={{ minWidth: column.minWidth }}>
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <TableRow key={i} className="us-row">
                                        <TableCell padding="checkbox" className="us-chk" sx={{ pl: 2 }}>
                                            <Skeleton variant="rectangular" width={16} height={16} sx={{ borderRadius: 1 }} />
                                        </TableCell>
                                        {columns.map((col) => (
                                            <TableCell key={col.id} data-label={col.label}>
                                                <Skeleton variant="text" width="80%" height={20} animation="wave" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : userData?.users?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <div className="us-empty">
                                            <FaUsers size={36} />
                                            <div style={{ fontSize: 13, fontWeight: 700 }}>No users found</div>
                                            <div style={{ fontSize: 11.5, marginTop: 4 }}>Try adjusting the search query</div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                userData?.users?.map((user, index) => {
                                    const rc = roleConfig[user?.role] || roleConfig.USER;
                                    const sc = statusConfig[user?.status] || statusConfig.Active;
                                    return (
                                        <TableRow
                                            key={user._id || index}
                                            hover
                                            className={`us-row${user.checked ? ' sel' : ''}`}
                                            style={{ '--rc': rc.color, animationDelay: `${Math.min(index, 12) * 0.035}s` }}
                                        >
                                            <TableCell padding="checkbox" className="us-chk" sx={{ pl: 2 }}>
                                                {!isReadOnly && (
                                                    <Checkbox
                                                        {...label}
                                                        size="small"
                                                        checked={!!user.checked}
                                                        onChange={() => handleCheckboxChange(user._id)}
                                                    />
                                                )}
                                            </TableCell>

                                            {/* User */}
                                            <TableCell data-label="User">
                                                <div className="us-u">
                                                    <Avatar
                                                        src={user?.avatar || '/user.jpg'}
                                                        alt={user?.name}
                                                        sx={{ width: 34, height: 34, borderRadius: '10px', fontSize: 13, fontWeight: 700, background: avatarGrad(user?.name) }}
                                                    >
                                                        {user?.name?.[0]?.toUpperCase()}
                                                    </Avatar>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div className="us-name">{user?.name}</div>
                                                        <div className="us-mail">
                                                            <MdOutlineMarkEmailRead size={12} />
                                                            {user?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Role */}
                                            <TableCell data-label="Role">
                                                {isReadOnly ? (
                                                    <div className="us-pill" style={{ background: rc.bg, color: rc.color }}>
                                                        {rc.icon}
                                                        <span>{ROLE_OPTIONS.find((r) => r.value === user?.role)?.label || user?.role}</span>
                                                    </div>
                                                ) : (
                                                    <Select
                                                        size="small"
                                                        value={user?.role || 'USER'}
                                                        onChange={(e) => updateUserAccess(user._id, { role: e.target.value })}
                                                        sx={{
                                                            fontSize: 11, fontWeight: 700, minWidth: 100,
                                                            background: rc.bg, color: rc.color, borderRadius: '20px',
                                                            transition: 'transform .2s, box-shadow .2s',
                                                            '&:hover': { boxShadow: `0 4px 12px ${rc.color}33` },
                                                            '& .MuiSelect-select': { py: '4px' },
                                                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                            '& .MuiSelect-icon': { color: rc.color },
                                                        }}
                                                    >
                                                        {ROLE_OPTIONS.map((role) => (
                                                            <MenuItem key={role.value} value={role.value} sx={menuItemSx}>{role.label}</MenuItem>
                                                        ))}
                                                    </Select>
                                                )}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell data-label="Status">
                                                {isReadOnly ? (
                                                    <div className="us-pill" style={{ background: sc.bg, color: sc.color }}>
                                                        <span className={`us-dot${user?.status === 'Active' || !user?.status ? ' live' : ''}`} style={{ background: sc.dot }} />
                                                        <span>{user?.status || 'Active'}</span>
                                                    </div>
                                                ) : (
                                                    <Select
                                                        size="small"
                                                        value={user?.status || 'Active'}
                                                        onChange={(e) => updateUserAccess(user._id, { status: e.target.value })}
                                                        sx={{
                                                            fontSize: 11, fontWeight: 700, minWidth: 110,
                                                            background: sc.bg, color: sc.color, borderRadius: '20px',
                                                            '&:hover': { boxShadow: `0 4px 12px ${sc.dot}33` },
                                                            '& .MuiSelect-select': { py: '4px' },
                                                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                            '& .MuiSelect-icon': { color: sc.color },
                                                        }}
                                                        renderValue={(val) => (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <span className={`us-dot${val === 'Active' ? ' live' : ''}`} style={{ background: statusConfig[val]?.dot || '#22c55e' }} />
                                                                {val}
                                                            </span>
                                                        )}
                                                    >
                                                        <MenuItem value="Active" sx={menuItemSx}>Active</MenuItem>
                                                        <MenuItem value="Inactive" sx={menuItemSx}>Inactive</MenuItem>
                                                        <MenuItem value="Suspended" sx={menuItemSx}>Suspended</MenuItem>
                                                    </Select>
                                                )}
                                            </TableCell>

                                            {/* Phone */}
                                            <TableCell data-label="Phone">
                                                <div className="us-ph">
                                                    <span style={{ color: user?.mobile ? '#0ea5e9' : '#9ca3af' }}>
                                                        <MdLocalPhone size={13} />
                                                        {user?.mobile || '—'}
                                                    </span>
                                                    {user?.mobile && (
                                                        <Tooltip title="Send WhatsApp Message" arrow>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    const message = encodeURIComponent(
                                                                        '🎉 *Zeedaddy की तरफ से खास ऑफर!* 🎉\n\n' +
                                                                        '🛍️ अब Zeedaddy पर खरीदारी करें और पाएं *10% की सीधी छूट!* 🔥\n\n' +
                                                                        '🎁 *COUPON CODE: ZEEDADDY10*\n\n' +
                                                                        'बस खरीदारी करते समय इस कूपन कोड का इस्तेमाल करें और अपनी पसंदीदा चीज़ों पर *10% बचत* करें। 💰\n\n' +
                                                                        '⏰ *ऑफर सीमित समय के लिए है!*\n' +
                                                                        'आज ही ऑर्डर करें और इस शानदार ऑफर का लाभ उठाएं। ❤️\n\n' +
                                                                        '🛒 *Zeedaddy — आपकी खरीदारी, आपकी पसंद!*'
                                                                    );
                                                                    window.open(`https://wa.me/${user.mobile}?text=${message}`, '_blank');
                                                                }}
                                                                sx={{
                                                                    color: '#25D366', bgcolor: '#25D36612', width: 28, height: 28,
                                                                    '&:hover': { bgcolor: '#25D36624', transform: 'scale(1.12) rotate(-6deg)' },
                                                                    transition: 'all 0.2s',
                                                                }}
                                                            >
                                                                <FaWhatsapp size={15} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Email Verify */}
                                            <TableCell data-label="Email Verify">
                                                {user?.verify_email !== true ? (
                                                    <span className="us-tag" style={{ background: '#fee2e2', color: '#be123c' }}>Not Verified</span>
                                                ) : (
                                                    <span className="us-tag" style={{ background: '#dcfce7', color: '#15803d' }}>
                                                        <FaCheckDouble size={10} /> Verified
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Created */}
                                            <TableCell data-label="Created">
                                                <span className="us-date">
                                                    <SlCalender size={11} color="#8b5cf6" />
                                                    {user?.createdAt?.split('T')[0] || '—'}
                                                </span>
                                            </TableCell>

                                            {/* Action */}
                                            <TableCell data-label="Action">
                                                {!isReadOnly && (
                                                    <Tooltip title="Delete user" arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => confirmDelete(user?._id, user?.name)}
                                                            sx={{
                                                                color: '#e11d48', background: '#fff1f2', borderRadius: '9px', width: 30, height: 30,
                                                                transition: 'all .2s',
                                                                '&:hover': { background: '#ffe4e6', transform: 'scale(1.1)', boxShadow: '0 6px 14px rgba(244,63,94,.25)' },
                                                            }}
                                                        >
                                                            <MdDeleteOutline size={16} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {isReadOnly && (
                                                    <span style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>View Only</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[25, 50, 100]}
                    component="div"
                    count={(userData?.totalPages || 0) * rowsPerPage}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </div>

            {/* ── Add Seller Dialog ── */}
            <Dialog
                open={addSellerOpen}
                onClose={closeAddSeller}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: '18px', m: { xs: 1.5, sm: 4 }, overflow: 'hidden' } }}
            >
                <DialogTitle
                    sx={{
                        fontFamily: 'Sora,sans-serif', fontSize: 14.5, fontWeight: 800, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'linear-gradient(120deg,#6366f1,#8b5cf6,#ec4899)', py: 1.6,
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FaUserPlus size={15} /> Create Seller Account
                    </span>
                    <IconButton size="small" onClick={closeAddSeller} sx={{ color: '#fff', '&:hover': { background: 'rgba(255,255,255,.2)', transform: 'rotate(90deg)' }, transition: 'all .25s' }}>
                        <MdClose size={17} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: '18px !important', display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                    <TextField size="small" label="Full Name" sx={fieldSx} value={sellerForm.name}
                        onChange={(e) => setSellerForm((prev) => ({ ...prev, name: e.target.value }))}
                        error={!!formErrors.name} helperText={formErrors.name} fullWidth />
                    <TextField size="small" label="Email Address" type="email" sx={fieldSx} value={sellerForm.email}
                        onChange={(e) => setSellerForm((prev) => ({ ...prev, email: e.target.value }))}
                        error={!!formErrors.email} helperText={formErrors.email} fullWidth />
                    <TextField
                        size="small" label="Password" sx={fieldSx}
                        type={showPassword ? 'text' : 'password'}
                        value={sellerForm.password}
                        onChange={(e) => setSellerForm((prev) => ({ ...prev, password: e.target.value }))}
                        error={!!formErrors.password} helperText={formErrors.password}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setShowPassword((p) => !p)} edge="end">
                                        {showPassword ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        fullWidth
                    />
                    <TextField size="small" label="Mobile (optional)" sx={fieldSx} value={sellerForm.mobile}
                        onChange={(e) => setSellerForm((prev) => ({ ...prev, mobile: e.target.value }))} fullWidth />
                    <Select size="small" sx={{ ...fieldSx, fontSize: 12.5 }} value={sellerForm.role}
                        onChange={(e) => setSellerForm((prev) => ({ ...prev, role: e.target.value }))} fullWidth>
                        {ROLE_OPTIONS.filter((role) => role.value !== 'USER').map((role) => (
                            <MenuItem key={role.value} value={role.value} sx={menuItemSx}>{role.label}</MenuItem>
                        ))}
                    </Select>

                    {isGoMarketRole && (
                        <>
                            <TextField size="small" label="Store Name" sx={fieldSx} value={sellerForm.storeName}
                                onChange={(e) => setSellerForm((prev) => ({ ...prev, storeName: e.target.value }))}
                                placeholder={sellerForm.name || 'Enter store name'} fullWidth />
                            <Select
                                size="small" sx={{ ...fieldSx, fontSize: 12.5 }}
                                value={sellerForm.marketId}
                                onChange={(e) => setSellerForm((prev) => ({ ...prev, marketId: e.target.value }))}
                                displayEmpty fullWidth error={!!formErrors.marketId}
                                onOpen={() => {
                                    if (markets.length === 0) {
                                        fetchDataFromApi('/api/go-market/markets').then((res) => {
                                            if (res?.data) setMarkets(res.data);
                                        });
                                    }
                                }}
                            >
                                <MenuItem value="" disabled sx={menuItemSx}><em>Select Market</em></MenuItem>
                                {markets.map((m) => (
                                    <MenuItem key={m._id} value={m._id} sx={menuItemSx}>
                                        {m.name} — {m.city}, {m.state}
                                    </MenuItem>
                                ))}
                            </Select>
                            {formErrors.marketId && (
                                <span style={{ color: '#d32f2f', fontSize: 11, marginTop: -6 }}>{formErrors.marketId}</span>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.2, gap: 1 }}>
                    <Button variant="outlined" onClick={closeAddSeller}
                        sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700, fontSize: 12.5, borderColor: '#c7d2fe', color: '#4f46e5' }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={createSeller}
                        sx={{
                            textTransform: 'none', borderRadius: '10px', fontWeight: 700, fontSize: 12.5, boxShadow: 'none',
                            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
                            transition: 'transform .2s, box-shadow .2s',
                            '&:hover': { boxShadow: '0 8px 18px rgba(236,72,153,.4)', transform: 'translateY(-1px)' },
                        }}>
                        Create Seller
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Delete Confirmation Dialog ── */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: '18px', m: { xs: 1.5, sm: 4 } } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'Sora,sans-serif', fontSize: 14.5, fontWeight: 800 }}>
                        <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#fee2e2,#fce7f3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', animation: 'usPop .35s var(--spring, ease) both' }}>
                            <MdWarning size={17} />
                        </span>
                        Confirm Delete
                    </span>
                </DialogTitle>
                <DialogContent>
                    <p style={{ fontSize: 12.5, color: '#4b5563', margin: 0, lineHeight: 1.6 }}>
                        {deleteTarget?.multiple
                            ? `Are you sure you want to delete ${sortedIds.length} selected users? This action cannot be undone.`
                            : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                    </p>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.2, gap: 1 }}>
                    <Button variant="outlined" onClick={() => setDeleteDialogOpen(false)}
                        sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700, fontSize: 12.5, borderColor: '#c7d2fe', color: '#4f46e5' }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleConfirmedDelete}
                        sx={{
                            textTransform: 'none', borderRadius: '10px', fontWeight: 700, fontSize: 12.5, boxShadow: 'none',
                            background: 'linear-gradient(135deg,#f43f5e,#f97316)',
                            '&:hover': { boxShadow: '0 8px 18px rgba(244,63,94,.4)', transform: 'translateY(-1px)' },
                        }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Users;