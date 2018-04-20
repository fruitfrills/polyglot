const fillOverride = function (defaultValue, override) {
    const newOverride = defaultValue || NSMutableDictionary.dictionary();
    const newMutableOverrides = NSMutableDictionary.dictionaryWithDictionary(newOverride);

    var overrideKeys = Object.keys(override)
    var overrideKeysLength = overrideKeys.length
    for (var i = 0; i <  overrideKeysLength; i++) {
       var key = overrideKeys[i];
       var value = override[key];
       if (typeof value == "string") {
           newMutableOverrides.setObject_forKey(value,key)
       } else {
           const subdictionary = newMutableOverrides.objectForKey(key)
           newMutableOverrides.setObject_forKey(fillOverride(subdictionary, value),key)
       }
    }
    return newMutableOverrides
}

const processOverrides = function (override, possibleTextfields) {
    const returnValue = {}
    const overrideKeys = Object.keys(override)
    const overrideKeysLength = overrideKeys.length

    for (var i = 0; i <  overrideKeysLength; i++) {
        const key = overrideKeys[i]
        var value = override[key]
        if ((value.class()+"").indexOf("String") != -1) {
            if (possibleTextfields[key]) {
                returnValue[key] = unescape(value)
            }
        } else if (value) {
            value = processOverrides(value, possibleTextfields)
            if (value && Object.getOwnPropertyNames(value).length > 0) {
                returnValue[key] = value
            }
        }
    }
    return returnValue
}

const parseArtboard = function (artboard, symbolTextLayer) {
    const content = {
        name: String(artboard.name()),
        texts: {}
    };
    const layers = artboard.children()
    //
    //
    // //first collect all textlayers for replace symbols

    //
    for (var i = 0; i < layers.length; i++) {
        switch (layers[i].class()){
            case MSTextLayer:
                var value = unescape(layers[i].stringValue());
                if (String(value) != "") {
                  content.texts[unescape(layers[i].objectID())] = value;
                }
                break;
            case MSSymbolInstance:
                var value = processOverrides(layers[i].overrides(), symbolTextLayer);
                if (Object.getOwnPropertyNames(value).length > 0) {
                  content.texts[unescape(layers[i].objectID())] = value;
                }
                break
        }
    }
    return content;
}


const parsePage = function (page, symbolTextLayer) {
    // page content
    const content = {
        name: String(page.name()),
        artboards: []
    };

    const artboards = page.artboards();
    for (var i = 0; i < artboards.count(); i++) {
        const artboardContent = parseArtboard(artboards[i], symbolTextLayer);
        if (Object.getOwnPropertyNames(artboardContent.texts).length > 0) {
            content.artboards.push(artboardContent);
        };
    }
    return content;
}

export const getContent = function (pages) {
    const contents = [];

    var symbolTextLayer = {};
    for (var i = 0; i < pages.count(); i++) {
      var layers = pages[i].children();
      for (var j = 0; j < layers.length; j++) {
          if (layers[j].class() === MSTextLayer) {
              const key_string = unescape(layers[j].objectID())
              symbolTextLayer[key_string] = true
          }
      }
    }

    for (var i = 0; i < pages.count(); i++) {
        contents.push(parsePage(pages[i], symbolTextLayer));
    }
    return contents;
}
