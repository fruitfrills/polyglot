import {getContent} from './content';
import getLocaleContext from './context';
import {saveFile} from './helpers';

export const saveLocaleToFile = (localeContext, textLayersContent) => saveFile(
    `${localeContext['folder_path']}${localeContext['current_locale']}.json`,
    JSON.stringify(textLayersContent, undefined, 2)
);


export const saveConfigFile = (localeContext) => saveFile(
    localeContext['config_file_path'], localeContext['current_locale']
);

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
    const localeContext = getLocaleContext(context);

    if (localeContext['folder_path']) {
        if (!localeContext['current_locale']) {
            const newLocaleByUser = getNewLocaleByUser();

            if (newLocaleByUser) {
                localeContext['current_locale'] = newLocaleByUser;
                saveConfigFile(localeContext);
            }
        }
        if (localeContext['current_locale']) {
            const textLayersContent = getContent(document.pages());


            if (saveLocaleToFile(localeContext, textLayersContent)) {
                context.document.showMessage("'" + localeContext['current_locale'] + "' locale saved.")
            }
        }
    }
}
