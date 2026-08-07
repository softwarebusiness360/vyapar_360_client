import React from "react";
import PerStoreBreakdown from "./PerStoreBreakdown";
import { componentContract } from "@/test/componentContract";
const stats = [{ storefront: { id: "s1", name: "Store", slug: "store", businessType: "restaurant" }, revenue: 1, orders: 1, bookings: 0 }];
componentContract("PerStoreBreakdown", { happy: () => <PerStoreBreakdown stats={stats} />, empty: () => <PerStoreBreakdown stats={[]} />, alternate: () => <PerStoreBreakdown stats={null} /> });
