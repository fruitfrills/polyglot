
// helper for filemanager
export class FileManager {

    constructor () {
        this._fm = NSFileManager.defaultManager();
    }

    dir(path) {
        return this._fm.contentsOfDirectoryAtPath_error(path, null)
    }

    exist(path) {
        return this._fm.fileExistsAtPath(path)
    }

    mkdir(path) {
        return this._fm.createDirectoryAtPath_withIntermediateDirectories_attributes_error(path, true, null, null)
    }
}

export const displayDialog = (text, title) => {
    const app = NSApplication.sharedApplication();
    if (title) {
        app.displayDialog_withTitle(text, title);
        return
    }
    app.displayDialog(text);
};

export const readFile = (path) => NSString.stringWithContentsOfFile_encoding_error(path, NSUTF8StringEncoding, null);

export const saveFile = (path, content) => Boolean(
    NSString.stringWithFormat(content)
    .writeToFile_atomically_encoding_error(path, true, NSUTF8StringEncoding, null)
);