import React from "react";
import NavDrawer from "./NavDrawer";
import { componentContract } from "@/test/componentContract";
componentContract("NavDrawer", { happy: () => <NavDrawer open onClose={() => {}} sections={[]} />, empty: () => <NavDrawer open={false} onClose={() => {}} />, alternate: () => <NavDrawer open onClose={() => {}} title="Alternate" footer="footer" /> });
