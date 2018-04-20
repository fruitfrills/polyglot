import saveLocale, {saveConfigFile, saveLocaleToFile} from './saveLocale';
import getLocaleContext from './context';
import {getContent} from './content';


function fillOverride(defaultValue, override) {
    const newOverride = defaultValue || NSMutableDictionary.dictionary();
    const newMutableOverrides = NSMutableDictionary.dictionaryWithDictionary(newOverride);

    var overrideKeys = Object.keys(override);
    var overrideKeysLength = overrideKeys.length;
    for (var i = 0; i <  overrideKeysLength; i++) {
       var key = overrideKeys[i];
       var value = override[key];
       if (typeof value === "string") {
           newMutableOverrides.setObject_forKey(value, key);
       } else {
           const subdictionary = newMutableOverrides.objectForKey(key);
           newMutableOverrides.setObject_forKey(fillOverride(subdictionary, value), key);
       }
    }
    return newMutableOverrides
}

function getLocaleTextFromFile(localeContext, locale) {
    var file = localeContext['folder_path']+locale+'.json';
    var fileContent = NSString.stringWithContentsOfFile_encoding_error(file, NSUTF8StringEncoding, null);
    var arrayContent = JSON.parse(fileContent, undefined, 2);
    return arrayContent;
}

function localeIsAvailable(localeContext,selected_locale) {
    for (var i = 0; i < localeContext['locales'].length; i++) {
        if(String(localeContext['locales'][i]) === String(selected_locale));
            return true;
    }
    return false;
}


function updateTextsLayersFromLocale(context,localeContext,selected_locale) {

    var document = context.document;


    if (!localeIsAvailable(localeContext,selected_locale) ) {
      return false;
    }
        var _localeContext = getLocaleTextFromFile(localeContext,selected_locale);
        var localeText = {};
        for (var i=0; i< _localeContext.length; i++) {
            for (var j=0; j<  _localeContext[i].artboards.length; j++) {
                for (var id in _localeContext[i].artboards[j].texts) {
                    localeText[id] = _localeContext[i].artboards[j].texts[id];
                }
            }
        }
        var pages = document.pages();

        for (var i = 0; i < pages.length; i++) {
            const artboards = pages[i].artboards();

            for (var a = 0; a < artboards.length; a++) {

            var layers = artboards[a].children();

            for (var j = 0; j < layers.length; j++) {
                switch (layers[j].class()) {
                  case MSTextLayer:
                    var key_string = unescape(layers[j].objectID());
                    var value_string = unescape(layers[j].stringValue());
                    if (localeText[key_string]) {
                      layers[j].setStringValue(localeText[key_string])
                    }
                      break;
                  case MSSymbolInstance:

                      var key_string = unescape(layers[j].objectID());
                      var value = localeText[key_string];
                        if (key_string  === '47D63924-B3D0-46AB-9AB1-429FE85A5CDC') {
                          context.document.showMessage(unescape(layers[j].objectID()));
                          throw new Error("test");
                        }

                        if (value) {

                          var overrides = fillOverride(layers[j].overrides(), value)
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

        localeContext['current_locale'] = selected_locale;
        saveConfigFile(localeContext);
        return true
}

export default function changeLocale(context) {

    var document = context.document
    var app = NSApplication.sharedApplication();

    const localeContext = getLocaleContext(context);
    context.document.showMessage('Hello!');
    if(localeContext['folder_path']) {

        var window = NSWindow.alloc().init();
        window.setTitle("Change locale");
        window.setFrame_display(NSMakeRect(0, 0, 600, 170), false);

        var promptField = NSTextField.alloc().initWithFrame(NSMakeRect(0, 0, 0, 0));
        promptField.setEditable(false);
        promptField.setBordered(false);
        promptField.setDrawsBackground(false);
        promptField.setStringValue("Select locale from list or create a new one:");
        promptField.sizeToFit();
        promptField.setFrame(NSMakeRect(20, 100, promptField.frame().size.width, promptField.frame().size.height))
        window.contentView().addSubview(promptField);

        var inputField = NSComboBox.alloc().initWithFrame(NSMakeRect(promptField.frame().size.width + 30, 95, 180, 25));
        inputField.addItemsWithObjectValues(localeContext['locales']);
        inputField.setEditable(false);
        window.contentView().addSubview(inputField);
        if(localeContext['current_locale']) {
          inputField.selectItemWithObjectValue(localeContext['current_locale'])
        }

        var okButton = NSButton.alloc().initWithFrame(NSMakeRect(0, 0, 0, 0));
        okButton.setTitle("  Change  ");
        okButton.setBezelStyle(NSRoundedBezelStyle);
        okButton.sizeToFit();
        okButton.setFrame(NSMakeRect(window.frame().size.width - okButton.frame().size.width - 20, 14, okButton.frame().size.width, okButton.frame().size.height));
        okButton.setKeyEquivalent("\r"); // return key
        okButton.setCOSJSTargetFunction( function(sender) {
            if(updateTextsLayersFromLocale(context, localeContext, inputField.stringValue())) {
                context.document.showMessage("Changed to locale '" + localeContext['current_locale'] + "'.")
                window.orderOut(undefined);
                NSApp.stopModal();
            } else {
                context.document.showMessage('It has been an error, please try again.')
            }
        });
        window.contentView().addSubview(okButton);

        var cancelButton = NSButton.alloc().initWithFrame(NSMakeRect(0, 0, 0, 0));
        cancelButton.setTitle("  Cancel  ");
        cancelButton.setBezelStyle(NSRoundedBezelStyle);
        cancelButton.sizeToFit();
        cancelButton.setFrame(NSMakeRect(okButton.frame().origin.x - cancelButton.frame().size.width, 14, cancelButton.frame().size.width, cancelButton.frame().size.height));
        cancelButton.setKeyEquivalent("\\033"); // escape key
        cancelButton.setCOSJSTargetFunction(function(sender) {
            window.orderOut(undefined);
            NSApp.stopModal();
        })
        window.contentView().addSubview(cancelButton)

        var newLocaleButton = NSButton.alloc().initWithFrame(NSMakeRect(0, 0, 0, 0));
        newLocaleButton.setTitle("  Add new locale  ");
        newLocaleButton.setBezelStyle(NSRoundedBezelStyle);
        newLocaleButton.sizeToFit();
        newLocaleButton.setFrame(NSMakeRect(20, okButton.frame().size.height + 14, 560, newLocaleButton.frame().size.height))
        newLocaleButton.setCOSJSTargetFunction(function(sender) {
            var newLocaleName = getNewLocaleByUser();
            if(newLocaleName){
                localeContext['current_locale'] = newLocaleName
                saveConfigFile(localeContext)
                var textLayersContent = getContent(context)
                if(saveLocaleToFile(localeContext,textLayersContent)) {
                    context.document.showMessage("'"+localeContext['current_locale']+"' locale created.")
                    window.orderOut(undefined);
                    NSApp.stopModal();
                }
            }
        })
        window.contentView().addSubview(newLocaleButton)
        var saveLocaleButton = NSButton.alloc().initWithFrame(NSMakeRect(0, 0, 0, 0));
        var saveLocaleButtonTitle = '  Save current locale  '
        if(localeContext['current_locale']){
          saveLocaleButtonTitle = "  Save current locale '" + localeContext['current_locale'] + "'  "
        }
        saveLocaleButton.setTitle(saveLocaleButtonTitle)
        saveLocaleButton.setBezelStyle(NSRoundedBezelStyle)
        saveLocaleButton.sizeToFit()
        saveLocaleButton.setFrame(NSMakeRect(20, 14, saveLocaleButton.frame().size.width, saveLocaleButton.frame().size.height))
        saveLocaleButton.setCOSJSTargetFunction(function(sender) {
            saveLocale(context)
        })
        window.contentView().addSubview(saveLocaleButton);
        NSApp.runModalForWindow(window);
    }
}
