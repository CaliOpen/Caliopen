export const readAsArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) =>
      reject(new Error(`File ${file.name} is unreadable: ${e.target.result}`));

    reader.readAsArrayBuffer(file);
  });

export const readAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) =>
      reject(new Error(`File ${file.name} is unreadable: ${e.target.result}`));

    reader.readAsText(file);
  });
