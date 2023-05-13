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
        <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div class="sm:col-span-4">
            <div>
              <label
                for="workspaceId"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                Workspace ID
              </label>
              <div class="mt-2">
                <Field name="workspaceId">
                  {(field, props) => (
                    <>
                      <input
                        {...props}
                        type="text"
                        id="workspaceId"
                        autoComplete="username"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={field.value}
                      />
                    </>
                  )}
                </Field>{" "}
              </div>
            </div>
          </div>
          <div class="sm:col-span-4">
            <div>
              <label
                for="apiKey"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                API Key
              </label>
              <div class="mt-2">
                <Field name="apiKey">
                  {(field, props) => (
                    <>
                      <input
                        {...props}
                        type="password"
                        id="apiKey"
                        autoComplete="password"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={field.value}
                      />
                    </>
                  )}
                </Field>{" "}
              </div>
            </div>
          </div>
          <div class="sm:col-span-4">
            <div>
              <label
                for="month"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                Month
              </label>
              <div class="mt-2">
                <Field name="month">
                  {(field, props) => (
                    <>
                      <input
                        {...props}
                        type="month"
                        id="month"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={field.value}
                      />
                    </>
                  )}
                </Field>{" "}
              </div>
            </div>
          </div>
          <div class="sm:col-span-4">
            <button
              type="submit"
              class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Generate Invoice Items
            </button>
          </div>
        </div>
      </Form>
      {loginForm.response.status === "error" && (
        <span>Error generating invoice items</span>
      )}
    </>
  );
});
