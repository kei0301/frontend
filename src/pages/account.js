import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";

import { useWallet } from "../contexts/accounts";
import { Contract, utils } from "near-api-js";
import { TokenContractAddress } from "../config/contract";

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

export default function Account() {
  const wallet = useWallet();
  const [account, setAccount] = useState(undefined);
  const [balance, setBalance] = useState(0);

  const disconnectWallet = async () => {
    await window.martian.disconnect();
    setAccount(undefined);
    setBalance(0);
  };

  const connectWallet = async () => {
    const client = new AptosClient(NODE_URL);
    var wallet = await window.martian.connect();
    let resources = await client.getAccountResources(wallet.address);
    let accountResource = resources.find((r) => r.type === aptosCoinStore);
    let balance = parseInt((accountResource?.data).coin.value);
    setBalance(balance / 100000000);
    setAccount(wallet.address);
  };

  useEffect(() => {
    if (wallet.address) {
      connectWallet();
    }
  }, [wallet]);
  return (
    <Container sx={{ pt: 5 }}>
      <Card sx={{ minWidth: 275 }}>
        <CardHeader title="Wallets" sx={{ borderBottom: "solid 1px grey" }} />
        <CardContent>
          {account ? (
            <Stack className="clm-to-row">
              <Typography
                sx={{ fontSize: 14 }}
                color="text.secondary"
                gutterBottom
              >
                Aptos Wallet : {account}
              </Typography>
              <Typography
                sx={{ fontSize: 14 }}
                color="text.secondary"
                gutterBottom
              >
                Aptos Balance : {balance.toFixed(3)}
              </Typography>
              <Button color="error" onClick={disconnectWallet}>
                Disconnect Wallet
              </Button>
            </Stack>
          ) : (
            <div style={{ display: "flex" }}>
              <p>Please connect your wallet</p>
              <div style={{ flex: "1" }}></div>
              <Button
                sx={{ textTransform: "unset" }}
                variant="contained"
                onClick={connectWallet}
              >
                Wallet Connect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
