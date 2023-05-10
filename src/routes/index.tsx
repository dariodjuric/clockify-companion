import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { InitialValues } from "@modular-forms/qwik";
import type { LoginForm } from "~/components/report-input-form/report-input-form";
import ReportInputForm from "~/components/report-input-form/report-input-form";
import { format, subMonths } from "date-fns";

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
  return (
    <>
      <ReportInputForm initialValues={initialValues} />
    </>
  );
});
