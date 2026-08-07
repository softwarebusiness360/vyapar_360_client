import React from "react";
import Modal from "./Modal";
import { componentContract } from "@/test/componentContract";
componentContract("Modal", { happy: () => <Modal open onClose={() => {}}>content</Modal>, empty: () => <Modal open={false} onClose={() => {}} />, alternate: () => <Modal open onClose={() => {}} labelledBy="title"><h2 id="title">Title</h2></Modal> });
