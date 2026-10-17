import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { RiProductHuntLine } from "react-icons/ri";
import { TbCategory } from "react-icons/tb";
import { IoBagCheckOutline, IoStorefrontOutline, IoWalletOutline, IoImageOutline } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { FiUsers, FiChevronDown, FiX } from "react-icons/fi";
import { MdOutlineRateReview, MdOutlineViewCarousel, MdOutlinePermMedia, MdOutlineArticle, MdLocalOffer } from "react-icons/md";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";

const SELLER_ROLES = ["SELLER", "GROCERY_SELLER", "RESTAURANT_SELLER", "FASHION_SELLER", "ELECTRONICS_SELLER", "MEDICAL_SELLER", "BEAUTY_SELLER", "HOME_KITCHEN_SELLER", "GIFTS_TOYS_SELLER", "BOOKS_STATIONERY_SELLER", "JEWELLERY_SELLER", "HARDWARE_SELLER", "AUTOMOBILE_SELLER"];
const isSellerRole = (role) => SELLER_ROLES.includes(role);
const roleLabels = {
  ADMIN: "🛡️ Admin Panel",
  VICE_ADMIN: "👔 Vice Admin Panel",
  SELLER: "🏪 Seller Panel",
  GROCERY_SELLER: "🛒 Grocery Seller Panel",
  RESTAURANT_SELLER: "🍽️ Restaurant Seller Panel",
  FASHION_SELLER: "👕 Fashion Seller Panel",
  ELECTRONICS_SELLER: "📱 Electronics Seller Panel",
  MEDICAL_SELLER: "💊 Medical Seller Panel",
  BEAUTY_SELLER: "💄 Beauty Seller Panel",
  HOME_KITCHEN_SELLER: "🏠 Home & Kitchen Seller Panel",
  GIFTS_TOYS_SELLER: "🎁 Gifts & Toys Seller Panel",
  BOOKS_STATIONERY_SELLER: "📚 Books & Stationery Seller Panel",
  JEWELLERY_SELLER: "💎 Jewellery Seller Panel",
  HARDWARE_SELLER: "🔧 Hardware Seller Panel",
  AUTOMOBILE_SELLER: "🚗 Automobile Seller Panel",
  DELIVERY_RIDER: "🚴 Delivery Rider Panel",
};

const GO_MARKET_SHOP_SELLERS = ["GROCERY_SELLER", "FASHION_SELLER", "ELECTRONICS_SELLER", "MEDICAL_SELLER", "BEAUTY_SELLER", "HOME_KITCHEN_SELLER", "GIFTS_TOYS_SELLER", "BOOKS_STATIONERY_SELLER", "JEWELLERY_SELLER", "HARDWARE_SELLER", "AUTOMOBILE_SELLER"];

// Jis route pe jo group khulna chahiye
const GROUP_ROUTES = {
  catalog: ["/category", "/subCategory"],
  banners: ["/banners", "/bannerlist2"],
  media: ["/homeSlider", "/slider"],
  goMarket: ["/go-market", "/commerce-settings"],
};

const MOBILE_BREAKPOINT = 992;

// ─── Colors ──────────────────────────────────────────────────────────────────
const K = {
  blue: "#3B82F6", orange: "#FF6B2B", green: "#10B981", amber: "#F59E0B", violet: "#8B5CF6",
  cyan: "#06B6D4", pink: "#EC4899", indigo: "#6366F1", purple: "#A855F7", rose: "#F43F5E",
  teal: "#14B8A6", lime: "#65A30D", emerald: "#059669",
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const stagger = (sel, base, step) =>
  Array.from({ length: 24 }, (_, i) => `${sel}:nth-child(${i + 1}){animation-delay:${base + i * step}ms}`).join("");

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
.sb, .sb * { box-sizing: border-box; font-family: 'Outfit', system-ui, sans-serif; -webkit-tap-highlight-color: transparent; }

/* ── Desktop: fixed sidebar, width collapse ── */
.sb { position: fixed; top: 0; left: 0; z-index: 52; height: 100%; display: flex; flex-direction: column; overflow: hidden;
  background: linear-gradient(180deg, #FFFFFF 0%, #FAF8FF 60%, #F4F9FF 100%); border-right: 1px solid #EEF0F6;
  box-shadow: 4px 0 24px rgba(99,102,241,.06); transition: width .35s cubic-bezier(.65,0,.25,1); }
.sb-inner { min-width: 200px; height: 100%; display: flex; flex-direction: column; }

@keyframes sb-in { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: none; } }
@keyframes sb-grad { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

.sb-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #F1F5F9; flex-shrink: 0; }
.sb-top img { width: 150px; max-width: 100%; transition: transform .3s; }
.sb-top a:hover img { transform: scale(1.03); }
.sb-close { display: none; width: 34px; height: 34px; border: 0; border-radius: 10px; background: #F1F5F9; color: #64748B; cursor: pointer;
  place-items: center; flex-shrink: 0; transition: background .25s, color .25s, transform .35s; }
.sb-close:hover { background: #FEE2E2; color: #EF4444; transform: rotate(90deg); }

.sb-role { display: block; margin: 10px 12px 4px; padding: 10px 12px; border-radius: 14px; text-decoration: none; flex-shrink: 0; color: #fff;
  background: linear-gradient(120deg, #6366F1, #8B5CF6, #EC4899, #FF6B2B); background-size: 250% 250%; animation: sb-grad 9s ease infinite;
  box-shadow: 0 8px 18px rgba(139,92,246,.28); transition: transform .25s, box-shadow .25s; }
.sb-role:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(139,92,246,.36); }
.sb-role small { display: block; font-size: 9.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; opacity: .85; }
.sb-role b { display: block; margin-top: 2px; font-size: 12.5px; font-weight: 700; }

.sb-nav { flex: 1; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; list-style: none; margin: 0; padding: 4px 10px 8px; }
.sb-nav::-webkit-scrollbar { width: 4px; }
.sb-nav::-webkit-scrollbar-thumb { background: #DDD6FE; border-radius: 4px; }
.sb-nav > li { animation: sb-in .45s cubic-bezier(.2,.8,.2,1) both; }
${stagger(".sb-nav > li", 0, 22)}

.sb-label { padding: 14px 10px 4px; font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #A1A1C0; user-select: none; }

.sb-item { --c: ${K.blue}; position: relative; display: flex; align-items: center; gap: 10px; margin: 2px 0; padding: 7px 10px; border-radius: 12px;
  font-size: 12.5px; font-weight: 500; color: #475569; cursor: pointer; text-decoration: none;
  transition: background .25s, color .25s, transform .25s, box-shadow .25s; }
.sb-item:hover { background: color-mix(in srgb, var(--c) 9%, white); color: #1E293B; transform: translateX(3px); }
.sb-item:active { transform: scale(.98); }
.sb-chip { width: 28px; height: 28px; border-radius: 9px; display: grid; place-items: center; flex-shrink: 0; font-size: 15px; color: var(--c);
  background: color-mix(in srgb, var(--c) 14%, white); transition: transform .3s, background .3s, color .3s; }
.sb-item:hover .sb-chip { transform: rotate(-8deg) scale(1.1); }
.sb-item.on { color: #fff; transform: none; background: linear-gradient(135deg, var(--c), color-mix(in srgb, var(--c) 60%, #EC4899));
  box-shadow: 0 8px 16px color-mix(in srgb, var(--c) 32%, transparent); }
.sb-item.on .sb-chip { background: rgba(255,255,255,.24); color: #fff; }
.sb-txt { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sb-badge { background: #EF4444; color: #fff; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 99px; min-width: 18px; text-align: center; }
.sb-pip { width: 6px; height: 6px; border-radius: 50%; background: #fff; opacity: .85; }
.sb-chev { color: #A1A1C0; transition: transform .35s cubic-bezier(.65,0,.25,1); }
.sb-item.open .sb-chev { transform: rotate(180deg); }
.sb-item.open { background: color-mix(in srgb, var(--c) 9%, white); }

.sb-sub { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s cubic-bezier(.65,0,.25,1); }
.sb-sub.open { grid-template-rows: 1fr; }
.sb-sub > ul { overflow: hidden; list-style: none; margin: 0 0 0 18px; padding: 0 0 0 10px; border-left: 2px dashed #E0E7FF; }
.sb-sub.open > ul { margin-top: 2px; margin-bottom: 4px; }
.sb-subitem { --c: ${K.blue}; display: flex; align-items: center; gap: 8px; margin: 1px 0; padding: 6px 10px; border-radius: 9px; font-size: 11.5px; font-weight: 500;
  color: #64748B; text-decoration: none; transition: background .2s, color .2s, transform .2s; }
.sb-subitem:hover { color: var(--c); background: color-mix(in srgb, var(--c) 8%, white); transform: translateX(3px); }
.sb-subitem:active { transform: scale(.98); }
.sb-subitem i { width: 6px; height: 6px; border-radius: 50%; background: #CBD5E1; flex-shrink: 0; transition: background .2s, transform .2s; }
.sb-subitem:hover i { background: var(--c); transform: scale(1.3); }
.sb-subitem.on { color: var(--c); background: color-mix(in srgb, var(--c) 12%, white); font-weight: 600; }
.sb-subitem.on i { background: var(--c); }

.sb-foot { padding: 10px 12px; border-top: 1px solid #F1F5F9; flex-shrink: 0; }
.sb-logout { width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 0; border-radius: 12px; background: #FFF1F2;
  color: #EF4444; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: background .25s, color .25s, transform .2s, box-shadow .25s; }
.sb-logout:hover { background: linear-gradient(135deg, #F43F5E, #FF6B2B); color: #fff; box-shadow: 0 8px 16px rgba(244,63,94,.3); transform: translateY(-1px); }
.sb-logout:active { transform: scale(.98); }

/* Overlay: hamesha DOM mein, sirf opacity se fade hota hai */
.sb-overlay { position: fixed; inset: 0; z-index: 51; background: rgba(15,23,42,.45); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
  opacity: 0; pointer-events: none; transition: opacity .35s ease; }
.sb-overlay.show { opacity: 1; pointer-events: auto; }

/* ── Mobile / tablet: slide-in drawer ── */
.sb.mobile { width: min(84vw, 300px); height: 100vh; height: 100dvh; border-right: 0; border-radius: 0 22px 22px 0;
  transform: translateX(-102%); visibility: hidden; box-shadow: none;
  transition: transform .42s cubic-bezier(.32,.72,0,1), visibility 0s linear .42s, box-shadow .42s; }
.sb.mobile.open { transform: translateX(0); visibility: visible; box-shadow: 14px 0 44px rgba(15,23,42,.28);
  transition: transform .42s cubic-bezier(.32,.72,0,1), visibility 0s, box-shadow .42s; }
.sb.mobile.drag { transition: none; }
.sb.mobile .sb-inner { min-width: 0; }
.sb.mobile .sb-close { display: grid; }
.sb.mobile .sb-top { padding-top: calc(12px + env(safe-area-inset-top)); }
.sb.mobile .sb-foot { padding-bottom: calc(10px + env(safe-area-inset-bottom)); }
.sb.mobile .sb-item { padding: 9px 10px; }
.sb.mobile .sb-subitem { padding: 8px 10px; }

/* Drawer khulte hi items dobara stagger se aate hain */
.sb.mobile:not(.open) .sb-nav > li, .sb.mobile:not(.open) .sb-role { animation: none; opacity: 0; }
.sb.mobile.open .sb-nav > li { animation: sb-in .45s cubic-bezier(.2,.8,.2,1) both; }
.sb.mobile.open .sb-role { animation: sb-in .45s cubic-bezier(.2,.8,.2,1) .08s both, sb-grad 9s ease infinite; }
${stagger(".sb.mobile.open .sb-nav > li", 140, 24)}

@media (hover: none) {
  .sb-item:hover, .sb-subitem:hover, .sb-role:hover, .sb-logout:hover { transform: none; }
}
@media (prefers-reduced-motion: reduce) { .sb, .sb *, .sb-overlay { animation: none !important; transition: none !important; } .sb.mobile:not(.open) .sb-nav > li { opacity: 1; } }
`;

// ─── Small components (bahar define kiye, taaki har render pe remount na ho) ──
const GroupLabel = ({ label }) => <li className="sb-label">{label}</li>;

const NavItem = ({ to, icon: Icon, label, color = K.blue, badge, active, onNav }) => (
  <li>
    <Link to={to} onClick={onNav} className={`sb-item${active ? " on" : ""}`} style={{ "--c": color }}>
      {Icon && <span className="sb-chip"><Icon /></span>}
      <span className="sb-txt">{label}</span>
      {badge > 0 && <span className="sb-badge">{badge}</span>}
      {active && <span className="sb-pip" />}
    </Link>
  </li>
);

const CollapseGroup = ({ icon: Icon, label, color = K.indigo, open, onToggle, children }) => (
  <li>
    <div onClick={onToggle} className={`sb-item${open ? " open" : ""}`} style={{ "--c": color }} role="button" aria-expanded={open}>
      {Icon && <span className="sb-chip"><Icon /></span>}
      <span className="sb-txt">{label}</span>
      <FiChevronDown size={13} className="sb-chev" />
    </div>
    <div className={`sb-sub${open ? " open" : ""}`}><ul>{children}</ul></div>
  </li>
);

const SubItem = ({ to, label, color = K.blue, active, onNav }) => (
  <li>
    <Link to={to} onClick={onNav} className={`sb-subitem${active ? " on" : ""}`} style={{ "--c": color }}>
      <i />{label}
    </Link>
  </li>
);

// ─── Main ────────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = context?.userData?.role || "USER";
  const isAdmin = userRole === "ADMIN";
  const isViceAdmin = userRole === "VICE_ADMIN";
  const isSeller = isSellerRole(userRole);
  const isGrocerySeller = userRole === "GROCERY_SELLER";
  const isRestaurantSeller = userRole === "RESTAURANT_SELLER";
  const isDeliveryRider = userRole === "DELIVERY_RIDER";
  const isGoMarketSeller = GO_MARKET_SHOP_SELLERS.includes(userRole) || isRestaurantSeller;

  const isMobile = context?.windowWidth < MOBILE_BREAKPOINT;
  const isOpen = context?.isSidebarOpen === true;

  const [openGroups, setOpenGroups] = useState({ catalog: false, media: false, banners: false, goMarket: false });
  const toggleGroup = (key) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  // Current route wala group khud khul jaye
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      Object.entries(GROUP_ROUTES).forEach(([key, paths]) => {
        if (paths.some((p) => location.pathname.startsWith(p))) next[key] = true;
      });
      return next;
    });
  }, [location.pathname]);

  const closeSidebar = () => {
    if (isMobile) context?.setisSidebarOpen(false);
  };

  // Mobile pe drawer khula ho to page scroll lock + Esc se band
  useEffect(() => {
    if (!(isMobile && isOpen)) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && context?.setisSidebarOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isMobile, isOpen]);

  // Swipe-left se drawer band
  const touch = useRef({ x: 0, y: 0, active: false, locked: false });
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const onTouchStart = (e) => {
    if (!isMobile) return;
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, active: true, locked: false };
  };
  const onTouchMove = (e) => {
    const s = touch.current;
    if (!isMobile || !s.active) return;
    const t = e.touches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (!s.locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) { s.active = false; return; } // vertical scroll hai
      s.locked = true;
      setDragging(true);
    }
    setDragX(Math.min(0, dx));
  };
  const onTouchEnd = () => {
    const s = touch.current;
    s.active = false;
    if (!s.locked) return;
    setDragging(false);
    if (dragX < -70) closeSidebar();
    setDragX(0);
  };

  const logout = () => {
    fetchDataFromApi(`/api/user/logout?token=${localStorage.getItem("accessToken")}`).then((res) => {
      if (res?.error === false) {
        context.setIsLogin(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
      }
    });
  };

  const isActive = (path) => (path === "/" ? location.pathname === "/" : location.pathname.startsWith(path));

  // helpers: JSX return karte hain (component nahi), isliye remount nahi hota
  const nav = (to, icon, label, color, extra = {}) => (
    <NavItem key={to + label} to={to} icon={icon} label={label} color={color} active={isActive(to)} onNav={closeSidebar} {...extra} />
  );
  const sub = (to, label, color) => <SubItem key={to} to={to} label={label} color={color} active={isActive(to)} onNav={closeSidebar} />;

  const sidebarClass = `sb${isMobile ? " mobile" : ""}${isMobile && isOpen ? " open" : ""}${dragging ? " drag" : ""}`;
  const sidebarStyle = isMobile
    ? dragging ? { transform: `translateX(${dragX}px)` } : undefined
    : { width: isOpen ? "20%" : "0px" };

  return (
    <>
      <style>{CSS}</style>

      {/* Overlay sirf mobile pe; hamesha render hota hai taaki fade in/out smooth rahe */}
      {isMobile && <div className={`sb-overlay${isOpen ? " show" : ""}`} onClick={closeSidebar} aria-hidden="true" />}

      <aside
        className={sidebarClass}
        style={sidebarStyle}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        aria-hidden={isMobile && !isOpen}
      >
        <div className="sb-inner">

          {/* Logo + close (mobile) */}
          <div className="sb-top">
            <Link to="/" onClick={closeSidebar}><img src={localStorage.getItem("logo")} className="md:min-w-[170px]" alt="logo" /></Link>
            <button type="button" className="sb-close" onClick={closeSidebar} aria-label="Close menu"><FiX size={17} /></button>
          </div>

          {/* Role Badge */}
          <Link to="/profile" className="sb-role" onClick={closeSidebar}>
            <small>Signed in as</small>
            <b>{roleLabels[userRole] || "👤 Control Panel"}</b>
          </Link>

          {/* Navigation */}
          <ul className="sb-nav">
            <GroupLabel label="Main" />
            {nav("/", RxDashboard, "Dashboard", K.blue)}
            {(isAdmin || isSeller) &&
              nav("/products", RiProductHuntLine,
                isGrocerySeller ? "My Grocery Products" : isRestaurantSeller ? "My Menu Items" : isSeller ? "My Products" : "Products", K.orange)}
            {(isAdmin || isViceAdmin || isSeller) && nav("/orders", IoBagCheckOutline, isSeller ? "My Orders" : "All Orders", K.green)}
            {isAdmin && nav("/reviews", MdOutlineRateReview, "All Reviews", K.amber)}
            {isSeller && nav("/reviews", MdOutlineRateReview, "My Reviews", K.amber)}

            {isAdmin && (
              <>
                <GroupLabel label="Management" />
                {nav("/users", FiUsers, "Users & Sellers", K.violet)}
                {nav("/riders", FiUsers, "Delivery Riders", K.cyan)}
                {nav("/coupons", MdLocalOffer, "Coupons", K.pink)}

                <CollapseGroup icon={TbCategory} label="Catalog" color={K.indigo} open={openGroups.catalog} onToggle={() => toggleGroup("catalog")}>
                  {sub("/category/list", "Categories", K.indigo)}
                  {sub("/subCategory/list", "Sub Categories", K.indigo)}
                </CollapseGroup>

                <GroupLabel label="Content" />
                {nav("/blog/list", MdOutlineArticle, "Blog Posts", K.purple)}
                {nav("/manageLogo", IoImageOutline, "Manage Logo", K.rose)}

                <GroupLabel label="Banners & Sliders" />
                <CollapseGroup icon={MdOutlinePermMedia} label="Banners" color={K.teal} open={openGroups.banners} onToggle={() => toggleGroup("banners")}>
                  {sub("/banners/management", "Banners Management", K.teal)}
                  {sub("/bannerlist2/List", "Home Banners V2", K.teal)}
                  {sub("/banners/sidebar", "Sidebar Banners", K.teal)}
                  {sub("/banners/category", "Category Banners", K.teal)}
                  {sub("/banners/offer", "Offer Banners", K.teal)}
                  {sub("/banners/footer", "Footer Banners", K.teal)}
                </CollapseGroup>

                <CollapseGroup icon={MdOutlineViewCarousel} label="Sliders" color={K.lime} open={openGroups.media} onToggle={() => toggleGroup("media")}>
                  {sub("/homeSlider/list", "Home Slider", K.lime)}
                  {sub("/slider/deals", "Deals Slider", K.lime)}
                  {sub("/slider/featured", "Featured Slider", K.lime)}
                </CollapseGroup>

                <GroupLabel label="Go Market" />
                <CollapseGroup icon={IoStorefrontOutline} label="Go Market" color={K.orange} open={openGroups.goMarket} onToggle={() => toggleGroup("goMarket")}>
                  {sub("/go-market/markets", "Manage Markets", K.orange)}
                  {sub("/go-market/categories", "Categories", K.orange)}
                  {sub("/go-market/subcategories", "Parent Categories", K.orange)}
                  {sub("/go-market/subsubcategories", "Sub Sub Categories", K.orange)}
                  {sub("/go-market/grocery-shops", "Grocery Shops", K.orange)}
                  {sub("/go-market/restaurants", "Restaurants", K.orange)}
                  {sub("/go-market/products", "Grocery Products", K.orange)}
                  {sub("/go-market/menus", "Menus", K.orange)}
                  {sub("/go-market/items", "Restaurant Items", K.orange)}
                  {sub("/go-market/owners", "Shop Owners", K.orange)}
                  {sub("/commerce-settings", "Fees & Collections", K.orange)}
                </CollapseGroup>

                <GroupLabel label="Finance" />
                {nav("/wallet/transactions", IoWalletOutline, "Wallet Requests", K.emerald)}
              </>
            )}

            {isSeller && (
              <>
                <GroupLabel label={isGoMarketSeller ? "Quick Commerce" : "My Store"} />
                {isGoMarketSeller && (
                  <>
                    {nav("/seller/store-ops", IoStorefrontOutline, isRestaurantSeller ? "Kitchen Operations" : "Store Operations", K.orange)}
                    {nav(isRestaurantSeller ? "/seller/go-market/restaurant" : "/seller/go-market/shop", IoStorefrontOutline,
                      isRestaurantSeller ? "Restaurant Profile (GoMarket)" : "Shop Profile (GoMarket)", K.violet)}
                    {nav("/coupons", MdLocalOffer, "Coupons & Offers", K.pink)}
                  </>
                )}
                {!isGoMarketSeller && nav("/seller/store-profile", IoStorefrontOutline, "Store Profile", K.orange)}
                {nav("/wallet/transactions", IoWalletOutline, "Wallet & Transactions", K.emerald)}
              </>
            )}

            {isDeliveryRider && (
              <>
                <GroupLabel label="Delivery" />
                {nav("/orders", IoBagCheckOutline, "Available Orders", K.green)}
                {nav("/wallet/transactions", IoWalletOutline, "Earnings & Wallet", K.emerald)}
                {nav("/profile", FiUsers, "My Profile", K.violet)}
              </>
            )}

            {isViceAdmin && (
              <>
                <GroupLabel label="View Only" />
                {nav("/users", FiUsers, "Users Info", K.violet)}
                <GroupLabel label="Account" />
                {nav("/profile", FiUsers, "My Profile", K.cyan)}
              </>
            )}
          </ul>

          {/* Logout */}
          <div className="sb-foot">
            <button onClick={logout} className="sb-logout">
              <IoMdLogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;