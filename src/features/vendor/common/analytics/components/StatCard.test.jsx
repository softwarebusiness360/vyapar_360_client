import React from "react";
import StatCard from "./StatCard";
import { componentContract } from "@/test/componentContract";
componentContract("StatCard", { happy: () => <StatCard label="Revenue" value="1" />, empty: () => <StatCard />, alternate: () => <StatCard label="" value={0} index={-1} /> });
