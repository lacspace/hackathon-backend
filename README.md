# ⚙️ PharmaGuard Backend: High-Performance Genomic AI Engine

[![API Status](https://img.shields.io/badge/API-Online-brightgreen.svg)](https://3.109.49.214.sslip.io/api/health)
[![Deployment](https://img.shields.io/badge/Cloud-AWS%20EC2-orange.svg)](https://aws.amazon.com/ec2/)
[![Runtime](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org)

This is the dedicated processing engine for the **PharmaGuard Platform**. It handles computationally expensive genomic file parsing, secure authentication, and advanced AI medical reporting.

---

## 🚀 API Endpoint

**Base URL**: `https://3.109.49.214.sslip.io/api`

### Core Services

- **VCF Parser**: High-speed SNP extraction from variant call files.
- **AI Interpreter**: Deep integration with Gemini 1.5 Flash for clinical summaries.
- **CORS Bridge**: Secured proxy for Vercel and local development origins.
- **Auth Worker**: JWT-based clinical master authentication.

---

## 🛠️ Tech Stack

- **Engine**: Node.js & Express (TypeScript)
- **Database**: Supabase (Postgres)
- **AI Layer**: Google Generative AI (Gemini)
- **Server**: Nginx (Reverse Proxy)
- **Process Manager**: PM2 (for 99.9% uptime)
- **Security**: Let's Encrypt (SSL/TLS)

---

## 🏗️ Architecture

The backend is optimized for the **RIFT 2026 Hackathon** specifications:

- **Decoupled Design**: Separated from the frontend to bypass serverless execution timeouts on Vercel.
- **Heavy Workloads**: Capable of processing large VCF files and cross-referencing against internal Drug-Database JSON stores.
- **Secure Secrets**: Managed via AWS environment injection and `.env` encapsulation.

---

## 📦 API Documentation (Brief)

| Method   | Endpoint      | Description                     |
| :------- | :------------ | :------------------------------ |
| **GET**  | `/health`     | Verify API Connectivity         |
| **POST** | `/auth/login` | Secure Clinical Master Access   |
| **POST** | `/upload`     | Genetic File (VCF) Processing   |
| **GET**  | `/profiles`   | Retrieve Processed Patient Data |

---

## 🛠️ Manual Deployment (on Ubuntu EC2)

1.  **Preparation**:

    ```bash
    ssh -i keys.pem ubuntu@your-ip
    sudo apt update && sudo apt install nodejs nginx certbot -y
    ```

2.  **Repo Setup**:

    ```bash
    git clone https://github.com/lacspace/hackathon-backend.git
    cd hackathon-backend
    npm install
    npm run build
    ```

3.  **Process Management**:

    ```bash
    pm2 start dist/index.js --name pharma-backend
    ```

4.  **SSL Configuration**:
    ```bash
    sudo certbot --nginx -d your-domain.com
    ```

---

## 👥 Team Members

- **Deep Naraya** (Lead Developer)
- **Abhishek jain** (Full-Stack Engineer)
- **Adarsh Kumar Rai** (Cloud Architect)

---

## 🧬 PharmaGuard Core

Built for precision medicine and zero-ADR clinical environments.
