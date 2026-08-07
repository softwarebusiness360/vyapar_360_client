import React from "react";
import UpgradeGate from "./UpgradeGate";
import { componentContract } from "@/test/componentContract";
componentContract("UpgradeGate", { happy: () => <UpgradeGate feature="Insights" description="Upgrade" />, empty: () => <UpgradeGate />, alternate: () => <UpgradeGate feature="Team" description="" /> });
