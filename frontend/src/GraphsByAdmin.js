import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';  // Import Bar chart
import axios from 'axios';
import { baseurl } from "./utils";
import { Container, Typography, Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register the required components for Bar chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GraphsbyAdmin = () => {
  const [seatData, setSeatData] = useState([]);
  const [graphData, setGraphData] = useState(null);

  // Fetch data for seat allocation and seating capacity
  useEffect(() => {
    const fetchData = async () => {
      try {
        const seatResponse = await axios.get(`${baseurl}/getSeatAllocationData`);
        //console.log("seatResponse", seatResponse.data);
        setSeatData(seatResponse.data);

        // Process seat allocation data for the combined graph
        const labels = seatResponse.data.map(item => `${item.city} - ${item.campus} - Floor ${item.floor}`);
        const occupiedSeats = seatResponse.data.map(item => item.allocated_seats[0] === null ? 0 : item.allocated_seats.length);
        const allocatedSeats = seatResponse.data.map(item => item.total);

        setGraphData({
          labels: labels,
          datasets: [
            {
              label: 'Total Seats Allocated',
              data: allocatedSeats,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              barThickness: 40 // Adjusted bar thickness
            },
            {
              label: 'Occupied Seats',
              data: occupiedSeats,
              backgroundColor: 'rgba(255, 159, 64, 0.6)',
              borderColor: 'rgba(255, 159, 64, 1)',
              borderWidth: 1,
              barThickness: 40 // Adjusted bar thickness
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Container style={{ marginTop: '20px', maxWidth: '1200px' }}>
      <Typography variant="h5" style={{ marginBottom: '10px', fontWeight: 'bold', textAlign: 'center' }}>
        Seats Allocated and Occupied
      </Typography>
      <Box display="flex" justifyContent="center" mb={2}>
        <Box display="flex" alignItems="center" mr={2}>
          <Box width={20} height={20} bgcolor="rgba(75, 192, 192, 0.6)" border="1px solid rgba(75, 192, 192, 1)" />
          <Typography variant="body1" style={{ marginLeft: '8px' }}>Total Seats Allocated</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Box width={20} height={20} bgcolor="rgba(255, 159, 64, 0.6)" border="1px solid rgba(255, 159, 64, 1)" />
          <Typography variant="body1" style={{ marginLeft: '8px' }}>Occupied Seats</Typography>
        </Box>
      </Box>
      <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <div style={{ width: '1500px', height: '450px' }}>
          {graphData && (
            <Bar 
              data={graphData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false // Disable default legend
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45
                    }
                  }
                }
              }} 
            />
          )}
        </div>
      </div>
    </Container>
  );
};

export default GraphsbyAdmin;
