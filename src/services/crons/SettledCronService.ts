import { CronService } from '.';
import { resumeOfTheWeek } from '../../utils/mailSender';
import { BillingService } from '../billing/BillingService';
import { FacturaApiService } from '../billing/FacturaApiService';

export function loadCronService() {
  const service = new CronService();
  service.setServices('mailResumeOfTheWeek', async () => {
    console.log('sending Resume of the week');
    return resumeOfTheWeek();
  });

  service.setServices('cancelExpiredBillings', async () => {
    console.log('Cancelling expired billings');
    const billingService = new BillingService(new FacturaApiService());
    return billingService.autoCancelExpiredInvoices();
  });
  return service;
}