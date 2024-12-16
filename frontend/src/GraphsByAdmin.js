      import React, { useEffect, useState } from 'react';
      import { Bar } from 'react-chartjs-2';  // Import Bar chart
      import axios from 'axios';
      import { baseurl } from "./utils";
      import { Container, Typography } from '@mui/material';
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
        const [seatingCapacityData, setSeatingCapacityData] = useState([]);
        const [graphData, setGraphData] = useState(null);
        const [seatingGraphData, setSeatingGraphData] = useState(null);
      
        // Fetch data for seat allocation and seating capacity
        useEffect(() => {
          const fetchData = async () => {
            try {
              const seatResponse = await axios.get(`${baseurl}/getSeatAllocationData`);
              const capacityResponse = await axios.get(`${baseurl}/getSeatingCapacityData`);
              
              console.log("seatResponse", seatResponse.data);
              setSeatData(seatResponse.data);
              setSeatingCapacityData(capacityResponse.data);
      
              // Process seat allocation data for the first graph
              const labels = seatResponse.data.map(item => `${item.city} - ${item.campus} - Floor ${item.floor}`);
              const totalSeats = seatResponse.data.map(item => item.allocated_seats[0]=== null ? 0 :  item.allocated_seats.length);
              setGraphData({
                labels: labels,
                datasets: [
                  {
                    label: 'Total Seats Allocated',
                    data: totalSeats,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                  },
                ],
              });
      
              // Process seating capacity data for the second graph
              const capacityLabels = seatResponse.data.map(item => `${item.city} - ${item.campus} - Floor ${item.floor}`);
              const capacityData = seatResponse.data.map(item => item.total);
              setSeatingGraphData({
                labels: capacityLabels,
                datasets: [
                  {
                    label: 'Seating Capacity by Floor',
                    data: capacityData,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1,
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
          <Container style={{ marginTop: '20px', maxWidth: '800px' }}>
            {/* <Typography variant="h4" style={{ marginBottom: '20px', fontWeight: 'bold' }}>
              Admin Graphs
            </Typography> */}
      
            {/* Seat Allocation Graph (Bar Chart) */}
            {graphData && (
              <div style={{ marginBottom: '30px' }}>
                <Typography variant="h5" style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                  Seats Allocated
                </Typography>
                <div style={{ height: '350px' }}>
                  <Bar data={graphData} options={{ responsive: true }} />
                </div>
              </div>
            )}
      
            {/* Seating Capacity Graph (Bar Chart) */}
            {seatingGraphData && (
              <div>
                <Typography variant="h5" style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                  Seating Capacity by Floor
                </Typography>
                <div style={{ height: '350px' }}>
                  <Bar data={seatingGraphData} options={{ responsive: true }} />
                </div>
              </div>
            )}
          </Container>
        );
      };
      
      export default GraphsbyAdmin;
      