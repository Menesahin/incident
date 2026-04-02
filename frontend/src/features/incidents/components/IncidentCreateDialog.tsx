import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SERVICE_LIST } from '@/shared/constants';
import { useCreateIncident } from '../api/useIncidents';
import {
  createIncidentSchema,
  type CreateIncidentInput,
} from '../schemas/incident.schema';

interface IncidentCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IncidentCreateDialog({
  open,
  onOpenChange,
}: IncidentCreateDialogProps) {
  const createIncident = useCreateIncident();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateIncidentInput>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: {
      title: '',
      description: '',
      service: 'PAYMENT_API',
      severity: 'MEDIUM',
    },
  });

  const onSubmit = (data: CreateIncidentInput) => {
    createIncident.mutate(data, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  const serviceValue = watch('service');
  const severityValue = watch('severity');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            New Incident
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Report a new incident for tracking and resolution.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              placeholder="Brief incident description"
              {...register('title')}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Detailed description (optional)"
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Service
            </Label>
            <Select
              value={serviceValue}
              onValueChange={(value) =>
                setValue('service', value as CreateIncidentInput['service'], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_LIST.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Severity
            </Label>
            <Select
              value={severityValue}
              onValueChange={(value) =>
                setValue(
                  'severity',
                  value as CreateIncidentInput['severity'],
                  { shouldValidate: true },
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={createIncident.isPending}
            className="bg-foreground text-background hover:bg-foreground/90 w-full"
          >
            {createIncident.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Create Incident
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
