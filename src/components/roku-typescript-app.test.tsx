// Copyright (c) 2026 Roku, Inc.
// SPDX-License-Identifier: MIT

/// <reference types="jest" />

import { render, TestAnchorNode } from "@roku-sdk/testing-library";

import RokuTypescriptApp from "./roku-typescript-app";

const TestRokuTypescriptApp = TestAnchorNode(RokuTypescriptApp);

describe("RokuTypescriptApp Component", () => {
    test("renders and matches snapshot", async () => {
        const { toString, getByProp, dispose } = await render(() => <TestRokuTypescriptApp />);

        expect(toString(2)).toMatchSnapshot();

        // Verify the title and subtitle labels are rendered
        getByProp("text", "Roku Typescript App");
        getByProp("text", "Roku RSG");

        await dispose();
    });

    test("renders with correct text content", async () => {
        const { getByProp, dispose } = await render(() => <TestRokuTypescriptApp />);

        // Verify the title and subtitle labels exist with correct text
        getByProp("text", "Roku Typescript App");
        getByProp("text", "Roku RSG");

        // Verify labels have the expected IDs
        getByProp("id", "titleLabel");
        getByProp("id", "subtitleLabel");

        await dispose();
    });
});
