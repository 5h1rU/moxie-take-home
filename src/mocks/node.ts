import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** Shared by the Next.js server (instrumentation.ts) and Vitest. */
export const server = setupServer(...handlers);
