import React from "react";
import AiInsightsSection from "./AiInsightsSection";
import { componentContract } from "@/test/componentContract";
componentContract("AiInsightsSection", { happy: () => <AiInsightsSection />, empty: () => <AiInsightsSection />, alternate: () => <AiInsightsSection /> });
