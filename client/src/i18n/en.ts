/**
 * English language file
 */
export const en = {
  // General
  app: {
    name: "NetGuardian",
    loading: "Loading...",
    error: "An error occurred",
    retry: "Retry",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    filter: "Filter",
    search: "Search...",
    noData: "No data found",
    confirm: "Confirm",
    actions: "Actions",
    moreInfo: "More Information",
    required: "This field is required",
    optional: "(optional)",
    settings: "Settings"
  },

  // Notifications
  notifications: {
    success: "Success!",
    error: "Error!",
    warning: "Warning!",
    info: "Information",
    connectionEstablished: "Connection established",
    connectionLost: "Connection lost",
    reconnecting: "Reconnecting..."
  },

  // Authentication
  auth: {
    login: "Login",
    logout: "Logout",
    username: "Username",
    password: "Password",
    forgotPassword: "Forgot Password",
    register: "Register",
    loginError: "Login failed",
    invalidCredentials: "Invalid username or password"
  },

  // Dashboard
  dashboard: {
    title: "Dashboard",
    overview: "Overview",
    totalDevices: "Total Devices",
    onlineDevices: "Online Devices",
    offlineDevices: "Offline Devices",
    uptime: "Uptime",
    performance: "Performance",
    recentAlerts: "Recent Alerts",
    status: {
      online: "Online",
      offline: "Offline",
      warning: "Warning",
      error: "Error",
      unknown: "Unknown"
    }
  },

  // Devices
  devices: {
    title: "Devices",
    add: "Add New Device",
    edit: "Edit Device",
    delete: "Delete Device",
    deleteConfirm: "Are you sure you want to delete this device?",
    name: "Device Name",
    ipAddress: "IP Address",
    type: "Device Type",
    status: "Status",
    location: "Location",
    lastSeen: "Last Seen",
    uptime: "Uptime",
    details: "Device Details",
    types: {
      server: "Server",
      router: "Router",
      switch: "Switch",
      firewall: "Firewall",
      workstation: "Workstation",
      printer: "Printer",
      other: "Other"
    }
  },

  // Monitoring
  monitoring: {
    title: "Monitoring",
    add: "Add New Monitor",
    edit: "Edit Monitor",
    delete: "Delete Monitor",
    deleteConfirm: "Are you sure you want to delete this monitor?",
    type: "Monitor Type",
    device: "Device",
    interval: "Check Interval",
    status: "Status",
    lastCheck: "Last Check",
    nextCheck: "Next Check",
    responseTime: "Response Time",
    details: "Monitor Details",
    enabled: "Enabled",
    disabled: "Disabled",
    enableDisable: "Enable/Disable",
    connectionSuccess: "Successfully connected to monitoring server",
    connectionLost: "Connection to monitoring server has been lost",
    reconnecting: "Attempting to reconnect to monitoring server",
    types: {
      icmp: "ICMP (Ping)",
      http: "HTTP/HTTPS",
      tcp: "TCP Port",
      snmp: "SNMP",
      custom: "Custom"
    },
    configuration: {
      title: "Monitor Configuration",
      timeout: "Timeout (ms)",
      retries: "Retries",
      port: "Port",
      url: "URL",
      method: "Method",
      username: "Username",
      password: "Password",
      community: "SNMP Community",
      version: "SNMP Version",
      oid: "OID",
      expectedValue: "Expected Value",
      expectedStatusCode: "Expected Status Code",
      script: "Custom Script",
      headers: "HTTP Headers",
      body: "HTTP Request Body"
    }
  },

  // Alerts
  alerts: {
    title: "Alerts",
    add: "Add New Alert",
    edit: "Edit Alert",
    delete: "Delete Alert",
    deleteConfirm: "Are you sure you want to delete this alert?",
    type: "Alert Type",
    device: "Device",
    monitor: "Monitor",
    status: "Status",
    timestamp: "Time",
    message: "Message",
    details: "Alert Details",
    acknowledge: "Acknowledge",
    resolve: "Resolve",
    severity: {
      info: "Info",
      warning: "Warning",
      critical: "Critical",
      error: "Error"
    },
    alertStatus: {
      active: "Active",
      acknowledged: "Acknowledged",
      resolved: "Resolved"
    },
    notification: {
      title: "New Alert",
      message: "New alert for {{deviceName}}: {{message}}"
    }
  },

  // Settings
  settings: {
    title: "Settings",
    general: "General Settings",
    notifications: "Notification Settings",
    security: "Security Settings",
    users: "User Management",
    backup: "Backup & Restore",
    language: "Language",
    theme: "Theme",
    timeZone: "Time Zone",
    dateFormat: "Date Format",
    save: "Save Settings",
    reset: "Reset to Default",
    languages: {
      tr: "Turkish",
      en: "English"
    },
    themes: {
      light: "Light",
      dark: "Dark",
      system: "System"
    },
    notificationSettings: {
      email: "Email Notifications",
      push: "Push Notifications",
      sms: "SMS Notifications",
      enabled: "Enabled",
      disabled: "Disabled",
      recipients: "Recipients",
      addRecipient: "Add Recipient",
      testNotification: "Send Test Notification"
    }
  },

  // Error pages
  errors: {
    notFound: {
      title: "Page Not Found",
      message: "The page you are looking for doesn't exist or has been moved.",
      goBack: "Go to Home"
    },
    serverError: {
      title: "Server Error",
      message: "A server error occurred. Please try again later.",
      goBack: "Go to Home"
    },
    noConnection: {
      title: "Connection Error",
      message: "Cannot connect to the server. Please check your internet connection.",
      retry: "Try Again"
    }
  }
};