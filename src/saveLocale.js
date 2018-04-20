import {getContent} from './content';
import getLocaleContext from './context';

export function saveLocaleToFile(localeContext,textLayersContent) {
    var currentLocaleContent = JSON.stringify(textLayersContent, undefined, 2)
    var currentLocaleFilePath = localeContext['folder_path']+localeContext['current_locale']+'.json'
    return Boolean(NSString.stringWithFormat(currentLocaleContent).writeToFile_atomically_encoding_error(currentLocaleFilePath, true, NSUTF8StringEncoding, null))
}

export function saveConfigFile(localeContext) {
    var currentLocaleFile = localeContext['current_locale'];
    if (!NSString.stringWithFormat(currentLocaleFile).writeToFile_atomically_encoding_error(localeContext['config_file_path'], true, NSUTF8StringEncoding, undefined )) {
      context.document.showMessage('It has been an error when saving config file.')
    }
}

function getNewLocaleByUser(){

    var response = null

    var accessory = NSView.alloc().initWithFrame(NSMakeRect(0,0,300,50));
    var input = NSTextField.alloc().initWithFrame(NSMakeRect(0,25,300,25));
    input.editable = true;
    accessory.addSubview(input);
    var alert = NSAlert.alloc().init()
    alert.setMessageText('Set locale name')
    alert.setInformativeText('Recomended naming: es_ES, en_EN, es, en, es_CO...')
    alert.setAccessoryView(accessory)
    alert.addButtonWithTitle('Save')
    alert.addButtonWithTitle('Cancel')

    var responseCode = alert.runModal()
    var selected_locale_input = input.stringValue()

    if(responseCode==1000 && selected_locale_input!='') {
      response = selected_locale_input;
    }
    return response
}


export default function saveLocale(context) {

    var document = context.document;
    var app = NSApplication.sharedApplication();

    var localeContext = getLocaleContext(context);

    if (localeContext['folder_path']){
        if (!localeContext['current_locale'])
        {
            const newLocaleByUser = getNewLocaleByUser();
            if(newLocaleByUser) {
                localeContext['current_locale'] = newLocaleByUser;
                saveConfigFile(localeContext);
            }
        }
        if(localeContext['current_locale']) {
            var textLayersContent = getContent(document.pages());
            context.document.showMessage("wtg???");
            if(saveLocaleToFile(localeContext,textLayersContent)) {
              context.document.showMessage("'" + localeContext['current_locale']+"' locale saved.")
            }

        }
    }

}
