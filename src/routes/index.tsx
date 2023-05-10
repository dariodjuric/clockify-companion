import { $, component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { InitialValues } from "@modular-forms/qwik";
import type { LoginForm } from "~/components/report-input-form/report-input-form";
import ReportInputForm from "~/components/report-input-form/report-input-form";

export const useFormLoader = routeLoader$<InitialValues<LoginForm>>(() => ({
  apiKey: "",
  month: "2023-05",
}));

export default component$(() => {
  const initialValues = useFormLoader();

  return (
    <>
      <ReportInputForm
        initialValues={initialValues}
        onSubmit={$(console.log)}
      />
    </>
  );
});
