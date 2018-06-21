export default class UploadFileAsFormField {
  constructor(file, fieldName) {
    this.file = file;
    this.fieldName = fieldName;
  }

  toFormData(formData) {
    if (typeof FormData !== 'function') {
      throw new Error('not a browser environment');
    }

    const fData = formData || new FormData();
    fData.append(this.fieldName, this.file);

    return fData;
  }
}
