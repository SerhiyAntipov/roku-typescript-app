// Copyright (c) 2026 Roku, Inc.
// SPDX-License-Identifier: MIT

import type { AnchorNodeDescriptor, AnchorNodeImplementation } from "@roku-sdk/rsg-ts";
import { defineAnchorNode } from "@roku-sdk/rsg-ts";

const RokuTypescriptAppDescriptor: AnchorNodeDescriptor = {
    componentName: "RokuTypescriptApp",
    extends: "Group" as const,
    inputFields: {},
    outputFields: {}
};

const RokuTypescriptApp: AnchorNodeImplementation<typeof RokuTypescriptAppDescriptor> = () => {
    return (
        <layoutGroup translation={[0, 540]} layoutDirection="vert" vertAlignment="center">
            <label
                id="titleLabel"
                color="0xFFFFFFFF"
                font="font:ExtraLargeSystemFont"
                text="Roku Typescript App"
                horizAlign="center"
                vertAlign="center"
                width={1920}
                height={100}
            />
            <label
                id="subtitleLabel"
                color="0xFFFFFFFF"
                font="font:LargeSystemFont"
                text="Roku RSG"
                horizAlign="center"
                vertAlign="center"
                width={1920}
                height={80}
            />
        </layoutGroup>
    );
};

export default defineAnchorNode(RokuTypescriptAppDescriptor, RokuTypescriptApp);
