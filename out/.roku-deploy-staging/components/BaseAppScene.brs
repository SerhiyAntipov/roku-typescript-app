' Copyright (c) 2026 Roku, Inc.
' SPDX-License-Identifier: MIT

sub init()
    print "BaseAppScene init"

    di = CreateObject("roDeviceInfo")
    uiResolution = di.GetUIResolution()

    print "uiResolution: "; uiResolution.name

    ' Set a simple background color for the scene
    m.top.backgroundColor = "0x000000FF"

    rokuTypescriptApp = m.top.findNode("rokuTypescriptApp")
    if rokuTypescriptApp <> invalid
        print "RokuTypescriptApp component found and initialized"
        rokuTypescriptApp.setFocus(true) ' Set initial focus to the RokuTypescriptApp component
    else
        print "ERROR: RokuTypescriptApp component (id rokuTypescriptApp) not found; initial focus not set"
    end if
end sub

'//# sourceMappingURL=BaseAppScene.brs.map