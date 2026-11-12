import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBooking } from "@/app/booking/[slug]/actions";
import { appointmentSelectionSchema, bookingPageSchema } from "@/lib/types";
import goldSpa from "@/mocks/data/gold-spa.json";
import selection from "@/mocks/data/selection.json";
import { BookingFlow } from "./BookingFlow";

// Next.js keeps useSearchParams in sync with history.pushState/replaceState and
// back/forward. This stand-in does the same from window.location.
vi.mock("next/navigation", async () => {
  const { useSyncExternalStore } = await import("react");
  const subscribe = (onChange: () => void) => {
    window.addEventListener("popstate", onChange);
    window.addEventListener("test:locationchange", onChange);
    return () => {
      window.removeEventListener("popstate", onChange);
      window.removeEventListener("test:locationchange", onChange);
    };
  };
  return {
    useSearchParams: () => new URLSearchParams(useSyncExternalStore(subscribe, () => window.location.search)),
  };
});

const { pushState, replaceState } = window.history;
beforeEach(() => {
  window.history.pushState = (...args) => {
    pushState.apply(window.history, args);
    window.dispatchEvent(new Event("test:locationchange"));
  };
  window.history.replaceState = (...args) => {
    replaceState.apply(window.history, args);
    window.dispatchEvent(new Event("test:locationchange"));
  };
  replaceState.call(window.history, null, "", "/booking/gold-spa");
});
afterEach(() => {
  window.history.pushState = pushState;
  window.history.replaceState = replaceState;
  vi.restoreAllMocks();
});

function renderFlow() {
  render(
    <BookingFlow
      page={bookingPageSchema.parse(goldSpa)}
      selection={appointmentSelectionSchema.parse(selection)}
      createBooking={createBooking}
    />,
  );
  return userEvent.setup();
}

describe("BookingFlow", () => {
  it("books an appointment, keeping contact details when going back", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const user = renderFlow();

    await user.type(screen.getByLabelText("Full Name"), "Jane Cooper");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Phone"), "6195550199");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByRole("heading", { name: "Secure your appointment by card" })).toHaveFocus();
    expect(window.location.search).toBe("?step=payment");

    // Back is rendered twice (mobile and desktop placements); CSS shows one of them.
    await user.click(screen.getAllByRole("button", { name: /Back/ })[0]);
    await screen.findByRole("heading", { name: "Enter your details below" });
    expect(screen.getByLabelText("Full Name")).toHaveValue("Jane Cooper");
    expect(screen.getByLabelText("Phone")).toHaveValue("(619) 555-0199");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await user.type(await screen.findByLabelText("Card number"), "4242424242424242");
    await user.type(screen.getByLabelText("Expiry date"), "1230");
    await user.type(screen.getByLabelText("Security code (CVV)"), "123");
    await user.type(screen.getByLabelText("Billing zip code"), "92108");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Book appointment" }));

    expect(await screen.findByRole("heading", { name: "Your appointment has been booked!" })).toBeInTheDocument();
    // The total comes from the server's booking: Botox $200 + HydraFacial $150.
    expect(screen.getByText("$350")).toBeInTheDocument();
    expect(window.location.search).toBe("");

    const [, request] = log.mock.calls.find(([label]) => label === "Booking request")!;
    expect(request).toMatchObject({
      businessId: "biz_gold_spa",
      client: { fullName: "Jane Cooper", email: "jane@example.com", phone: "+16195550199" },
      payment: { brand: "visa", last4: "4242", expMonth: 12, expYear: 2030, billingPostalCode: "92108" },
    });
    // Only a token and the card's public details: no card number, no CVV.
    expect(Object.keys(request.payment).sort()).toEqual(
      ["billingPostalCode", "brand", "expMonth", "expYear", "last4", "paymentMethodId"],
    );
    expect(request.payment.paymentMethodId).toMatch(/^pm_/);
    expect(JSON.stringify(request)).not.toContain("4242424242424242");
  });

  it("shows every error on an empty submit and stays on Contact", async () => {
    const user = renderFlow();
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Enter a 10-digit US phone number.")).toBeInTheDocument();
    expect(screen.getByLabelText("Full Name")).toHaveFocus();
    expect(window.location.search).toBe("");
  });

  it("returns to Contact when Payment is opened without contact details", async () => {
    replaceState.call(window.history, null, "", "/booking/gold-spa?step=payment");
    renderFlow();

    expect(screen.getByRole("heading", { name: "Enter your details below" })).toBeInTheDocument();
    await waitFor(() => expect(window.location.search).toBe("?step=contact"));
  });
});
