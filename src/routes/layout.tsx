import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

import styles from "./styles.css?inline";

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export default component$(() => {
  useStyles$(styles);
  return (
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 m-3">
      <div class="mx-auto max-w-3xl">
        <div class="overflow-hidden bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <Slot />
          </div>
        </div>
      </div>
    </div>
  );
});
