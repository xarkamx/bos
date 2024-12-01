import { CronService } from '.';
import { resumeOfTheWeek, sendPaymentRemainder } from '../../utils/mailSender';
import { BillingService } from '../billing/BillingService';
import { FacturaApiService } from '../billing/FacturaApiService';
import { StatsService } from '../stats/StatsService';

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

  service.setServices('sendPaymentRemainder', async () => {
    console.log('sending payment remainder');
    const stats = new StatsService();
    const debts=await stats.getExpiredDebts();
    Promise.all(debts.map((debt:any)=>sendPaymentRemainder(debt)));
    return debts;
  });
  return service;
}