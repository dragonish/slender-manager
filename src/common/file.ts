/**
 * Open and read text file.
 * @returns
 */
export function openTextFile() {
  return new Promise<{ data: string }>((resolve, reject) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt, .text, .json';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', () => {
      if (!fileInput.value) {
        reject(new Error('no file selected.'));
      }

      const file = fileInput.files?.[0];
      if (file) {
        const { type } = file;
        if (['application/json', 'application/xml', 'text/plain'].includes(type)) {
          const reader = new FileReader();
          reader.onload = e => {
            const { target } = e;
            if (target) {
              const data = target.result;
              if (typeof data === 'string') {
                resolve({
                  data,
                });
              } else {
                reject(new Error('not a text file.'));
              }
            }
          };
          reader.readAsText(file);
        } else {
          reject(new Error('invalid file.'));
        }
      } else {
        reject(new Error('unable to found file.'));
      }
    });

    fileInput.click();
  });
}

export function downloadTextFile(content: string, filename: string) {
  return new Promise<void>((resolve, reject) => {
    const exportBlob = new Blob([content]);
    const saveLink = document.createElement('a');
    saveLink.href = URL.createObjectURL(exportBlob);
    saveLink.download = filename;

    const ev = new MouseEvent('click', {
      bubbles: true,
      cancelable: false,
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      button: 0,
      relatedTarget: null,
    });
    const state = saveLink.dispatchEvent(ev);
    if (state) {
      resolve();
    } else {
      reject(new Error('event cancelled.'));
    }
  });
}
