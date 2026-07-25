/**
 * Vyapar360 API client — adapter-switching entry point.
 *
 * Every page and context imports from here:
 *
 *     import { api } from "@/lib/api";
 *     const vendors = await api.listVendors({ type: "restaurant" });
 *
 * The adapter is chosen at import time:
 *   - REACT_APP_USE_MOCK_API === "false"  →  HTTP adapter (real backend)
 *   - anything else                        →  Mock adapter (LocalStorage)
 *
 * Defaulting to mock keeps the app fully self-contained until the backend
 * is ready. Flip the env var (or replace individual re-exports) to migrate.
 *
 * See /API_CONTRACT.md for the full endpoint list, payload shapes, and
 * migration guide.
 */

import * as mock from "./adapters/mock";
import * as http from "./adapters/http";

const useMock = String(process.env.REACT_APP_USE_MOCK_API || "true").toLowerCase() !== "false";

export const api = useMock ? mock : http;
export const isMockApi = useMock;
export default api;
