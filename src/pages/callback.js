import axios from "axios";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CLIENT_ID, CLIENT_SECRET, DOMAIN } from "../config/config";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { createNotify, createUser } from "../utils/service";

const OAuthScope = ["identify"].join(" ");

export default function Dashboard() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isInitialRender = useRef(true)
    const discordCode = searchParams.get("code");

    const getDiscordData = async () => {
        if (discordCode) {
            const OAuthData = new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "authorization_code",
                code: discordCode,
                redirect_uri: `${DOMAIN}auth/callback`,
            });
            const { data } = await axios.post(
                "https://discordapp.com/api/v9/oauth2/token",
                OAuthData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            if (data.scope !== OAuthScope) {
                createNotify(`Expected scope "${OAuthScope}" but received scope "${data.scope}"`)
            }
            const { data: user } = await axios.get(
                "https://discordapp.com/api/v9/users/@me",
                {
                    headers: {
                        Authorization: `Bearer ${data.access_token}`,
                    },
                }
            );
            if (user.email === null) {
                createNotify("Please verify your Discord's account E-mail before logging in.")
            }

            const result = await createUser(user);
            if (result.data.status === true) {
                localStorage.setItem('discordUser', JSON.stringify(user))
                navigate('/raffles');
            } else {
                navigate('/login');
            }
        };
    }

    useEffect(() => {
        if (isInitialRender.current) {
            (async () => {
                if (!JSON.parse(localStorage.getItem("discordUser"))) {
                    getDiscordData();
                }
            })()
        }
        return () => isInitialRender.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div>
        </div>
    );
}
