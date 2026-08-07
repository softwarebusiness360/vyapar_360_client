import React from "react";
import EmployeePerformanceTable from "./EmployeePerformanceTable";
import { componentContract } from "@/test/componentContract";
componentContract("EmployeePerformanceTable", { happy: () => <EmployeePerformanceTable rows={[{ employee: { id: "e1", name: "A", email: "a@x", role: "employee" }, assignedStores: [], revenue: 1, orders: 1, bookings: 0, avgTicket: 1 }]} />, empty: () => <EmployeePerformanceTable rows={[]} />, alternate: () => <EmployeePerformanceTable rows={null} isRestaurant={false} /> });
