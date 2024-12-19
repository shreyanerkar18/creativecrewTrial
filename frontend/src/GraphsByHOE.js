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
  const [graphData, setGraphData] = useState(null);
  const [floorGraphData, setFloorGraphData] = useState(null);

  const { token } = useContext(AuthContext);
  const decoded = jwtDecode(token); 
  //console.log("ddd", decoded);

  const id = decoded.bu === 'cloud' ? 1 :
             decoded.bu === 'service' ? 2 :
             decoded.bu === 'sales' ? 3 :
             decoded.bu === 'Group Infrastructure Services' ? 4 : 5;

  //console.log(id);

  // Colors for each category
  const colors = [
    'rgba(75, 192, 192, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 205, 86, 0.6)',
    'rgba(201, 203, 207, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(244, 67, 54, 0.6)',
    'rgba(0, 150, 136, 0.6)',
    'rgba(233, 30, 99, 0.6)',
    'rgba(63, 81, 181, 0.6)'
  ];
  
  const borderColors = [
    'rgba(75, 192, 192, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 205, 86, 1)',
    'rgba(201, 203, 207, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(244, 67, 54, 1)',
    'rgba(0, 150, 136, 1)',
    'rgba(233, 30, 99, 1)',
    'rgba(63, 81, 181, 1)'
  ];
  

  // Fetch manager allocation data
  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        const response = await axios.get(`${baseurl}/getManagerAllocationData`, {
          params: {
            hoeId: id
          }
        });
        //console.log(response.data);

        // Graph 2: Floor-wise allocated and occupied seats
        const floorGroupedData = response.data.reduce((acc, item) => {
          const key = `${item.country} - ${item.state} - ${item.city} - ${item.campus} - Floor ${item.floor}`;
          if (!acc[key]) {
            acc[key] = { allocated: 0, occupied: 0 };
          }
          acc[key].allocated = item.allocated_seats.length;
          acc[key].occupied += item.seats_array.length;
          return acc;
        }, {});

        const floorLabels = Object.keys(floorGroupedData);
        const allocatedSeats = floorLabels.map(label => floorGroupedData[label].allocated);
        const occupiedSeats = floorLabels.map(label => floorGroupedData[label].occupied);

        const floorColors = {};
        floorLabels.forEach((label, index) => {
          floorColors[label] = {
            backgroundColor: colors[index % colors.length],
            borderColor: borderColors[index % borderColors.length]
          };
        });

        setFloorGraphData({
          labels: floorLabels,
          datasets: [
            {
              label: 'Allocated Seats',
              data: allocatedSeats,
              backgroundColor: floorLabels.map(label => floorColors[label].backgroundColor),
              borderColor: floorLabels.map(label => floorColors[label].borderColor),
              borderWidth: 1,
              maxBarThickness: 50,
              minBarThickness: 10
            },
            {
              label: 'Occupied Seats',
              data: occupiedSeats,
              backgroundColor: floorLabels.map(label => floorColors[label].backgroundColor),
              borderColor: floorLabels.map(label => floorColors[label].borderColor),
              borderWidth: 1,
              maxBarThickness: 50,
              minBarThickness: 10
            }
          ],
          options: {
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(tooltipItem) {
                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                  }
                }
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Country - State - City - Campus - Floor'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Number of Seats'
                }
              }
            }
          }
        });

        // Graph 1: Manager seat allocation by manager
        const managers = response.data.map(item => `${item.first_name} ${item.last_name}`);
        const managerData = response.data.map(item => item.seats_array.length);
        const managerColors = response.data.map(item => {
          const key = `${item.country} - ${item.state} - ${item.city} - ${item.campus} - Floor ${item.floor}`;
          return floorColors[key].backgroundColor;
        });
        const managerBorderColors = response.data.map(item => {
          const key = `${item.country} - ${item.state} - ${item.city} - ${item.campus} - Floor ${item.floor}`;
          return floorColors[key].borderColor;
        });

        setGraphData({
          labels: managers,
          datasets: [
            {
              label: 'Seats Allocated',
              data: managerData,
              backgroundColor: managerColors,
              borderColor: managerBorderColors,
              borderWidth: 1,
              maxBarThickness: 50,
              minBarThickness: 10
            }
          ],
          options: {
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(tooltipItem) {
                    const managerIndex = tooltipItem.dataIndex;
                    const managerDetails = response.data[managerIndex];
                    return [
                      `Manager: ${tooltipItem.label}`,
                      `Seats Allocated: ${tooltipItem.raw}`,
                      `Country: ${managerDetails.country}`,
                      `State: ${managerDetails.state}`,
                      `City: ${managerDetails.city}`,
                      `Campus: ${managerDetails.campus}`,
                      `Floor: ${managerDetails.floor}`
                    ];
                  }
                }
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Managers'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Number of Seats'
                }
              }
            }
          }
        });

      } catch (error) {
        console.error('Error fetching manager data for graph:', error);
      }
    };

    fetchManagerData();
  }, [id]);

  return (
    <Container style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {graphData && (
        <div style={{ marginBottom: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '80%' }}>
            <Typography variant="h6" style={{ marginBottom: '10px', fontWeight: 'bold', textAlign: 'center' }}>
              Number of Seats Allocated per Manager
            </Typography>
            <Bar data={graphData} options={graphData.options} />
          </div>
        </div>
      )}

      {floorGraphData && (
        <div style={{ marginBottom: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '80%' }}>
            <Typography variant="h6" style={{ marginBottom: '10px', fontWeight: 'bold', textAlign: 'center' }}>
              Allocated and Occupied Seats per Floor
            </Typography>
            <Bar data={floorGraphData} options={floorGraphData.options} />
          </div>
        </div>
      )}
    </Container>
  );
};

export default GraphsbyHoe;
