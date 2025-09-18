@description('ERIFY™ Web app name.')
@minLength(2)
param webAppName string = 'erify-webapp-${uniqueString(resourceGroup().id)}'

@description('Location for all resources.')
param location string = resourceGroup().location

@description('The SKU of App Service Plan.')
param sku string = 'B1'

@description('The Runtime stack of current web app (Node.js for ERIFY™)')
param linuxFxVersion string = 'NODE|18-lts'

@description('Optional Git Repo URL')
param repoUrl string = 'https://github.com/erify-world/erify-world.git'

var appServicePlanPortalName = 'AppServicePlan-${webAppName}'

resource appServicePlan 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: appServicePlanPortalName
  location: location
  sku: {
    name: sku
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
  tags: {
    Environment: 'ERIFY™ Production'
    Project: 'ERIFY™ World'
    Owner: 'ERIFY™ Technologies'
    Purpose: 'Luxury Digital Infrastructure'
  }
}

resource webApp 'Microsoft.Web/sites@2021-02-01' = {
  name: webAppName
  location: location
  properties: {
    httpsOnly: true
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: linuxFxVersion
      minTlsVersion: '1.2'
      ftpsState: 'FtpsOnly'
      appSettings: [
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'ERIFY_ENVIRONMENT'
          value: 'azure'
        }
      ]
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
  tags: {
    Environment: 'ERIFY™ Production'
    Project: 'ERIFY™ World'
    Owner: 'ERIFY™ Technologies'
    Purpose: 'Node.js Web Application'
    Stack: 'Node.js 18 LTS'
  }
}

resource webAppSourceControl 'Microsoft.Web/sites/sourcecontrols@2021-02-01' = if(contains(repoUrl,'http')){
  name: 'web'
  parent: webApp
  properties: {
    repoUrl: repoUrl
    branch: 'main'
    isManualIntegration: true
  }
}
