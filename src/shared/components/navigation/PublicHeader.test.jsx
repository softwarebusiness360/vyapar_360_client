import React from "react";
import PublicHeader from "./PublicHeader";
import { componentContract } from "@/test/componentContract";
componentContract("PublicHeader", { happy: () => <PublicHeader />, empty: () => <PublicHeader />, alternate: () => <PublicHeader /> });
