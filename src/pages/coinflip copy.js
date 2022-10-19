import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import RestorePageIcon from "@mui/icons-material/RestorePage";
import aptosCoin from "../assets/aptos.png";
import goldCoin from "../assets/goldCoin.gif";
import coin from "../assets/bulletPoint.webp";
import headsCoin from "../assets/headsCoin.webp";
import tailsCoin from "../assets/tailsCoin.webp";
import randomCoin from "../assets/randomCoin.webp";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  AptosClient,
  AptosAccount,
  CoinClient,
  TokenClient,
  FaucetClient,
  HexString,
  TxnBuilderTypes,
} from "aptos";
import { NODE_URL, FAUCET_URL, aptosCoinStore } from "../config/section";
import { toast } from "react-toastify";
import {
  AppBar,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Toolbar,
} from "@mui/material";
import { STORAGEDEPOSITAMOUNT } from "../config/contract";

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Eclair", 262, 16.0, 24, 6.0),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Gingerbread", 356, 16.0, 49, 3.9),
];

export default function CoinFlip({ wAddress }) {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(0.01);
  const [flag, setFlag] = useState(2);
  const [loading, setLoading] = useState(false);

  const X2Amount = () => {
    setAmount(amount * 2);
  };

  const Amount2 = () => {
    setAmount(amount / 2);
  };

  const getBalance = async (address) => {
    const client = new AptosClient(NODE_URL);
    let resources = await client.getAccountResources(address);
    let accountResource = resources.find((r) => r.type === aptosCoinStore);
    let balance = parseInt((accountResource?.data).coin.value);
    setBalance((balance / 100000000).toFixed(3));
  };

  const FlipCoin = () => {
    setLoading(true);
    toast.success("Successed Flip Coin");
    setLoading(false);
  };

  useEffect(() => {
    if (wAddress) {
      getBalance(wAddress);
    } else {
      setBalance(undefined);
    }
  }, [wAddress]);

  return (
    <Container sx={{ pt: 5 }}>
      <div className="coinflip">
        <div className="coinflip-main">
          <div className="coinflip-main-head">
            <div className="coinflip-main-coin">
              <img src={coin} />
              <span>Coin Flip Game</span>
            </div>
            <div className="push"></div>
            <div className="coinflip-main-btngroup">
              <div>
                <Button variant="contained">{balance ? balance : 0} APT</Button>
              </div>
            </div>
          </div>
          <div className="coinflip-main-content">
            <div className="coinflip-main-setting">
              <div style={{ textAlign: "center", fontSize: "20px" }}>
                Bet Settings
              </div>
              <div>
                <FormControl
                  sx={{
                    minWidth: "100%",
                  }}
                  size="small"
                >
                  <Select
                    value="10"
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                  >
                    <MenuItem value={10}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <img src={aptosCoin} width="20px" />
                        Aptos
                      </div>
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div>Bet Amount</div>
              <div>
                <FormControl
                  sx={{ width: "100%" }}
                  size="small"
                  variant="outlined"
                >
                  <OutlinedInput
                    id="outlined-adornment-weight"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                    }}
                    endAdornment={
                      <InputAdornment
                        position="end"
                        style={{
                          display: "flex",
                          gap: "10px",
                          cursor: "pointer",
                        }}
                      >
                        <span onClick={X2Amount}>X2</span>
                        <span onClick={Amount2}>2/1</span>
                      </InputAdornment>
                    }
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      "aria-label": "weight",
                    }}
                  />
                </FormControl>
              </div>
              <div>
                <LoadingButton
                  loading={loading}
                  variant="contained"
                  size="small"
                  sx={{ width: "100%" }}
                  onClick={FlipCoin}
                >
                  Flip Coin
                </LoadingButton>
              </div>
              <div style={{ textAlign: "center" }}>2X ODD (50%)</div>
            </div>
            <div className="coinflip-main-mode">
              <div>
                {flag === 2 || flag === 3 ? (
                  <div
                    className="coinAvatar"
                    onClick={() => {
                      setFlag(1);
                    }}
                  >
                    <img src={headsCoin} />
                    Heads
                  </div>
                ) : (
                  <div
                    className="coinAvatar"
                    onClick={() => {
                      setFlag(2);
                    }}
                  >
                    <img src={randomCoin} />
                    Random
                  </div>
                )}
              </div>
              <div className="coinAvatarR">
                {flag === 1 ? (
                  <div className="coinAvatar">
                    <img src={headsCoin} />
                    Heads
                  </div>
                ) : flag === 2 ? (
                  <div className="coinAvatar">
                    <img src={randomCoin} />
                    Random
                  </div>
                ) : (
                  <div className="coinAvatar">
                    <img src={tailsCoin} />
                    Tails
                  </div>
                )}
              </div>
              <div className="coinAvatar">
                {flag === 2 || flag === 1 ? (
                  <div
                    className="coinAvatar"
                    onClick={() => {
                      setFlag(3);
                    }}
                  >
                    <img src={tailsCoin} />
                    Tails
                  </div>
                ) : (
                  <div
                    className="coinAvatar"
                    onClick={() => {
                      setFlag(2);
                    }}
                  >
                    <img src={randomCoin} />
                    Random
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="coinflip-history">
          <div>
            <Button variant="contained" startIcon={<RestorePageIcon />}>
              Latest BET
            </Button>
          </div>
          <div>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Dessert (100g serving)</TableCell>
                    <TableCell align="right">Calories</TableCell>
                    <TableCell align="right">Fat&nbsp;(g)</TableCell>
                    <TableCell align="right">Carbs&nbsp;(g)</TableCell>
                    <TableCell align="right">Protein&nbsp;(g)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.name}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      <TableCell align="right">{row.calories}</TableCell>
                      <TableCell align="right">{row.fat}</TableCell>
                      <TableCell align="right">{row.carbs}</TableCell>
                      <TableCell align="right">{row.protein}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>
    </Container>
  );
}
