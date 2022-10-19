import React, { lazy, useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { initialCrossword, WalletContext } from "./contexts/accounts";
import { Routes, Route } from "react-router-dom";
import Loadable from "./utils/loadable";
import { Web3ReactProvider } from "@web3-react/core";
import Web3 from "web3";

import { Buffer } from "buffer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import SolWalletProvider from "./config/wallet";

const Layout = Loadable(lazy(() => import("./layout")));
const DiscordLogin = Loadable(lazy(() => import("./pages/login")));
const Raffle = Loadable(lazy(() => import("./pages/raffle")));
const Raffle2 = Loadable(lazy(() => import("./pages/raffle2")));
const Account = Loadable(lazy(() => import("./pages/account")));
const CreateNewRaffle = Loadable(lazy(() => import("./pages/create")));
const Callback = Loadable(lazy(() => import("./pages/callback")));
const CoinFlip = Loadable(lazy(() => import("./pages/coinflip")));

// eslint-disable-next-line no-undef
globalThis.Buffer = Buffer;

export default function App() {
  const [wallet, setWallet] = useState(undefined);
  const [walletFlag, setwalletFlag] = useState(true);
  const [wAddress, setWAddress] = useState();

  const init = useCallback(async () => {
    const getProvider = () => {
      if ("martian" in window) {
        return window.martian;
      }
    };
    setWallet(getProvider);
  }, []);

  function getLibrary(provider) {
    return new Web3(provider);
  }

  useEffect(() => {
    init();
  }, [init]);

  return (
    <SolWalletProvider>
      <WalletContext.Provider value={wallet}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Router>
            <Routes>
              <Route element={<Layout getWallet={setwalletFlag} />}>
                <Route path="/auth/callback" element={<Callback />} />
                <Route path="/" element={<Raffle walletFlag={walletFlag} />} />
                <Route
                  path="/raffles"
                  element={<Raffle walletFlag={walletFlag} />}
                />
              </Route>
            </Routes>
          </Router>
        </Web3ReactProvider>
        <ToastContainer />
      </WalletContext.Provider>
    </SolWalletProvider>
  );
}
