import React, { useState, useEffect } from 'react';

function Medications() {
    const [medications, setMedications] = useState([]);
    const [newMedication, setNewMedication] = useState({
        drug_name: '',
        dosage: '',
        prescriber: '',
        renew_date: ''
    });

    useEffect(() => {
        fetch('/api/medications')
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to fetch medications');
                }
            })
            .then(data => {
                setMedications(data);
            })
            .catch(error => {
                console.error('Error fetching medications:', error);
            });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMedication(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAddMedication = () => {
        fetch('/api/medications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newMedication)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to add medication');
            }
        })
        .then(data => {
            setMedications(prevMedications => [...prevMedications, data]);
            setNewMedication({
                drug_name: '',
                dosage: '',
                prescriber: '',
                renew_date: ''
            });
        })
        .catch(error => {
            console.error('Error adding medication:', error);
        });
    };

    return (
        <div>
            <h1>Medications</h1>
            <div>
                <h3>My prescriptions</h3>
                <div className='my-medications'>
                    {medications.map(medication => (
                        <div key={medication.id}>
                            <div>{medication.drug_name}</div>
                            <div>Dosage: {medication.dosage}</div>
                            <div>Prescriber: {medication.prescriber}</div>
                            <div>Renewal Date: {medication.renew_date}</div>
                        </div>
                    ))}
                </div>
            </div>
            <br />
            <div>
                <h3>Add medications</h3>
                <label>Drug name: </label>
                <input
                    type='text'
                    placeholder='Drug name...'
                    name='drug_name'
                    value={newMedication.drug_name}
                    onChange={handleInputChange}
                />
                <br></br>
                <br></br>
                <label>Dosage: </label>
                <input
                    type='text'
                    placeholder='Dosage...'
                    name='dosage'
                    value={newMedication.dosage}
                    onChange={handleInputChange}
                />
                <br></br>
                <br></br>
                <label>Prescriber: </label>
                <input
                    type='text'
                    placeholder='Prescriber...'
                    name='prescriber'
                    value={newMedication.prescriber}
                    onChange={handleInputChange}
                />
                <br></br>
                <br></br>
                <label>Renewal Date: </label>
                <input
                    type='text'
                    placeholder='Renewal Date...'
                    name='renew_date'
                    value={newMedication.renew_date}
                    onChange={handleInputChange}
                />
                <br></br>
                <br></br>
                <button onClick={handleAddMedication}>Add Medication</button>
            </div>
        </div>
    );
}

export default Medications;

