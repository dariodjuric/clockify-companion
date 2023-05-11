import type { Signal } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import { z } from "@builder.io/qwik-city";
import type { InitialValues } from "@modular-forms/qwik";
import { formAction$, useForm, zodForm$ } from "@modular-forms/qwik";
import type { Invoice } from "~/lib/invoice-generator";
import { generateInvoice } from "~/lib/invoice-generator";
import { endOfMonth, setSeconds, startOfMonth } from "date-fns";
import InvoiceDisplay from "~/components/invoice-display/invoice-display";

const loginSchema = z.object({
  workspaceId: z.string(),
  apiKey: z.string(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});
export type LoginForm = z.infer<typeof loginSchema>;

interface Props {
  initialValues: Signal<InitialValues<LoginForm>>;
}

export const useFormAction = formAction$<LoginForm, Invoice>(async (values) => {
  const startOfMonthDate = startOfMonth(new Date(values.month));
  const endOfMonthDate = setSeconds(endOfMonth(new Date(values.month)), 59);

  const invoice = await generateInvoice(
    values.workspaceId,
    values.apiKey,
    startOfMonthDate,
    endOfMonthDate
  );

  return {
    status: "success",
    message: " ",
    data: invoice,
  };
}, zodForm$(loginSchema));

export default component$<Props>(({ initialValues }) => {
  const [loginForm, { Form, Field }] = useForm<LoginForm, Invoice>({
    loader: initialValues,
    validate: zodForm$(loginSchema),
    action: useFormAction(),
  });

  return (
    <>
      <Form>
        <label for="workspaceId">Workspace ID</label>
        <Field name="workspaceId">
          {(field, props) => (
            <>
              <input
                {...props}
                type="text"
                id="workspaceId"
                autoComplete="on"
                value={field.value}
              />
            </>
          )}
        </Field>

        <label for="apiKey">API ID</label>
        <Field name="apiKey">
          {(field, props) => (
            <>
              <input
                {...props}
                type="password"
                id="apiKey"
                autoComplete="on"
                value={field.value}
              />
            </>
          )}
        </Field>

        <label for="month">Month</label>
        <Field name="month">
          {(field, props) => (
            <input {...props} type="month" id="month" value={field.value} />
          )}
        </Field>
        <button type="submit">Generate invoice items</button>
      </Form>
      {loginForm.response.data && (
        <InvoiceDisplay invoice={loginForm.response.data} />
      )}
    </>
  );
});
