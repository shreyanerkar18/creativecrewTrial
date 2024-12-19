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

const GraphsbyManager = () => {
  const [managerId, setManagerId] = useState('');
  const [floorGraphData, setFloorGraphData] = useState(null);

  const { token } = useContext(AuthContext);
  const decoded = jwtDecode(token); 
  //console.log("ddd", decoded);

  const id = decoded.bu === 'cloud' ? 1 :
             decoded.bu === 'service' ? 2 :
             decoded.bu === 'sales' ? 3 :
             decoded.bu === 'Group Infrastructure Services' ? 4 : 5;

  // Colors for allocated and occupied seats
  const allocatedColor = 'rgba(75, 192, 192, 0.6)';
  const allocatedBorderColor = 'rgba(75, 192, 192, 1)';
  const occupiedColor = 'rgba(255, 159, 64, 0.6)';
  const occupiedBorderColor = 'rgba(255, 159, 64, 1)';

  // Fetch manager allocation data
  useEffect(() => {
    const fetchManagerId = async () => {
      try {
        const response = await axios.get(`${baseurl}/getManagerIdForGraph`, {
          params: {
            bu: decoded.bu,
            firstName: decoded.firstName,
            lastName: decoded.lastName
          }
        });
        setManagerId(response.data[0].id);
      } catch (error) {
        console.error('Error fetching manager Id for graph:', error);
      }
    }

    const fetchManagerData = async () => {
      try {
        const response = await axios.get(`${baseurl}/getGraphDetailsForManager`, {
          params: {
            managerId: managerId
          }
        });
        //console.log(response.data);

        // Graph: Day-wise allocated and occupied seats
        const dayGroupedData = response.data.reduce((acc, item) => {
          const key = item.day;
          if (!acc[key]) {
            acc[key] = { allocated: 0, occupied: 0 };
          }
          acc[key].allocated = item.manager_seats.length;
          acc[key].occupied += item.occupied_seats.filter(seat => seat !== null).length;
          return acc;
        }, {});

        const dayLabels = Object.keys(dayGroupedData);
        const allocatedSeats = dayLabels.map(label => dayGroupedData[label].allocated);
        const occupiedSeats = dayLabels.map(label => dayGroupedData[label].occupied);

        setFloorGraphData({
          labels: dayLabels,
          datasets: [
            {
              label: 'Allocated Seats',
              data: allocatedSeats,
              backgroundColor: allocatedColor,
              borderColor: allocatedBorderColor,
              borderWidth: 1,
              maxBarThickness: 50,
              minBarThickness: 10
            },
            {
              label: 'Occupied Seats',
              data: occupiedSeats,
              backgroundColor: occupiedColor,
              borderColor: occupiedBorderColor,
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
                  text: 'Day'
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

    fetchManagerId();
    managerId !== '' && fetchManagerData();
  }, [managerId]);

  return (
    <Container style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {floorGraphData && (
        <div style={{ marginBottom: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '80%' }}>
            <Typography variant="h6" style={{ marginBottom: '10px', fontWeight: 'bold', textAlign: 'center' }}>
              Allocated and Occupied Seats per Day
            </Typography>
            <Bar data={floorGraphData} options={floorGraphData.options} />
          </div>
        </div>
      )}
    </Container>
  );
};

export default GraphsbyManager;
