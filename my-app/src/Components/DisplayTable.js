import React from 'react';
import "./styles.css";
const DisplayTable = ({ dataArray }) => {
    return (
        <div>
          {console.log("Data is ", dataArray)}
          <table className="table">
            <thead>
              <tr>
                {dataArray[0].map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataArray.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      
};

export default DisplayTable;
