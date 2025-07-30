require("dotenv").config();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const qs = require("querystring");

// 1. Redirect to VeriFayda Login
exports.login = (req, res) => {
  const params = qs.stringify({
    response_type: "code",
    client_id: process.env.CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
    scope: "openid profile",
  });

  res.redirect(`${process.env.AUTHORIZATION_ENDPOINT}?${params}`);
};

// 2. Handle Fayda Callback
exports.callback = async (req, res) => {
  const { code } = req.query;

  if (!code) return res.status(400).send("Missing code");

  try {
    const privateKey = JSON.parse(process.env.PRIVATE_KEY);

    const assertion = jwt.sign(
      {
        iss: process.env.CLIENT_ID,
        sub: process.env.CLIENT_ID,
        aud: process.env.TOKEN_ENDPOINT,
        exp:
          Math.floor(Date.now() / 1000) +
          parseInt(process.env.EXPIRATION_TIME) * 60,
        jti: Math.random().toString(36).substring(2),
      },
      privateKey,
      {
        algorithm: process.env.ALGORITHM,
        keyid: privateKey.kid,
        header: {
          alg: process.env.ALGORITHM,
          typ: "JWT",
        },
      }
    );

    const tokenRes = await axios.post(
      process.env.TOKEN_ENDPOINT,
      qs.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI,
        client_assertion_type: process.env.CLIENT_ASSERTION_TYPE,
        client_assertion: assertion,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenRes.data;

    const userRes = await axios.get(process.env.USERINFO_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    res.json({
      message: "Authentication successful!",
      user: userRes.data,
    });
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).send("Fayda authentication failed.");
  }
};
