import React from "react";
import StatusBadge from "./StatusBadge";
import { componentContract } from "@/test/componentContract";
componentContract("StatusBadge", { happy: () => <StatusBadge status="active" />, empty: () => <StatusBadge />, alternate: () => <StatusBadge status="cancelled" className="edge" /> });
