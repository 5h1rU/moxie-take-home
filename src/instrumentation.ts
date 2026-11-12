// Next.js runs register() once per server process, before it handles requests.
// Every request to the booking API is made on the server (Server Components and
// the Server Action), so MSW only needs to run here: there is no browser worker.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.API_MOCKING === "enabled") {
    const { server } = await import("./mocks/node");
    server.listen({ onUnhandledFrame: "bypass" });
  }
}
