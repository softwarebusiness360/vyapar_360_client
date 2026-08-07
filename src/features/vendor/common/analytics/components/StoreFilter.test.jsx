import React from "react";
import StoreFilter from "./StoreFilter";
import { componentContract } from "@/test/componentContract";
const storefronts = [{ id: "s1", name: "One" }, { id: "s2", slug: "two" }];
componentContract("StoreFilter", { happy: () => <StoreFilter storefronts={storefronts} value="all" onChange={() => {}} />, empty: () => <StoreFilter storefronts={[]} onChange={() => {}} />, alternate: () => <StoreFilter storefronts={null} onChange={() => {}} /> });
