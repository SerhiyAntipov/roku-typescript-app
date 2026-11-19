// Copyright (c) 2026 Roku, Inc.
// SPDX-License-Identifier: MIT

import type { AnchorNodeDescriptor, AnchorNodeImplementation } from "@roku-sdk/rsg-ts";
import { defineAnchorNode } from "@roku-sdk/rsg-ts";
import { createSignal } from "@roku-sdk/solid";

const RokuTypescriptAppDescriptor: AnchorNodeDescriptor = {
    componentName: "RokuTypescriptApp",
    extends: "Group" as const,
    inputFields: {},
    outputFields: {}
};

const RokuTypescriptApp: AnchorNodeImplementation<typeof RokuTypescriptAppDescriptor> = () => {
    const appTitle: string = "roku-typescript-app";
    const appSubtitle: string = "Powered by Roku RSG 2.0";
    const [counter, setCounter] = createSignal(5);

    return (
        <layoutGroup translation={[0, 540]} layoutDirection="vert" vertAlignment="center">
            <label
                id="titleLabel"
                color="0xFFFFFFFF"
                font="font:ExtraLargeSystemFont"
                text={appTitle}
                horizAlign="center"
                vertAlign="center"
                width={1920}
                height={100}
            />
            <label
                id="subtitleLabel"
                color="0xFFFFFFFF"
                font="font:LargeSystemFont"
                text={appSubtitle}
                horizAlign="center"
                vertAlign="center"
                width={1920}
                height={80}
            />
            <label
                color="0x00FF00FF"
                font="font:LargeSystemFont"
                text={`Counter: ${counter()}`}
                horizAlign="center"
                width={1920}
                height={80}
            />
            <buttonGroup
                onButtonSelected={index => {
                    if (index === 0) {
                        setCounter(counter() + 1);
                    } else if (index === 1) {
                        setCounter(counter() - 1);
                    }
                }}
                buttons={["Increase counter", "Decrease counter"]}
                focusButton={0}
                minWidth={520}
                buttonHeight={72}
                showFocusFootprint={true}
            />
        </layoutGroup>
    );
};

export default defineAnchorNode(RokuTypescriptAppDescriptor, RokuTypescriptApp);
