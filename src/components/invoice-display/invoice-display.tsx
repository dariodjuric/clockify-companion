import { component$ } from "@builder.io/qwik";
import type { Invoice } from "~/lib/invoice-generator";

interface Props {
  invoice: Invoice;
}

export default component$<Props>(({ invoice }) => {
  return (
    <>
      <table>
        <thead>
          <tr>
            <td>Description</td>
            <td>Hours</td>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr>
              <td>{item.description}</td>
              <td>{new Intl.NumberFormat("de-DE").format(item.hours)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            <td>{new Intl.NumberFormat("de-DE").format(invoice.totalHours)}</td>
          </tr>
        </tfoot>
      </table>
    </>
  );
});
