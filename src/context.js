export default function getLocaleContext(context) {

      var document = context.document;
      var app = NSApplication.sharedApplication();
      var localeContext = {};
      localeContext['folder_path'] = null;
      localeContext['config_file_path'] = null;
      localeContext['locales'] = new Array();
      localeContext['current_locale'] = null;

      // Check if document is saved
      if ( document.fileURL() == null ){
          app.displayDialog_withTitle('You need to save the document in your computer in order to save texts translations.', 'Document required');
        }
      else {
          var documentName = document.displayName()
          var documentFolderPath = decodeURIComponent(document.fileURL()).replace('file://','').replace(documentName,'').replace('.sketch','')
          var translationsFolderName = documentName.replace('.sketch','')+'_translations'
          var translationsFolderPath = documentFolderPath+translationsFolderName+'/'
          var fileManager = NSFileManager.defaultManager()

          // Create translations folder if does not exists
          if(fileManager.fileExistsAtPath(translationsFolderPath)){
            // translation folder exists
          }else{
        if(fileManager.createDirectoryAtPath_withIntermediateDirectories_attributes_error(translationsFolderPath, true, null, null))
            {
              context.document.showMessage('Translations folder created.')
            } else {
              app.displayDialog_withTitle('It has been an error when creating translations folder.', 'Error');
            }

          }

          // Check translations folder
          if(fileManager.fileExistsAtPath(translationsFolderPath)){
              localeContext['folder_path'] = translationsFolderPath

              // Check if config file (with current_locale) exists
              localeContext['config_file_path'] = translationsFolderPath+'.config'
              if(fileManager.fileExistsAtPath(localeContext['config_file_path'])) {
                var configFileContent = NSString.stringWithContentsOfFile_encoding_error(localeContext['config_file_path'], NSUTF8StringEncoding, 'NULL');
              }

              // Check translations folder files
              var dirContents = fileManager.contentsOfDirectoryAtPath_error(translationsFolderPath, null);

              for(var i = 0; i < dirContents.count(); i++)
                  if(dirContents[i].includes(".json")){
                      const locale = dirContents[i].replace('.json','')
                      localeContext['locales'].push(locale)
                      if(String(configFileContent) == String(locale)) {
                        localeContext['current_locale'] = locale;
                      }

                  }

          }
      }
      return localeContext

  }
