import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { RiProductHuntLine } from "react-icons/ri";
import { TbCategory } from "react-icons/tb";
import { IoBagCheckOutline, IoStorefrontOutline, IoWalletOutline, IoImageOutline } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { FiUsers, FiChevronDown } from "react-icons/fi";
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

// ─── Colors ──────────────────────────────────────────────────────────────────
const K = {
  blue: "#3B82F6", orange: "#FF6B2B", green: "#10B981", amber: "#F59E0B", violet: "#8B5CF6",
  cyan: "#06B6D4", pink: "#EC4899", indigo: "#6366F1", purple: "#A855F7", rose: "#F43F5E",
  teal: "#14B8A6", lime: "#65A30D", emerald: "#059669",
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const stagger = Array.from({ length: 24 }, (_, i) => `.sb-nav > li:nth-child(${i + 1}){animation-delay:${i * 22}ms}`).join("");
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
.sb, .sb * { box-sizing: border-box; font-family: 'Outfit', system-ui, sans-serif; }
.sb { position: fixed; top: 0; left: 0; z-index: 52; height: 100%; display: flex; flex-direction: column; overflow: hidden;
  background: linear-gradient(180deg, #FFFFFF 0%, #FAF8FF 60%, #F4F9FF 100%); border-right: 1px solid #EEF0F6;
  box-shadow: 4px 0 24px rgba(99,102,241,.06); transition: width .35s cubic-bezier(.65,0,.25,1); }
.sb-inner { min-width: 232px; height: 100%; display: flex; flex-direction: column; }

@keyframes sb-in { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: none; } }
@keyframes sb-grad { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
@keyframes sb-fade { from { opacity: 0; } to { opacity: 1; } }

.sb-logo { padding: 12px 16px; border-bottom: 1px solid #F1F5F9; flex-shrink: 0; }
.sb-logo img { width: 150px; transition: transform .3s; }
.sb-logo:hover img { transform: scale(1.03); }

.sb-role { display: block; margin: 10px 12px 4px; padding: 10px 12px; border-radius: 14px; text-decoration: none; flex-shrink: 0; color: #fff;
  background: linear-gradient(120deg, #6366F1, #8B5CF6, #EC4899, #FF6B2B); background-size: 250% 250%; animation: sb-grad 9s ease infinite;
  box-shadow: 0 8px 18px rgba(139,92,246,.28); transition: transform .25s, box-shadow .25s; }
.sb-role:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(139,92,246,.36); }
.sb-role small { display: block; font-size: 9.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; opacity: .85; }
.sb-role b { display: block; margin-top: 2px; font-size: 12.5px; font-weight: 700; }

.sb-nav { flex: 1; overflow-y: auto; overflow-x: hidden; list-style: none; margin: 0; padding: 4px 10px 8px; }
.sb-nav::-webkit-scrollbar { width: 4px; }
.sb-nav::-webkit-scrollbar-thumb { background: #DDD6FE; border-radius: 4px; }
.sb-nav > li { animation: sb-in .45s cubic-bezier(.2,.8,.2,1) both; }
${stagger}

.sb-label { padding: 14px 10px 4px; font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #A1A1C0; user-select: none; }

.sb-item { --c: ${K.blue}; position: relative; display: flex; align-items: center; gap: 10px; margin: 2px 0; padding: 7px 10px; border-radius: 12px;
  font-size: 12.5px; font-weight: 500; color: #475569; cursor: pointer; text-decoration: none;
  transition: background .25s, color .25s, transform .25s, box-shadow .25s; }
.sb-item:hover { background: color-mix(in srgb, var(--c) 9%, white); color: #1E293B; transform: translateX(3px); }
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
.sb-subitem i { width: 6px; height: 6px; border-radius: 50%; background: #CBD5E1; flex-shrink: 0; transition: background .2s, transform .2s; }
.sb-subitem:hover i { background: var(--c); transform: scale(1.3); }
.sb-subitem.on { color: var(--c); background: color-mix(in srgb, var(--c) 12%, white); font-weight: 600; }
.sb-subitem.on i { background: var(--c); }

.sb-foot { padding: 10px 12px; border-top: 1px solid #F1F5F9; flex-shrink: 0; }
.sb-logout { width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 0; border-radius: 12px; background: #FFF1F2;
  color: #EF4444; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: background .25s, color .25s, transform .2s, box-shadow .25s; }
.sb-logout:hover { background: linear-gradient(135deg, #F43F5E, #FF6B2B); color: #fff; box-shadow: 0 8px 16px rgba(244,63,94,.3); transform: translateY(-1px); }
.sb-logout:active { transform: scale(.98); }
.sb-overlay { position: fixed; inset: 0; z-index: 51; background: rgba(15,23,42,.4); backdrop-filter: blur(2px); animation: sb-fade .3s ease both; }
@media (prefers-reduced-motion: reduce) { .sb, .sb * { animation: none !important; transition: none !important; } }
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
    <div onClick={onToggle} className={`sb-item${open ? " open" : ""}`} style={{ "--c": color }}>
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

  const [openGroups, setOpenGroups] = useState({ catalog: false, media: false, banners: false, goMarket: false });
  const toggleGroup = (key) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const closeSidebar = () => {
    if (context?.windowWidth < 992) context?.setisSidebarOpen(false);
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

  return (
    <>
      <style>{CSS}</style>
      <div className="sb" style={{ width: context.isSidebarOpen === true ? "20%" : "0px" }}>
        <div className="sb-inner">

          {/* Logo */}
          <div className="sb-logo" onClick={closeSidebar}>
            <Link to="/"><img src={localStorage.getItem("logo")} className="md:min-w-[170px]" alt="logo" /></Link>
          </div>

          {/* Role Badge */}
          <Link to="/profile" className="sb-role">
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
      </div>

      {context?.windowWidth < 920 && context?.isSidebarOpen === true && (
        <div className="sb-overlay" onClick={closeSidebar} />
      )}
    </>
  );
};

export default Sidebar;