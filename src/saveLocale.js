import {getContent} from './content';
import Polyglot from './context';

// create new locale
function getNewLocaleByUser() {
    const accessory = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 50));
    const input = NSTextField.alloc().initWithFrame(NSMakeRect(0, 25, 300, 25));
    input.editable = true;
    accessory.addSubview(input);
    const alert = NSAlert.alloc().init();
    alert.setMessageText('Set locale name');
    alert.setInformativeText('Recomended naming: es_ES, en_EN, es, en, es_CO...');
    alert.setAccessoryView(accessory);
    alert.addButtonWithTitle('Save');
    alert.addButtonWithTitle('Cancel');

    const responseCode = alert.runModal();
    const selected_locale_input = input.stringValue();

    if (responseCode === 1000 && selected_locale_input !== '') {
        return selected_locale_input;
    }
}

// save locales
export default function saveLocale(context) {
    const document = context.document;
    const polyglot = new Polyglot(context);

    if (polyglot.folder_path) {
        if (!polyglot.current_locale) {
            const newLocaleByUser = getNewLocaleByUser();

            if (newLocaleByUser) {
                polyglot.current_locale = newLocaleByUser;
                polyglot.saveConfigFile();
            }
        }

        if (polyglot.current_locale) {
            const textLayersContent = getContent(document.pages());

            if (polyglot.saveLocaleToFile(textLayersContent)) {
                context.document.showMessage(`'${polyglot.current_locale}' locale saved.`)
            }
        }
    }
}
