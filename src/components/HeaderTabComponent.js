import React, { useState, useEffect } from 'react';
import Heading from './FormatUtilites/Format_Heading';
import StandardButton from './FormatUtilites/Format_Button';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@windmill/react-ui';
import { toast } from 'react-toastify';

const HeaderRow = ({ row, index, handleInputChange, handleCheckboxChange, deleteRow }) => (
    <TableRow key={index} style={{ backgroundColor: row.disabled ? 'lightgray' : 'transparent' }}>
        <TableCell className='flex items-center text-sm'>
            <input
                type='text'
                name='key'
                value={row.key}
                onChange={(e) => handleInputChange(index, 'key', e.target.value)}
                disabled={row.disabled} // Disable input if the row is marked as disabled
            />
        </TableCell>
        <TableCell>
            <input
                type='text'
                name='value'
                value={row.value}
                onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                disabled={row.disabled} // Disable input if the row is marked as disabled
            />
        </TableCell>
        <TableCell>
            <input
                type='checkbox'
                checked={!row.disabled}
                onChange={() => handleCheckboxChange(index)}
            />
            {/* Invert checkbox behavior to represent enabled state */}
        </TableCell>
        <TableCell>
        <StandardButton text="Delete" onClick={()=> deleteRow(index)} />
       
        </TableCell>
    </TableRow>
);

export default function HeaderTab({ onHeaderButtonChange }) {

    // Initial header data (overridden immediately by fetchHeaders on mount)
    const [headers, setHeaderButtonData] = useState([
        { key: 'Authorization', value: '', disabled: false },
        { key: 'Cache-Control', value: 'no-cache', disabled: false },
        { key: 'Content-Type', value: 'application/json', disabled: false },
        { key: 'Accept', value: 'application/json', disabled: false },
    ]);

    // Function to fetch headers from user.json
    const fetchHeaders = async () => {
        try {
            const response = await fetch('/api/getHeaders');
            const data = await response.json();
            setHeaderButtonData(data.headers);
        } catch (error) {
            console.error('Error fetching headers:', error);
        }
    };

    useEffect(() => {
        fetchHeaders();
    }, []);

    const handleInputChange = (index, key, value) => {
        const updatedData = [...headers];
        updatedData[index][key] = value;
        setHeaderButtonData(updatedData);
        saveHeaders(updatedData); // Save headers when input changes
   
    };
    const saveHeaders = async (updatedHeaders) => {
        try {
            await fetch('/api/saveHeaders', {
                method: 'POST',
                body: JSON.stringify({ headers: updatedHeaders }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
            toast.success('Headers saved successfully!');
            console.log('Headers saved successfully!', headers);
        } catch (error) {
            console.error('Error saving headers:', error);
            toast.error('Failed to save headers.');
        }
    };

    const handleCheckboxChange = (index) => {
        const newHeaderData = [...headers];
        newHeaderData[index].disabled = !newHeaderData[index].disabled;
        // Toggle the disable state
         setHeaderButtonData(newHeaderData); //Update the state
         saveHeaders(newHeaderData); //Save headers when checkbox is toggled
    };

    const addRow = () => {
        const newRow = { key: '', value: '', disabled: false };
        const updatedHeaders = [...headers, newRow];
        setHeaderButtonData(updatedHeaders);
        saveHeaders(updatedHeaders); // Save headers when a new row is added
    };

    const deleteRow = (index) => {
        const newHeaderData = headers.filter((_, i) => i !== index);
        setHeaderButtonData(newHeaderData);
        saveHeaders(newHeaderData); // Save headers when a row is deleted
    
    };


    return (
        <div style={{ height: 'auto', width: '750px' }}>
            <Heading>Manage Headers</Heading>
            <Table style={{ tableLayout: 'auto', width: 'auto' }}>
                <TableHeader>
                    <TableRow>
                        <TableCell className='flex items-center text-sm'>Key</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Enabled</TableCell> {/* Additional column for the checkbox */}
                        <TableCell>Delete</TableCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {headers.map((row, index) => (
                        <HeaderRow
                            key={index}
                            row={row}
                            index={index}
                            handleInputChange={handleInputChange}
                            handleCheckboxChange={handleCheckboxChange}
                            deleteRow={deleteRow}
                        />
                    ))}
                </TableBody>
            </Table>
            <StandardButton text="Add Row" onClick={addRow} />
    
        </div>
    );
}