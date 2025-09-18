#!/bin/bash

# ERIFY™ Azure Deployment Script
# Deploy ERIFY™ Azure templates with luxury branding

set -e

echo "🚀 ERIFY™ Azure Deployment Script"
echo "⚡ Building legacy systems, inspiring the world"
echo ""

# Default values
RESOURCE_GROUP="erify-world-rg"
LOCATION="East US"
TEMPLATE_TYPE="webapp"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -g|--resource-group)
      RESOURCE_GROUP="$2"
      shift 2
      ;;
    -l|--location)
      LOCATION="$2"
      shift 2
      ;;
    -t|--template)
      TEMPLATE_TYPE="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  -g, --resource-group    Azure resource group name (default: erify-world-rg)"
      echo "  -l, --location         Azure location (default: East US)"
      echo "  -t, --template         Template type: webapp, functions (default: webapp)"
      echo "  -h, --help             Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0 --template webapp"
      echo "  $0 --template functions --resource-group my-rg"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo "💎 Deploying ERIFY™ $TEMPLATE_TYPE template"
echo "📍 Resource Group: $RESOURCE_GROUP"
echo "🌍 Location: $LOCATION"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "❌ Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

# Create resource group if it doesn't exist
echo "🔧 Ensuring resource group exists..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output table

# Deploy the template
case $TEMPLATE_TYPE in
  webapp)
    echo "🌐 Deploying Node.js Web App..."
    az deployment group create \
      --resource-group "$RESOURCE_GROUP" \
      --template-file azure-templates/web-apps/nodejs-webapp/azuredeploy.json \
      --parameters @azure-templates/web-apps/nodejs-webapp/azuredeploy.parameters.json \
      --output table
    ;;
  functions)
    echo "⚡ Deploying Azure Functions..."
    az deployment group create \
      --resource-group "$RESOURCE_GROUP" \
      --template-file azure-templates/functions/erify-functions/azuredeploy.json \
      --parameters @azure-templates/functions/erify-functions/azuredeploy.parameters.json \
      --output table
    ;;
  *)
    echo "❌ Unknown template type: $TEMPLATE_TYPE"
    echo "Available templates: webapp, functions"
    exit 1
    ;;
esac

echo ""
echo "✨ ERIFY™ deployment completed successfully!"
echo "🔥 From the ashes to the stars ✨"