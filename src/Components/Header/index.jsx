import React, { useContext, useEffect } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

import { RiMenu2Line } from "react-icons/ri";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import { MyContext } from "../../App";
import OrderSoundNotifier from "../OrderSoundNotifier";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
import AddProduct from "../../Pages/Products/addProduct";
import AddHomeSlide from "../../Pages/HomeSliderBanners/addHomeSlide";
import AddCategory from "../../Pages/Categegory/addCategory";
import AddSubCategory from "../../Pages/Categegory/addSubCategory";
import AddAddress from "../../Pages/Address/addAddress";
import EditCategory from "../../Pages/Categegory/editCategory";

import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { IoMdClose } from "react-icons/io";
import Slide from "@mui/material/Slide";
import EditProduct from "../../Pages/Products/editProduct";
import { AddBannerV1 } from "../../Pages/Banners/addBannerV1";
import { EditBannerV1 } from "../../Pages/Banners/editBannerV1";
import { BannerList2_AddBanner } from "../../Pages/Banners/bannerList2_AddBanner";
import { BannerList2_Edit_Banner } from "../../Pages/Banners/bannerList2_Edit_Banner";
import AddBlog from "../../Pages/Blog/addBlog";
import EditBlog from "../../Pages/Blog/editBlog";
import EditHomeSlide from "../../Pages/HomeSliderBanners/editHomeSlide";

import "../ui-theme.css";
import "./header-theme.css";

const Transition = React.forwardRef(function Transition(props, ref) {
  return (
    <Slide
      direction="up"
      ref={ref}
      {...props}
      timeout={{ enter: 450, exit: 300 }}
      easing={{ enter: "cubic-bezier(.2,.8,.2,1)", exit: "ease-in" }}
    />
  );
});

const GO_MARKET_SHOP_SELLERS = [
  "GROCERY_SELLER", "FASHION_SELLER", "ELECTRONICS_SELLER", "MEDICAL_SELLER",
  "BEAUTY_SELLER", "HOME_KITCHEN_SELLER", "GIFTS_TOYS_SELLER",
  "BOOKS_STATIONERY_SELLER", "JEWELLERY_SELLER", "HARDWARE_SELLER", "AUTOMOBILE_SELLER",
];

const prettyRole = (role) =>
  (role || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

const Header = () => {
  const [anchorMyAcc, setAnchorMyAcc] = React.useState(null);
  const openMyAcc = Boolean(anchorMyAcc);

  const history = useNavigate();

  const handleClickMyAcc = (event) => {
    setAnchorMyAcc(event.currentTarget);
  };
  const handleCloseMyAcc = () => {
    setAnchorMyAcc(null);
  };

  const context = useContext(MyContext);

  const location = useLocation();

  useEffect(() => {
    fetchDataFromApi("/api/logo").then((res) => {
      localStorage.setItem("logo", res?.logo[0]?.logo);
    });

    const token = localStorage.getItem("accessToken");

    if (token !== undefined && token !== null && token !== "") {
      history(location.pathname);
    } else {
      history("/login");
    }
  }, [context?.isLogin]);

  const logout = () => {
    setAnchorMyAcc(null);

    fetchDataFromApi(`/api/user/logout?token=${localStorage.getItem("accessToken")}`, { withCredentials: true }).then((res) => {
      if (res?.error === false) {
        context.setIsLogin(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        history("/login");
      }
    });
  };

  const avatarSrc = context?.userData?.avatar || "/user.jpg";

  const closePanel = () => context?.setIsOpenFullScreenPanel({ open: false });

  const panelTitle = (() => {
    const role = context?.userData?.role;
    const model = context?.isOpenFullScreenPanel?.model;

    if (model === "Add Product" && GO_MARKET_SHOP_SELLERS.includes(role)) return "Add Shop Product";
    if (model === "Add Product" && role === "RESTAURANT_SELLER") return "Add Menu Item";
    if (model === "Edit Product" && GO_MARKET_SHOP_SELLERS.includes(role)) return "Edit Shop Product";
    if (model === "Edit Product" && role === "RESTAURANT_SELLER") return "Edit Menu Item";
    return model;
  })();

  const model = context?.isOpenFullScreenPanel?.model;

  return (
    <>
      <header
        className={`hd dx w-full h-[auto] py-0 ${context.isSidebarOpen === true ? "pl-[22%]" : "pl-5"} ${
          context.isSidebarOpen === true && context?.windowWidth < 992 ? "!pl-80" : ""
        } pr-7 flex items-center justify-between transition-all fixed top-0 left-0 z-[50]`}
      >
        <div className="part1 flex items-center gap-4">
          {context.isSidebarOpen === false && context?.windowWidth > 992 && (
            <div
              className="col"
              onClick={() => {
                context?.windowWidth < 992 && context?.setisSidebarOpen(false);
              }}
            >
              <Link to="/">
                <img src={localStorage.getItem("logo")} className="hd-logo w-[170px] md:w-[150px]" alt="logo" />
              </Link>
            </div>
          )}

          <Button
            className="hd-menu-btn !w-[36px] !h-[36px] !rounded-full !min-w-[36px]"
            onClick={() => context.setisSidebarOpen(!context.isSidebarOpen)}
          >
            <RiMenu2Line />
          </Button>
        </div>

        <div className="part2 flex items-center justify-end gap-5">
          {context.isLogin === true ? (
            <div className="relative">
              <span className="hd-avatar" onClick={handleClickMyAcc} role="button" aria-label="Account menu">
                <img src={avatarSrc} alt="" />
              </span>

              <Menu
                anchorEl={anchorMyAcc}
                id="account-menu"
                open={openMyAcc}
                onClose={handleCloseMyAcc}
                slotProps={{
                  paper: {
                    elevation: 0,
                    className: "hd-menu dx",
                    sx: {
                      overflow: "visible",
                      filter: "drop-shadow(0px 14px 28px rgba(79,70,229,0.25))",
                      mt: 1.5,
                      "& .MuiAvatar-root": {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      "&::before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: "#f4f6ff",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                      },
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem onClick={handleCloseMyAcc} className="hd-profile" disableRipple>
                  <div className="flex items-center gap-3">
                    <div className="hd-profile-avatar">
                      <img src={avatarSrc} alt="" />
                    </div>

                    <div className="info">
                      <h3 className="hd-name">{context?.userData?.name}</h3>
                      <p className="hd-email">{context?.userData?.email}</p>
                      {context?.userData?.role && <span className="hd-role">{prettyRole(context.userData.role)}</span>}
                    </div>
                  </div>
                </MenuItem>
                <Divider sx={{ m: "0 !important" }} />

                <Link to="/profile">
                  <MenuItem
                    onClick={handleCloseMyAcc}
                    className="hd-item hd-item--profile flex items-center gap-3"
                    style={{ "--d": "40ms" }}
                  >
                    <span className="hd-item-icon"><FaRegUser /></span>
                    <span className="hd-item-text">Profile</span>
                  </MenuItem>
                </Link>

                <OrderSoundNotifier inline />

                <MenuItem
                  onClick={logout}
                  className="hd-item hd-item--out flex items-center gap-3"
                  style={{ "--d": "100ms" }}
                >
                  <span className="hd-item-icon"><IoMdLogOut /></span>
                  <span className="hd-item-text">Sign Out</span>
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <Link to="/login">
              <Button className="hd-signin !rounded-full">Sign In</Button>
            </Link>
          )}
        </div>
      </header>

      <Dialog
        fullScreen
        open={context?.isOpenFullScreenPanel.open}
        onClose={closePanel}
        TransitionComponent={Transition}
        PaperProps={{ className: "dx hd-dialog" }}
      >
        <AppBar className="hd-appbar" sx={{ position: "relative" }} elevation={0}>
          <Toolbar sx={{ minHeight: "48px !important" }}>
            <IconButton edge="start" color="inherit" className="hd-close" onClick={closePanel} aria-label="close">
              <IoMdClose />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div" className="hd-title" key={panelTitle}>
              <span>{panelTitle}</span>
            </Typography>
          </Toolbar>
        </AppBar>

        {model === "Add Product" && <AddProduct />}
        {model === "Add Home Slide" && <AddHomeSlide />}
        {model === "Edit Home Slide" && <EditHomeSlide />}
        {model === "Add New Category" && <AddCategory />}
        {model === "Add New Sub Category" && <AddSubCategory />}
        {model === "Add New Address" && <AddAddress />}
        {model === "Edit Category" && <EditCategory />}
        {model === "Edit Product" && <EditProduct />}
        {model === "Add Home Banner List 1" && <AddBannerV1 />}
        {model === "Edit BannerV1" && <EditBannerV1 />}
        {model === "Add Home Banner List2" && <BannerList2_AddBanner />}
        {model === "Edit bannerList2" && <BannerList2_Edit_Banner />}
        {model === "Add Blog" && <AddBlog />}
        {model === "Edit Blog" && <EditBlog />}
      </Dialog>
    </>
  );
};

export default Header;