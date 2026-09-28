

export type BillingCustomer = {
  legal_name: string;
  tax_id: string;
  tax_system: string;
  email: string;
  address: {
    zip: string;
  };
}

export type BillingProduct = {
  description: string;
  product_key: string;
  price: number;
  sku: string;
  tax_include: boolean;
  taxes: {
    rate: number;
    type: string;
  };
};

export type BillingInvoice = {
  customer: BillingCustomer;
  items: BillingProduct[];
  payment_form: string;
  use: string
  folio_number: string;
};


export type BillingComplement = {
  type: string;
  data: Array<iComplementData>;
}

export type iComplementData = {
  payment_form: string;
  date: string;
  related_documents: Array<{
    uuid: string;
    amount: number;
    last_balance: number;
    installment: number;
    taxes: Array<{
      base: number;
      type: string;
      rate: number;
    }>;
  }>;
} 
