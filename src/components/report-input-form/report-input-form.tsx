import type { PropFunction, Signal } from "@builder.io/qwik";
import { $, component$ } from "@builder.io/qwik";
import { z } from "@builder.io/qwik-city";
import type { InitialValues } from "@modular-forms/qwik";
import { useForm, zodForm$ } from "@modular-forms/qwik";

const loginSchema = z.object({
  apiKey: z.string(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});
export type LoginForm = z.infer<typeof loginSchema>;

interface Props {
  initialValues: Signal<InitialValues<LoginForm>>;
  onSubmit: PropFunction<(values: LoginForm) => void>;
}

export default component$<Props>(({ initialValues: loader, onSubmit }) => {
  const [, { Form, Field }] = useForm<LoginForm>({
    loader,
    validate: zodForm$(loginSchema),
  });

  const handleSubmit = $((values: LoginForm) => {
    onSubmit(values);
  });

  return (
    <Form onSubmit$={handleSubmit}>
      <Field name="apiKey">
        {(field, props) => (
          <>
            <input {...props} type="password" value={field.value} />
            {field.error}
          </>
        )}
      </Field>
      <Field name="month">
        {(field, props) => (
          <input {...props} type="month" value={field.value} />
        )}
      </Field>
      <input type="submit" />
    </Form>
  );
});
