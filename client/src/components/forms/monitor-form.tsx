import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";

// Monitor type definitions
const monitorTypes = [
  { value: 'icmp', label: 'ICMP (Ping)' },
  { value: 'snmp', label: 'SNMP' },
  { value: 'http', label: 'HTTP' },
  { value: 'tcp', label: 'TCP Port' }
];

// Monitor schema
const monitorSchema = z.object({
  type: z.string().min(1, { message: "Please select a monitor type" }),
  enabled: z.boolean().default(true),
  interval: z.number().min(10, { message: "Interval must be at least 10 seconds" }).default(60),
  config: z.object({
    timeout: z.number().min(1).default(5),
    count: z.number().min(1).default(3),
  }).optional(),
});

type MonitorFormValues = z.infer<typeof monitorSchema>;

interface MonitorFormProps {
  deviceId?: number;
  onSuccess?: () => void;
}

export const MonitorForm = ({ deviceId, onSuccess }: MonitorFormProps) => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>('icmp');

  const form = useForm<MonitorFormValues>({
    resolver: zodResolver(monitorSchema),
    defaultValues: {
      type: 'icmp',
      enabled: true,
      interval: 60,
      config: {
        timeout: 5,
        count: 3,
      },
    },
  });

  const createMonitorMutation = useMutation({
    mutationFn: async (values: MonitorFormValues) => {
      await apiRequest('POST', '/api/monitors', { ...values, deviceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/monitors'] });
      toast({
        title: "Monitor Added",
        description: "The monitor has been added successfully.",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add monitor: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: MonitorFormValues) => {
    if (!deviceId) {
      toast({
        title: "Error",
        description: "No device selected",
        variant: "destructive",
      });
      return;
    }
    createMonitorMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monitor Type</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedType(value);
                }}
                value={field.value}
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

        {selectedType === 'icmp' && (
          <div className="border rounded-md p-4 space-y-4">
            <h4 className="text-sm font-medium mb-4">ICMP Configuration</h4>
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
              name="config.count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ping Count</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
  );
};

export default MonitorForm;