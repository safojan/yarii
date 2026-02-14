declare module '@editorjs/table' {
  interface TableConstructor {
    data: any;
    config: any;
    api: any;
    readOnly: boolean;
    block?: any; // <-- add this line
  }
}
