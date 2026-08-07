import React from "react";
import CustomerAuthModal from "./CustomerAuthModal";
import { componentContract } from "@/test/componentContract";
componentContract("CustomerAuthModal", { happy: () => <CustomerAuthModal open onClose={() => {}} />, empty: () => <CustomerAuthModal open={false} onClose={() => {}} />, alternate: () => <CustomerAuthModal open onClose={() => {}} variant="register" /> });
