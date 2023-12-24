import React, { useRef, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart } from "react-google-charts";
const StackedBarChart = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Clear the canvas or create a new canvas if needed
    const canvas = canvasRef.current;
    // const ctx = canvas.getContext('2d');
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Your chart creation code here
    const data = {
        labels: ['Water Park', 'Marbles', 'Airlines', 'Monsters', 'Am I Lucky!', 'Tetris', 'Tom and Jerry', 'World Cup'],
        datasets: [
          {
            label: 'Dataset 1',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            data: [160, 73, 154, 29, 145, 0, 0, 0],
          },
          {
            label: 'Dataset 2',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            data: [16, 7, 15, 2, 14, 10, 10, 10],
          },
        ],
      };
      
      const options = {
        scales: {
          x: { stacked: true },
          y: { stacked: true },
        },
      };

  return (
    <div>
      <h2>Stacked Bar Chart</h2>
      <Bar data={data} options={options} width={400} height={200} />
    </div>
  );
});
}
export default StackedBarChart
