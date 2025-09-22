import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useAuth } from '@/contexts/AuthContext'
import { 
  Settings,
  Save,
  Shield,
  Globe,
  Bell,
  Mail,
  Database,
  Key,
  Users,
  CreditCard,
  FileText,
  Zap,
  Server,
  Lock,
  Activity,
  AlertTriangle
} from 'lucide-react'

interface PlatformSettings {
  siteName: string
  siteDescription: string
  adminEmail: string
  supportEmail: string
  defaultLanguage: string
  timezone: string
  currency: string
  enableRegistration: boolean
  enableGuestAccess: boolean
  maintenanceMode: boolean
  maxFileUploadSize: number
  sessionTimeout: number
}

interface SecuritySettings {
  passwordMinLength: number
  requireTwoFactor: boolean
  enableCaptcha: boolean
  loginAttempts: number
  lockoutDuration: number
  enableAuditLog: boolean
  ipWhitelist: string
  allowedFileTypes: string
  dataRetentionDays: number
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  systemAlerts: boolean
  weeklyReports: boolean
  userActivityAlerts: boolean
  securityAlerts: boolean
}

interface PaymentSettings {
  stripePublicKey: string
  stripeSecretKey: string
  paypalClientId: string
  paypalClientSecret: string
  enableStripe: boolean
  enablePaypal: boolean
  defaultCurrency: string
  taxRate: number
  processingFee: number
}

const AdminSettings: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('platform')
  const [hasChanges, setHasChanges] = useState(false)

  // Platform Settings
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    siteName: 'Learn Academy',
    siteDescription: 'Premium language learning platform connecting students with expert teachers',
    adminEmail: 'admin@learnacademy.com',
    supportEmail: 'support@learnacademy.com',
    defaultLanguage: 'en',
    timezone: 'UTC',
    currency: 'USD',
    enableRegistration: true,
    enableGuestAccess: true,
    maintenanceMode: false,
    maxFileUploadSize: 10, // MB
    sessionTimeout: 60 // minutes
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordMinLength: 8,
    requireTwoFactor: false,
    enableCaptcha: true,
    loginAttempts: 5,
    lockoutDuration: 30, // minutes
    enableAuditLog: true,
    ipWhitelist: '',
    allowedFileTypes: 'jpg,jpeg,png,pdf,doc,docx',
    dataRetentionDays: 365
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    systemAlerts: true,
    weeklyReports: true,
    userActivityAlerts: true,
    securityAlerts: true
  })

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripePublicKey: '',
    stripeSecretKey: '',
    paypalClientId: '',
    paypalClientSecret: '',
    enableStripe: true,
    enablePaypal: false,
    defaultCurrency: 'USD',
    taxRate: 0,
    processingFee: 2.9
  })

  const handleSaveSettings = () => {
    // Here you would typically send the settings to the API
    console.log('Saving settings:', {
      platform: platformSettings,
      security: securitySettings,
      notifications: notificationSettings,
      payments: paymentSettings
    })
    
    setHasChanges(false)
    // Show success toast
  }

  const handleSettingChange = (category: string, field: string, value: any) => {
    setHasChanges(true)
    
    switch (category) {
      case 'platform':
        setPlatformSettings(prev => ({ ...prev, [field]: value }))
        break
      case 'security':
        setSecuritySettings(prev => ({ ...prev, [field]: value }))
        break
      case 'notifications':
        setNotificationSettings(prev => ({ ...prev, [field]: value }))
        break
      case 'payments':
        setPaymentSettings(prev => ({ ...prev, [field]: value }))
        break
    }
  }

  const SettingItem = ({ 
    icon: Icon, 
    label, 
    description, 
    children 
  }: {
    icon: any
    label: string
    description?: string
    children: React.ReactNode
  }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5 text-primary" />
        <div>
          <div className="font-medium">{label}</div>
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {children}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure platform settings and preferences</p>
        </div>
        <Button 
          onClick={handleSaveSettings}
          disabled={!hasChanges}
          className={hasChanges ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <Save className="h-4 w-4 mr-2" />
          {hasChanges ? 'Save Changes' : 'No Changes'}
        </Button>
      </div>

      {/* Warning Banner */}
      {hasChanges && (
        <div className="flex items-center space-x-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div className="text-sm">
            <strong>Unsaved Changes:</strong> You have unsaved changes. Make sure to save before leaving this page.
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Platform Settings Tab */}
        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
              <CardDescription>Configure basic platform information and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={platformSettings.siteName}
                    onChange={(e) => handleSettingChange('platform', 'siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={platformSettings.adminEmail}
                    onChange={(e) => handleSettingChange('platform', 'adminEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={platformSettings.supportEmail}
                    onChange={(e) => handleSettingChange('platform', 'supportEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <Select 
                    value={platformSettings.defaultLanguage} 
                    onValueChange={(value) => handleSettingChange('platform', 'defaultLanguage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={platformSettings.timezone} 
                    onValueChange={(value) => handleSettingChange('platform', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select 
                    value={platformSettings.currency} 
                    onValueChange={(value) => handleSettingChange('platform', 'currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={platformSettings.siteDescription}
                  onChange={(e) => handleSettingChange('platform', 'siteDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Platform Behavior</h4>
                
                <SettingItem
                  icon={Users}
                  label="Enable User Registration"
                  description="Allow new users to register for accounts"
                >
                  <Switch
                    checked={platformSettings.enableRegistration}
                    onCheckedChange={(checked) => handleSettingChange('platform', 'enableRegistration', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Globe}
                  label="Enable Guest Access"
                  description="Allow non-registered users to access some content"
                >
                  <Switch
                    checked={platformSettings.enableGuestAccess}
                    onCheckedChange={(checked) => handleSettingChange('platform', 'enableGuestAccess', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Settings}
                  label="Maintenance Mode"
                  description="Temporarily disable site access for maintenance"
                >
                  <Switch
                    checked={platformSettings.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('platform', 'maintenanceMode', checked)}
                  />
                </SettingItem>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileUploadSize">Max File Upload Size (MB)</Label>
                  <Input
                    id="maxFileUploadSize"
                    type="number"
                    value={platformSettings.maxFileUploadSize}
                    onChange={(e) => handleSettingChange('platform', 'maxFileUploadSize', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={platformSettings.sessionTimeout}
                    onChange={(e) => handleSettingChange('platform', 'sessionTimeout', parseInt(e.target.value))}
                    min="15"
                    max="480"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Configuration</span>
              </CardTitle>
              <CardDescription>Configure security policies and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                    min="6"
                    max="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={securitySettings.loginAttempts}
                    onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
                    min="3"
                    max="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={securitySettings.lockoutDuration}
                    onChange={(e) => handleSettingChange('security', 'lockoutDuration', parseInt(e.target.value))}
                    min="5"
                    max="120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataRetentionDays">Data Retention (days)</Label>
                  <Input
                    id="dataRetentionDays"
                    type="number"
                    value={securitySettings.dataRetentionDays}
                    onChange={(e) => handleSettingChange('security', 'dataRetentionDays', parseInt(e.target.value))}
                    min="30"
                    max="2555"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Security Features</h4>
                
                <SettingItem
                  icon={Key}
                  label="Require Two-Factor Authentication"
                  description="Require 2FA for all admin accounts"
                >
                  <Switch
                    checked={securitySettings.requireTwoFactor}
                    onCheckedChange={(checked) => handleSettingChange('security', 'requireTwoFactor', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Shield}
                  label="Enable CAPTCHA"
                  description="Show CAPTCHA on login and registration forms"
                >
                  <Switch
                    checked={securitySettings.enableCaptcha}
                    onCheckedChange={(checked) => handleSettingChange('security', 'enableCaptcha', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Activity}
                  label="Enable Audit Log"
                  description="Log all administrative actions"
                >
                  <Switch
                    checked={securitySettings.enableAuditLog}
                    onCheckedChange={(checked) => handleSettingChange('security', 'enableAuditLog', checked)}
                  />
                </SettingItem>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                  <Input
                    id="allowedFileTypes"
                    value={securitySettings.allowedFileTypes}
                    onChange={(e) => handleSettingChange('security', 'allowedFileTypes', e.target.value)}
                    placeholder="jpg,jpeg,png,pdf,doc,docx"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated list of allowed file extensions</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                  <Textarea
                    id="ipWhitelist"
                    value={securitySettings.ipWhitelist}
                    onChange={(e) => handleSettingChange('security', 'ipWhitelist', e.target.value)}
                    placeholder="192.168.1.1, 10.0.0.0/8"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">One IP address or CIDR block per line</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>Configure system-wide notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Notification Channels</h4>
                
                <SettingItem
                  icon={Mail}
                  label="Email Notifications"
                  description="Send notifications via email"
                >
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Bell}
                  label="Push Notifications"
                  description="Send browser push notifications"
                >
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'pushNotifications', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Activity}
                  label="SMS Notifications"
                  description="Send notifications via SMS (requires SMS provider)"
                >
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'smsNotifications', checked)}
                  />
                </SettingItem>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                
                <SettingItem
                  icon={AlertTriangle}
                  label="System Alerts"
                  description="Critical system notifications"
                >
                  <Switch
                    checked={notificationSettings.systemAlerts}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'systemAlerts', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Shield}
                  label="Security Alerts"
                  description="Security-related notifications"
                >
                  <Switch
                    checked={notificationSettings.securityAlerts}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'securityAlerts', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Users}
                  label="User Activity Alerts"
                  description="Notifications about user registrations and activities"
                >
                  <Switch
                    checked={notificationSettings.userActivityAlerts}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'userActivityAlerts', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={FileText}
                  label="Weekly Reports"
                  description="Weekly platform usage reports"
                >
                  <Switch
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'weeklyReports', checked)}
                  />
                </SettingItem>

                <SettingItem
                  icon={Mail}
                  label="Marketing Emails"
                  description="Platform updates and marketing communications"
                >
                  <Switch
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'marketingEmails', checked)}
                  />
                </SettingItem>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Configuration</span>
              </CardTitle>
              <CardDescription>Configure payment processors and billing settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stripe Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Stripe Configuration</h4>
                  <Switch
                    checked={paymentSettings.enableStripe}
                    onCheckedChange={(checked) => handleSettingChange('payments', 'enableStripe', checked)}
                  />
                </div>
                {paymentSettings.enableStripe && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                      <Input
                        id="stripePublicKey"
                        value={paymentSettings.stripePublicKey}
                        onChange={(e) => handleSettingChange('payments', 'stripePublicKey', e.target.value)}
                        placeholder="pk_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                      <Input
                        id="stripeSecretKey"
                        type="password"
                        value={paymentSettings.stripeSecretKey}
                        onChange={(e) => handleSettingChange('payments', 'stripeSecretKey', e.target.value)}
                        placeholder="sk_..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* PayPal Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">PayPal Configuration</h4>
                  <Switch
                    checked={paymentSettings.enablePaypal}
                    onCheckedChange={(checked) => handleSettingChange('payments', 'enablePaypal', checked)}
                  />
                </div>
                {paymentSettings.enablePaypal && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                      <Input
                        id="paypalClientId"
                        value={paymentSettings.paypalClientId}
                        onChange={(e) => handleSettingChange('payments', 'paypalClientId', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paypalClientSecret">PayPal Client Secret</Label>
                      <Input
                        id="paypalClientSecret"
                        type="password"
                        value={paymentSettings.paypalClientSecret}
                        onChange={(e) => handleSettingChange('payments', 'paypalClientSecret', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* General Payment Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">General Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <Select 
                      value={paymentSettings.defaultCurrency} 
                      onValueChange={(value) => handleSettingChange('payments', 'defaultCurrency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={paymentSettings.taxRate}
                      onChange={(e) => handleSettingChange('payments', 'taxRate', parseFloat(e.target.value))}
                      min="0"
                      max="50"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="processingFee">Processing Fee (%)</Label>
                    <Input
                      id="processingFee"
                      type="number"
                      value={paymentSettings.processingFee}
                      onChange={(e) => handleSettingChange('payments', 'processingFee', parseFloat(e.target.value))}
                      min="0"
                      max="10"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminSettings