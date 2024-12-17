// frontend/src/Graphs.js
import React, { useEffect, useState, useContext } from 'react';
import { Bar } from 'react-chartjs-2';
import { baseurl } from "./utils";
import axios from 'axios';
import { Container, Typography } from '@mui/material';

import { AuthContext } from "./AuthProvider";
import {jwtDecode} from 'jwt-decode';


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GraphsbyHoe = () => {
  const [managerData, setManagerData] = useState([]);
  const [graphData, setGraphData] = useState(null);

  const { token } = useContext(AuthContext);
    const decoded = jwtDecode(token); 
    console.log("ddd", decoded);

  // Fetch manager allocation data
  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        const response = await axios.get(`${baseurl}/getManagerAllocationData`);
        setManagerData(response.data);

        const campusLabels = response.data.map(item => `${item.city} - ${item.campus}`);
        const floorLabels = [...new Set(response.data.map(item => item.floor))];

        const floorData = floorLabels.map(floor => {
          return response.data
            .filter(item => item.floor === floor)
            .map(item => item.seats_array.length); // Count seats for each manager per floor
        });

        setGraphData({
          labels: campusLabels,
          datasets: floorLabels.map((floor, index) => ({
            label: `Floor ${floor}`,
            data: floorData[index],
            backgroundColor: `rgba(${(index * 30) % 255}, ${(index * 60) % 255}, ${(index * 90) % 255}, 0.6)`,
          }))
        });
      } catch (error) {
        console.error('Error fetching manager data for graph:', error);
      }
    };

    fetchManagerData();
  }, []);

  return (
    <Container style={{ marginTop: '20px' }}>
      <Typography variant="h4" style={{ marginBottom: '20px', fontWeight: 'bold' }}>
        Manager Seat Allocation by Campus and Floor
      </Typography>

      {graphData && (
        <div style={{ marginBottom: '40px' }}>
          <Typography variant="h6" style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            Number of Seats Allocated per Floor
          </Typography>
          <Bar data={graphData} options={{ responsive: true }} />
        </div>
      )}
    </Container>
  );
};

export default GraphsbyHoe;

