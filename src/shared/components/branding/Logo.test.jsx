import React from "react";
import Logo from "./Logo";
import { componentContract } from "@/test/componentContract";
componentContract("Logo", { happy: () => <Logo />, empty: () => <Logo to="" />, alternate: () => <Logo size="lg" className="edge" /> });
