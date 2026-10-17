import { useContext, useEffect, useMemo, useState } from "react";
import { Avatar, MenuItem, Pagination, Select, Skeleton } from "@mui/material";
import Rating from "@mui/material/Rating";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";

const SELLER_ROLES = ["SELLER", "GROCERY_SELLER", "RESTAURANT_SELLER", "FASHION_SELLER", "ELECTRONICS_SELLER", "MEDICAL_SELLER", "BEAUTY_SELLER", "HOME_KITCHEN_SELLER", "GIFTS_TOYS_SELLER", "BOOKS_STATIONERY_SELLER", "JEWELLERY_SELLER", "HARDWARE_SELLER", "AUTOMOBILE_SELLER"];
const isSellerRole = (role) => SELLER_ROLES.includes(role);

// rating → colour / mood
const tone = (r) =>
  r >= 4 ? { c: "#10b981", bg: "#ecfdf5", label: "Great" }
  : r >= 3 ? { c: "#f59e0b", bg: "#fff8eb", label: "Okay" }
  : { c: "#f43f5e", bg: "#fff1f2", label: "Poor" };

const BAR_COLORS = { 5: "#10b981", 4: "#84cc16", 3: "#f59e0b", 2: "#f97316", 1: "#f43f5e" };

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

.rv{
  --indigo:#6366f1; --violet:#8b5cf6; --pink:#ec4899; --amber:#f59e0b; --emerald:#10b981; --sky:#0ea5e9; --rose:#f43f5e;
  --ink:#1e1b3a; --muted:#8b8fa8; --line:#ececf6;
  --ease:cubic-bezier(.22,1,.36,1); --spring:cubic-bezier(.34,1.45,.64,1);
  position:relative; font-family:'DM Sans',sans-serif; font-size:12px; color:var(--ink);
}
.rv *,.rv *::before,.rv *::after{box-sizing:border-box}
@media (prefers-reduced-motion:reduce){.rv *,.rv *::before,.rv *::after{animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important}}

@keyframes rvIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes rvFlow{to{background-position:200% 0}}
@keyframes rvFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes rvGrow{from{width:0}}
@keyframes rvShine{from{transform:translateX(-120%) skewX(-20deg)}to{transform:translateX(420%) skewX(-20deg)}}
@keyframes rvDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(18px,-20px)}}

/* Header */
.rv-head{
  position:relative; overflow:hidden; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:14px;
  padding:18px 20px; margin-bottom:14px; border-radius:20px;
  background:linear-gradient(120deg,#eef2ff 0%,#fdf2f8 50%,#fff7ed 100%); border:1px solid var(--line);
  box-shadow:0 10px 30px -14px rgba(99,102,241,.3); animation:rvIn .5s var(--ease) both;
}
.rv-head::before{content:''; position:absolute; left:0; top:0; right:0; height:3px; background:linear-gradient(90deg,var(--indigo),var(--pink),var(--amber),var(--emerald),var(--sky),var(--indigo)); background-size:200% 100%; animation:rvFlow 6s linear infinite}
.rv-head::after{content:''; position:absolute; right:-40px; bottom:-60px; width:160px; height:160px; border-radius:50%; background:radial-gradient(circle,rgba(236,72,153,.18),transparent 70%); animation:rvDrift 10s ease-in-out infinite; pointer-events:none}
.rv-title{margin:0 0 3px; font-family:'Sora',sans-serif; font-size:17px; font-weight:800; letter-spacing:-.02em; background:linear-gradient(90deg,var(--indigo),var(--pink)); -webkit-background-clip:text; background-clip:text; color:transparent}
.rv-sub{margin:0; font-size:11.5px; color:var(--muted)}
.rv-chips{display:flex; flex-wrap:wrap; gap:7px; margin-top:10px}
.rv-chip{display:inline-flex; align-items:center; gap:5px; padding:4px 11px; border-radius:99px; font-size:10.5px; font-weight:700; transition:transform .2s var(--spring)}
.rv-chip:hover{transform:translateY(-2px) scale(1.04)}
.rv-chip.a{color:#fff; background:linear-gradient(135deg,var(--indigo),var(--violet)); box-shadow:0 5px 12px rgba(99,102,241,.3)}
.rv-chip.b{color:#9d174d; background:linear-gradient(135deg,#fce7f3,#fbcfe8)}
.rv-rows{display:flex; align-items:center; gap:8px; font-size:11px; font-weight:600; color:#5b6086; position:relative; z-index:1}

/* Summary (current page) */
.rv-sum{display:grid; grid-template-columns:minmax(150px,200px) 1fr; gap:12px; margin-bottom:14px}
.rv-avg{
  position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; padding:16px 14px;
  border-radius:18px; color:#fff; text-align:center;
  background:linear-gradient(135deg,#6366f1,#8b5cf6 50%,#ec4899); box-shadow:0 12px 26px -12px rgba(139,92,246,.7);
  animation:rvIn .5s .05s var(--ease) both;
}
.rv-avg::after{content:''; position:absolute; top:0; bottom:0; width:22%; background:rgba(255,255,255,.25); transform:translateX(-120%) skewX(-20deg); animation:rvShine 4s ease-in-out infinite 1s}
.rv-avg b{font-family:'Sora',sans-serif; font-size:30px; font-weight:800; line-height:1}
.rv-avg small{font-size:10.5px; font-weight:600; opacity:.9}
.rv-dist{display:flex; flex-direction:column; justify-content:center; gap:6px; padding:12px 16px; background:#fff; border:1px solid var(--line); border-radius:18px; animation:rvIn .5s .1s var(--ease) both}
.rv-bar-row{display:grid; grid-template-columns:22px 1fr 24px; align-items:center; gap:8px; font-size:10.5px; font-weight:700; color:#5b6086}
.rv-bar{height:7px; border-radius:99px; background:#f1f2fb; overflow:hidden}
.rv-bar span{display:block; height:100%; border-radius:99px; animation:rvGrow .9s var(--ease) both; transform-origin:left}
.rv-bar-row em{font-style:normal; text-align:right; color:var(--muted)}

/* Cards */
.rv-wrap{padding:14px; background:#fff; border:1px solid var(--line); border-radius:20px; box-shadow:0 10px 30px -16px rgba(99,102,241,.25); animation:rvIn .5s .12s var(--ease) both}
.rv-list{display:grid; gap:12px}
.rv-card{
  --ac:var(--indigo); --soft:#eef2ff;
  position:relative; overflow:hidden; display:flex; gap:12px; padding:14px 16px;
  background:#fff; border:1px solid var(--line); border-left:4px solid var(--ac); border-radius:16px;
  animation:rvIn .5s var(--ease) both; transition:transform .3s var(--spring), box-shadow .3s, border-color .2s;
}
.rv-card:nth-child(6n+1){--ac:var(--indigo); --soft:#eef2ff}
.rv-card:nth-child(6n+2){--ac:var(--pink); --soft:#fdf2f8}
.rv-card:nth-child(6n+3){--ac:var(--amber); --soft:#fff8eb}
.rv-card:nth-child(6n+4){--ac:var(--emerald); --soft:#ecfdf5}
.rv-card:nth-child(6n+5){--ac:var(--sky); --soft:#f0f9ff}
.rv-card:nth-child(6n+6){--ac:var(--violet); --soft:#f5f3ff}
.rv-card::after{content:''; position:absolute; right:-30px; top:-30px; width:100px; height:100px; border-radius:50%; background:var(--ac); opacity:.07; transition:transform .5s var(--ease)}
.rv-card:hover{transform:translateY(-3px); box-shadow:0 14px 28px -12px var(--ac)}
.rv-card:hover::after{transform:scale(2.2)}

.rv-avatar{flex-shrink:0; padding:2px; border-radius:50%; background:linear-gradient(135deg,var(--ac),var(--pink)); height:fit-content; transition:transform .4s var(--spring)}
.rv-card:hover .rv-avatar{transform:rotate(-8deg) scale(1.08)}
.rv-avatar .MuiAvatar-root{width:38px; height:38px; border:2px solid #fff; font-size:14px; font-weight:700; background:var(--ac)}
.rv-body{position:relative; z-index:1; flex:1; min-width:0}
.rv-top{display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px}
.rv-name{margin:0; font-family:'Sora',sans-serif; font-size:13px; font-weight:700}
.rv-date{margin:2px 0 0; font-size:10.5px; color:var(--muted)}
.rv-prod-chip{max-width:220px; padding:3px 10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; border-radius:99px; font-size:10.5px; font-weight:700; color:var(--ac); background:var(--soft); border:1px solid var(--ac)}
.rv-rating{display:flex; flex-wrap:wrap; align-items:center; gap:7px; margin-top:8px}
.rv-score{padding:1px 9px; border-radius:99px; font-size:10px; font-weight:800; color:#fff}
.rv-mood{padding:1px 9px; border-radius:99px; font-size:10px; font-weight:700}
.rv-text{margin:8px 0 0; font-size:12.5px; line-height:1.65; color:#3b3f63; word-break:break-word}
.rv-text.clamp{display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden}
.rv-more{margin-top:4px; padding:0; border:none; background:none; cursor:pointer; font:inherit; font-size:11px; font-weight:700; color:var(--ac); transition:transform .2s}
.rv-more:hover{transform:translateX(3px)}
.rv-foot{display:flex; align-items:center; gap:8px; margin-top:12px; padding-top:10px; border-top:1px dashed #e4e2f7; font-size:11px; font-weight:600; color:#5b6086}
.rv-foot .MuiAvatar-root{width:28px; height:28px; border-radius:8px; flex-shrink:0}
.rv-foot span{min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}

.rv-empty{padding:44px 16px; text-align:center}
.rv-empty-ico{font-size:38px; animation:rvFloat 3s ease-in-out infinite}
.rv-empty p{margin:6px 0 0; font-size:12px; font-weight:600; color:var(--muted)}
.rv-pager{display:flex; justify-content:flex-end; margin-top:16px}

.rv .MuiPaginationItem-root{font-family:'DM Sans',sans-serif; font-size:11.5px; font-weight:700; border-radius:10px; transition:transform .2s var(--spring)}
.rv .MuiPaginationItem-root:hover{transform:translateY(-2px)}
.rv .MuiPaginationItem-root.Mui-selected{color:#fff; background:linear-gradient(135deg,var(--indigo),var(--pink)); box-shadow:0 5px 12px rgba(236,72,153,.3)}
.rv .MuiSelect-select{font-size:11.5px !important; font-weight:700 !important; padding:5px 12px !important}
.rv .rv-select .MuiOutlinedInput-root{border-radius:10px; background:#fff}
.rv .rv-select fieldset{border-color:#d9dcf5}
.rv .rv-select:hover fieldset{border-color:var(--indigo)}

/* Tablet */
@media (max-width:760px){
  .rv-sum{grid-template-columns:1fr}
  .rv-avg{flex-direction:row; justify-content:center; gap:14px; padding:12px}
  .rv-avg b{font-size:26px}
}
/* Mobile */
@media (max-width:600px){
  .rv-head{padding:14px; border-radius:16px}
  .rv-rows{width:100%; justify-content:space-between}
  .rv-wrap{padding:10px; border-radius:16px}
  .rv-card{padding:12px; gap:10px}
  .rv-top{flex-direction:column; align-items:flex-start; gap:6px}
  .rv-prod-chip{max-width:100%}
  .rv-pager{justify-content:center}
}
`;

const ReviewCard = ({ item, idx }) => {
  const [open, setOpen] = useState(false);
  const rating = Number(item?.rating || 0);
  const t = tone(rating);
  const text = item?.review || "";
  const long = text.length > 160;

  return (
    <div className="rv-card" style={{ animationDelay: `${Math.min(idx, 10) * 0.05}s` }}>
      <div className="rv-avatar">
        <Avatar src={item?.image || ""} alt={item?.userName || "User"}>
          {(item?.userName || "C").charAt(0).toUpperCase()}
        </Avatar>
      </div>

      <div className="rv-body">
        <div className="rv-top">
          <div>
            <h3 className="rv-name">{item?.userName || "Customer"}</h3>
            <p className="rv-date">📅 {item?.createdAt?.split("T")?.[0]}</p>
          </div>
          <span className="rv-prod-chip" title={item?.productName || "Product"}>
            {item?.productName || "Product"}
          </span>
        </div>

        <div className="rv-rating">
          <Rating readOnly size="small" value={rating} sx={{ fontSize: 16 }} />
          <span className="rv-score" style={{ background: t.c }}>{rating.toFixed(1)}</span>
          <span className="rv-mood" style={{ color: t.c, background: t.bg }}>{t.label}</span>
        </div>

        <p className={`rv-text${long && !open ? " clamp" : ""}`}>{text}</p>
        {long && (
          <button type="button" className="rv-more" onClick={() => setOpen(!open)}>
            {open ? "Show less ↑" : "Read more ↓"}
          </button>
        )}

        <div className="rv-foot">
          <Avatar variant="rounded" src={item?.productImage || ""} alt={item?.productName || "Product"} />
          <span>{item?.productName || "Product"}</span>
        </div>
      </div>
    </div>
  );
};

const ReviewsPage = () => {
  const context = useContext(MyContext);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const isSeller = isSellerRole(context?.userData?.role);

  const getReviews = async (currentPage, limit) => {
    setIsLoading(true);
    const res = await fetchDataFromApi(`/api/user/getAllReviews?page=${currentPage}&limit=${limit}`);

    if (res?.error === false) {
      setReviews(res?.reviews || []);
      setPagination(res?.pagination || { page: currentPage, limit, total: 0, totalPages: 0 });
    } else {
      setReviews([]);
      setPagination({ page: currentPage, limit, total: 0, totalPages: 0 });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (context?.userData?.role === "ADMIN" || isSellerRole(context?.userData?.role)) {
      getReviews(page, rowsPerPage);
    }
  }, [page, rowsPerPage, context?.userData?.role]);

  // rating summary of the reviews on the current page
  const summary = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach((r) => {
      const v = Math.min(5, Math.max(1, Math.round(Number(r?.rating || 0)))) || 1;
      counts[v] += 1;
      sum += Number(r?.rating || 0);
    });
    return { counts, avg: reviews.length ? sum / reviews.length : 0 };
  }, [reviews]);

  const title = isSeller ? "My Product Reviews" : "All Reviews";

  return (
    <div className="rv">
      <style>{STYLES}</style>

      <div className="rv-head">
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 className="rv-title">⭐ {title}</h2>
          <p className="rv-sub">
            {isSeller
              ? "Only reviews related to your products are shown here."
              : "Centralized review management for all products."}
          </p>
          <div className="rv-chips">
            <span className="rv-chip a">💬 Total Reviews: {pagination?.total || 0}</span>
            <span className="rv-chip b">📄 Page {page} of {Math.max(pagination?.totalPages || 1, 1)}</span>
          </div>
        </div>

        <div className="rv-rows">
          <span>Rows:</span>
          <Select
            size="small"
            className="rv-select"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20, 50].map((size) => (
              <MenuItem key={size} value={size} sx={{ fontSize: 12 }}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Rating summary for this page */}
      {!isLoading && reviews.length > 0 && (
        <div className="rv-sum">
          <div className="rv-avg">
            <b>{summary.avg.toFixed(1)}</b>
            <div>
              <Rating readOnly size="small" precision={0.1} value={summary.avg} sx={{ fontSize: 15, "& .MuiRating-iconEmpty": { color: "rgba(255,255,255,.45)" } }} />
              <small style={{ display: "block" }}>Avg. on this page · {reviews.length} reviews</small>
            </div>
          </div>
          <div className="rv-dist">
            {[5, 4, 3, 2, 1].map((s) => {
              const pct = reviews.length ? (summary.counts[s] / reviews.length) * 100 : 0;
              return (
                <div className="rv-bar-row" key={s}>
                  <span>{s}★</span>
                  <div className="rv-bar">
                    <span style={{ width: `${pct}%`, background: BAR_COLORS[s], animationDelay: `${(5 - s) * 0.08}s` }} />
                  </div>
                  <em>{summary.counts[s]}</em>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rv-wrap">
        {isLoading ? (
          <div className="rv-list">
            {[...Array(4)].map((_, idx) => (
              <Skeleton key={idx} variant="rounded" height={110} animation="wave" sx={{ borderRadius: "16px" }} />
            ))}
          </div>
        ) : reviews?.length === 0 ? (
          <div className="rv-empty">
            <div className="rv-empty-ico">💭</div>
            <p>No reviews found.</p>
          </div>
        ) : (
          <div className="rv-list">
            {reviews.map((item, idx) => (
              <ReviewCard key={item?._id || idx} item={item} idx={idx} />
            ))}
          </div>
        )}

        {pagination?.totalPages > 1 && (
          <div className="rv-pager">
            <Pagination
              page={page}
              size="small"
              siblingCount={0}
              boundaryCount={1}
              count={pagination?.totalPages || 1}
              onChange={(_, newPage) => {
                setPage(newPage);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;