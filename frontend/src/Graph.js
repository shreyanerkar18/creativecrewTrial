import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Box,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import axios from "axios";
import { baseurl } from "./utils";

const BUWiseChart = () => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [data, setData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [floors, setFloors] = useState([]);

  // Fetch data for dropdowns based on selection
  const fetchDropdownData = async (type, params = {}) => {
    try {
      const response = await axios.get(
        `${baseurl}/getAllocationForBUwise`,
        { params: { type, ...params } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching ${type} data:, error');
      return [];
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const countryData = await fetchDropdownData("country");
      setCountries([...new Set(countryData.map((item) => item.country))]);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const fetchStateData = async () => {
        const stateData = await fetchDropdownData("state", {
          country: selectedCountry,
        });
        setStates([...new Set(stateData.map((item) => item.state))]);
      };
      fetchStateData();
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      const fetchCityData = async () => {
        const cityData = await fetchDropdownData("city", {
          country: selectedCountry,
          state: selectedState,
        });
        setCities([...new Set(cityData.map((item) => item.city))]);
      };
      fetchCityData();
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedCity) {
      const fetchCampusData = async () => {
        const campusData = await fetchDropdownData("campus", {
          country: selectedCountry,
          state: selectedState,
          city: selectedCity,
        });
        setCampuses([...new Set(campusData.map((item) => item.campus))]);
      };
      fetchCampusData();
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedCampus) {
      const fetchFloorData = async () => {
        const floorData = await fetchDropdownData("floor", {
          country: selectedCountry,
          state: selectedState,
          city: selectedCity,
          campus: selectedCampus,
        });
        setFloors([...new Set(floorData.map((item) => item.floor))]);
      };
      fetchFloorData();
    }
  }, [selectedCampus]);

  // Fetch data for chart based on all selections
  useEffect(() => {
    const fetchData = async () => {
      if (
        selectedCountry &&
        selectedState &&
        selectedCity &&
        selectedCampus &&
        selectedFloor
      ) {
        try {
          const response = await axios.get(
            `${baseurl}/getAllocationForBUwise`,
            {
              params: {
                country: selectedCountry,
                state: selectedState,
                city: selectedCity,
                campus: selectedCampus,
                floor: selectedFloor,
              },
            }
          );
          const result = response.data.map((item) => ({
            name: item.bu_name,
            total: parseInt(item.total, 10),
            allocated: parseInt(item.allocated, 10),
            unallocated: parseInt(item.unallocated, 10),
          }));
          setData(result);
        } catch (error) {
          console.error("Error fetching data:", error);
          setData([]);
        }
      }
    };
    fetchData();
  }, [
    selectedCountry,
    selectedState,
    selectedCity,
    selectedCampus,
    selectedFloor,
  ]);

  return (
    <Container>
      <div
        style={{
          marginTop: 50,
          marginBottom: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            flexWrap="wrap"
            gap={2}
            mb={2}
          >
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="country-select-label">Country</InputLabel>
              <Select
                labelId="country-select-label"
                id="country-select"
                value={selectedCountry}
                label="Country"
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedState("");
                  setSelectedCity("");
                  setSelectedCampus("");
                  setSelectedFloor("");
                }}
              >
                {countries.map((country, index) => (
                  <MenuItem key={index} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }} disabled={!selectedCountry}>
              <InputLabel id="state-select-label">State</InputLabel>
              <Select
                labelId="state-select-label"
                id="state-select"
                value={selectedState}
                label="State"
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity("");
                  setSelectedCampus("");
                  setSelectedFloor("");
                }}
              >
                {states.map((state, index) => (
                  <MenuItem key={index} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }} disabled={!selectedState}>
              <InputLabel id="city-select-label">City</InputLabel>
              <Select
                labelId="city-select-label"
                id="city-select"
                value={selectedCity}
                label="City"
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedCampus("");
                  setSelectedFloor("");
                }}
              >
                {cities.map((city, index) => (
                  <MenuItem key={index} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }} disabled={!selectedCity}>
              <InputLabel id="campus-select-label">Campus</InputLabel>
              <Select
                labelId="campus-select-label"
                id="campus-select"
                value={selectedCampus}
                label="Campus"
                onChange={(e) => {
                  setSelectedCampus(e.target.value);
                  setSelectedFloor("");
                }}
              >
                {campuses.map((campus, index) => (
                  <MenuItem key={index} value={campus}>
                    {campus}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }} disabled={!selectedCampus}>
              <InputLabel id="floor-select-label">Floor</InputLabel>
              <Select
                labelId="floor-select-label"
                id="floor-select"
                value={selectedFloor}
                label="Floor"
                onChange={(e) => setSelectedFloor(e.target.value)}
              >
                {floors.map((floor, index) => (
                  <MenuItem key={index} value={floor}>
                    {floor}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </div>
      <div style={{ width: "100%", height: "400px", marginTop: "20px" }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            barSize={100} // Adjust the bar width here
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="allocated" fill="#8884d8">
              <LabelList dataKey="allocated" position="top" />
            </Bar>
            <Bar dataKey="unallocated" fill="#82ca9d">
              <LabelList dataKey="unallocated" position="top" />
            </Bar>
            <Bar dataKey="total" fill="#ffc658">
              <LabelList dataKey="total" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Container>
  );
};

export default BUWiseChart;