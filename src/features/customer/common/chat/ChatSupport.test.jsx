import React from "react";
import ChatSupport from "./ChatSupport";
import { componentContract } from "@/test/componentContract";
componentContract("ChatSupport", { happy: () => <ChatSupport />, empty: () => <ChatSupport />, alternate: () => <ChatSupport /> });
