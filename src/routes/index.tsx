import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { InitialValues } from "@modular-forms/qwik";
import type { LoginFormData } from "~/components/report-input-form/report-input-form";
import ReportInputForm from "~/components/report-input-form/report-input-form";
import { format, subMonths } from "date-fns";
import InvoiceDisplay from "~/components/invoice-display/invoice-display";
import type { Invoice } from "~/lib/invoice-generator";

export const useFormLoader = routeLoader$<InitialValues<LoginFormData>>(() => {
  const currentDate = new Date();
  const previousMonth = subMonths(currentDate, 1);
  const formattedDate = format(previousMonth, "yyyy-MM");

  return {
    workspaceId: "",
    apiKey: "",
    month: formattedDate,
  };
});

export default component$(() => {
  const initialValues = useFormLoader();
  const invoiceSignal = useSignal<Invoice>();
  return (
    <>
      <ReportInputForm
        initialValues={initialValues}
        onSubmit$={(invoice) => {
          invoiceSignal.value = invoice;
        }}
      />
      {invoiceSignal.value && <InvoiceDisplay invoice={invoiceSignal.value} />}
    </>
  );
});
