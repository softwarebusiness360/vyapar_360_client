import { flattenRoutes, routeDefinitions } from "./routeDefinitions";

export const appRoutes = flattenRoutes();
export const vendorRoutes = appRoutes.filter(({ id }) => id.startsWith("vendor-"));
export const customerRoutes = appRoutes.filter(({ id }) => id.startsWith("customer-"));
export const adminRoutes = appRoutes.filter(({ id }) => id.startsWith("admin-"));
export { routeDefinitions };
