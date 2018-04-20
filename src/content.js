import {displayDialog} from './utils';

const processOverrides = function (override, possibleTextfields) {
    const returnValue = {};
    const overrideKeys = Object.keys(override);
    const overrideKeysLength = overrideKeys.length;

    for (let i = 0; i < overrideKeysLength; i++) {
        const key = overrideKeys[i];
        let value = override[key];
        if ((value.class() + "").indexOf("String") !== -1) {
            if (possibleTextfields[key]) {
                returnValue[key] = decodeURI(value)
            }
        } else if (value) {
            value = processOverrides(value, possibleTextfields);
            if (value && Object.getOwnPropertyNames(value).length > 0) {
                returnValue[key] = value
            }
        }
    }
    return returnValue
};

const parseArtboard = function (artboard, symbolTextLayer) {

    const content = {
        name: String(artboard.name()),
        texts: {}
    };

    // get all contents
    const layers = artboard.children();
    for (var i = 0; i < layers.length; i++) {
        const layer = layers[i];
        let value;
        switch (layer.class()) {

            case MSTextLayer:
                value = decodeURI(layer.stringValue());
                if (String(value) !== "") {
                  content.texts[decodeURI(layer.objectID())] = value;
                }
                break;
            case MSSymbolInstance:
                value = processOverrides(layer.overrides(), symbolTextLayer);
                if (Object.getOwnPropertyNames(value).length > 0) {
                  content.texts[decodeURI(layer.objectID())] = value;
                }
                break
        }
    }
    return content;
};


export const getContent = function (pages) {

    let page;
    const contents = [];

    const symbolTextLayer = {};
    // prepare symbol string for override
    for (let i = 0; i < pages.count(); i++) {
        page = pages[i];
        const layers = page.children();
        for (let j = 0; j < layers.length; j++) {
            const layer = layers[j];
            if (layer.class() === MSTextLayer) {
                const key_string = decodeURI(layer.objectID());
                symbolTextLayer[key_string] = true
            }
        }
    }

    // check all nodes

    for (let i = 0; i < pages.length; i++) {
        page = pages[i];
        // page content
        const content = {
            name: String(page.name()),
            artboards: []
        };

        // get artboard
        const artboards = page.artboards();

        // get artboards content;
        for (let j = 0; j < artboards.length; j++) {
            const artboard = artboards[j];
            const artboardContent = parseArtboard(artboard, symbolTextLayer);
            if (Object.getOwnPropertyNames(artboardContent.texts).length > 0) {
                content.artboards.push(artboardContent);
            }

        }
        contents.push(content);
    }
    displayDialog("second", 's')

    return contents;
};
