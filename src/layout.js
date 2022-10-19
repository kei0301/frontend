import { useState, useEffect, useRef } from "react";
// import { useWallet } from "./contexts/accounts";

import Sidebar from "./pages/sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { utils } from "near-api-js";
import { checkWallet, createNotify, truncate } from "./utils/service";
import {
  AptosClient,
  AptosAccount,
  CoinClient,
  TokenClient,
  FaucetClient,
  HexString,
  TxnBuilderTypes,
} from "aptos";

import { CLIENT_ID, DOMAIN } from "./config/config";
import { NODE_URL, FAUCET_URL, aptosCoinStore } from "./config/section";
import { toast } from "react-toastify";
import { Backdrop, Fade, Grid, Menu, MenuItem, Modal } from "@mui/material";
import logoIcon from "./assets/img/logo.svg";
import footerLogo from "./assets/img/footerlogo.svg";
import metamask from "./assets/wallet/metamask.png";
import solana from "./assets/wallet/solana.png";
import { useWeb3React } from "@web3-react/core";
import { injected } from "./config/connector";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

// -----solana--
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
// -----

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: "100%",
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  background: "#121212 !important",
  transform: "translate(-50%, -50%)",
  width: "20vw !important",
  borderRadius: "5px",
  padding: "20px 30px",
  boxShadow: 24,
  display: "grid",
};

const settings = ["Home", "Raffles", "CoinFlip", "Cynic Society"];

export default function MainLayout({ getWallet }) {
  const disData = JSON.parse(localStorage.getItem("discordUser"));
  const navigate = useNavigate();
  const [aptosAccount, setAccount] = useState(undefined);
  const [balance, setBalance] = useState(0);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [walletFlag, setWalletFlag] = useState(true);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElUser2, setAnchorElUser2] = useState(null);
  const [anchorElUser3, setAnchorElUser3] = useState(null);
  const { active, account, library, connector, activate, deactivate } =
    useWeb3React();

  const solwallet = useWallet();

  const ConnectWallet = async () => {
    try {
      var wallet = await window.martian.connect();
      const client = new AptosClient(NODE_URL);
      const coinClient = new CoinClient(client);
      const alice = new AptosAccount(undefined, wallet.address);
      var balance = await coinClient.checkBalance(alice);
      setBalance((Number(balance) / 100000000).toFixed(3));
      setAccount(wallet.address);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const DisconnectWallet = async () => {
    await window.martian.disconnect();
    setAccount(undefined);
  };

  async function connect() {
    try {
      await activate(injected);
      handleClose();
    } catch (ex) {
      console.log(ex);
    }
  }

  async function disconnect() {
    try {
      deactivate();
    } catch (ex) {
      console.log(ex);
    }
  }

  const selectMetamask = () => {
    setWalletFlag(true);
    getWallet(true);
    handleClose();
  };

  const selectSolana = () => {
    setWalletFlag(false);
    getWallet(false);
    handleClose();
  };

  const changeWallet = () => {
    handleOpen();
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenUserMenu2 = (event) => {
    setAnchorElUser2(event.currentTarget);
  };

  const handleCloseUserMenu2 = () => {
    setAnchorElUser2(null);
  };

  const handleOpenUserMenu3 = (event) => {
    setAnchorElUser3(event.currentTarget);
  };

  const handleCloseUserMenu3 = () => {
    setAnchorElUser3(null);
  };

  const handleDiscordLogin = async () => {
    const OAuthScope = ["identify"].join(" ");
    const OAuthData = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: `${DOMAIN}auth/callback`,
      scope: OAuthScope,
    });
    window.location.href = `https://discordapp.com/oauth2/authorize?${OAuthData}`;
  };

  const handleDiscordLogout = () => {
    localStorage.removeItem("discordUser");
    window.location.reload();
  };

  useEffect(() => {
    console.log(active, 'active');
    if (!active) {
      console.log(active,'active')
      connect();
    }
  },[])

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box sx={style} className="mw80">
            <span style={{ marginBottom: "20px", color: "white" }}>
              Select Network
            </span>
            <Button
              sx={{
                display: "flex",
                bgcolor: "black",
                justifyContent: "center",
                border: "1px solid gray",
                background: "transparent",
                marginBottom: "10px",
              }}
              onClick={selectMetamask}
            >
              <span style={{ color: "white" }}>Ethereum</span>
            </Button>
            <Button
              sx={{
                display: "flex",
                bgcolor: "black",
                justifyContent: "center",
                border: "1px solid gray",
                background: "transparent",
                marginBottom: "10px",
              }}
              onClick={selectSolana}
            >
              <span style={{ color: "white" }}>Solana</span>
            </Button>
            <Button
              sx={{
                display: "flex",
                bgcolor: "black",
                justifyContent: "center",
                border: "1px solid gray",
                background: "transparent",
              }}
            >
              <span style={{ color: "white" }}>Aptos(Soon)</span>
            </Button>
          </Box>
        </Fade>
      </Modal>
      <AppBar sx={{ background: "white", boxShadow: "none" }}>
        <Toolbar sx={{ m: "10px 50px", p: "0px !important" }} className="m0p10">
          <Typography
            variant="h4"
            sx={{
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
              display: "flex",
            }}
            component="div"
            className="rdc-text-m"
          >
            <img src={logoIcon} />
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: "10px",
              paddingLeft: "30px",
            }}
            className="dn"
          >
            <Button
              sx={{ fontSize: "20px", color: "black", fontWeight: "bold" }}
            >
              Home
            </Button>
            <Button
              sx={{ fontSize: "20px", color: "black", fontWeight: "bold" }}
              onClick={() => {
                navigate("/raffles");
              }}
            >
              Raffles
            </Button>
            <Button
              sx={{ fontSize: "20px", color: "black", fontWeight: "bold" }}
            >
              CoinFlip
            </Button>
            <Button
              sx={{ fontSize: "20px", color: "black", fontWeight: "bold" }}
            >
              Cynic Society
            </Button>
          </Box>
          <Box
            sx={{
              flexGrow: "1",
              display: "flex",
              justifyContent: "flex-end",
              py: 1,
            }}
            className="dn"
          >
            {/* {aptosAccount ? (
              <Button
                variant="contained"
                style={{ display: "flex", textTransform: "unset" }}
                onClick={DisconnectWallet}
                className="btn"
                size="large"
              >
                <Typography>{`${truncate(aptosAccount, [5, 5])}`}</Typography>
                <Typography> | {balance}</Typography>
              </Button>
            ) : (
              <Button
                sx={{ textTransform: "unset" }}
                variant="contained"
                size="large"
                onClick={handleOpen}
                className="btn"
              >
                Wallet Connect
              </Button>
            )} */}

            <Button
              sx={{
                textTransform: "unset",
                mr: "20px",
                bgcolor: "#512da8 !important",
                fontSize: "16px",
                fontWeight: "bold",
              }}
              variant="contained"
              size="large"
              onClick={changeWallet}
              className="btn"
            >
              Change Wallet
            </Button>

            {walletFlag ? (
              disData ? (
                active ? (
                  <>
                    <Button
                      variant="contained"
                      sx={{
                        display: "flex",
                        textTransform: "unset",
                        bgcolor: "#512da8 !important",
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "white",
                      }}
                      onClick={handleOpenUserMenu3}
                      size="large"
                      startIcon={
                        <img src={metamask} style={{ width: "24px" }} />
                      }
                    >
                      {`${truncate(account, [4, 4])}`}
                    </Button>
                    <Menu
                      sx={{ mt: "60px" }}
                      id="menu-appbar"
                      anchorEl={anchorElUser3}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      open={Boolean(anchorElUser3)}
                      onClose={handleCloseUserMenu3}
                      className="usermenu"
                    >
                      <MenuItem
                        onClick={() => {
                          disconnect();
                          handleCloseUserMenu3();
                        }}
                      >
                        <Typography textAlign="center" sx={{ px: "20px" }}>
                          Disconnect
                        </Typography>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button
                    sx={{
                      textTransform: "unset",
                      bgcolor: "#512da8 !important",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                    variant="contained"
                    size="large"
                    onClick={connect}
                    className="btn"
                  >
                    Connect Metamask
                  </Button>
                )
              ) : (
                <Button
                  className="btn"
                  onClick={handleDiscordLogin}
                  sx={{
                    textTransform: "unset",
                    bgcolor: "#512da8 !important",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                  variant="contained"
                  size="large"
                >
                  Login With Discord
                </Button>
              )
            ) : disData ? (
              <Box sx={{ flexGrow: 0 }}>
                <WalletModalProvider>
                  <WalletModalProvider>
                    <WalletMultiButton />
                  </WalletModalProvider>
                </WalletModalProvider>
              </Box>
            ) : (
              <Button
                onClick={handleDiscordLogin}
                sx={{
                  textTransform: "unset",
                  mr: "20px",
                  bgcolor: "#512da8 !important",
                  fontSize: "16px",
                  fontWeight: "bold",
                  p: "10px",
                }}
                variant="contained"
                size="large"
                className="btn"
              >
                Login With Discord
              </Button>
            )}
            {disData ? (
              disData && disData.avatar !== null ? (
                <img
                  // src={`https://lh3.google.com/u/0/d/1zed-ayMn6z7qhdg760Uv5_C27Fsve1Wy=w200-h190-p-k-nu-iv1`}
                  src={`https://cdn.discordapp.com/avatars/${disData.id}/${disData.avatar}.webp?size=128`}
                  alt="d_avatar"
                  style={{
                    borderRadius: "50%",
                    width: "50px",
                    marginLeft: "20px",
                  }}
                  onClick={handleOpenUserMenu2}
                />
              ) : (
                <AccountCircleIcon sx={{ color: "white" }} />
              )
            ) : (
              <></>
            )}
            <Menu
              sx={{ mt: "60px" }}
              id="menu-appbar"
              anchorEl={anchorElUser2}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser2)}
              onClose={handleCloseUserMenu2}
              className="usermenu"
            >
              {(walletFlag && active) ||
              (!walletFlag && solwallet.connected) ? (
                <MenuItem>
                  <Typography textAlign="center" sx={{ px: "20px" }}>
                    Profile
                  </Typography>
                </MenuItem>
              ) : (
                <></>
              )}
              <MenuItem onClick={handleDiscordLogout}>
                <Typography textAlign="center" sx={{ px: "20px" }}>
                  LogOut
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
          <div className="pdn" style={{ flex: "1" }}></div>
          <Box className="pdn">
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ color: "black" }}
              onClick={handleOpenUserMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
        <Box
          className="pdn2"
          sx={{
            justifyContent: "center",
            alignItems: "center",
            p: "0px 10px",
          }}
        >
          <Button
            sx={{
              textTransform: "unset",
              mr: "20px",
              bgcolor: "#512da8 !important",
              fontSize: "16px",
              fontWeight: "bold",
              p: "10px",
            }}
            variant="contained"
            size="large"
            className="btn"
            onClick={changeWallet}
          >
            Change Wallet
          </Button>

          {walletFlag ? (
            disData ? (
              active ? (
                <Button
                  variant="contained"
                  sx={{
                    display: "flex",
                    textTransform: "unset",
                    bgcolor: "#512da8 !important",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "white",
                  }}
                  onClick={disconnect}
                  size="large"
                  startIcon={<img src={metamask} style={{ width: "24px" }} />}
                >
                  {`${truncate(account, [4, 4])}`}
                </Button>
              ) : (
                <Button
                  sx={{
                    textTransform: "unset",
                    bgcolor: "#512da8 !important",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                  variant="contained"
                  size="large"
                  onClick={connect}
                  className="btn"
                >
                  Connect Metamask
                </Button>
              )
            ) : (
              <Button
                onClick={handleDiscordLogin}
                sx={{
                  textTransform: "unset",
                  mr: "20px",
                  bgcolor: "#512da8 !important",
                  fontSize: "16px",
                  fontWeight: "bold",
                  p: "10px",
                }}
                variant="contained"
                size="large"
                className="btn"
              >
                Login With Discord
              </Button>
            )
          ) : disData ? (
            <Box sx={{ flexGrow: 0 }}>
              <WalletModalProvider>
                <WalletModalProvider>
                  <WalletMultiButton />
                </WalletModalProvider>
              </WalletModalProvider>
            </Box>
          ) : (
            <Button
              onClick={handleDiscordLogin}
              sx={{
                textTransform: "unset",
                mr: "20px",
                bgcolor: "#512da8 !important",
                fontSize: "16px",
                fontWeight: "bold",
                p: "10px",
              }}
              variant="contained"
              size="large"
              className="btn"
            >
              Login With Discord
            </Button>
          )}
        </Box>
      </AppBar>
      <Box className="mmt80 rdc-pd-m" sx={{ flexGrow: 1, pt: 11 }}>
        <Outlet />
      </Box>
      <Box sx={{ p: 6, bgcolor: "rgba(18, 20, 24, 1)" }}>
        <div style={{ borderBottom: "1px solid gray", display: "flex" }}>
          <Grid container spacing={2}>
            <Grid item sm={12} md={8} lg={8}>
              <div style={{ flex: "2" }}>
                <img
                  src={footerLogo}
                  style={{ width: "100%", maxWidth: "320px" }}
                />
              </div>
            </Grid>
            <Grid item sm={12} md={4} lg={4} sx={{ width: "100%" }}>
              <div
                style={{
                  flex: "1",
                  display: "flex",
                  color: "rgba(255, 255, 255, 1)",
                  width: "100%",
                }}
              >
                <div style={{ flex: "1" }}>
                  <h2>Cynic Society</h2>
                  <h4>Home</h4>
                  <h4>Our Product</h4>
                  <h4>About Us</h4>
                  <h4>Contact Us</h4>
                </div>
                <div style={{ flex: "1" }}>
                  <div style={{ flex: "1" }}>
                    <h2>Degen Town</h2>
                    <h4>Raffles</h4>
                    <h4>Coin Flip</h4>
                  </div>
                </div>
              </div>
            </Grid>
          </Grid>
        </div>
        <div
          style={{
            textAlign: "center",
            color: "rgba(255, 255, 255, 1)",
            marginTop: "25px",
          }}
        >
          © 2022 cynic social. All rights reserved
        </div>
      </Box>
    </Box>
  );
}
