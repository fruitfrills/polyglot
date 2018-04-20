import {FileManager, displayDialog, readFile} from './utils';

export default function getLocaleContext(context) {

    const document = context.document;
    const localeContext = {};

    localeContext['folder_path'] = null;
    localeContext['config_file_path'] = null;
    localeContext['locales'] = [];
    localeContext['current_locale'] = null;

    // Check if document is saved
    if (document.fileURL() === null) {
        displayDialog('You need to save the document in your computer in order to save texts translations.', 'Document required');
        return
    }

    const documentName = document.displayName();

    // get project folder
    const documentFolderPath = decodeURIComponent(document.fileURL())
        .replace('file://', '')
        .replace(documentName, '')
        .replace('.sketch', '');

    const translationsFolderName = documentName.replace('.sketch', '') + '_polyglot';

    const translationsFolderPath = documentFolderPath + translationsFolderName + '/';

    // get FileManaager
    const fileManager = new FileManager();

    // Create translations folder if does not exists
    if (!fileManager.exist(translationsFolderPath)) {
        if (fileManager.mkdir(translationsFolderPath)) {
            context.document.showMessage('Translations folder created.')
        } else {
            displayDialog('It has been an error when creating translations folder.', 'Error');
        }

    }

    // Check translations folder
    if (fileManager.exist(translationsFolderPath)) {
        localeContext['folder_path'] = translationsFolderPath;

        // Check if config file (with current_locale) exists
        localeContext['config_file_path'] = `${translationsFolderPath}.config`;

        if (!fileManager.exist(localeContext['config_file_path'])) {
            return
        }

        const configFileContent = readFile(localeContext['config_file_path']);

        // Check translations folder files
        const dirContents = fileManager.dir(translationsFolderPath);

        for (const content of dirContents) {
            if (content.includes('.json')) {
                const locale = content.replace('.json', '');
                if (String(configFileContent) === String(locale)) {
                    localeContext['current_locale'] = locale;
                }
            }
        }
    }
    return localeContext
}
