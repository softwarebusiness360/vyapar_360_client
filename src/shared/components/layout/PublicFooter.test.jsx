import React from "react";
import PublicFooter from "./PublicFooter";
import { componentContract } from "@/test/componentContract";
componentContract("PublicFooter", { happy: () => <PublicFooter />, empty: () => <PublicFooter />, alternate: () => <PublicFooter /> });
