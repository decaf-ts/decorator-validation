## Prompts to generate bulk actions

 - Bulk JSDoc
```
- glob all the files under `src/**/*.ts`
- for each file, identify the prompt from  `workdocs/prompts/documention.md` most appropriate with the file content and tell me what it is;
- for each file run the selected prompt ONLY to document the code in the file;
stop only when the task is done
```

 - Bulk Examples
```
- glob all the source files under `src/**/*.ts`
- for each file, identify all classes and functions;
- from the identified elements, elaborate a short summary of the intent of the library and write in `workdocs/1-Header.md` under the banner and title
- from the identified elements, elaborate a detailed description of the intent of the library and write in `workdocs/4-Description.md` under the title
- write examples in the `workdocs/5-HowToUse.md` file for all the identified elements
- each exaple MUST contain:
  - Description of the use case;
  - typescript example using the appropriate typescript code notation in md format
stop only when the task is done
```