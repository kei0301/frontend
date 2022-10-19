import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Grid from "@mui/material/Grid";
import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import { Contract } from "near-api-js";
import { useWallet } from "../contexts/accounts";
import {
  buyRaffleTicket,
  createNotify,
  getRaffles,
  getWinner,
  getState,
  getNFTimageURL,
} from "../utils/service";
import moment from "moment";

import TwitterIcon from "@mui/icons-material/Twitter";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation } from "react-router-dom";
import { decode } from "base-64";
import { DOMAIN } from "../config/config";
import {
  RaffleContractAddress,
  TokenContractAddress,
} from "../config/contract";
import { useRef } from "react";
import {
  ButtonGroup,
  Collapse,
  Divider,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";

import uploadIcon from "../assets/img/upload.svg";
import discord from "../assets/discord.svg";
import nftImage from "../assets/img/nft.svg";
import discordIcon from "../assets/img/discordIcon.svg";
import ExpandMore from "../assets/img/upIcon.svg";
import ExpandLess from "../assets/img/downIcon.svg";
import redCoin from "../assets/img/redCoin.svg";
import yrect from "../assets/img/yrect.svg";
import bbtn from "../assets/img/bbtn.svg";
import bgTable from "../assets/img/bgTable.svg";
import tossCoin from "../assets/img/tossCoin.svg";
import option from "../assets/img/option.svg";
import option2 from "../assets/img/1day.svg";

const PublicButton = styled(Button)(({ theme }) => ({
  color: "white",
  // backgroundColor: '#075985',
  textTransform: "unset",
  borderRadius: "20px",
}));
const GButton = styled(Button)(({ theme }) => ({
  color: "white",
  background: "linear-gradient(90deg, #F7BB14 0%, #EC6C0D 103.59%)",
  borderRadius: "6px",
  textTransform: "unset",
}));

const BootstrapDialogTitle = (props) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};
const CDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-container": {
    width: "25%",
    display: "flex",
    float: "right",
  },
  "& .MuiPaper-root": {
    maxHeight: "100vh !important",
    height: "100vh",
    width: "100%",
    margin: 0,
  },
  [theme.breakpoints.down("md")]: {
    "& .MuiDialog-container": {
      width: "45% !important",
    },
  },
  [theme.breakpoints.down("xs")]: {
    "& .MuiDialog-container": {
      width: "85% !important",
    },
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const CardRaffle = ({ data, isOpen, getData }) => {
  const wallet = useWallet();
  const {
    _id,
    raffleId,
    name,
    description,
    nftContract,
    nftId,
    price,
    endDate,
    discordLink,
    twitterLink,
    winner,
    winnerNum,
    imageLink,
    isNFT,
    rafflesInfos,
  } = data;
  const disData = JSON.parse(localStorage.getItem("discordUser"));

  const [open, setOpen] = React.useState(false);
  const [endTimeSeconds, setEndTimeSeconds] = useState(
    moment(Number(endDate)).diff(moment(), "seconds")
  );

  const [ticketNum, setTicketNum] = useState(1);
  const [spentToken, setSpentToken] = useState(0);
  const [uniquDiscordUser, setUniquDiscordUser] = useState(0);
  const [ticketSold, setTicketSold] = useState(0);
  const [yourTicket, setYourTicket] = useState(0);
  const [nftImage, setNftImage] = useState("");
  const [winners, setWinners] = useState([]);

  const tokenContract = new Contract(wallet.account(), TokenContractAddress, {
    changeMethods: ["ft_transfer_call", "ft_transfer"],
  });

  const handleClickLink = (url) => {
    window.open(url, "_blank");
  };
  const handleClickOpen = async () => {
    const winners = await getWinner({ raffleId: _id });
    setWinners(winners.data.winners);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleBuyTicket = async () => {
    if (!wallet.isSignedIn()) {
      createNotify("info", "First connect wallet please...");
      return;
    }
    if (ticketNum <= 0) createNotify("info", "please input ticket number");
    else {
      let data = {
        raffleId: _id,
        ticketNum,
        username: `${disData.username}#${disData.discriminator}`,
        userid: `${disData.id}`,
        isNFT,
        walletAddress: wallet.account().accountId,
      };
      if (isNFT)
        tokenContract.ft_transfer_call({
          callbackUrl: `${DOMAIN}raffles?${new URLSearchParams(data)}`,
          args: {
            receiver_id: RaffleContractAddress,
            amount: `${ticketNum * price * 10 ** 18}`,
            msg: `{"raffle_index": ${Number(raffleId)},"num": ${Number(
              ticketNum
            )}}`,
          },
          gas: 300000000000000,
          amount: 1,
        });
      else
        tokenContract.ft_transfer({
          callbackUrl: `${DOMAIN}raffles?${new URLSearchParams(data)}`,
          args: {
            receiver_id: RaffleContractAddress,
            amount: `${ticketNum * price * 10 ** 18}`,
          },
          gas: 300000000000000,
          amount: 1,
        });
    }
  };

  const init = async () => {
    if (isNFT) {
      const imgURL = await getNFTimageURL(nftContract, nftId);
      setNftImage(imgURL);
    } else {
      setNftImage(imageLink);
    }
    setUniquDiscordUser(rafflesInfos.length);
    const spent = rafflesInfos.reduce((a, b) => a + b.ticketNum, 0);
    setSpentToken(spent * price);
    setTicketSold(spent);
    const yourTic = rafflesInfos.find((item) => {
      return item.userid === `${disData.id}`;
    });
    setYourTicket(yourTic ? yourTic.ticketNum : 0);
  };

  useEffect(() => {
    init();
    const interval = setInterval(() => {
      setEndTimeSeconds((prev) => {
        if (prev > 0) return prev - 1;
        else if (prev === 0) {
          setTimeout(() => {
            getData();
          }, 15000);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Grid item xs={12} sm={6} md={4} sx={{ display: "flex" }}>
      <Card sx={{ margin: "3px", padding: 3, flexGrow: "1" }}>
        <CardMedia component="img" image={nftImage} sx={{ height: "200px" }} />
        <CardContent>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{ textAlign: "center" }}
          >
            {name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              textOverflow: "ellipsis",
              overflow: "hidden !important",
              WebkitBoxOrient: "vertical",
            }}
          >
            {description}
          </Typography>
          <Box sx={{ borderBottom: 2, borderColor: "divider", my: 1 }}></Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <FiberManualRecordIcon
                sx={{ color: isOpen ? "#22C55E" : "red", width: "15px" }}
              />
              <Typography
                gutterBottom
                variant="caption"
                sx={{ m: 0, mt: "3px" }}
              >
                {isOpen ? "Live" : "Closed"}
              </Typography>
            </div>
            <Typography gutterBottom variant="caption" component="div">
              {isOpen
                ? endTimeSeconds > 0
                  ? `Ends in ${Math.floor(endTimeSeconds / 3600)}h ${Math.floor(
                      (endTimeSeconds % 3600) / 60
                    )}m ${(endTimeSeconds % 3600) % 60}s`
                  : "Winner selecting..."
                : "Ended"}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography gutterBottom variant="caption" component="div">
              Ticket Price
            </Typography>
            <Typography gutterBottom variant="caption" component="div">
              {price} NVRS
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography gutterBottom variant="caption" component="div">
              Winners
            </Typography>
            <Typography gutterBottom variant="caption" component="div">
              {isNFT ? winner : winnerNum}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography gutterBottom variant="caption" component="div">
              $NVRS spent
            </Typography>
            <Typography gutterBottom variant="caption" component="div">
              {spentToken}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography gutterBottom variant="caption" component="div">
              Unique Discord users entered
            </Typography>
            <Typography gutterBottom variant="caption" component="div">
              {uniquDiscordUser}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography gutterBottom variant="caption" component="div">
              Tickets Sold
            </Typography>
            <Typography gutterBottom variant="caption" component="div">
              {ticketSold}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography gutterBottom variant="caption" component="div">
              Your Tickets
            </Typography>
            <Typography gutterBottom variant="caption" component="div">
              {yourTicket}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <PublicButton variant="contained" color={isNFT ? "error" : "info"}>
              {isNFT ? "NFT Raffle" : "WL Raffle"}
            </PublicButton>
          </Box>
          {isOpen ? (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <TextField
                size="small"
                variant="outlined"
                defaultValue={ticketNum}
                type={"number"}
                sx={{ width: "70px", mr: 1 }}
                onChange={(e) => setTicketNum(e.target.value)}
              />
              <GButton sx={{ flex: 1 }} onClick={handleBuyTicket}>
                Buy {ticketNum} Ticket{ticketNum > 1 && "s"}
              </GButton>
            </Box>
          ) : (
            <Button
              fullWidth
              variant="contained"
              disabled={winner === "No Winner"}
              onClick={handleClickOpen}
              sx={{ textTransform: "unset" }}
            >
              View Winners
            </Button>
          )}
        </CardContent>
        <Box sx={{ borderBottom: 2, borderColor: "divider", my: 1 }}></Box>
        <CardActions sx={{ justifyContent: "center" }}>
          <IconButton
            disabled={twitterLink === ""}
            color="primary"
            aria-label="upload picture"
            component="label"
            onClick={() => handleClickLink(twitterLink)}
          >
            <TwitterIcon sx={{ color: "white" }} />
          </IconButton>
          <IconButton
            disabled={discordLink === ""}
            color="primary"
            aria-label="upload picture"
            component="label"
            onClick={() => handleClickLink(discordLink)}
          >
            <img src={discord} alt="" />
          </IconButton>
        </CardActions>
      </Card>
      <CDialog open={open} TransitionComponent={Transition} keepMounted>
        <BootstrapDialogTitle
          sx={{ color: "#adac1c" }}
          id="customized-dialog-title"
          onClose={handleClose}
        >
          {isNFT ? "Winner of NFT raffle" : "Winners of WL raffle"}
        </BootstrapDialogTitle>
        <DialogContent>
          <Box mb={3}>
            <div
              style={{ textAlign: "center", width: "100%", height: "200px" }}
            >
              <img
                style={{ width: "90%", height: "200px", borderRadius: "5px" }}
                src={nftImage}
                alt={nftImage}
              />
            </div>
            <Typography
              mt={1}
              gutterBottom
              variant="subtitle1"
              component="p"
              sx={{ color: "#21bbff" }}
            >
              Name :{name}
            </Typography>
            <Typography
              gutterBottom
              variant="subtitle2"
              component="p"
              sx={{ color: "#668fb4" }}
            >
              Ended At {moment(Number(endDate)).format("YYYY-MM-DD  hh:mm")}
            </Typography>
          </Box>
          <Typography
            gutterBottom
            variant="subtitle1"
            component="div"
            sx={{ color: "#adac1c" }}
          >
            {"Winners"}
          </Typography>
          <Box sx={{ borderBottom: 2, borderColor: "divider", my: 1 }}></Box>

          {winners.map(({ username, ticketNum, userid }, i) => {
            return (
              <DialogContentText key={i} id="alert-dialog-slide-description">
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography gutterBottom variant="caption" component="div">
                    {username}
                  </Typography>
                  <Typography gutterBottom variant="caption" component="div">
                    {ticketNum}
                  </Typography>
                </Box>
                <Box
                  sx={{ borderBottom: 2, borderColor: "divider", my: 1 }}
                ></Box>
              </DialogContentText>
            );
          })}

          <Typography
            gutterBottom
            variant="subtitle2"
            component="div"
            sx={{ textAlign: "center" }}
          >
            {winners.length === 0 && "No winner"}
          </Typography>
        </DialogContent>
      </CDialog>
    </Grid>
  );
};

const BadgeBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "25px",
  height: "27px",
  background: `linear-gradient(90deg, #F9C615 0%, #EA5B0C 103.59%)`,
  borderRadius: "5px",
}));

const CustomTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    background: `linear-gradient(90deg, #F9C615 0%, #EA5B0C 103.59%)`,
    height: "3px !important",
    borderRadius: "60px",
  },
  "& .MuiButtonBase-root": {
    textTransform: "unset !important",
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

const columns = [
  { id: "name", label: "Name", minWidth: 170 },
  { id: "code", label: "ISO\u00a0Code", minWidth: 100 },
  {
    id: "population",
    label: "Population",
    minWidth: 170,
    align: "right",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "size",
    label: "Size\u00a0(km\u00b2)",
    minWidth: 170,
    align: "right",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "density",
    label: "Density",
    minWidth: 170,
    align: "right",
    format: (value) => value.toFixed(2),
  },
];

function createData(name, code, population, size) {
  const density = population / size;
  return { name, code, population, size, density };
}

const rows = [
  createData("India", "IN", 1324171354, 3287263),
  createData("China", "CN", 1403500365, 9596961),
  createData("Italy", "IT", 60483973, 301340),
  createData("United States", "US", 327167434, 9833520),
  createData("Canada", "CA", 37602103, 9984670),
  createData("Australia", "AU", 25475400, 7692024),
  createData("Germany", "DE", 83019200, 357578),
  createData("Ireland", "IE", 4857000, 70273),
  createData("Mexico", "MX", 126577691, 1972550),
  createData("Japan", "JP", 126317000, 377973),
  createData("France", "FR", 67022000, 640679),
  createData("United Kingdom", "GB", 67545757, 242495),
  createData("Russia", "RU", 146793744, 17098246),
  createData("Nigeria", "NG", 200962417, 923768),
  createData("Brazil", "BR", 210147125, 8515767),
];

export default function CoinFlip() {
  const wallet = useWallet();
  const location = useLocation();
  const [value, setValue] = useState(0);
  const [openRaffles, setOpenRaffles] = useState([]);
  const [closedRaffles, setClosedRaffles] = useState([]);
  const isInitialRender = useRef(true);

  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getRaffleData = async () => {
    const data = await getRaffles();
    setOpenRaffles(data.data.openRaffles);
    setClosedRaffles(data.data.closedRaffles);
  };

  useEffect(() => {
    if (isInitialRender.current) {
      (async () => {
        const params = new URLSearchParams(location.search);
        const transactionHash = params.get("transactionHashes");
        const raffleId = params.get("raffleId");
        const ticketNum = params.get("ticketNum");
        const username = params.get("username");
        const userid = params.get("userid");
        const isNFT = params.get("isNFT");
        const walletAddress = params.get("walletAddress");
        if (transactionHash) {
          const txData = await getState(transactionHash, wallet.getAccountId());
          const dataT = decode(txData.status.SuccessValue);
          if (dataT || String(isNFT) === "false") {
            let data = {
              txHash: transactionHash,
              raffleId,
              ticketNum,
              username,
              userid,
              walletAddress,
            };
            const result = await buyRaffleTicket(data);
            if (
              result.data.status === true &&
              result.data.status !== "already exist"
            )
              createNotify("success", "You have successfully purchased!!!");
            else if (result.data.status === false)
              createNotify("error", "Some error occured!");
          }
        }
        await getRaffleData();
      })();
    }
    return () => (isInitialRender.current = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Box sx={{ px: "50px", pb: "50px" }}>
      <div
        style={{
          background: "#EBE3FF",
          height: "80vh",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <h1>Coin Flip Game</h1>
        <div style={{ textAlign: "center" }}>
          Below you can participate in one or all of the <br />
          NFT Raffles hosted across several different <br />
          blockchain NFT marketplaces.
        </div>
        <div
          style={{
            display: "flex",
            gap: "60px",
            width: "70vw",
            height: "55vh",
            justifyContent: "center",
            background: `url(${bgTable})`,
            backgroundSize: "100% 100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              zIndex: "9",
              flexDirection: "column",
              alignItems: "center",
              gap: "30px",
            }}
          >
            <div>
              <img src={redCoin} width="150px" />
            </div>
            <div
              style={{
                background: `url(${yrect})`,
                backgroundSize: "100% 100%",
                padding: "0px 20px",
              }}
            >
              <Button variant="text" className="activeBtn">
                Heads
              </Button>
              <Button
                variant="text"
                sx={{ color: "black", fontSize: "16px", fontWeight: "bold" }}
              >
                Tails
              </Button>
              <Button
                variant="text"
                sx={{ color: "black", fontSize: "16px", fontWeight: "bold" }}
              >
                Random
              </Button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              width: "400px",
              flexDirection: "column",
              gap: "30px",
              justifyContent: "center",
            }}
          >
            <h2 style={{ color: "white", textAlign: "center", margin: "0px" }}>
              Bet Setting
            </h2>
            <Box
              style={{
                background: `url(${yrect})`,
                backgroundSize: "100% 100%",
                padding: "10px 20px",
                display: "flex",
                gap: "10px",
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1, color: "black" }}
                placeholder="Please Input the Bet Amount"
                inputProps={{ "aria-label": "search google maps" }}
                type="number"
              />
              <Button variant="text" className="activeBtn">
                Aptos
              </Button>
            </Box>
            <Box sx={{ display: "flex" }}>
              <Button
                variant="text"
                fullWidth
                sx={{
                  background: `url(${tossCoin})`,
                  backgroundSize: "100% 100%",
                  color: "white",
                  p: "16px",
                  fontSize: "16px",
                }}
              >
                Toss Coin
              </Button>
            </Box>
            <Box sx={{ color: "white", textAlign: "center" }}>2x Odds</Box>
          </div>
        </div>
      </div>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          paddingTop: "20px",
          gap: "10px",
        }}
      >
        <h1 style={{ margin: "0px" }}>LeaderBoard</h1>
        <div
          style={{
            background: `url(${option})`,
            backgroundSize: "100% 100%",
            padding: "10px 20px",
          }}
        >
          <Button
            variant="text"
            sx={{
              background: `url(${option2})`,
              backgroundSize: "100% 100%",
              color: "black",
              fontSize: "16px",
              fontWeight: "bold",
              padding: "10px 40px",
            }}
          >
            1 Day
          </Button>
          <Button
            variant="text"
            sx={{ color: "white", fontSize: "16px", fontWeight: "bold" }}
          >
            1 Week
          </Button>
          <Button
            variant="text"
            sx={{ color: "white", fontSize: "16px", fontWeight: "bold" }}
          >
            1 Month
          </Button>
        </div>
      </Box>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow
                style={{
                  backgroundColor: "rgba(235, 227, 255, 1)",
                  color: "rgba(52, 66, 88, 1)",
                  fontWeight: "bold",
                }}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{
                      minWidth: column.minWidth,
                      backgroundColor: "rgba(235, 227, 255, 1)",
                      color: "rgba(52, 66, 88, 1)",
                      fontWeight: "bold",
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow
                      style={{
                        backgroundColor: "rgba(235, 227, 255, 1)",
                        color: "rgba(52, 66, 88, 1)",
                        fontWeight: "bold",
                      }}
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.code}
                    >
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            style={{
                              backgroundColor: "rgba(235, 227, 255, 1)",
                              color: "rgba(52, 66, 88, 1)",
                              fontWeight: "bold",
                            }}
                          >
                            {column.format && typeof value === "number"
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          style={{
            backgroundColor: "rgba(235, 227, 255, 1)",
            color: "rgba(52, 66, 88, 1)",
            fontWeight: "bold",
          }}
        />
      </Paper>
    </Box>
  );
}
