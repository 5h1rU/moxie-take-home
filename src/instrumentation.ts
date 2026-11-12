// Next.js runs register() once per server process, before it handles requests.
// Every request to the booking API is made on the server (Server Components and
// the Server Action), so MSW only needs to run here: there is no browser worker.
// Mocking is on unless API_MOCKING=disabled, so the app runs with no setup.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.API_MOCKING !== "disabled") {
    const { server } = await import("./mocks/node");
    server.listen({ onUnhandledFrame: "bypass" });
  }
}
