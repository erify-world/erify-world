# ERIFY™ Node.js Web App Template

Deploy a Node.js web application to Azure App Service (Linux) with ERIFY™ branding and best practices.

## 🚀 Features

- **Node.js 18 LTS** runtime on Linux
- **HTTPS Only** with TLS 1.2 minimum
- **System Assigned Managed Identity** for secure access
- **Git deployment** from ERIFY™ repositories
- **ERIFY™ branding** with luxury tags
- **Production-ready** configuration

## 📦 What's Deployed

- **App Service Plan** (Linux, B1 SKU)
- **Web App** (Node.js 18 LTS)
- **Source Control** (optional Git deployment)

## 🛠 Quick Deploy

### Using Azure CLI

```bash
# Create resource group
az group create --name erify-world-rg --location "East US"

# Deploy ARM template
az deployment group create \
  --resource-group erify-world-rg \
  --template-file azuredeploy.json \
  --parameters @azuredeploy.parameters.json

# Deploy Bicep template (alternative)
az deployment group create \
  --resource-group erify-world-rg \
  --template-file main.bicep \
  --parameters @azuredeploy.parameters.json
```

### Using Azure Portal

1. Click "Deploy to Azure" button (add to your README)
2. Fill in the parameters
3. Review and deploy

## ⚙️ Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `webAppName` | string | `erify-webapp-{uniqueString}` | Name of the web application |
| `location` | string | Resource group location | Azure region for deployment |
| `sku` | string | `B1` | App Service Plan SKU (F1, B1, B2, etc.) |
| `linuxFxVersion` | string | `NODE\|18-lts` | Node.js runtime version |
| `repoUrl` | string | ERIFY World repo | Git repository URL for deployment |

## 🏷️ ERIFY™ Tags

All resources are tagged with:
- **Environment**: ERIFY™ Production
- **Project**: ERIFY™ World
- **Owner**: ERIFY™ Technologies
- **Purpose**: Node.js Web Application
- **Stack**: Node.js 18 LTS

## 🔧 Post-Deployment

After deployment:

1. **Configure App Settings** in the Azure portal
2. **Set up Custom Domain** and SSL certificate
3. **Configure CI/CD** with GitHub Actions
4. **Enable Application Insights** for monitoring
5. **Set up backup and scaling** rules

## 🌍 ERIFY™ Integration

This template includes:
- Environment variables for ERIFY™ configuration
- Managed identity for secure Azure resource access
- Integration points for ERIFY™ services
- Optimized for Cloudflare Workers integration

---

⚡ *Building legacy systems, inspiring the world, and creating the future of digital luxury.*