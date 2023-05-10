import { $, component$, useSignal } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { InitialValues } from "@modular-forms/qwik";
import type { LoginForm } from "~/components/report-input-form/report-input-form";
import ReportInputForm from "~/components/report-input-form/report-input-form";
import type { Invoice } from "~/lib/invoice-generator";
import { generateInvoice } from "~/lib/invoice-generator";
import InvoiceDisplay from "~/components/invoice-display/invoice-display";
import {
  endOfMonth,
  format,
  setSeconds,
  startOfMonth,
  subMonths,
} from "date-fns";

export const useFormLoader = routeLoader$<InitialValues<LoginForm>>(() => {
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
  const invoiceSignal = useSignal<Invoice | null>(null);

  const submitHandler = $(async (values: LoginForm) => {
    const startOfMonthDate = startOfMonth(new Date(values.month));
    const endOfMonthDate = setSeconds(endOfMonth(new Date(values.month)), 59);

    invoiceSignal.value = await generateInvoice(
      "",
      "",
      startOfMonthDate,
      endOfMonthDate
    );
  });

  return (
    <>
      <ReportInputForm initialValues={initialValues} onSubmit={submitHandler} />
      {invoiceSignal.value && <InvoiceDisplay invoice={invoiceSignal.value} />}
    </>
  );
});
