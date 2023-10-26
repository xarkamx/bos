import libxmljs from "libxmljs";
import { HttpError } from '../../errors/HttpError';

export function paymentComplementToXml(complement: Complement) {
  const { uuid, folio_number, series, total, amount, paymentForm } = complement;
  const base = total / 1.16;
  const baseIncrement = base * 0.16;
  const baseAmount = amount / 1.16;
  const baseAmountIncrement = baseAmount * 0.16;
  const xml = `<pago20:Pagos Version="2.0">
  <pago20:Totales TotalTrasladosBaseIVA16="${base.toFixed(2)}" TotalTrasladosImpuestoIVA16="${baseIncrement.toFixed(2)}" MontoTotalPagos="${total}" />
  <pago20:Pago FechaPago="2023-09-26T18:06:04" FormaDePagoP="${paymentForm}" MonedaP="MXN" TipoCambioP="1" Monto="${total}">
    <pago20:DoctoRelacionado IdDocumento="${uuid}" Serie="${series}" Folio="${folio_number}" MonedaDR="MXN" NumParcialidad="1" ImpSaldoAnt="${total}" ImpPagado="${amount}" ImpSaldoInsoluto="${total - amount}" ObjetoImpDR="02">
      <pago20:ImpuestosDR>
        <pago20:TrasladosDR>
          <pago20:TrasladoDR BaseDR="${baseAmount.toFixed(2)}" ImpuestoDR="002" TipoFactorDR="Tasa" TasaOCuotaDR="0.160000" ImporteDR="${baseAmountIncrement.toFixed()}" />
        </pago20:TrasladosDR>
      </pago20:ImpuestosDR>
    </pago20:DoctoRelacionado>
    <pago20:ImpuestosP>
      <pago20:TrasladosP>
        <pago20:TrasladoP BaseP="${base.toFixed(2)}" ImpuestoP="002" TipoFactorP="Tasa" TasaOCuotaP="0.160000" ImporteP="${baseIncrement.toFixed(2)}" />
      </pago20:TrasladosP>
    </pago20:ImpuestosP>
  </pago20:Pago>
</pago20:Pagos>`  
  if(!validateXml(xml)) {
    throw new HttpError('Invalid xml', 400);
  }

  return xml;
}

type Complement = {
  uuid: string;
  folio_number: string;
  series: string;
  total: number;
  amount: number;
  paymentForm: string;
};

function validateXml(xml: string) {
  try {
    libxmljs.parseXml(xml);
    return true;
  }
  catch (e) {
    console.log(e);
    return false;
  }
}