import * as XLSX from 'xlsx';

export function ConvertExcelToData(input) {
    return new Promise((resolve, reject) => {
        if (!input.files || input.files.length === 0) {
        reject('Please select an Excel file.');
    }
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
    try {
        const binaryData = e.target.result;
        const workbook = XLSX.read(binaryData, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        resolve(data);
    } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject('Error parsing Excel file.');
    }
    };
    reader.readAsBinaryString(file);
    });
}