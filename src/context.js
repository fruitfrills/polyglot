import {saveFile, FileManager, displayDialog, readFile} from './helpers';

export default class Polyglot {

    constructor(context) {

        const document = context.document;
        const localeContext = {};

        this.folder_path = null;
        this.config_file_path = null;
        this.locales = [];
        this.current_locale = null;

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
            this.folder_path = translationsFolderPath;

            // Check if config file (with current_locale) exists
            this.config_file_path = `${translationsFolderPath}.config`;

            if (!fileManager.exist(this.config_file_path)) {
                return localeContext;
            }

            const configFileContent = readFile(this.config_file_path);

            // Check translations folder files
            const dirContents = fileManager.dir(translationsFolderPath);


            for (let i = 0; i < dirContents.count(); i++) {
                if (dirContents[i].includes(".json")) {
                    const locale = dirContents[i].replace('.json', '');
                    this.locales.push(locale);
                    if (String(configFileContent) === String(locale)){
                        this.current_locale = locale;
                    }
                }
            }
        }
    }

    getLocaleTextFromFile(locale) {
        const fileName = `${this.folder_path}${locale}.json`;
        const fileContent = NSString.stringWithContentsOfFile_encoding_error(fileName, NSUTF8StringEncoding, null);
        return JSON.parse(fileContent);
    }

    localeIsAvailable(selected_locale) {
        for (const locale of this.locales) {
            if (String(locale) === String(selected_locale)) {
                return true;
            }
        }
        return false;
    }

    saveLocaleToFile(textLayersContent) {
        return saveFile(
            `${this.folder_path}${this.current_locale}.json`,
            JSON.stringify(textLayersContent, undefined, 2)
        )
    }

    saveConfigFile() {
        return saveFile(
            this.config_file_path,
            this.current_locale,
        );
    }
}
