const API_DOCS = [
    {
        name: "FileApi",
        interface: "FileApi",
        description: "Provides file system operations for reading, writing, and managing files in allowed directories inside HOS filesystem.",
        package: "com.dmfnn.htmlos.sysapi",
        methods: [
            {
                name: "readfile",
                signature: "String readfile(String path)",
                description: "Reads the content of a file as a string from the specified path.",
                parameters: [
                    {
                        name: "path",
                        type: "String",
                        description: "Absolute path to the file. Must start with /storage and pass security checks."
                    }
                ],
                returns: {
                    type: "String",
                    description: "File content as string, or error codes: FILE_NOT_EXISTS, PERMISSION_DENIED, FAIL"
                },
                permissions: ["READ_STORAGE", "MANAGE_STORAGE"],
                example: `const content = FileApi.readfile("/storage/documents/test.txt");
if (content === "FILE_NOT_EXISTS") {
    console.log("File not found");
} else if (content === "PERMISSION_DENIED") {
    console.log("No permission to read");
} else {
    console.log("Content:", content);
}`
            },
            {
                name: "readFileAsBase64",
                signature: "String readFileAsBase64(String path)",
                description: "Reads a file and returns its content as Base64 encoded string. Useful for binary files.",
                parameters: [
                    {
                        name: "path",
                        type: "String",
                        description: "Absolute path to the file"
                    }
                ],
                returns: {
                    type: "String",
                    description: "Base64 encoded file content, or error codes: FILE_NOT_EXISTS, PERMISSION_DENIED, FAIL"
                },
                permissions: ["READ_STORAGE", "MANAGE_STORAGE"],
                example: `const base64 = FileApi.readFileAsBase64("/storage/images/photo.png");
if (base64 !== "FAIL") {
    const img = document.createElement("img");
    img.src = "data:image/png;base64," + base64;
}`
            },
            {
                name: "writefile",
                signature: "String writefile(String text, String path)",
                description: "Writes text content to a file at the specified path.",
                parameters: [
                    {
                        name: "text",
                        type: "String",
                        description: "Content to write"
                    },
                    {
                        name: "path",
                        type: "String",
                        description: "Path to the file"
                    }
                ],
                returns: {
                    type: "String",
                    description: "SUCCESS on success, or error codes: FILE_NOT_EXISTS, PERMISSION_DENIED, FAIL"
                },
                permissions: ["WRITE_STORAGE", "MANAGE_STORAGE"],
                example: `const result = FileApi.writefile("Hello World", "/storage/test.txt");
if (result === "SUCCESS") {
    console.log("File written successfully");
}`
            },
            {
                name: "movefile",
                signature: "String movefile(String from, String to)",
                description: "Moves a file from one location to another.",
                parameters: [
                    {
                        name: "from",
                        type: "String",
                        description: "Source file path"
                    },
                    {
                        name: "to",
                        type: "String",
                        description: "Destination file path"
                    }
                ],
                returns: {
                    type: "String",
                    description: "SUCCESS on success, or error codes: FILE_NOT_EXISTS, PERMISSION_DENIED, FAIL"
                },
                permissions: ["WRITE_STORAGE", "MANAGE_STORAGE"],
                example: `const result = FileApi.movefile("/storage/old.txt", "/storage/new.txt");`
            },
            {
                name: "copyfile",
                signature: "String copyfile(String from, String to)",
                description: "Copies a file from one location to another.",
                parameters: [
                    {
                        name: "from",
                        type: "String",
                        description: "Source file path"
                    },
                    {
                        name: "to",
                        type: "String",
                        description: "Destination file path"
                    }
                ],
                returns: {
                    type: "String",
                    description: "SUCCESS on success, or error codes: FILE_NOT_EXISTS, PERMISSION_DENIED, FAIL"
                },
                permissions: ["WRITE_STORAGE", "MANAGE_STORAGE"],
                example: `FileApi.copyfile("/storage/source.txt", "/storage/backup.txt");`
            },
            {
                name: "removefile",
                signature: "String removefile(String path)",
                description: "Deletes a file at the specified path.",
                parameters: [
                    {
                        name: "path",
                        type: "String",
                        description: "Path to the file to delete"
                    }
                ],
                returns: {
                    type: "String",
                    description: "SUCCESS on success, or error codes: FILE_NOT_EXISTS, PERMISSION_DENIED, FAIL"
                },
                permissions: ["WRITE_STORAGE", "MANAGE_STORAGE"],
                example: `const result = FileApi.removefile("/storage/temp.txt");`
            },
            {
                name: "isFileExists",
                signature: "boolean isFileExists(String path)",
                description: "Checks if a file exists at the specified path.",
                parameters: [
                    {
                        name: "path",
                        type: "String",
                        description: "Path to check"
                    }
                ],
                returns: {
                    type: "boolean",
                    description: "true if file exists and path is allowed, false otherwise"
                },
                permissions: [],
                example: `if (FileApi.isFileExists("/storage/config.json")) {
    const config = FileApi.readfile("/storage/config.json");
}`
            },
            {
                name: "getfilelist",
                signature: "String getfilelist(String path)",
                description: "Returns a JSON array of files and directories in the specified directory.",
                parameters: [
                    {
                        name: "path",
                        type: "String",
                        description: "Directory path"
                    }
                ],
                returns: {
                    type: "String",
                    description: "JSON array of file/directory names, or empty array on error/no permission"
                },
                permissions: ["READ_STORAGE", "MANAGE_STORAGE"],
                example: `const filesJson = FileApi.getfilelist("/storage/documents");
const files = JSON.parse(filesJson);
files.forEach(file => console.log(file));`
            },
            {
                name: "getAbsolutePath",
                signature: "String getAbsolutePath(String relative)",
                description: "Converts a relative path to an absolute HOS internal storage path. Can be used in HTML5 media players.",
                parameters: [
                    {
                        name: "relative",
                        type: "String",
                        description: "Relative path (e.g., /myfile.txt)"
                    }
                ],
                returns: {
                    type: "String",
                    description: "Absolute path or FAIL on error"
                },
                permissions: [],
                example: `const absPath = FileApi.getAbsolutePath("/data/apps");
// Returns: /data/user/0/com.dmfnn.htmlos/files/HOS/data/apps`
            }
        ]
    },
    {
        name: "PreferenceApi",
        interface: "PreferenceApi",
        description: "Manages application preferences (key-value storage) stored in prefs.json for each app.",
        package: "com.dmfnn.htmlos.sysapi",
        methods: [
            {
                name: "getpkey",
                signature: "String getpkey(String key)",
                description: "Retrieves the value of a preference key.",
                parameters: [
                    {
                        name: "key",
                        type: "String",
                        description: "Preference key name"
                    }
                ],
                returns: {
                    type: "String",
                    description: "Value as string, or error codes: NULL, KEY_NOT_EXISTS, ERROR"
                },
                permissions: [],
                example: `const username = PreferenceApi.getpkey("username");
if (username !== "KEY_NOT_EXISTS") {
    console.log("Welcome,", username);
}`
            },
            {
                name: "setpkey",
                signature: "boolean setpkey(String key, String value)",
                description: "Sets a preference key-value pair. Creates the key if it doesn't exist.",
                parameters: [
                    {
                        name: "key",
                        type: "String",
                        description: "Preference key name"
                    },
                    {
                        name: "value",
                        type: "String",
                        description: "Value to store"
                    }
                ],
                returns: {
                    type: "boolean",
                    description: "true on success, false on failure"
                },
                permissions: [],
                example: `PreferenceApi.setpkey("theme", "dark");
PreferenceApi.setpkey("fontSize", "16");`
            },
            {
                name: "haspkey",
                signature: "boolean haspkey(String key)",
                description: "Checks if a preference key exists.",
                parameters: [
                    {
                        name: "key",
                        type: "String",
                        description: "Preference key name"
                    }
                ],
                returns: {
                    type: "boolean",
                    description: "true if key exists, false otherwise"
                },
                permissions: [],
                example: `if (!PreferenceApi.haspkey("firstRun")) {
    // Show welcome screen
    PreferenceApi.setpkey("firstRun", "false");
}`
            },
            {
                name: "removepkey",
                signature: "boolean removepkey(String key)",
                description: "Removes a preference key.",
                parameters: [
                    {
                        name: "key",
                        type: "String",
                        description: "Preference key to remove"
                    }
                ],
                returns: {
                    type: "boolean",
                    description: "true if removed, false if key doesn't exist or error"
                },
                permissions: [],
                example: `PreferenceApi.removepkey("temporaryData");`
            }
        ]
    },
    {
        name: "RuntimeApi",
        interface: "RuntimeApi",
        description: "Provides runtime operations like showing toasts, exiting the app, and retrieving startup data.",
        package: "com.dmfnn.htmlos.sysapi",
        methods: [
            {
                name: "maketoast",
                signature: "void maketoast(String text)",
                description: "Displays a toast message to the user.",
                parameters: [
                    {
                        name: "text",
                        type: "String",
                        description: "Message to display"
                    }
                ],
                returns: {
                    type: "void",
                    description: "No return value"
                },
                permissions: [],
                example: `RuntimeApi.maketoast("Operation completed successfully!");`
            },
            {
                name: "exit",
                signature: "void exit()",
                description: "Closes the current application.",
                parameters: [],
                returns: {
                    type: "void",
                    description: "No return value"
                },
                permissions: [],
                example: `// Close app when user clicks exit button
document.getElementById("exitBtn").onclick = function() {
    RuntimeApi.exit();
};`
            },
            {
                name: "getStartData",
                signature: "String getStartData()",
                description: "Retrieves the data passed to the app when it was started (intent data).",
                parameters: [],
                returns: {
                    type: "String",
                    description: "Startup data string or null"
                },
                permissions: [],
                example: `const startData = RuntimeApi.getStartData();
if (startData) {
    const data = JSON.parse(startData);
    console.log("Opened file:", data.filePath);
}`
            }
        ]
    },
    {
        name: "ScreenApi",
        interface: "ScreenApi",
        description: "Manages navigation between different screens within an application.",
        package: "com.dmfnn.htmlos.sysapi",
        methods: [
            {
                name: "startScreen",
                signature: "void startScreen(String screen)",
                description: "Navigates to another screen (HTML file) within the same app. The screen name should not include .html extension.",
                parameters: [
                    {
                        name: "screen",
                        type: "String",
                        description: "Screen name without .html extension (e.g., 'settings' for settings.html)"
                    }
                ],
                returns: {
                    type: "void",
                    description: "No return value"
                },
                permissions: [],
                example: `// Navigate to settings screen
document.getElementById("settingsBtn").onclick = function() {
    ScreenApi.startScreen("settings");
};

// Back to main screen
ScreenApi.startScreen("main");`
            }
        ]
    },
    {
        name: "SettingsApi",
        interface: "SettingsApi",
        description: "Access and modify system settings. Write operations require MODIFY_SETTINGS permission.",
        package: "com.dmfnn.htmlos.sysapi",
        methods: [
            {
                name: "getStringKey",
                signature: "String getStringKey(String key)",
                description: "Retrieves a string system setting value.",
                parameters: [
                    {
                        name: "key",
                        type: "String",
                        description: "Setting key (e.g., 'system.ui.shellPrefix')"
                    }
                ],
                returns: {
                    type: "String",
                    description: "Setting value or 'none' if not found"
                },
                permissions: [],
                example: `const prefix = SettingsApi.getStringKey("system.ui.shellPrefix");`
            },
            {
                name: "getBoolKey",
                signature: "boolean getBoolKey(String key)",
                description: "Retrieves a boolean system setting value.",
                parameters: [
                    {
                        name: "key",
                        type: "String",
                        description: "Setting key (e.g., 'system.ui.showAppLoadAnimation')"
                    }
                ],
                returns: {
                    type: "boolean",
                    description: "Setting value or false if not found"
                },
                permissions: [],
                example: `if (SettingsApi.getBoolKey("system.debug.enableJavaScriptLogs")) {
    console.log("Debug mode enabled");
}`
            },
            {
                name: "getNumKey",
                signature: "int getNumKey(String key)",
                description: "Retrieves a numeric system setting value.",
                parameters: [
                    {
                        name: "key",
                        type: "String",
                        description: "Setting key (e.g., 'system.proc.maxBackgroundApps')"
                    }
                ],
                returns: {
                    type: "int",
                    description: "Setting value or 0 if not found"
                },
                permissions: [],
                example: `const maxApps = SettingsApi.getNumKey("system.proc.maxBackgroundApps");`
            },
            {
                name: "setStringKey",
                signature: "void setStringKey(String key, String value)",
                description: "Sets a string system setting value.",
                parameters: [
                    {
                        name: "key",
                        type: "String",
                        description: "Setting key"
                    },
                    {
                        name: "value",
                        type: "String",
                        description: "New value"
                    }
                ],
                returns: {
                    type: "void",
                    description: "No return value"
                },
                permissions: ["MODIFY_SETTINGS"],
                example: `SettingsApi.setStringKey("system.ui.userPrefix", "[Admin] ");`
            },
            {
                name: "setBoolKey",
                signature: "void setBoolKey(String key, double value)",
                description: "Sets a boolean system setting value. Use 1 for true, 0 for false.",
                parameters: [
                    {
                        name: "key",
                        type: "String",
                        description: "Setting key"
                    },
                    {
                        name: "value",
                        type: "double",
                        description: "1 for true, 0 for false"
                    }
                ],
                returns: {
                    type: "void",
                    description: "No return value"
                },
                permissions: ["MODIFY_SETTINGS"],
                example: `SettingsApi.setBoolKey("system.ui.showAppLoadAnimation", 1);`
            },
            {
                name: "setNumKey",
                signature: "void setNumKey(String key, double value)",
                description: "Sets a numeric system setting value.",
                parameters: [
                    {
                        name: "key",
                        type: "String",
                        description: "Setting key"
                    },
                    {
                        name: "value",
                        type: "double",
                        description: "New value"
                    }
                ],
                returns: {
                    type: "void",
                    description: "No return value"
                },
                permissions: ["MODIFY_SETTINGS"],
                example: `SettingsApi.setNumKey("system.proc.maxBackgroundApps", 5);`
            },
            {
                name: "getSettingsList",
                signature: "String getSettingsList()",
                description: "Returns a JSON array of all available system settings with their metadata.",
                parameters: [],
                returns: {
                    type: "String",
                    description: "JSON array containing settings info (key, type, defaultValue, currentValue, min/max for numbers)"
                },
                permissions: [],
                example: `const settingsJson = SettingsApi.getSettingsList();
const settings = JSON.parse(settingsJson);
settings.forEach(setting => {
    console.log(setting.key + ":", setting.currentValue);
});`
            }
        ]
    },
    {
        name: "NotificationApi",
        interface: "NotificationsApi",
        description: "Allows apps to post system notifications. Requires POST_NOTIFICATIONS permission.",
        package: "com.dmfnn.htmlos.sysapi",
        methods: [
            {
                name: "postNotification",
                signature: "void postNotification(String message, String data)",
                description: "Posts a system notification with a message and optional data payload.",
                parameters: [
                    {
                        name: "message",
                        type: "String",
                        description: "Notification message to display"
                    },
                    {
                        name: "data",
                        type: "String",
                        description: "Additional data (JSON string or any string)"
                    }
                ],
                returns: {
                    type: "void",
                    description: "No return value"
                },
                permissions: ["POST_NOTIFICATIONS"],
                example: `NotificationsApi.postNotification(
    "Download Complete", 
    JSON.stringify({file: "document.pdf", size: "2.5MB"})
);`
            }
        ]
    },
    {
        name: "PermissionApi",
        interface: "PermissionApi",
        description: "Manages application permissions - requesting, checking, and removing permissions.",
        package: "com.dmfnn.htmlos.sysapi",
        methods: [
            {
                name: "requestPermission",
                signature: "boolean requestPermission(String permission)",
                description: "Requests a runtime permission from the user.",
                parameters: [
                    {
                        name: "permission",
                        type: "String",
                        description: "Permission name (e.g., 'READ_STORAGE', 'WRITE_STORAGE')"
                    }
                ],
                returns: {
                    type: "boolean",
                    description: "true if granted, false if denied or invalid permission"
                },
                permissions: [],
                example: `if (PermissionApi.requestPermission("WRITE_STORAGE")) {
    // Permission granted, can write files
    FileApi.writefile("data", "/storage/file.txt");
} else {
    RuntimeApi.maketoast("Storage permission denied");
}`
            },
            {
                name: "checkSelfPermission",
                signature: "boolean checkSelfPermission(String permission)",
                description: "Checks if the app currently has a specific permission.",
                parameters: [
                    {
                        name: "permission",
                        type: "String",
                        description: "Permission name to check"
                    }
                ],
                returns: {
                    type: "boolean",
                    description: "true if permission is granted, false otherwise"
                },
                permissions: [],
                example: `if (!PermissionApi.checkSelfPermission("POST_NOTIFICATIONS")) {
    PermissionApi.requestPermission("POST_NOTIFICATIONS");
}`
            },
            {
                name: "removePermission",
                signature: "void removePermission(String permission)",
                description: "Removes a permission from the current app. Requires MANAGE_PERMISSIONS permission.",
                parameters: [
                    {
                        name: "permission",
                        type: "String",
                        description: "Permission to remove"
                    }
                ],
                returns: {
                    type: "void",
                    description: "No return value"
                },
                permissions: ["MANAGE_PERMISSIONS"],
                example: `// Advanced: Only for system/admin apps
PermissionApi.removePermission("WRITE_STORAGE");`
            }
        ]
    },
    {
        name: "AssetApi",
        interface: "AssetApi",
        description: "Provides access to application assets stored in the /assets directory.",
        package: "com.dmfnn.htmlos.sysapi",
        methods: [
            {
                name: "getStringAsset",
                signature: "String getStringAsset(String path)",
                description: "Reads an asset file as a string. Path is relative to app's assets directory.",
                parameters: [
                    {
                        name: "path",
                        type: "String",
                        description: "Relative path to asset (e.g., 'config.json' or 'data/info.txt')"
                    }
                ],
                returns: {
                    type: "String",
                    description: "Asset content as string, or error codes: ASSET_NOT_FOUND, FAIL"
                },
                permissions: [],
                example: `const config = AssetApi.getStringAsset("config.json");
if (config !== "ASSET_NOT_FOUND") {
    const settings = JSON.parse(config);
}`
            },
            {
                name: "getAssetBase64",
                signature: "String getAssetBase64(String path)",
                description: "Reads an asset file and returns it as Base64 encoded string. Useful for binary assets like images.",
                parameters: [
                    {
                        name: "path",
                        type: "String",
                        description: "Relative path to asset"
                    }
                ],
                returns: {
                    type: "String",
                    description: "Base64 encoded content, or error codes: ASSET_NOT_FOUND, FAIL"
                },
                permissions: [],
                example: `const imgBase64 = AssetApi.getAssetBase64("images/logo.png");
if (imgBase64 !== "FAIL") {
    document.getElementById("logo").src = 
        "data:image/png;base64," + imgBase64;
}`
            }
        ]
    }
];
