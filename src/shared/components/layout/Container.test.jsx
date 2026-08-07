import React from "react";
import { Container, Section } from "./Container";
import { componentContract } from "@/test/componentContract";
componentContract("Container", { happy: () => <Container>content</Container>, empty: () => <Container />, alternate: () => <Section className="edge">section</Section> });
