// override symbols
const processOverrides = function (override, possibleTextfields) {
    const returnValue = {};
    const overrideKeys = Object.keys(override);
    const overrideKeysLength = overrideKeys.length;

    for (let i = 0; i < overrideKeysLength; i++) {
        const key = overrideKeys[i];
        let value = override[key];
        if ((value.class() + "").indexOf("String") !== -1) {
            if (possibleTextfields[key]) {
                returnValue[key] = escape(value)
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

// override symbols
function fillOverride(defaultValue, override) {
    const newOverride = defaultValue || NSMutableDictionary.dictionary();
    const newMutableOverrides = NSMutableDictionary.dictionaryWithDictionary(newOverride);
    const overrideKeys = Object.keys(override);
    const overrideKeysLength = overrideKeys.length;

    for (let i = 0; i < overrideKeysLength; i++) {
        const key = overrideKeys[i];
        const value = override[key];
        if (typeof value === "string") {
            newMutableOverrides.setObject_forKey(value, key);
        } else {
            const subdictionary = newMutableOverrides.objectForKey(key);
            newMutableOverrides.setObject_forKey(fillOverride(subdictionary, value), key);
        }
    }

    return newMutableOverrides
}
import {displayDialog} from './helpers';

const parseArtboard = function (artboard, symbolTextLayer) {

    const content = {
        name: String(artboard.name()),
        texts: {}
    };

    // get all contents
    const layers = artboard.children();
    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        try {


        let value;
        switch (layer.class()) {

            case MSTextLayer:
                value = escape(layer.stringValue());
                if (String(value) !== "") {
                    content.texts[escape(layer.objectID())] = value;
                }
                break;
            case MSSymbolInstance:
                value = processOverrides(layer.overrides(), symbolTextLayer);
                if (Object.getOwnPropertyNames(value).length > 0) {
                    content.texts[escape(layer.objectID())] = value;
                }
                break
        }
      } catch (err) {
        displayDialog(`Catch error at '${artboard.name()}'. ${err.message}`, `Error`)
      }
    }
    return content;
};
// getting content from all pages and artboards;
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
                const key_string = escape(layer.objectID());
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
    return contents;
};

export const setContent = (pages, polyglot, selected_locale) => {

    if (!polyglot.localeIsAvailable(selected_locale)) {
        return false;
    }
    const _localeContext = polyglot.getLocaleTextFromFile(selected_locale);
    const localeText = {};

    for (let i = 0; i < _localeContext.length; i++) {
        for (let j = 0; j < _localeContext[i].artboards.length; j++) {
            for (let id in _localeContext[i].artboards[j].texts) {
                localeText[id] = _localeContext[i].artboards[j].texts[id];
            }
        }
    }

    for (let i = 0; i < pages.length; i++) {
        const artboards = pages[i].artboards();

        for (let a = 0; a < artboards.length; a++) {

            const layers = artboards[a].children();

            for (let j = 0; j < layers.length; j++) {
                let key_string;
                switch (layers[j].class()) {
                    case MSTextLayer:
                        key_string = escape(layers[j].objectID());
                        if (localeText[key_string]) {
                            layers[j].setStringValue(localeText[key_string])
                        }
                        break;
                    case MSSymbolInstance:
                        key_string = escape(layers[j].objectID());
                        const value = localeText[key_string];
                        if (value) {
                            const overrides = fillOverride(layers[j].overrides(), value);
                            if (overrides && Object.keys(overrides).length > 0) {
                                layers[j].overrides = overrides;
                            }
                        }
                        break;
                    default:
                }
            }
        }
    }

    polyglot.current_locale = selected_locale;
    polyglot.saveConfigFile();
    return true
}
