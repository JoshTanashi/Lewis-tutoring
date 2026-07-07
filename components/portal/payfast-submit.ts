import type { PayfastCheckout } from "@/lib/payfast";

/** Builds and submits the PayFast POST form (client-side navigation away). */
export function submitPayfast(checkout: PayfastCheckout) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkout.processUrl;
  for (const [name, value] of checkout.fields) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}
