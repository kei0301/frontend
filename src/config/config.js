export function getConfig(env) {
  switch (env) {
    case "production":
    case "mainnet":
      return {
        networkId: "mainnet",
        nodeUrl: "https://rpc.mainnet.near.org",
        walletUrl: "https://wallet.near.org",
        helperUrl: "https://helper.mainnet.near.org",
      };
    case "development":
    case "testnet":
      return {
        networkId: "testnet",
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
      };
    case "betanet":
      return {
        networkId: "betanet",
        nodeUrl: "https://rpc.betanet.near.org",
        walletUrl: "https://wallet.betanet.near.org",
        helperUrl: "https://helper.betanet.near.org",
      };
    case "local":
      return {
        networkId: "local",
        nodeUrl: "http://localhost:3030",
        keyPath: `${process.env.HOME}/.near/validator_key.json`,
        walletUrl: "http://localhost:4000/wallet",
      };
    case "test":
    case "ci":
      return {
        networkId: "shared-test",
        nodeUrl: "https://rpc.ci-testnet.near.org",
        masterAccount: "test.near",
      };
    case "ci-betanet":
      return {
        networkId: "shared-test-staging",
        nodeUrl: "https://rpc.ci-betanet.near.org",
        masterAccount: "test.near",
      };
    default:
      throw Error(
        `Unconfigured environment '${env}'. Can be configured in src/config/config.ts.`
      );
  }
}
export const AdminUsers = [
  "Punter",
  "917087055295701112",
  "877570907726549042",
  "915821948573995048",
  "944835356350644296",
  "1020567653519208479",
];
// export const SERVER_URL = 'http://193.203.202.113:2000/api';
// export const DOMAIN = "http://193.203.202.113:3000/"
export const SERVER_URL = "https://Degentown.nearverselabs.com/api";
export const DOMAIN = "https://Degentown.nearverselabs.com/";
export const CLIENT_ID = "1030826114182025296";
export const CLIENT_SECRET = "0wCUKaHhWDruFIDMFCUdzqXdTRgl4Ph1";
// export const COOKIE_SECRET = "ww6e9dyJ8z5q1WJ3tRqU88kuRsx0EYDQ"
// export const CRYPT_KEYS = [
//     'wiJtAH+FT9ARLoQUi0akXCyTBBunWDo1HQKOLkcdkK4=',
//     'yeGhlXraAijCGisxG862fg=='
// ]
