import type { PropFunction, Signal } from "@builder.io/qwik";
import { component$, useTask$ } from "@builder.io/qwik";
import { z } from "@builder.io/qwik-city";
import type { InitialValues } from "@modular-forms/qwik";
import { formAction$, useForm, zodForm$ } from "@modular-forms/qwik";
import type { Invoice } from "~/lib/invoice-generator";
import { generateInvoice } from "~/lib/invoice-generator";
import { endOfMonth, setSeconds, startOfMonth } from "date-fns";
import { isBrowser } from "@builder.io/qwik/build";

const loginSchema = z.object({
  workspaceId: z.string(),
  apiKey: z.string(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});
export type LoginFormData = z.infer<typeof loginSchema>;

interface Props {
  initialValues: Signal<InitialValues<LoginFormData>>;
  onSubmit$: PropFunction<(data: Invoice) => void>;
}

export const useFormAction = formAction$<LoginFormData, Invoice>(
  async (values) => {
    const startOfMonthDate = startOfMonth(new Date(values.month));
    const endOfMonthDate = setSeconds(endOfMonth(new Date(values.month)), 59);

    try {
      const invoice = await generateInvoice(
        values.workspaceId,
        values.apiKey,
        startOfMonthDate,
        endOfMonthDate
      );

      return {
        status: "success",
        data: invoice,
      };
    } catch (e) {
      console.error(e);

      return {
        status: "error",
      };
    }
  },
  zodForm$(loginSchema)
);

export default component$<Props>(({ initialValues, onSubmit$ }) => {
  const [loginForm, { Form, Field }] = useForm<LoginFormData, Invoice>({
    loader: initialValues,
    validate: zodForm$(loginSchema),
    action: useFormAction(),
  });

  useTask$(({ track }) => {
    track(() => loginForm.response.status);

    if (isBrowser && !loginForm.submitting) {
      onSubmit$(loginForm.response.data as Invoice);
    }
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
                autoComplete="username"
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
                autoComplete="password"
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
      {loginForm.response.status === "error" && (
        <span>Error generating invoice items</span>
      )}
    </>
  );
});
