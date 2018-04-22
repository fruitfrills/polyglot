import saveLocale, {getNewLocaleByUser} from './saveLocale';
import Polyglot from './context';
import {getContent, setContent} from './content';


export default function changeLocale(context) {

    const polyglot = new Polyglot(context);

    if (!polyglot.folder_path) {
        return
    }

    const window = NSWindow.alloc().init();
    window.setTitle("Change locale");
    window.setFrame_display(NSMakeRect(0, 0, 600, 170), false);

    const promptField = NSTextField.alloc().initWithFrame(NSMakeRect(0, 0, 0, 0));
    promptField.setEditable(false);
    promptField.setBordered(false);
    promptField.setDrawsBackground(false);
    promptField.setStringValue("Select locale from list or create a new one:");
    promptField.sizeToFit();
    promptField.setFrame(NSMakeRect(20, 100, promptField.frame().size.width, promptField.frame().size.height))
    window.contentView().addSubview(promptField);

    const inputField = NSComboBox.alloc().initWithFrame(NSMakeRect(promptField.frame().size.width + 30, 95, 180, 25));
    inputField.addItemsWithObjectValues(polyglot.locales);
    inputField.setEditable(false);
    window.contentView().addSubview(inputField);
    if (polyglot.current_locale) {
        inputField.selectItemWithObjectValue(polyglot.current_locale)
    }

    const okButton = NSButton.alloc().initWithFrame(NSMakeRect(0, 0, 0, 0));
    okButton.setTitle("  Change  ");
    okButton.setBezelStyle(NSRoundedBezelStyle);
    okButton.sizeToFit();
    okButton.setFrame(NSMakeRect(window.frame().size.width - okButton.frame().size.width - 20, 14, okButton.frame().size.width, okButton.frame().size.height));
    okButton.setKeyEquivalent("\r"); // return key
    okButton.setCOSJSTargetFunction((sender) => {
        if (setContent(context.document.pages(), polyglot, inputField.stringValue())) {
            context.document.showMessage( `Changed to locale  '${polyglot.current_locale}'.`);
            window.orderOut(undefined);
            NSApp.stopModal();
        } else {
            context.document.showMessage('It has been an error, please try again.')
        }
    });
    window.contentView().addSubview(okButton);

    const cancelButton = NSButton.alloc().initWithFrame(NSMakeRect(0, 0, 0, 0));
    cancelButton.setTitle("  Cancel  ");
    cancelButton.setBezelStyle(NSRoundedBezelStyle);
    cancelButton.sizeToFit();
    cancelButton.setFrame(NSMakeRect(okButton.frame().origin.x - cancelButton.frame().size.width, 14, cancelButton.frame().size.width, cancelButton.frame().size.height));
    cancelButton.setKeyEquivalent("\\033"); // escape key
    cancelButton.setCOSJSTargetFunction((sender) => {
        window.orderOut(undefined);
        NSApp.stopModal();
    });

    window.contentView().addSubview(cancelButton);

    const newLocaleButton = NSButton.alloc().initWithFrame(NSMakeRect(0, 0, 0, 0));
    newLocaleButton.setTitle("  Add new locale  ");
    newLocaleButton.setBezelStyle(NSRoundedBezelStyle);
    newLocaleButton.sizeToFit();
    newLocaleButton.setFrame(NSMakeRect(20, okButton.frame().size.height + 14, 560, newLocaleButton.frame().size.height));
    newLocaleButton.setCOSJSTargetFunction((sender) => {
        const newLocaleName = getNewLocaleByUser();
        if (newLocaleName) {
            polyglot.current_locale = newLocaleName;
            polyglot.saveConfigFile();
            const textLayersContent = getContent(context);
            if (polyglot.saveLocaleToFile(textLayersContent)) {
                context.document.showMessage(`'${polyglot.current_locale}'  locale created.`);
                window.orderOut(undefined);
                NSApp.stopModal();
            }
        }
    });
    window.contentView().addSubview(newLocaleButton);
    const saveLocaleButton = NSButton.alloc().initWithFrame(NSMakeRect(0, 0, 0, 0));
    let saveLocaleButtonTitle = '  Save current locale  ';
    if (polyglot.current_locale) {
        saveLocaleButtonTitle = `  Save current locale '${polyglot.current_locale}'  `;
    }
    saveLocaleButton.setTitle(saveLocaleButtonTitle);
    saveLocaleButton.setBezelStyle(NSRoundedBezelStyle);
    saveLocaleButton.sizeToFit();
    saveLocaleButton.setFrame(NSMakeRect(20, 14, saveLocaleButton.frame().size.width, saveLocaleButton.frame().size.height))
    saveLocaleButton.setCOSJSTargetFunction((sender) => saveLocale(context));
    window.contentView().addSubview(saveLocaleButton);
    NSApp.runModalForWindow(window);
}
