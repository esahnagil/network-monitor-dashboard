import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// General settings schema
const generalSettingsSchema = z.object({
  refreshInterval: z.coerce.number().min(5, {
    message: "Refresh interval must be at least 5 seconds",
  }).max(3600, {
    message: "Refresh interval must not exceed 3600 seconds",
  }),
  autoAcknowledge: z.boolean().default(false),
  autoResolve: z.boolean().default(false),
  retryCount: z.coerce.number().min(1).max(10),
});

// Notification settings schema
const notificationSettingsSchema = z.object({
  emailEnabled: z.boolean().default(false),
  emailRecipients: z.string().optional(),
  slackEnabled: z.boolean().default(false),
  slackWebhook: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  severity: z.enum(["all", "warning", "danger"]).default("all"),
});

// User settings schema
const userSettingsSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email",
  }),
  currentPassword: z.string().min(1, {
    message: "Please enter your current password",
  }),
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }).optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;
type UserSettingsValues = z.infer<typeof userSettingsSchema>;

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  // General settings form
  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      refreshInterval: 60,
      autoAcknowledge: false,
      autoResolve: false,
      retryCount: 3,
    },
  });

  // Notification settings form
  const notificationForm = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailEnabled: false,
      emailRecipients: "",
      slackEnabled: false,
      slackWebhook: "",
      severity: "all",
    },
  });

  // User settings form
  const userForm = useForm<UserSettingsValues>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      username: "admin",
      email: "admin@example.com",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Form submission handlers
  const onGeneralSubmit = (data: GeneralSettingsValues) => {
    console.log("General settings:", data);
    toast({
      title: "Settings Updated",
      description: "General settings have been saved successfully.",
    });
  };

  const onNotificationSubmit = (data: NotificationSettingsValues) => {
    console.log("Notification settings:", data);
    toast({
      title: "Settings Updated",
      description: "Notification settings have been saved successfully.",
    });
  };

  const onUserSubmit = (data: UserSettingsValues) => {
    console.log("User settings:", data);
    toast({
      title: "Settings Updated",
      description: "User settings have been saved successfully.",
    });
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-gray-600">Configure application settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="user">User Account</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure system-wide monitoring settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                  <FormField
                    control={generalForm.control}
                    name="refreshInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dashboard Refresh Interval (seconds)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          How often the dashboard will refresh data
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="retryCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monitoring Retry Count</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Number of retries before marking a service as down
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={generalForm.control}
                      name="autoAcknowledge"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Auto-Acknowledge Alerts</FormLabel>
                            <FormDescription>
                              Automatically acknowledge alerts after a certain period
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="autoResolve"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Auto-Resolve Alerts</FormLabel>
                            <FormDescription>
                              Automatically resolve alerts when service recovers
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit">Save General Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <FormField
                    control={notificationForm.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alert Severity Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select severity level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Alerts</SelectItem>
                            <SelectItem value="warning">Warning and Critical</SelectItem>
                            <SelectItem value="danger">Critical Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose which alert severity levels trigger notifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications via email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {notificationForm.watch("emailEnabled") && (
                      <FormField
                        control={notificationForm.control}
                        name="emailRecipients"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Recipients</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com, another@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Comma-separated list of email addresses
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="slackEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Slack Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications via Slack
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {notificationForm.watch("slackEnabled") && (
                      <FormField
                        control={notificationForm.control}
                        name="slackWebhook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slack Webhook URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://hooks.slack.com/services/..." {...field} />
                            </FormControl>
                            <FormDescription>
                              Slack webhook URL for incoming WebHooks integration
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <Button type="submit">Save Notification Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Settings */}
        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle>User Account</CardTitle>
              <CardDescription>
                Manage your account settings and password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={userForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 border-t pt-4 mt-4">
                    <h3 className="text-lg font-medium">Change Password</h3>

                    <FormField
                      control={userForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Leave blank to keep current password
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit">Save User Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Settings;
