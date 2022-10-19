/* eslint-disable react-hooks/exhaustive-deps */
import { CLIENT_ID, DOMAIN } from "../config/config";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import image from "../assets/logo.svg";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigator = useNavigate();
  const disData = JSON.parse(localStorage.getItem("discordUser"));

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
    if (disData) navigator("/raffles");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ background: "rgb(23 23 23)", height: "100vh" }}>
      <Stack spacing={1} pt={10}>
        <img src={image} style={{ width: "150px", margin: "auto" }} alt="" />
        <Typography
          variant="h4"
          sx={{
            background: "linear-gradient(96.35deg, #F7BC14 0%, #E95E57 81.64%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
          }}
        >
          Vulcan+
        </Typography>
        <Box sx={{ color: "#9CA3AF" }}>
          <Typography sx={{ fontSize: "12px", textAlign: "center" }}>
            Powered by NEARverse Labs
          </Typography>
        </Box>
      </Stack>
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Button
          sx={{ textTransform: "unset" }}
          color="warning"
          variant="contained"
          onClick={handleDiscordLogin}
        >
          Login with Discord
        </Button>
      </Box>
    </div>
  );
}
