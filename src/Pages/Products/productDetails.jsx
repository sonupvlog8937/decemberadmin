import React, { useEffect, useRef, useState } from 'react';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { useParams } from 'react-router-dom';
import { fetchDataFromApi } from '../../utils/api';
import { MdBrandingWatermark, MdFilterVintage, MdRateReview, MdCalendarToday, MdCheck } from 'react-icons/md';
import { BiSolidCategoryAlt } from 'react-icons/bi';
import { TbListDetails } from 'react-icons/tb';
import { FaTag } from 'react-icons/fa';
import Rating from '@mui/material/Rating';
import { Skeleton } from '@mui/material';

const PALETTE = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'];

const CSS = `
@keyframes pdIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pdPop { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: scale(1); } }
@keyframes pdShift { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }

.pd, .pd * { box-sizing: border-box; }
.pd { max-width: 1100px; padding: 4px 0 24px; font-size: 12.5px; color: #1f2937; font-family: inherit; }

/* header */
.pd-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; animation: pdIn .4s ease both; }
.pd-header h1 {
  margin: 0; font-size: 18px; font-weight: 800; letter-spacing: -.01em;
  background: #6366f1; background: linear-gradient(90deg, #6366f1, #ec4899, #f59e0b, #6366f1); background-size: 200% auto;
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
  animation: pdShift 6s linear infinite;
}
.pd-header p { margin: 3px 0 0; font-size: 11.5px; color: #6b7280; }
.pd-badges { display: flex; flex-wrap: wrap; gap: 6px; }
.pd-badge {
  display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 700; background: var(--bg); color: var(--fg); animation: pdPop .35s ease both;
}

/* cards */
.pd-card {
  position: relative; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #eef0f6;
  box-shadow: 0 6px 24px -14px rgba(99,102,241,.35); animation: pdIn .45s ease both;
}
.pd-card::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 3px; background: linear-gradient(90deg, #6366f1, #ec4899, #f59e0b, #10b981, #0ea5e9); }
.pd-card + .pd-card { margin-top: 16px; }

.pd-main { display: flex; flex-wrap: wrap; gap: 24px; padding: 22px 20px; }

/* gallery */
.pd-gallery { flex: 0 0 38%; min-width: 260px; }
.pd-gallery-wrap { display: flex; gap: 10px; }
.pd-thumbs { width: 60px; flex-shrink: 0; }
.pd-thumbs .swiper { height: 380px; }
.pd-thumb {
  height: 56px; border-radius: 10px; overflow: hidden; cursor: pointer; background: #f9fafb;
  border: 2px solid transparent; opacity: .55; transition: all .2s ease;
}
.pd-thumb:hover { opacity: .9; transform: translateX(2px); }
.pd-thumb.active { border-color: #8b5cf6; opacity: 1; box-shadow: 0 6px 14px -6px rgba(139,92,246,.7); }
.pd-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pd-bigimg { flex: 1; min-width: 0; border-radius: 14px; overflow: hidden; border: 1px solid #ede9fe; background: #faf5ff; box-shadow: 0 10px 26px -16px rgba(139,92,246,.6); }
.pd-bigimg .swiper { width: 100%; }

/* info */
.pd-info { flex: 1; min-width: 260px; }
.pd-name { margin: 0 0 8px; font-size: 18px; font-weight: 800; color: #111827; line-height: 1.3; }
.pd-rating {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 14px; padding: 8px 12px; border-radius: 12px;
  background: linear-gradient(135deg, #fffbeb, #fdf2f8); border: 1px solid #fde68a;
}
.pd-rating strong { font-size: 14px; font-weight: 800; color: #92400e; }
.pd-rating span { font-size: 11.5px; color: #6b7280; }

.pd-price { display: flex; flex-wrap: wrap; align-items: baseline; gap: 10px; margin-bottom: 14px; }
.pd-price .now { font-size: 22px; font-weight: 800; color: #059669; }
.pd-price .old { font-size: 13px; color: #9ca3af; text-decoration: line-through; }

.pd-rows { border-top: 1px solid #f3f4f6; }
.pd-row { display: flex; align-items: flex-start; gap: 10px; padding: 9px 4px; border-bottom: 1px solid #f3f4f6; border-radius: 8px; transition: background .2s ease; }
.pd-row:hover { background: color-mix(in srgb, var(--c) 6%, #fff); }
.pd-row-label { min-width: 110px; flex-shrink: 0; display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; color: #374151; }
.pd-row-ico { width: 24px; height: 24px; border-radius: 7px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; background: #eef2ff; color: var(--c); background: color-mix(in srgb, var(--c) 14%, #fff); }
.pd-row-val { font-size: 12.5px; color: #111827; min-width: 0; word-break: break-word; }
.pd-row-val .muted { color: #9ca3af; }
.pd-wrap { display: flex; flex-wrap: wrap; gap: 6px; }

.pd-chip {
  display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700;
  color: var(--c); background: #f3f4f6; border: 1px solid #e5e7eb;
  background: color-mix(in srgb, var(--c) 10%, #fff); border: 1px solid color-mix(in srgb, var(--c) 35%, #fff);
  transition: transform .18s ease, box-shadow .18s ease;
}
.pd-chip:hover { transform: translateY(-2px); box-shadow: 0 6px 12px -6px var(--c); }

/* sections */
.pd-section { padding: 18px 20px; border-top: 1px solid #f3f4f6; }
.pd-section-head { display: flex; align-items: center; gap: 9px; margin-bottom: 12px; }
.pd-section-head h3 { margin: 0; font-size: 14px; font-weight: 800; color: #111827; }
.pd-section-head small { display: block; font-size: 11px; font-weight: 500; color: #6b7280; margin-top: 1px; }
.pd-sico { width: 28px; height: 28px; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; background: var(--c); background: linear-gradient(135deg, var(--c), color-mix(in srgb, var(--c) 55%, #ec4899)); box-shadow: 0 6px 12px -6px var(--c); }
.pd-desc { margin: 0; font-size: 12.5px; line-height: 1.75; color: #374151; }

.pd-specs { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px; }
.pd-spec {
  display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-radius: 10px; background: #fff;
  border: 1px solid #e5e7eb; border-left: 4px solid var(--c); border: 1px solid color-mix(in srgb, var(--c) 22%, #e5e7eb); border-left: 4px solid var(--c);
  transition: transform .2s ease, box-shadow .2s ease; animation: pdIn .4s ease both;
}
.pd-spec:hover { transform: translateY(-2px); box-shadow: 0 10px 18px -12px var(--c); }
.pd-spec svg { color: var(--c); flex-shrink: 0; }
.pd-spec .k { font-size: 11.5px; font-weight: 600; color: #6b7280; min-width: 80px; }
.pd-spec .v { font-size: 12px; font-weight: 700; color: #111827; min-width: 0; word-break: break-word; }

.pd-colors { display: flex; flex-wrap: wrap; gap: 8px; }
.pd-color {
  display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px 6px 8px; border-radius: 999px; background: #f9fafb; border: 1px solid #e5e7eb;
  font-size: 11.5px; font-weight: 700; color: #374151; transition: transform .2s ease, box-shadow .2s ease; animation: pdPop .35s ease both;
}
.pd-color:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 8px 16px -10px rgba(0,0,0,.4); }
.pd-color i { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px #e5e7eb; flex-shrink: 0; }

/* reviews */
.pd-reviews { display: flex; flex-direction: column; gap: 10px; padding: 14px 20px 18px; }
.pd-review {
  display: flex; gap: 12px; padding: 12px 14px; border-radius: 12px; background: #fafafa; border: 1px solid #f3f4f6; border-left: 4px solid var(--c);
  transition: transform .2s ease, box-shadow .2s ease; animation: pdIn .4s ease both;
}
.pd-review:hover { transform: translateY(-2px); background: #fff; box-shadow: 0 10px 20px -14px var(--c); }
.pd-avatar { width: 40px; height: 40px; border-radius: 50%; padding: 2px; flex-shrink: 0; background: linear-gradient(135deg, var(--c), #ec4899); }
.pd-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; background: #e5e7eb; border: 2px solid #fff; display: block; }
.pd-review-body { flex: 1; min-width: 0; }
.pd-review-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 3px; }
.pd-review-top b { font-size: 13px; color: #111827; }
.pd-review-meta { display: flex; align-items: center; gap: 8px; }
.pd-review-meta span { font-size: 10.5px; color: #9ca3af; }
.pd-review p { margin: 0; font-size: 12.5px; line-height: 1.6; color: #374151; word-break: break-word; }

/* tablet / mobile */
@media (max-width: 900px) {
  .pd-gallery { flex: 1 1 100%; }
}
@media (max-width: 600px) {
  .pd-header h1 { font-size: 16px; }
  .pd-main { padding: 14px 12px; gap: 16px; }
  .pd-gallery { min-width: 0; }
  .pd-info { min-width: 0; flex-basis: 100%; }
  .pd-thumbs { width: 52px; }
  .pd-thumbs .swiper { height: 260px; }
  .pd-thumb { height: 46px; }
  .pd-name { font-size: 16px; }
  .pd-price .now { font-size: 20px; }
  .pd-row { flex-direction: column; gap: 6px; }
  .pd-row-label { min-width: 0; }
  .pd-section { padding: 14px 12px; }
  .pd-specs { grid-template-columns: 1fr; }
  .pd-spec .k { min-width: 70px; }
  .pd-reviews { padding: 12px; }
  .pd-review { padding: 10px; gap: 10px; }
  .pd-avatar { width: 34px; height: 34px; }
}
@media (prefers-reduced-motion: reduce) {
  .pd *, .pd *::before { animation: none !important; transition: none !important; }
}
`;

const InfoRow = ({ icon, label, color, children }) => (
    <div className="pd-row" style={{ '--c': color }}>
        <span className="pd-row-label"><span className="pd-row-ico">{icon}</span>{label}</span>
        <div className="pd-row-val">{children}</div>
    </div>
);

const SpecBadge = ({ text, color }) => (
    <span className="pd-chip" style={{ '--c': color }}>{text}</span>
);

const ProductDetails = () => {
    const [slideIndex, setSlideIndex] = useState(0);
    const [product, setProduct] = useState(null);
    const [reviewsData, setReviewsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const zoomSliderBig = useRef();
    const zoomSliderSml = useRef();
    const { id } = useParams();

    useEffect(() => {
        fetchDataFromApi(`/api/user/getReviews?productId=${id}`).then((res) => {
            if (res?.error === false) setReviewsData(res.reviews);
        });
    }, []);

    useEffect(() => {
        fetchDataFromApi(`/api/product/${id}`).then((res) => {
            if (res?.error === false) {
                setTimeout(() => { setProduct(res?.product); setIsLoading(false); }, 500);
            }
        });
    }, []);

    const goto = (index) => {
        setSlideIndex(index);
        zoomSliderSml.current?.swiper?.slideTo(index);
        zoomSliderBig.current?.swiper?.slideTo(index);
    };

    const avgRating = reviewsData.length > 0
        ? (reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length).toFixed(1)
        : product?.rating?.toFixed(1) || '—';

    const specs = product?.specifications?.filter((s) => s.key && s.value) || [];
    const colors = product?.colorOptions?.filter((c) => c.name) || [];

    if (isLoading) {
        return (
            <div className="pd">
                <style>{CSS}</style>
                <div className="pd-card">
                    <div className="pd-main">
                        <div className="pd-gallery">
                            <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 3 }} />
                        </div>
                        <div className="pd-info">
                            <Skeleton variant="text" height={36} width="80%" />
                            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="text" height={22} sx={{ my: 0.5 }} />)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pd">
            <style>{CSS}</style>

            {/* ── Header ── */}
            <div className="pd-header">
                <div>
                    <h1>Product Details</h1>
                    <p>View full details and customer reviews</p>
                </div>
                <div className="pd-badges">
                    {product?.isFeatured && <span className="pd-badge" style={{ '--bg': '#fef3c7', '--fg': '#92400e' }}>★ Featured</span>}
                    <span className="pd-badge" style={{ '--bg': product?.countInStock > 0 ? '#dcfce7' : '#fee2e2', '--fg': product?.countInStock > 0 ? '#15803d' : '#991b1b' }}>
                        {product?.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                    </span>
                </div>
            </div>

            {/* ── Main Product Card ── */}
            <div className="pd-card">
                <div className="pd-main">

                    {/* ── Image Gallery ── */}
                    <div className="pd-gallery">
                        {product?.images?.length > 0 && (
                            <div className="pd-gallery-wrap">
                                <div className="pd-thumbs">
                                    <Swiper
                                        ref={zoomSliderSml}
                                        direction="vertical"
                                        slidesPerView={5}
                                        spaceBetween={8}
                                        navigation={true}
                                        modules={[Navigation]}
                                        className={product?.images?.length > 5 ? 'space' : ''}
                                    >
                                        {product.images.map((item, index) => (
                                            <SwiperSlide key={index}>
                                                <div onClick={() => goto(index)} className={`pd-thumb${slideIndex === index ? ' active' : ''}`}>
                                                    <img src={item} alt="" />
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>

                                <div className="pd-bigimg">
                                    <Swiper ref={zoomSliderBig} slidesPerView={1} spaceBetween={0} navigation={false}>
                                        {product.images.map((item, index) => (
                                            <SwiperSlide key={index}>
                                                <InnerImageZoom zoomType="hover" zoomScale={1.2} src={item} style={{ width: '100%' }} />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Product Info ── */}
                    <div className="pd-info">
                        <h2 className="pd-name">{product?.name}</h2>

                        <div className="pd-rating">
                            <Rating value={Number(avgRating)} readOnly precision={0.5} size="small" />
                            <strong>{avgRating}</strong>
                            <span>({reviewsData.length} review{reviewsData.length !== 1 ? 's' : ''})</span>
                        </div>

                        <div className="pd-price">
                            <span className="now">
                                {product?.oldPrice?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                            </span>
                            {product?.price !== product?.oldPrice && (
                                <span className="old">
                                    {product?.price?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                                </span>
                            )}
                            {product?.discount > 0 && (
                                <span className="pd-badge" style={{ '--bg': '#dcfce7', '--fg': '#15803d' }}>{product.discount}% off</span>
                            )}
                        </div>

                        <div className="pd-rows">
                            <InfoRow color={PALETTE[0]} icon={<MdBrandingWatermark size={13} />} label="Brand">
                                <strong>{product?.brand}</strong>
                            </InfoRow>

                            <InfoRow color={PALETTE[1]} icon={<BiSolidCategoryAlt size={13} />} label="Category">
                                {product?.catName}
                                {product?.subCat && <span className="muted"> → {product.subCat}</span>}
                                {product?.thirdsubCat && <span className="muted"> → {product.thirdsubCat}</span>}
                            </InfoRow>

                            {product?.productRam?.length > 0 && (
                                <InfoRow color={PALETTE[2]} icon={<MdFilterVintage size={13} />} label="RAM">
                                    <div className="pd-wrap">
                                        {product.productRam.map((ram, i) => <SpecBadge key={i} text={ram} color={PALETTE[(i + 2) % PALETTE.length]} />)}
                                    </div>
                                </InfoRow>
                            )}

                            {product?.size?.length > 0 && (
                                <InfoRow color={PALETTE[3]} icon={<MdFilterVintage size={13} />} label="Size">
                                    <div className="pd-wrap">
                                        {product.size.map((s, i) => <SpecBadge key={i} text={s} color={PALETTE[(i + 3) % PALETTE.length]} />)}
                                    </div>
                                </InfoRow>
                            )}

                            {product?.productWeight?.length > 0 && (
                                <InfoRow color={PALETTE[4]} icon={<MdFilterVintage size={13} />} label="Weight">
                                    <div className="pd-wrap">
                                        {product.productWeight.map((w, i) => <SpecBadge key={i} text={w} color={PALETTE[(i + 4) % PALETTE.length]} />)}
                                    </div>
                                </InfoRow>
                            )}

                            {product?.keywords?.length > 0 && (
                                <InfoRow color={PALETTE[5]} icon={<FaTag size={11} />} label="Keywords">
                                    <div className="pd-wrap">
                                        {product.keywords.map((kw, i) => (
                                            <SpecBadge key={i} text={kw} color={PALETTE[(i + 5) % PALETTE.length]} />
                                        ))}
                                    </div>
                                </InfoRow>
                            )}

                            <InfoRow color={PALETTE[0]} icon={<MdCalendarToday size={12} />} label="Published">
                                {product?.createdAt?.split('T')[0]}
                            </InfoRow>
                        </div>
                    </div>
                </div>

                {/* ── Description ── */}
                {product?.description && (
                    <div className="pd-section">
                        <div className="pd-section-head">
                            <div className="pd-sico" style={{ '--c': '#0ea5e9' }}><TbListDetails size={14} /></div>
                            <h3>Product Description</h3>
                        </div>
                        <p className="pd-desc">{product.description}</p>
                    </div>
                )}

                {/* ── Specifications ── */}
                {specs.length > 0 && (
                    <div className="pd-section">
                        <div className="pd-section-head">
                            <div className="pd-sico" style={{ '--c': '#10b981' }}><TbListDetails size={14} /></div>
                            <h3>Specifications</h3>
                        </div>
                        <div className="pd-specs">
                            {specs.map((spec, i) => (
                                <div key={i} className="pd-spec" style={{ '--c': PALETTE[i % PALETTE.length], animationDelay: `${i * 40}ms` }}>
                                    <MdCheck size={14} />
                                    <span className="k">{spec.key}</span>
                                    <span className="v">{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Colour Options ── */}
                {colors.length > 0 && (
                    <div className="pd-section">
                        <div className="pd-section-head">
                            <div className="pd-sico" style={{ '--c': '#ec4899' }}><MdFilterVintage size={14} /></div>
                            <h3>Colour Options</h3>
                        </div>
                        <div className="pd-colors">
                            {colors.map((color, i) => (
                                <div key={i} className="pd-color" style={{ animationDelay: `${i * 40}ms` }}>
                                    {color.code && <i style={{ background: color.code }} />}
                                    <span>{color.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Reviews ── */}
            {reviewsData.length > 0 && (
                <div className="pd-card">
                    <div className="pd-section" style={{ borderTop: 'none', paddingBottom: 6 }}>
                        <div className="pd-section-head" style={{ marginBottom: 0 }}>
                            <div className="pd-sico" style={{ '--c': '#8b5cf6' }}><MdRateReview size={14} /></div>
                            <div>
                                <h3>Customer Reviews</h3>
                                <small>{reviewsData.length} review{reviewsData.length !== 1 ? 's' : ''} · Avg. {avgRating} ★</small>
                            </div>
                        </div>
                    </div>

                    <div className="pd-reviews">
                        {reviewsData.map((review, index) => (
                            <div key={index} className="pd-review" style={{ '--c': PALETTE[index % PALETTE.length], animationDelay: `${Math.min(index, 8) * 50}ms` }}>
                                <div className="pd-avatar">
                                    <img src={review?.image || '/user.jpg'} alt="" />
                                </div>
                                <div className="pd-review-body">
                                    <div className="pd-review-top">
                                        <b>{review?.userName}</b>
                                        <div className="pd-review-meta">
                                            <Rating value={review?.rating} readOnly size="small" precision={0.5} />
                                            <span>{review?.createdAt?.split('T')[0]}</span>
                                        </div>
                                    </div>
                                    <p>{review?.review}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;