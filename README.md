
# 🌾 AgroLink: Digitizing Agricultural Input Delivery in Ethiopia

## 👥 Contributors
- Kidist Shewangizawe  
- Mulualem Mekonin Mezmur  
- Amanuel Alemu Zewdu

---

## 📘 Project Synopsis

### 🧩 Problem Statement

In Ethiopia, brokers exploit the agricultural input supply system by stockpiling or reselling inputs like fertilizers at inflated prices. The lack of a digital distribution system results in:

- Unfair access for smallholder farmers
- Inflated input costs
- Loss of trust and transparency

---

### 💡 Planned Solution

AgroLink is a digital platform that enables **verified, direct access** to agricultural inputs through Fayda National ID. It provides:

- ✅ Authenticated input purchase via Fayda ID
- ✅ Real-time government verification
- ✅ Transparent, secure data logging
- ✅ Admin dashboards for analytics and monitoring

---

### 🎯 Expected Outcomes

#### 👨‍🌾 For Farmers
- Transparent pricing & access  
- Direct purchase without brokers  
- Trustworthy government system

#### 🏛️ For Government
- End-to-end traceability of inputs  
- Elimination of black-market interference  
- Real-time insight into shortages and distribution

---

## 🆔 Role of Fayda

Fayda National ID ensures:
- ✅ Only eligible farmers get inputs
- ✅ Secure verification and fraud prevention
- ✅ Traceable digital identity for transactions

---

## 🧰 Tech Stack

| Component       | Technology                      |
|----------------|----------------------------------|
| Frontend        | HTML, CSS, JavaScript           |
| Backend         | Node.js                         |
| Database        | MySQL                           |
| Authentication  | VeriFayda OIDC (OAuth 2.0)      |
| National ID     | Fayda Integration APIs          |
| Version Control | Git, GitHub                     |
| Deployment      | GitHub, ZIP archive (backend)   |
| Optional Hosting| Render / Vercel / Netlify       |

---

## 🛠️ Installation and Deployment

This section explains how to set up and run the project locally for both **frontend** and **backend**, especially since the backend is provided as a `.zip` file on GitHub.

---

### 📁 Frontend

> The frontend is a simple HTML/CSS/JS app that runs in the browser.

**Steps:**
1. Clone the repository or download it as a ZIP.
2. Extract it and open the `frontend` folder in **VS Code**.
3. Right-click `index.html` and choose **"Open with Live Server"** (if you use the Live Server extension).

✅ Done! Your frontend will now be accessible in your browser.

---

### 🔧 Backend (Node.js + VeriFayda + MySQL)

> The backend includes authentication, user verification, and MySQL integration.

#### 📦 Setup Instructions

1. **Unzip the backend folder** (named something like `FaydaBack.zip`) inside your project directory.
2. Open the backend folder in VS Code.
3. Create a `.env` file and paste the VeriFayda credentials provided in the hackathon kit.

Example `.env`:

```env
PORT=3000

# VeriFayda OIDC
CLIENT_ID=your-client-id
REDIRECT_URI=http://localhost:3000/callback
AUTHORIZATION_ENDPOINT=https://esignet.ida.fayda.et/authorize
TOKEN_ENDPOINT=https://esignet.ida.fayda.et/v1/esignet/oauth/v2/token
USERINFO_ENDPOINT=https://esignet.ida.fayda.et/v1/esignet/oidc/userinfo
ALGORITHM=RS256
CLIENT_ASSERTION_TYPE=urn:ietf:params:oauth:client-assertion-type:jwt-bearer
PRIVATE_KEY=your-private-key-single-line
EXPIRATION_TIME=15

# MySQL DB
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=fayda_users
```

4. Install backend dependencies:

```bash
npm install
```

5. Start the backend server:

```bash
node app.js
```

You should see:

```
✅ Connected to MySQL
🚀 Server running at http://localhost:3000
```

6. Visit the following URLs to test:

- Fayda login: `http://localhost:3000/auth/login`
- Test route: `http://localhost:3000/auth/test`

✅ After logging in, the authenticated Fayda user is stored in MySQL.

---

### 🐳 Docker Deployment (Optional)

> Docker support can be added with a `Dockerfile` and `docker-compose.yml`. Not required if running locally via Node.js.

---

## 📂 Repository Access

✅ HackHyperdrive has been invited to the repository.  
✅ freandis has been added as a collaborator.

---

## ✅ Project Status

- [x] Frontend built and hosted locally
- [x] Backend runs with Node.js + VeriFayda + MySQL
- [x] Authentication functional and tested
- [x] Backend delivered in `.zip` as per checklist
- [x] README updated with full instructions

---

## 🚀 Let's Empower Farmers

AgroLink enables farmers to bypass brokers, receive verified support, and build trust in Ethiopia's agricultural systems — all through open technology.
