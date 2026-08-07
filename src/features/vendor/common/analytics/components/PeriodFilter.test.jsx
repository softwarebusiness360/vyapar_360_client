import React from "react";
import PeriodFilter from "./PeriodFilter";
import { componentContract } from "@/test/componentContract";
componentContract("PeriodFilter", { happy: () => <PeriodFilter options={[{ id: "week", label: "Week" }]} value="week" onChange={() => {}} />, empty: () => <PeriodFilter options={[]} onChange={() => {}} />, alternate: () => <PeriodFilter options={[{ id: "all", label: "All" }]} value="missing" onChange={() => {}} /> });
