var jam = {
    "packages": [
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "w2ui",
            "location": "jam/w2ui",
            "main": "w2ui.js"
        }
    ],
    "version": "0.2.13",
    "shim": {
        "w2ui": {
            "deps": [
                "jquery"
            ],
            "exports": "w2ui"
        }
    }
};

if (typeof require !== "undefined" && require.config) {
    require.config({
    "packages": [
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "w2ui",
            "location": "jam/w2ui",
            "main": "w2ui.js"
        }
    ],
    "shim": {
        "w2ui": {
            "deps": [
                "jquery"
            ],
            "exports": "w2ui"
        }
    }
});
}
else {
    var require = {
    "packages": [
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "w2ui",
            "location": "jam/w2ui",
            "main": "w2ui.js"
        }
    ],
    "shim": {
        "w2ui": {
            "deps": [
                "jquery"
            ],
            "exports": "w2ui"
        }
    }
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}