import React from "react";
import NavToggle from "./NavToggle";
import { componentContract } from "@/test/componentContract";
componentContract("NavToggle", { happy: () => <NavToggle onOpen={() => {}} />, empty: () => <NavToggle onOpen={() => {}} label="" />, alternate: () => <NavToggle onOpen={() => {}} variant="inline" /> });
