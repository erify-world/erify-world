# ERIFY™ Azure Templates

Azure Resource Manager (ARM) and Bicep templates curated for the ERIFY™ ecosystem. These templates enable rapid deployment of Azure infrastructure for ERIFY™ World, Flame Feed, ERIVOX, and ERIFY Wallet services.

---

## 🚀 Featured Templates

### Web Applications
- **[Node.js Web App](./web-apps/nodejs-webapp/)** → Deploy Node.js apps with Azure App Service
- **[Function Apps](./functions/erify-functions/)** → Serverless functions for ERIFY™ services
- **[API Management](./api-management/erify-api/)** → API gateway for ERIFY™ services

### Infrastructure
- **[Storage & CDN](./storage/erify-storage/)** → Azure Storage + CDN for static assets
- **[Database](./database/erify-db/)** → Azure SQL/CosmosDB for ERIFY™ data
- **[Security](./security/erify-security/)** → Key Vault, certificates, and authentication

---

## 🛠 Usage

Each template includes:
- **ARM template** (`.json`) for infrastructure as code
- **Bicep template** (`.bicep`) for modern ARM authoring
- **Parameter files** for different environments (dev, staging, prod)
- **Deployment scripts** for automation
- **Documentation** specific to ERIFY™ use cases

---

## 🌍 ERIFY™ Branding

All templates are customized with:
- ERIFY™ naming conventions
- Luxury branding tags
- Security best practices
- Cost optimization
- Integration with existing Cloudflare Workers

---

## 📦 Quick Deploy

```bash
# Deploy Node.js web app
az deployment group create \
  --resource-group erify-world-rg \
  --template-file web-apps/nodejs-webapp/azuredeploy.json \
  --parameters @web-apps/nodejs-webapp/azuredeploy.parameters.json

# Deploy with Bicep
az deployment group create \
  --resource-group erify-world-rg \
  --template-file web-apps/nodejs-webapp/main.bicep \
  --parameters @web-apps/nodejs-webapp/main.parameters.json
```

---

## 🔗 Integration with ERIFY™ Stack

These templates complement the existing ERIFY™ infrastructure:
- **Cloudflare Workers** → Primary edge compute
- **Azure Functions** → Backend processing
- **Azure Storage** → File storage and backups
- **Azure CDN** → Global content delivery
- **Azure Key Vault** → Secrets management

---

⚡ *Building legacy systems, inspiring the world, and creating the future of digital luxury.*