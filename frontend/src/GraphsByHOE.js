import React, { useEffect, useState, useContext } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Container, Typography, Button, Box } from '@mui/material';
import { AuthContext } from "./AuthProvider";
import {jwtDecode} from 'jwt-decode';
import { baseurl } from './utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const GraphsbyHoe = () => {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [graphData, setGraphData] = useState(null);
  const [floorGraphData, setFloorGraphData] = useState(null);
  const [hoeId, setHoeId] = useState("");

  const { token } = useContext(AuthContext);
  const decoded = jwtDecode(token);

  const id = decoded.bu === 'cloud' ? 1 :
             decoded.bu === 'service' ? 2 :
             decoded.bu === 'sales' ? 3 :
             decoded.bu === 'Group Infrastructure Services' ? 4 : 5;

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

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        const response1 = await axios.get(`${baseurl}/getHoeIdFromTable`, {
          params: { bu: decoded.bu }
        });

        const hoeId = response1.data[0].id;

        console.log(hoeId);
        setHoeId(hoeId);

        const response = await axios.get(`${baseurl}/getManagerAllocationData`, {
          params: { hoeId }
        });

        console.log(response.data);

        const floorGroupedData = response.data.reduce((acc, item) => {
          const key = `${item.country} - ${item.state} - ${item.city} - ${item.campus} - Floor ${item.floor}`;
          console.log(item);
          if (item.allocated_seats[0] === null) return acc;

          if (!acc[key]) {
            acc[key] = { allocated: item.allocated_seats.length, occupied: 0, colorIndex: Object.keys(acc).length % colors.length };
          }
          
          let seatsData = {};
          if (typeof item.seats_data === 'string') {
            seatsData = JSON.parse(item.seats_data);
          } else if (typeof item.seats_data === 'object') {
            seatsData = item.seats_data;
          }

          if (seatsData[selectedDay]) {
            const occupiedSeats = new Set(seatsData[selectedDay]);
            acc[key].occupied += occupiedSeats.size;
          }

          return acc;
        }, {});

        console.log("floor", floorGroupedData);

        const floorLabels = Object.keys(floorGroupedData);
        const allocatedSeats = floorLabels.map(label => floorGroupedData[label].allocated);
        const occupiedSeats = floorLabels.map(label => floorGroupedData[label].occupied);

        const floorColors = {};
        floorLabels.forEach((label, index) => {
          floorColors[label] = {
            backgroundColor: colors[floorGroupedData[label].colorIndex],
            borderColor: borderColors[floorGroupedData[label].colorIndex]
          };
        });

        setFloorGraphData({
          labels: floorLabels,
          datasets: [
            {
              label: 'Total Seats Allocated',
              data: allocatedSeats,
              backgroundColor: floorLabels.map(label => floorColors[label].backgroundColor),
              borderColor: floorLabels.map(label => floorColors[label].borderColor),
              borderWidth: 1,
              maxBarThickness: 50,
              minBarThickness: 10
            },
            {
              label: `Occupied Seats on ${selectedDay}`,
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

        const managers = response.data.filter(item => {
          let seatsData = {};
          if (typeof item.seats_data === 'string') {
            seatsData = JSON.parse(item.seats_data);
          } else if (typeof item.seats_data === 'object') {
            seatsData = item.seats_data;
          }
          return seatsData[selectedDay] && seatsData[selectedDay].length > 0;
        }).map(item => ({
          name: `${item.first_name} ${item.last_name} - ${item.team}`,
          floorKey: `${item.country} - ${item.state} - ${item.city} - ${item.campus} - Floor ${item.floor}`
        }));

        const managerData = response.data.filter(item => {
          let seatsData = {};
          if (typeof item.seats_data === 'string') {
            seatsData = JSON.parse(item.seats_data);
          } else if (typeof item.seats_data === 'object') {
            seatsData = item.seats_data;
          }
          return seatsData[selectedDay] && seatsData[selectedDay].length > 0;
        }).map(item => {
          let seatsData = {};
          if (typeof item.seats_data === 'string') {
            seatsData = JSON.parse(item.seats_data);
          } else if (typeof item.seats_data === 'object') {
            seatsData = item.seats_data;
          }
          const uniqueSeats = new Set(seatsData[selectedDay]);
          return uniqueSeats.size;
        });

        const managerColors = managers.map(manager => floorColors[manager.floorKey].backgroundColor);
        const managerBorderColors = managers.map(manager => floorColors[manager.floorKey].borderColor);

        setGraphData({
          labels: managers.map(manager => manager.name),
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
          ]
        });

      } catch (error) {
        console.error('Error fetching manager data for graph:', error);
      }
    };

    if (token) fetchManagerData();
  }, [token, selectedDay]);

  const onClickingDay = (day) => {
    setSelectedDay(day);
  };

  return (
    <Container style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box display="flex" flexDirection="row" justifyContent='center' flexWrap='wrap' alignItems="center" gap={2} mb={2}>
        {daysOfWeek.map((day, index) => (
          <Button key={index} variant="contained" onClick={() => onClickingDay(day)} sx={{ backgroundColor: selectedDay === day ? "primary" : "grey" }}>
            {day}
          </Button>
        ))}
      </Box>

      {graphData && (
        <div style={{ marginBottom: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '80%' }}>
          <Typography variant="h6" style={{ marginBottom: '10px', fontWeight: 'bold', textAlign: 'center' }}>
              Number of Seats Allocated per Manager on {selectedDay}
            </Typography>
            <Bar data={graphData} />
          </div>
        </div>
      )}

      {floorGraphData && (
        <div style={{ marginBottom: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '80%' }}>
            <Typography variant="h6" style={{ marginBottom: '10px', fontWeight: 'bold', textAlign: 'center' }}>
              Allocated and Occupied Seats per Floor on {selectedDay}
            </Typography>
            <Bar data={floorGraphData} />
          </div>
        </div>
      )}
    </Container>
  );
};

export default GraphsbyHoe;
