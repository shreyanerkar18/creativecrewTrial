import React from 'react';
import { Button } from '@mui/material';

const Seat = ({ number, isSelected, onClick, employeeDetails, employeesList, isSeatsChanging, totalManagerSeats, newSeats, isAddingEmployee, floor, day, seatData, selectedDay }) => {

    let { seats_array } = employeeDetails;
    if (isAddingEmployee) {
        seats_array = newSeats;
    }
    let employeeSeatonDay = []
    let allEmployeeSeatsOnDay = []
    let isDisabled = !isSeatsChanging; // Initially disable if seats are not changing
    let dummy;
    let allocatedSeats;

    if (employeesList.length > 0 || isAddingEmployee) {

        if (day === 'all') {
            employeeSeatonDay = seats_array;
        } else {
            employeeSeatonDay = [seatData[day]];
        }

        if (day === "all") {
            allEmployeeSeatsOnDay = seats_array;
        } else {
            allEmployeeSeatsOnDay = employeesList.map(employee =>
                employeeDetails.id === employee.id ? seatData[day] : employee.seat_data[day]
            );
        }

        if (day === 'all') dummy = employeesList.flatMap(employee => employee.seats_array); // to get all allocated seats 
        else dummy = allEmployeeSeatsOnDay;

        if (day === 'all') allocatedSeats = isSeatsChanging ? dummy.filter(item => !employeeDetails.seats_array.includes(item)) : dummy;
        else allocatedSeats = isSeatsChanging ? dummy.filter(item => !employeeSeatonDay.includes(item)) : dummy;

        if (day === 'all') {
            isDisabled = !isSeatsChanging ? true : employeeDetails.seats_array.includes(number) || (!allocatedSeats.includes(number) && (totalManagerSeats.includes(number))) ? false : true;
        } else {
            isDisabled = !isSeatsChanging ? true : employeeSeatonDay.includes(number) || (!allocatedSeats.includes(number) && (totalManagerSeats.includes(number))) ? false : true;
        }
    } else {
        allocatedSeats = [];
    }

    return (
        <Button
            variant="contained"
            onClick={onClick}
            style={{ margin: '5px' }}
            disabled={isDisabled}
            sx={{
                width: 30,
                backgroundColor: isSelected ? '#007bff' : '#28a745',
                '&.Mui-disabled': {
                    backgroundColor: employeeSeatonDay.includes(number) ? "#ffc107" : allocatedSeats.includes(number) ? "#fd7e14" : (totalManagerSeats.includes(number)) ? "#28a745" : ""
                },
            }}
        >
            {floor}-{number}
        </Button>
    );
};

export default Seat;
