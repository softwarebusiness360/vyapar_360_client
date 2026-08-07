import React from "react";
import LegalPage from "./LegalPage";
import { componentContract } from "@/test/componentContract";

componentContract("Privacy legal page", {
  happy: () => <LegalPage page="privacy" />,
  empty: () => <LegalPage page="privacy" />,
  alternate: () => <LegalPage page="terms" />,
});
