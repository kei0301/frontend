import React, { useState, useEffect } from "react";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Grid from "@mui/material/Grid";
import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
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
import Bignumber from "bignumber.js";
import { CLIENT_ID, DOMAIN } from "../config/config";
import {
  buyRaffleTicket,
  createNotify,
  getRaffles,
  getWinner,
  getState,
  getNFTimageURL,
  checkAdmin,
  createRaffle,
  createNewWLRaffle,
  checkNFT,
} from "../utils/service";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import moment from "moment";
import discord from "../assets/discord.svg";
import TwitterIcon from "@mui/icons-material/Twitter";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation } from "react-router-dom";
import { decode } from "base-64";
import {
  RaffleContractAddress,
  TokenContractAddress,
} from "../config/contract";
import { useRef } from "react";
import uploadIcon from "../assets/img/upload.svg";
import nftImage from "../assets/img/nft.svg";
import discordIcon from "../assets/img/discordIcon.svg";
import {
  ButtonGroup,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Modal,
} from "@mui/material";
import ExpandMore from "../assets/img/upIcon.svg";
import ExpandLess from "../assets/img/downIcon.svg";
import { useWeb3React } from "@web3-react/core";
import LoadingButton from "@mui/lab/LoadingButton";
import abi from "../config/wallet/erc20.json";
import Web3 from "web3";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";
import axios from "axios";
import floor from "floor";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { web3 as solWeb3 } from "@project-serum/anchor";
import SendIcon from "@mui/icons-material/Send";

const web3 = new Web3(window.ethereum);
const disData = JSON.parse(localStorage.getItem("discordUser"));

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
      width: "75% !important",
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

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#EBE3FF",
  width: "500px",
  height: "350px",
  border: "1px solid gray",
  borderRadius: "12px",
  boxShadow: 24,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const opts = {
  preflightCommitment: "processed",
};

const CardRaffle = ({ data, isOpen, getData, walletFlag }) => {
  let raffleId = data._id;
  const solwallet = useWallet();
  const connection = new Connection(clusterApiUrl("mainnet-beta"));
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState(
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  );
  const [ticketAmount, setticketAmount] = useState(1);
  const [loading, setloading] = useState(false);
  const { active, account, library, connector, activate, deactivate } =
    useWeb3React();
  const signWallet = useWeb3React();

  const [unique, setUniquDiscordUser] = useState(0);
  const [spentPrice, setSpentToken] = useState(0);
  const [spent, setTicketSold] = useState(0);
  const [ownTicket, setYourTicket] = useState(0);
  const [solprice, setSolprice] = useState(0);
  const [winners, setWinners] = useState([]);
  const [detailFlag, setDetailFlag] = useState(false);
  const solUsdc = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const solUsdt = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

  const handleClick = () => {
    setDetailFlag(!detailFlag);
  };
  const [endTimeSeconds, setEndTimeSeconds] = useState(
    moment(Number(data.endDate)).diff(moment(), "seconds")
  );

  const transferToken = async (token, ticketNum, amount) => {
    console.log(token, ticketNum, amount, "token,ticketNum,amount,");
    const recipement = "0x4bF6b957744eE2E99e40c43612Cb0D25a63b2454";
    let hash = await token.methods
      .transfer(recipement, amount)
      .send({ from: account });
    let buyHistory = {
      txHash: hash.transactionHash,
      raffleId,
      ticketNum,
      username: `${disData.username}#${disData.discriminator}`,
      userid: `${disData.id}`,
      walletAddress: account,
      walletFlag: walletFlag,
    };
    const result = await buyRaffleTicket(buyHistory);
    if (result.data.status === true && result.data.status !== "already exist")
      createNotify("success", "You have successfully purchased!!!");
    else if (result.data.status === false)
      createNotify("error", "Some error occured!");
    setloading(false);
  };

  const transferEth = async (amount, ticketNum) => {
    web3.eth.sendTransaction(
      {
        from: account,
        to: "0x4bF6b957744eE2E99e40c43612Cb0D25a63b2454",
        value: amount,
      },
      async function (err, hash) {
        if (!err) {
          let buyHistory = {
            txHash: hash,
            raffleId,
            ticketNum,
            username: `${disData.username}#${disData.discriminator}`,
            userid: `${disData.id}`,
            walletAddress: account,
            walletFlag: walletFlag,
          };
          const result = await buyRaffleTicket(buyHistory);
          if (
            result.data.status === true &&
            result.data.status !== "already exist"
          )
            createNotify("success", "You have successfully purchased!!!");
          else if (result.data.status === false)
            createNotify("error", "Some error occured!");
          setloading(false);
        } else {
          console.log(
            "❗Something went wrong while submitting your transaction:",
            error
          );
          createNotify("error", "Some error occured!");
        }
      }
    );
  };

  const handleTransferToken = async (tokenMintAddress) => {
    let publicKey = solwallet.wallet.adapter.publicKey;
    const mintPublicKey = new solWeb3.PublicKey(tokenMintAddress);
    const txWallet = solwallet.wallet.adapter;
    const mintToken = new Token(
      connection,
      mintPublicKey,
      TOKEN_PROGRAM_ID,
      txWallet
    );
    const fromTokenAccount = await mintToken.getOrCreateAssociatedAccountInfo(
      publicKey
    );
    const tokenAccountBalance = await connection.getTokenAccountBalance(
      fromTokenAccount.address
    );
    const instructions = [];
    const dest = "EHbsXfSCLQMJ3gvMCmQQfwrSh143dF2WpgySPWAkgn2T";
    const destPublicKey = new solWeb3.PublicKey(dest);
    const associatedDestinationTokenAddr =
      await Token.getAssociatedTokenAddress(
        mintToken.associatedProgramId,
        mintToken.programId,
        mintPublicKey,
        destPublicKey
      );
    const receiverAccount = await connection.getAccountInfo(
      associatedDestinationTokenAddr
    );
    if (receiverAccount === null) {
      instructions.push(
        Token.createAssociatedTokenAccountInstruction(
          mintToken.associatedProgramId,
          mintToken.programId,
          mintPublicKey,
          associatedDestinationTokenAddr,
          destPublicKey,
          publicKey
        )
      );
    }
    instructions.push(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        fromTokenAccount.address,
        associatedDestinationTokenAddr,
        publicKey,
        [],
        Number(ticketAmount * data.price) *
          10 ** tokenAccountBalance.value.decimals
      )
    );
    const transaction = new solWeb3.Transaction().add(...instructions);
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash(opts.preflightCommitment)
    ).blockhash;
    await solwallet.signTransaction(transaction);
    const rawTx = transaction.serialize();
    const txId = await solWeb3.sendAndConfirmRawTransaction(
      connection,
      rawTx,
      opts
    );
    return txId;
  };

  const SolTransfer = async () => {
    let PriceData = await axios.get(
      "https://price-api.crypto.com/price/v1/exchange/solana"
    );
    const getProvider = async () => {
      if ("solana" in window) {
        const provider = window.solana;
        if (provider.isPhantom) {
          return provider;
        }
      } else {
        window.open("https://www.phantom.app/", "_blank");
      }
    };
    var provider = await getProvider();
    var transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: new PublicKey("EHbsXfSCLQMJ3gvMCmQQfwrSh143dF2WpgySPWAkgn2T"),
        lamports: (
          ((ticketAmount * data.price) / PriceData.data.fiat.usd) *
          LAMPORTS_PER_SOL
        ).toFixed(0), //Investing 1 SOL. Remember 1 Lamport = 10^-9 SOL.
      })
    );
    // Setting the variables for the transaction
    transaction.feePayer = await provider.publicKey;
    let blockhashObj = await connection.getRecentBlockhash();
    transaction.recentBlockhash = await blockhashObj.blockhash;
    // Request creator to sign the transaction (allow the transaction)
    let signed = await provider.signTransaction(transaction);
    // The signature is generated
    let signature = await connection.sendRawTransaction(signed.serialize());
    // Confirm whether the transaction went through or not

    connection.confirmTransaction(signature);
    return signature;
  };

  const balanceCheck = async (mint) => {
    const mintPublicKey = new solWeb3.PublicKey(mint);
    const txWallet = solwallet.wallet.adapter;
    const mintToken = new Token(
      connection,
      mintPublicKey,
      TOKEN_PROGRAM_ID,
      txWallet
    );
    const fromTokenAccount = await mintToken.getOrCreateAssociatedAccountInfo(
      solwallet.wallet.adapter.publicKey
    );
    const tokenAccountBalance = await connection.getTokenAccountBalance(
      fromTokenAccount.address
    );
    return tokenAccountBalance.value.uiAmount;
  };

  const savetoDB = async (signature) => {
    let ticketNum = ticketAmount;
    let buyHistory = {
      txHash: signature,
      raffleId,
      ticketNum,
      username: `${disData.username}#${disData.discriminator}`,
      userid: `${disData.id}`,
      walletAddress: solwallet.wallet.adapter.publicKey.toBase58(),
      walletFlag: walletFlag,
    };
    console.log(buyHistory, "buyHistory");
    const result = await buyRaffleTicket(buyHistory);
    if (result.data.status === true && result.data.status !== "already exist")
      createNotify("success", "You have successfully purchased!!!");
    else if (result.data.status === false)
      createNotify("error", "Some error occured!");
    setloading(false);
  };

  const buyTicket = async () => {
    if (disData) {
      if (ticketAmount >= 1) {
        setticketAmount(floor(ticketAmount));
        if (walletFlag) {
          if (active) {
            try {
              setloading(true);
              let ticketNum = ticketAmount;
              let amount = new Bignumber(String(ticketNum * data.price))
                .times(new Bignumber(10).pow(6))
                .toString();
              const token = new web3.eth.Contract(abi, address);
              await token.methods
                .balanceOf(account)
                .call()
                .then(async function (result) {
                  if (result === "0") {
                    console.log(result, "result");
                    const token = new web3.eth.Contract(
                      abi,
                      "0xdac17f958d2ee523a2206206994597c13d831ec7"
                    );
                    await token.methods
                      .balanceOf(account)
                      .call()
                      .then(async function (result) {
                        if (result !== "0") {
                          let PriceData = await axios.get(
                            "https://price-api.crypto.com/price/v1/exchange/ethereum"
                          );
                          let ethPrice = Number(PriceData.data.fiat.usd);
                          let amount = web3.utils.toWei(
                            String(
                              ((ticketNum * data.price) / ethPrice).toFixed(10)
                            ),
                            "ether"
                          );
                          transferEth(amount, ticketNum);
                        } else {
                          transferToken(token, ticketNum, amount);
                        }
                      });
                  } else {
                    console.log(result, "result-usdc");
                    transferToken(token, ticketNum, amount);
                  }
                });
            } catch (err) {
              console.log(err, "errrr");
              createNotify("error", err.message);
              setloading(false);
            }
          } else {
            createNotify("error", "Please Connect the Wallet");
          }
        } else {
          if (solwallet.connected) {
            try {
              setloading(true);
              if (balanceCheck(solUsdc) !== 0) {
                let signature = await handleTransferToken(solUsdc);
                savetoDB(signature);
              } else {
                if (balanceCheck(solUsdt) !== 0) {
                  let signature = await handleTransferToken(solUsdt);
                  savetoDB(signature);
                } else {
                  let balance = await connection.getBalance(
                    solwallet.wallet.adapter.publicKey
                  );
                  if (balance === 0) {
                    createNotify("error", "Your Sol Token Balance is 0");
                    setloading(false);
                  } else {
                    let signature = await SolTransfer();
                    savetoDB(signature);
                  }
                }
              }
            } catch (error) {
              createNotify("error", error.message);
              setloading(false);
            }
          } else {
            createNotify("error", "Please Connect Wallet");
          }
        }
      } else {
        createNotify("error", "Ticket Amount is must more that 1");
      }
    } else {
      createNotify("error", "Please Login with Discord");
    }
  };

  const handleClickOpen = async () => {
    const winners = await getWinner({ raffleId: data._id });
    setWinners(winners.data.winners);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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

  useEffect(() => {
    setUniquDiscordUser(data.rafflesInfos.length);
    const spent = data.rafflesInfos.reduce((a, b) => a + b.ticketNum, 0);
    setSpentToken(spent * data.price);
    setTicketSold(spent);
    if (disData) {
      const yourTic = data.rafflesInfos.find((item) => {
        return item.userid === disData.id;
      });
      setYourTicket(yourTic ? yourTic.ticketNum : 0);
    } else {
      setYourTicket(0);
    }
  }, []);

  useEffect(() => {
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
    <Grid item sm={12} md={4} lg={3} sx={{ height: "fit-content" }} pr="35px">
      <Box
        sx={{
          border: "1px solid gray",
          borderRadius: "20px",
          width: "100%",
          background: "transparent",
          position: "relative",
          padding: 1 / 8,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: -5,
            transform: "translate(-50%, -50%)",
            width: 50,
            height: 50,
            background: "white",
            border: "1px solid gray",
            borderRadius: "50%",
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            "&::before": {
              content: '""',
              position: "absolute",
              borderTop: 1,
              borderBottom: 1,
              borderLeft: 1,
              borderColor: "white",
              top: -1,
              left: -1,
              width: 30,
              height: 50,
              background: "white",
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            right: -57,
            transform: "translate(-50%, -50%)",
            width: 50,
            height: 50,
            background: "white",
            border: "1px solid gray",
            borderRadius: "50%",
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            "&::before": {
              content: '""',
              position: "absolute",
              borderTop: 1,
              borderBottom: 1,
              borderRight: 1,
              borderColor: "white",
              top: -1,
              right: -1,
              width: 30,
              height: 50,
              background: "white",
            },
          }}
        />
        <Box
          sx={{
            width: "100%",
            height: "100%",
            background: "#fff",
            borderRadius: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
            }}
          >
            <div style={{ flex: "1" }}></div>
            <div
              style={{
                padding: "10px",
                textAlign: "center",
                borderTopRightRadius: "20px",
                background: "rgba(209, 220, 242, 1)",
              }}
            >
              {isOpen
                ? endTimeSeconds > 0
                  ? `Ends in ${Math.floor(endTimeSeconds / 3600)}h ${Math.floor(
                      (endTimeSeconds % 3600) / 60
                    )}m ${(endTimeSeconds % 3600) % 60}s`
                  : "Winner selecting..."
                : "Ended"}
            </div>
          </div>
          <div
            style={{
              padding: "0px 30px 24px 30px",
              borderBottom: "1px solid gray",
            }}
          >
            <div
              style={{
                justifyContent: "center",
                display: "flex",
                paddingTop: "12px",
              }}
            >
              <img
                src={`${process.env.REACT_APP_Base_Url}/${data.image}`}
                style={{
                  borderRadius: "5px",
                  border: "1px solid gray",
                  width: "100%",
                  height: "200px",
                }}
              />
            </div>
            <div style={{ display: "flex" }}>
              <div>
                <h3>{data.name}</h3>
              </div>
              <div style={{ flex: "1" }}></div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <a
                  href={data.tweeter !== "" ? data.tweeter : "#"}
                  target="_blank"
                >
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="label"
                    sx={{ color: "black" }}
                  >
                    <TwitterIcon />
                  </IconButton>
                </a>
                <a
                  href={data.discord !== "" ? data.discord : "#"}
                  target="_blank"
                >
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="label"
                  >
                    <img src={discordIcon} />
                  </IconButton>
                </a>
              </div>
            </div>
            <div style={{ height: "80px" }}>{data.description}</div>
            <div style={{ display: "flex" }}>
              <h3>Ticket Price</h3>
              <div style={{ flex: "1" }}></div>
              <h3>{data.price} USD</h3>
            </div>
            <div style={{ display: "flex" }}>
              <h3 style={{ marginTop: "0px" }}>Your Tickets</h3>
              <div style={{ flex: "1" }}></div>
              <h3 style={{ marginTop: "0px" }}>{ownTicket}</h3>
            </div>
            {isOpen ? (
              disData ? (
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <TextField
                    id="outlined-basic"
                    variant="outlined"
                    inputProps={{ style: { color: "white" } }}
                    type="number"
                    sx={{
                      bgcolor: "#1B1F24",
                      borderRadius: "5px",
                      height: "100%",
                    }}
                    value={ticketAmount}
                    onChange={(e) => {
                      setticketAmount(e.target.value);
                    }}
                    disabled={loading}
                  />
                  <LoadingButton
                    onClick={buyTicket}
                    fullWidth
                    endIcon={<SendIcon />}
                    loading={loading}
                    loadingPosition="end"
                    variant="contained"
                    className="btn"
                    sx={{ height: "55px !important" }}
                  >
                    Buy Ticket
                  </LoadingButton>
                </div>
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
                  fullWidth
                >
                  Login With Discord
                </Button>
              )
            ) : (
              <div style={{ display: "flex", gap: "20px" }}>
                <Button
                  className="btn"
                  fullWidth
                  disabled={data.winner === "No Winner"}
                  onClick={handleClickOpen}
                >
                  View Winners
                </Button>
              </div>
            )}
          </div>
          <List
            sx={{ bgcolor: "white", borderRadius: "0px 0px 20px 20px" }}
            component="nav"
          >
            <ListItemButton
              onClick={handleClick}
              sx={{ justifyContent: "center", display: "flex" }}
            >
              {detailFlag ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <ListItemText
                    primary={<h3 style={{ margin: "0px" }}>Hide</h3>}
                  />
                  <img src={ExpandMore} />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <ListItemText
                    primary={<h3 style={{ margin: "0px" }}>More Details</h3>}
                  />
                  <img src={ExpandLess} />
                </div>
              )}
            </ListItemButton>
            <Collapse in={detailFlag} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ px: "20px" }}>
                  <h3 style={{ margin: "0px" }}>Winners</h3>
                  <div style={{ flex: "1" }}></div>
                  <h3 style={{ margin: "0px" }}>{data.winnerNum}</h3>
                </ListItemButton>
                <ListItemButton sx={{ px: "20px" }}>
                  <h3 style={{ margin: "0px" }}>$USD Spent</h3>
                  <div style={{ flex: "1" }}></div>
                  <h3 style={{ margin: "0px" }}>{spentPrice.toFixed(3)}</h3>
                </ListItemButton>
                <ListItemButton sx={{ px: "20px" }}>
                  <h3 style={{ margin: "0px" }}>Unique Users</h3>
                  <div style={{ flex: "1" }}></div>
                  <h3 style={{ margin: "0px" }}>{unique}</h3>
                </ListItemButton>
                <ListItemButton sx={{ px: "20px" }}>
                  <h3 style={{ margin: "0px" }}>Tickets Sold</h3>
                  <div style={{ flex: "1" }}></div>
                  <h3 style={{ margin: "0px" }}>{spent.toFixed(3)}</h3>
                </ListItemButton>
                <Box
                  sx={{
                    display: "flex",
                    py: "30px",
                    gap: "12px",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    className="btnBlack"
                    sx={{
                      borderRadius: "20px",
                    }}
                  >
                    WL Raffle
                  </Button>
                  <Button
                    className="btnBlack"
                    sx={{
                      borderRadius: "20px",
                    }}
                  >
                    Public Raffle
                  </Button>
                </Box>
              </List>
            </Collapse>
          </List>
        </Box>
      </Box>
      {/* <Box
        sx={{
          borderRadius: "20px",
          border: "1px solid black",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
          }}
        >
          <div style={{ flex: "1" }}></div>
          <div
            style={{
              padding: "10px",
              textAlign: "center",
              borderTopRightRadius: "20px",
              background: "rgba(209, 220, 242, 1)",
            }}
          >
            {isOpen
              ? endTimeSeconds > 0
                ? `Ends in ${Math.floor(endTimeSeconds / 3600)}h ${Math.floor(
                    (endTimeSeconds % 3600) / 60
                  )}m ${(endTimeSeconds % 3600) % 60}s`
                : "Winner selecting..."
              : "Ended"}
          </div>
        </div>
        <div
          style={{
            padding: "0px 20px 24px 20px",
            borderBottom: "1px solid gray",
          }}
        >
          <div
            style={{
              justifyContent: "center",
              display: "flex",
              paddingTop: "12px",
            }}
          >
            <img
              src={`${process.env.REACT_APP_Base_Url}/${data.image}`}
              style={{
                borderRadius: "5px",
                border: "1px solid gray",
                width: "100%",
                height: "200px",
              }}
            />
          </div>
          <div style={{ display: "flex" }}>
            <div>
              <h3>{data.name}</h3>
            </div>
            <div style={{ flex: "1" }}></div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <a
                href={data.tweeter !== "" ? data.tweeter : "#"}
                target="_blank"
              >
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="label"
                  sx={{ color: "black" }}
                >
                  <TwitterIcon />
                </IconButton>
              </a>
              <a
                href={data.discord !== "" ? data.discord : "#"}
                target="_blank"
              >
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="label"
                >
                  <img src={discordIcon} />
                </IconButton>
              </a>
            </div>
          </div>
          <div style={{ height: "80px" }}>{data.description}</div>
          <div style={{ display: "flex" }}>
            <h3>Ticket Price</h3>
            <div style={{ flex: "1" }}></div>
            <h3>{data.price} USD</h3>
          </div>
          <div style={{ display: "flex" }}>
            <h3 style={{ marginTop: "0px" }}>Your Tickets</h3>
            <div style={{ flex: "1" }}></div>
            <h3 style={{ marginTop: "0px" }}>{ownTicket}</h3>
          </div>
          {isOpen ? (
            disData ? (
              <div style={{ display: "flex", gap: "20px" }}>
                <TextField
                  id="outlined-basic"
                  variant="outlined"
                  inputProps={{ style: { color: "white" } }}
                  type="number"
                  sx={{
                    bgcolor: "#1B1F24",
                    borderRadius: "5px",
                  }}
                  value={ticketAmount}
                  onChange={(e) => {
                    setticketAmount(e.target.value);
                  }}
                  disabled={loading}
                />
                <LoadingButton
                  size="small"
                  onClick={buyTicket}
                  fullWidth
                  endIcon={<SendIcon />}
                  loading={loading}
                  loadingPosition="end"
                  variant="contained"
                  className="btn"
                >
                  Buy Ticket
                </LoadingButton>
              </div>
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
                fullWidth
              >
                Login With Discord
              </Button>
            )
          ) : (
            <div style={{ display: "flex", gap: "20px" }}>
              <Button
                className="btn"
                fullWidth
                disabled={data.winner === "No Winner"}
                onClick={handleClickOpen}
              >
                View Winners
              </Button>
            </div>
          )}
        </div>
        <List
          sx={{ bgcolor: "white", borderRadius: "0px 0px 20px 20px" }}
          component="nav"
        >
          <ListItemButton
            onClick={handleClick}
            sx={{ justifyContent: "center", display: "flex" }}
          >
            {detailFlag ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <ListItemText
                  primary={<h3 style={{ margin: "0px" }}>Hide</h3>}
                />
                <img src={ExpandMore} />
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center" }}>
                <ListItemText
                  primary={<h3 style={{ margin: "0px" }}>More Details</h3>}
                />
                <img src={ExpandLess} />
              </div>
            )}
          </ListItemButton>
          <Collapse in={detailFlag} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ px: "20px" }}>
                <h3 style={{ margin: "0px" }}>Winners</h3>
                <div style={{ flex: "1" }}></div>
                <h3 style={{ margin: "0px" }}>{data.winnerNum}</h3>
              </ListItemButton>
              <ListItemButton sx={{ px: "20px" }}>
                <h3 style={{ margin: "0px" }}>$USD Spent</h3>
                <div style={{ flex: "1" }}></div>
                <h3 style={{ margin: "0px" }}>{spentPrice.toFixed(3)}</h3>
              </ListItemButton>
              <ListItemButton sx={{ px: "20px" }}>
                <h3 style={{ margin: "0px" }}>Unique Users</h3>
                <div style={{ flex: "1" }}></div>
                <h3 style={{ margin: "0px" }}>{unique}</h3>
              </ListItemButton>
              <ListItemButton sx={{ px: "20px" }}>
                <h3 style={{ margin: "0px" }}>Tickets Sold</h3>
                <div style={{ flex: "1" }}></div>
                <h3 style={{ margin: "0px" }}>{spent.toFixed(3)}</h3>
              </ListItemButton>
              <Box
                sx={{
                  display: "flex",
                  py: "30px",
                  gap: "12px",
                  justifyContent: "center",
                }}
              >
                <Button
                  className="btnBlack"
                  sx={{
                    borderRadius: "20px",
                  }}
                >
                  WL Raffle
                </Button>
                <Button
                  className="btnBlack"
                  sx={{
                    borderRadius: "20px",
                  }}
                >
                  Public Raffle
                </Button>
              </Box>
            </List>
          </Collapse>
        </List>
      </Box> */}
      <CDialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        className="mw100"
      >
        <BootstrapDialogTitle
          sx={{ color: "white" }}
          id="customized-dialog-title"
          onClose={handleClose}
        >
          Winners of WL raffle
        </BootstrapDialogTitle>
        <DialogContent>
          <Box mb={3}>
            <div
              style={{ textAlign: "center", width: "100%", height: "200px" }}
            >
              <img
                style={{ width: "90%", height: "200px", borderRadius: "5px" }}
                src={`${process.env.REACT_APP_Base_Url}/${data.image}`}
                alt={`${process.env.REACT_APP_Base_Url}/${data.image}`}
              />
            </div>
            <Typography
              mt={1}
              gutterBottom
              variant="subtitle1"
              component="p"
              sx={{ color: "white" }}
            >
              Name :{data.name}
            </Typography>
            <Typography
              gutterBottom
              variant="subtitle2"
              component="p"
              sx={{ color: "white" }}
            >
              Ended At{" "}
              {moment(Number(data.endDate)).format("YYYY-MM-DD  hh:mm")}
            </Typography>
          </Box>
          <Typography
            gutterBottom
            variant="subtitle1"
            component="div"
            sx={{ color: "white" }}
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

export default function Raffles({ walletFlag }) {
  const inputRef = useRef(null);
  const [isLive, setIsLive] = useState(true);
  const [closedRaffles, setClosedRaffles] = useState([]);
  const [openRaffles, setOpenRaffles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedNft, setSelectedNft] = useState(uploadIcon);
  const [nftfile, setNftfile] = useState(null);
  const [WLRaffleData, setWLRaffleData] = useState({
    name: "",
    description: "",
    winnerNum: 0,
    price: 0,
    supply: 0,
    endDate: moment(),
    isDuplicate: false,
    tweeter: "",
    discord: "",
  });
  const [openModal, setOpenModal] = useState(false);

  const newRaffle = async () => {
    const now = moment();
    const {
      name,
      description,
      winnerNum,
      price,
      endDate,
      supply,
      tweeter,
      discord,
    } = WLRaffleData;
    const secondsToExpire = moment(new Date(endDate)).diff(now, "seconds");

    if (name === "") {
      createNotify("info", "Please input Name!");
      return;
    } else if (description === "") {
      createNotify("info", "Please input Description!");
      return;
    } else if (winnerNum === 0 || winnerNum < 0) {
      createNotify("info", "Please input correct Winner Count!");
      return;
    } else if (price === 0 || price < 0) {
      createNotify("info", "Please input Price!");
      return;
    } else if (supply === 0 || supply < 0) {
      createNotify("info", "Please input Supply!");
      return;
    } else if (secondsToExpire === 0) {
      createNotify("info", "Please select end Date!");
      return;
    } else if (secondsToExpire < 0) {
      createNotify("info", "You should select Correct Time!");
      return;
    } else if (nftfile === null) {
      createNotify("info", "Please select the image file!");
      return;
    }

    let data = WLRaffleData;
    data.endDate = endDate.valueOf();

    let params = new FormData();
    params.append("file", nftfile);
    params.append("data", JSON.stringify(data));
    const reuslt = await createNewWLRaffle(params);

    if (reuslt) {
      setWLRaffleData({
        name: "",
        description: "",
        winnerNum: 0,
        price: 0,
        supply: 0,
        endDate: moment(),
        isDuplicate: false,
        tweeter: "",
        discord: "",
      });
      createNotify("success", "Created new WL raffle successufully");
    } else {
      createNotify("error", "Some error occured!");
    }
  };

  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setNftfile(e.dataTransfer.files[0]);
      setSelectedNft(URL.createObjectURL(e.dataTransfer.files[0]));
    }
  };
  // triggers when file is selected with click
  const handleChange = function (e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setNftfile(e.target.files[0]);
      setSelectedNft(URL.createObjectURL(e.target.files[0]));
    }
  };

  const getRaffleData = async () => {
    const data = await getRaffles();
    setOpenRaffles(data.data.openRaffles);
    setClosedRaffles(data.data.closedRaffles);
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

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const checkData = async () => {
    const disData = await JSON.parse(localStorage.getItem("discordUser"));
    if (!disData) {
      setOpenModal(true);
    } else {
      setOpenModal(false);
    }
  };

  useEffect(() => {
    checkData();
  }, [disData]);

  useEffect(() => {
    getRaffleData();
  }, []);

  return (
    <Box sx={{ px: "50px" }} className="px10">
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="mw8h4">
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            className="mw7"
            sx={{ width: "310px", textAlign: "center" }}
          >
            PLEASE LOGIN TO YOUR DISCORD TO CREATE A NEW RAFFLE
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <Button
              className="btn"
              sx={{ color: "white !important" }}
              onClick={handleDiscordLogin}
            >
              Login With Discord
            </Button>
          </Typography>
        </Box>
      </Modal>
      {checkAdmin() ? (
        <div
          style={{
            background: "#EBE3FF",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <h1>Create A New Raffle</h1>
          <div style={{ textAlign: "center" }}>
            Below you can participate in one or all of the <br />
            NFT Raffles hosted across several different <br />
            blockchain NFT marketplaces.
          </div>
          <div
            style={{ display: "flex", paddingTop: "30px" }}
            className="mw100"
          >
            <Grid container spacing={2} className="mm0p0 mw100">
              <Grid item sm={12} md={6} lg={6} className="mm0p0 mw100">
                <div
                  className="mw100h"
                  style={{
                    border: "1px dashed #747474",
                    background: "white",
                    width: "400px",
                    height: "400px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <form
                    className="shift"
                    id="form-file-upload"
                    onDragEnter={handleDrag}
                    onSubmit={(e) => e.preventDefault()}
                    style={{ width: "100%" }}
                  >
                    <Button sx={{ width: "100%", height: "100%" }}>
                      <input
                        ref={inputRef}
                        type="file"
                        id="input-file-upload"
                        multiple={true}
                        onChange={handleChange}
                        style={{ display: "none" }}
                      />
                      <label
                        id="label-file-upload"
                        htmlFor="input-file-upload"
                        className={dragActive ? "drag-active" : ""}
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={selectedNft}
                          className={
                            selectedNft === uploadIcon ? "default" : "full"
                          }
                          style={{ cursor: "pointer" }}
                        />
                      </label>
                      {dragActive && (
                        <div
                          id="drag-file-element"
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        ></div>
                      )}
                    </Button>
                  </form>
                </div>
              </Grid>
              <Grid item sm={12} md={6} lg={6} className="mm0p0 mw100">
                <div
                  className="mw100 mt30"
                  style={{
                    display: "flex",
                    width: "400px",
                    flexDirection: "column",
                    gap: "30px",
                    justifyContent: "center",
                  }}
                >
                  <Box sx={{ display: "grid" }}>
                    NFT Name
                    <TextField
                      id="outlined-basic"
                      variant="outlined"
                      size="small"
                      inputProps={{ style: { color: "black" } }}
                      sx={{
                        bgcolor: "white",
                        border: "1px solid lightblue",
                        borderRadius: "5px",
                      }}
                      value={WLRaffleData.name}
                      onChange={(e) =>
                        setWLRaffleData({
                          ...WLRaffleData,
                          name: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box sx={{ display: "grid" }}>
                    NFT Description
                    <TextField
                      id="outlined-basic"
                      variant="outlined"
                      size="small"
                      rows={3}
                      multiline
                      inputProps={{ style: { color: "black" } }}
                      sx={{
                        bgcolor: "white",
                        border: "1px solid lightblue",
                        borderRadius: "5px",
                      }}
                      value={WLRaffleData.description}
                      onChange={(e) =>
                        setWLRaffleData({
                          ...WLRaffleData,
                          description: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box sx={{ display: "grid" }}>
                    Winner Count
                    <TextField
                      id="outlined-basic"
                      variant="outlined"
                      size="small"
                      type="number"
                      inputProps={{ style: { color: "black" } }}
                      sx={{
                        bgcolor: "white",
                        border: "1px solid lightblue",
                        borderRadius: "5px",
                      }}
                      value={WLRaffleData.winnerNum}
                      onChange={(e) =>
                        setWLRaffleData({
                          ...WLRaffleData,
                          winnerNum: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box sx={{ display: "grid" }}>
                    Ticket Price
                    <TextField
                      id="outlined-basic"
                      variant="outlined"
                      size="small"
                      type="number"
                      inputProps={{ style: { color: "black" } }}
                      sx={{
                        bgcolor: "white",
                        border: "1px solid lightblue",
                        borderRadius: "5px",
                      }}
                      value={WLRaffleData.price}
                      onChange={(e) =>
                        setWLRaffleData({
                          ...WLRaffleData,
                          price: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box sx={{ display: "grid" }}>
                    Ticket Supply
                    <TextField
                      id="outlined-basic"
                      variant="outlined"
                      size="small"
                      type="number"
                      inputProps={{ style: { color: "black" } }}
                      sx={{
                        bgcolor: "white",
                        border: "1px solid lightblue",
                        borderRadius: "5px",
                      }}
                      value={WLRaffleData.supply}
                      onChange={(e) =>
                        setWLRaffleData({
                          ...WLRaffleData,
                          supply: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box sx={{ display: "grid" }}>
                    Twitter Link
                    <TextField
                      id="outlined-basic"
                      variant="outlined"
                      size="small"
                      inputProps={{ style: { color: "black" } }}
                      sx={{
                        bgcolor: "white",
                        border: "1px solid lightblue",
                        borderRadius: "5px",
                      }}
                      value={WLRaffleData.tweeter}
                      onChange={(e) =>
                        setWLRaffleData({
                          ...WLRaffleData,
                          tweeter: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box sx={{ display: "grid" }}>
                    Discord Link
                    <TextField
                      id="outlined-basic"
                      variant="outlined"
                      size="small"
                      inputProps={{ style: { color: "black" } }}
                      sx={{
                        bgcolor: "white",
                        border: "1px solid lightblue",
                        borderRadius: "5px",
                      }}
                      value={WLRaffleData.discord}
                      onChange={(e) =>
                        setWLRaffleData({
                          ...WLRaffleData,
                          discord: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box sx={{ display: "grid" }}>
                    End Date
                    <LocalizationProvider
                      inputProps={{ style: { color: "black" } }}
                      dateAdapter={AdapterDayjs}
                    >
                      <DateTimePicker
                        renderInput={(props) => (
                          <TextField
                            id="outlined-basic"
                            variant="outlined"
                            size="small"
                            type="number"
                            inputProps={{ style: { color: "black" } }}
                            sx={{
                              bgcolor: "white",
                              border: "1px solid lightblue",
                              borderRadius: "5px",
                              svg: { color: "black" },
                              input: { color: "black" },
                              label: { color: "black" },
                            }}
                            required
                            {...props}
                          />
                        )}
                        inputProps={{ style: { color: "black" } }}
                        value={WLRaffleData.endDate}
                        minDate={new Date()}
                        onChange={(newValue) => {
                          setWLRaffleData({
                            ...WLRaffleData,
                            endDate: newValue,
                          });
                        }}
                      />
                    </LocalizationProvider>
                  </Box>
                  <Box sx={{ display: "grid" }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={WLRaffleData.isDuplicate}
                          onChange={(e) =>
                            setWLRaffleData({
                              ...WLRaffleData,
                              isDuplicate: e.target.checked,
                            })
                          }
                          inputProps={{ "aria-label": "controlled" }}
                          sx={{
                            svg: { color: "black" },
                          }}
                        />
                      }
                      label="Duplicate Winner Allowed"
                    />
                  </Box>
                  <Box>
                    <Button className="btn" onClick={newRaffle}>
                      Create Raffle
                    </Button>
                  </Box>
                </div>
              </Grid>
            </Grid>
          </div>
        </div>
      ) : (
        <></>
      )}
      {/* ---------------------------------- */}
      <Box
        sx={{ display: "flex", alignItems: "flex-end", paddingTop: "20px" }}
        className="dgg20"
      >
        <Box
          sx={{
            borderRadius: "20px",
            bgcolor: "#F5F5F5",
            border: "1px solid black",
          }}
          className="mw130"
        >
          <Button
            className={isLive ? "Livebtn" : "closedbtn"}
            onClick={() => {
              setIsLive(true);
            }}
          >
            Live
          </Button>
          <Button
            className={isLive ? "closedbtn" : "Livebtn"}
            onClick={() => {
              setIsLive(false);
            }}
          >
            Closed
          </Button>
        </Box>
        <div style={{ flex: "1" }} className="dn"></div>
        <Box sx={{ display: "grid", gap: "5px" }}>
          Search
          <TextField
            id="outlined-basic"
            variant="outlined"
            size="small"
            placeholder="Search Raffles"
            inputProps={{ style: { color: "black" } }}
            sx={{
              bgcolor: "rgba(241, 241, 241, 1)",
              color: "black",
              border: "1px solid black",
              borderRadius: "5px",
            }}
          />
        </Box>
      </Box>
      {/* ----------------------------------- */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          width: "100% !important",
          paddingTop: "30px",
          paddingBottom: "50px",
        }}
      >
        <Grid container spacing={2}>
          {isLive
            ? openRaffles.length? 
            openRaffles.map((raffle, i) => {
                if (raffle.isOpen === true) {
                  return (
                    <CardRaffle
                      key={i}
                      data={raffle}
                      isOpen={true}
                      getData={getRaffleData}
                      walletFlag={walletFlag}
                    />
                  );
                }
              })
              :
              <div style={{display:'flex',justifyContent:'center',width:'100%'}}>
                <h3 style={{display:'flex',justifyContent:'center',textAlign:'center',alignItems:'center',height:'30vh',fontSize:'xxx-large'}}>
                  No Raffles
                </h3>
              </div>
            : closedRaffles.length ? (
              closedRaffles.map((raffle, i) => {
                  return (
                    <CardRaffle
                      key={i}
                      data={raffle}
                      isOpen={false}
                      getData={getRaffleData}
                      walletFlag={walletFlag}
                    />
                  );
                })
            ) : (
              <div style={{display:'flex',justifyContent:'center',width:'100%'}}>
                <h3 style={{display:'flex',justifyContent:'center',textAlign:'center',alignItems:'center',height:'30vh',fontSize:'xxx-large'}}>
                  No Raffles
                </h3>
              </div>)
            }
        </Grid>
      </Box>
    </Box>
  );
}
