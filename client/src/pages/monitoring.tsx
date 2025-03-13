import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Device, Monitor } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Monitor type definitions
const monitorTypes = [
  { value: 'icmp', label: 'ICMP (Ping)' },
  { value: 'snmp', label: 'SNMP' },
  { value: 'http', label: 'HTTP' },
  { value: 'tcp', label: 'TCP Port' }
];

// Base monitor schema
const baseMonitorSchema = z.object({
  deviceId: z.coerce.number().min(1, { message: "Please select a device" }),
  type: z.string().min(1, { message: "Please select a monitor type" }),
  enabled: z.boolean().default(true),
  interval: z.coerce.number().min(10, { message: "Interval must be at least 10 seconds" }).default(60)
});

// ICMP monitor schema
const icmpMonitorSchema = baseMonitorSchema.extend({
  type: z.literal("icmp"),
  config: z.object({
    timeout: z.coerce.number().min(1).default(5),
    packetSize: z.coerce.number().min(1).default(56),
    count: z.coerce.number().min(1).default(3)
  })
});

// SNMP monitor schema
const snmpMonitorSchema = baseMonitorSchema.extend({
  type: z.literal("snmp"),
  config: z.object({
    community: z.string().default("public"),
    version: z.enum(["1", "2c", "3"]).default("2c"),
    port: z.coerce.number().default(161),
    oids: z.array(z.string()).min(1, { message: "At least one OID is required" })
  })
});

// HTTP monitor schema
const httpMonitorSchema = baseMonitorSchema.extend({
  type: z.literal("http"),
  config: z.object({
    url: z.string().url({ message: "Please enter a valid URL" }),
    method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET"),
    headers: z.string().optional(),
    body: z.string().optional(),
    expectedStatus: z.coerce.number().min(100).max(599).default(200),
    timeout: z.coerce.number().min(1).default(5),
    validateSSL: z.boolean().default(true)
  })
});

// TCP monitor schema
const tcpMonitorSchema = baseMonitorSchema.extend({
  type: z.literal("tcp"),
  config: z.object({
    port: z.coerce.number().min(1).max(65535),
    timeout: z.coerce.number().min(1).default(5)
  })
});

// Combined monitor schema
const monitorSchema = z.discriminatedUnion("type", [
  icmpMonitorSchema,
  snmpMonitorSchema,
  httpMonitorSchema,
  tcpMonitorSchema
]);

type MonitorFormValues = z.infer<typeof monitorSchema>;

// Helper for transforming form data
const transformFormData = (data: any): MonitorFormValues => {
  // Transform headers string to object for HTTP monitors
  if (data.type === 'http' && data.config.headers) {
    try {
      const headersObj = JSON.parse(data.config.headers);
      data.config.headers = headersObj;
    } catch (e) {
      // If parsing fails, leave as string and let backend handle it
    }
  }

  // Handle SNMP OIDs
  if (data.type === 'snmp' && typeof data.config.oids === 'string') {
    data.config.oids = data.config.oids.split('\n').map(oid => oid.trim()).filter(Boolean);
  }

  return data;
};

const MonitorTypeIcon = ({ type }: { type: string }) => {
  const icons: Record<string, JSX.Element> = {
    'icmp': (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 text-blue-500" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
    ),
    'snmp': (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 text-purple-500" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" 
        />
      </svg>
    ),
    'http': (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 text-green-500" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" 
        />
      </svg>
    ),
    'tcp': (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 text-yellow-500" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
        />
      </svg>
    )
  };

  return icons[type] || (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-5 w-5 text-gray-500" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" 
      />
    </svg>
  );
};

const Monitoring = () => {
  const { toast } = useToast();
  const [isAddMonitorOpen, setIsAddMonitorOpen] = useState(false);
  const [selectedMonitorType, setSelectedMonitorType] = useState<string | null>(null);

  // Fetch devices
  const { data: devices } = useQuery<Device[]>({
    queryKey: ['/api/devices'],
  });

  // Fetch monitors
  const { data: monitors, isLoading } = useQuery<Monitor[]>({
    queryKey: ['/api/monitors'],
  });

  // Determine the default form values based on the selected monitor type
  const getDefaultValues = () => {
    const baseDefaults = {
      deviceId: 0,
      enabled: true,
      interval: 60,
    };

    switch (selectedMonitorType) {
      case 'icmp':
        return {
          ...baseDefaults,
          type: 'icmp',
          config: {
            timeout: 5,
            packetSize: 56,
            count: 3
          }
        };
      case 'snmp':
        return {
          ...baseDefaults,
          type: 'snmp',
          config: {
            community: 'public',
            version: '2c',
            port: 161,
            oids: []
          }
        };
      case 'http':
        return {
          ...baseDefaults,
          type: 'http',
          config: {
            url: '',
            method: 'GET',
            headers: '',
            body: '',
            expectedStatus: 200,
            timeout: 5,
            validateSSL: true
          }
        };
      case 'tcp':
        return {
          ...baseDefaults,
          type: 'tcp',
          config: {
            port: 80,
            timeout: 5
          }
        };
      default:
        return baseDefaults;
    }
  };

  // Create form
  const form = useForm<MonitorFormValues>({
    resolver: zodResolver(monitorSchema),
    defaultValues: getDefaultValues(),
  });

  // Watch the monitor type to dynamically update form fields
  const watchMonitorType = form.watch("type");

  // Reset form when monitor type changes
  const handleMonitorTypeChange = (value: string) => {
    setSelectedMonitorType(value);
    form.reset({
      ...getDefaultValues(),
      type: value as any
    });
  };

  // Create monitor mutation
  const createMonitorMutation = useMutation({
    mutationFn: async (values: any) => {
      const transformedData = transformFormData(values);
      await apiRequest('POST', '/api/monitors', transformedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/monitors'] });
      toast({
        title: "Monitor Added",
        description: "The monitor has been added successfully.",
      });
      form.reset();
      setIsAddMonitorOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add monitor: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Toggle monitor enabled status
  const toggleMonitorMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      await apiRequest('PUT', `/api/monitors/${id}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/monitors'] });
      toast({
        title: "Monitor Updated",
        description: "The monitor status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update monitor: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: MonitorFormValues) => {
    createMonitorMutation.mutate(values);
  };

  // Get device name by ID
  const getDeviceName = (deviceId: number) => {
    return devices?.find(d => d.id === deviceId)?.name || 'Unknown Device';
  };

  // Configure the appropriate form sections based on the monitor type
  const renderMonitorConfigFields = () => {
    switch (watchMonitorType) {
      case 'icmp':
        return (
          <>
            <FormField
              control={form.control}
              name="config.timeout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeout (seconds)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Maximum time to wait for a response
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config.packetSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Packet Size (bytes)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config.count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ping Count</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Number of ping packets to send
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case 'snmp':
        return (
          <>
            <FormField
              control={form.control}
              name="config.community"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Community String</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config.version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SNMP Version</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select SNMP version" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Version 1</SelectItem>
                      <SelectItem value="2c">Version 2c</SelectItem>
                      <SelectItem value="3">Version 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config.port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="65535" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config.oids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OIDs (one per line)</FormLabel>
                  <FormControl>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder=".1.3.6.1.2.1.1.3.0"
                      onChange={(e) => field.onChange(e.target.value.split('\n').map(oid => oid.trim()).filter(Boolean))}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter OIDs, one per line (e.g., system uptime: .1.3.6.1.2.1.1.3.0)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case 'http':
        return (
          <>
            <FormField
              control={form.control}
              name="config.url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config.method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HTTP Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select HTTP method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config.headers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headers (JSON format)</FormLabel>
                  <FormControl>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder='{"Content-Type": "application/json"}'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter headers in JSON format (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config.body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Body</FormLabel>
                  <FormControl>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Request body content (if needed)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter request body content (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config.expectedStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Status Code</FormLabel>
                  <FormControl>
                    <Input type="number" min="100" max="599" {...field} />
                  </FormControl>
                  <FormDescription>
                    HTTP status code indicating success (default: 200)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config.timeout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeout (seconds)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config.validateSSL"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Validate SSL</FormLabel>
                    <FormDescription>
                      Verify SSL certificates
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
          </>
        );
      case 'tcp':
        return (
          <>
            <FormField
              control={form.control}
              name="config.port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="65535" {...field} />
                  </FormControl>
                  <FormDescription>
                    TCP port to monitor (e.g., 80 for HTTP, 22 for SSH)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config.timeout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeout (seconds)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      default:
        return null;
    }
  };

  // Group monitors by device
  const monitorsByDevice = monitors?.reduce((acc, monitor) => {
    const deviceId = monitor.deviceId;
    if (!acc[deviceId]) {
      acc[deviceId] = [];
    }
    acc[deviceId].push(monitor);
    return acc;
  }, {} as Record<number, Monitor[]>) || {};

  // Handle toggle monitor status
  const handleToggleMonitor = (id: number, currentStatus: boolean) => {
    toggleMonitorMutation.mutate({ id, enabled: !currentStatus });
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Monitoring</h2>
        <p className="text-gray-600">Configure and manage monitoring checks</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Add New Monitor</h3>
          <Dialog open={isAddMonitorOpen} onOpenChange={setIsAddMonitorOpen}>
            <DialogTrigger asChild>
              <Button>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 4v16m8-8H4" 
                  />
                </svg>
                Add Monitor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Monitor</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="deviceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select device" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {devices?.map((device) => (
                                <SelectItem key={device.id} value={device.id.toString()}>
                                  {device.name} ({device.ipAddress})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monitor Type</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleMonitorTypeChange(value);
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select monitor type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {monitorTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="interval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check Interval (seconds)</FormLabel>
                          <FormControl>
                            <Input type="number" min="10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Enabled</FormLabel>
                            <FormDescription>
                              Start monitoring immediately
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

                  {selectedMonitorType && (
                    <div className="border rounded-md p-4">
                      <h4 className="text-sm font-medium mb-4">Monitor Configuration</h4>
                      {renderMonitorConfigFields()}
                    </div>
                  )}

                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createMonitorMutation.isPending}
                    >
                      {createMonitorMutation.isPending ? "Adding..." : "Add Monitor"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array(3).fill(0).map((_, idx) => (
                <Card key={idx} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : devices?.length ? (
              Object.entries(monitorsByDevice).map(([deviceId, deviceMonitors]) => {
                const device = devices.find(d => d.id === parseInt(deviceId));
                if (!device) return null;

                return (
                  <Card key={deviceId}>
                    <CardHeader>
                      <CardTitle className="text-base">{device.name}</CardTitle>
                      <p className="text-sm text-gray-500">{device.ipAddress}</p>
                    </CardHeader>
                    <CardContent>
                      {deviceMonitors.length > 0 ? (
                        <div className="space-y-3">
                          {deviceMonitors.map((monitor) => (
                            <div key={monitor.id} className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <MonitorTypeIcon type={monitor.type} />
                                <span className="text-sm font-medium">
                                  {monitorTypes.find(t => t.value === monitor.type)?.label || monitor.type}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={monitor.enabled ? "default" : "outline"}
                                  className={monitor.enabled ? "bg-green-500" : ""}
                                >
                                  {monitor.enabled ? "Active" : "Paused"}
                                </Badge>
                                <Switch 
                                  checked={monitor.enabled} 
                                  onCheckedChange={() => handleToggleMonitor(monitor.id, monitor.enabled)}
                                  disabled={toggleMonitorMutation.isPending}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center">
                          No monitors configured
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12 mx-auto text-gray-400 mb-3" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <p>No devices found. Add a device first, then create monitors.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Monitoring;
