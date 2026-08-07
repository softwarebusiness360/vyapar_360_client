import React from "react";
import ThemeToggle from "./ThemeToggle";
import { componentContract } from "@/test/componentContract";
componentContract("ThemeToggle", { happy: () => <ThemeToggle />, empty: () => <ThemeToggle testid="" />, alternate: () => <ThemeToggle variant="icon" /> });
