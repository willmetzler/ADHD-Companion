import React, { useState, useEffect } from 'react';

function Medications() {
    const [medications, setMedications] = useState([]);
    const [editMode, setEditMode] = useState({});
    const [editedMedications, setEditedMedications] = useState({});
    const [newMedication, setNewMedication] = useState({
        drug_name: '',
        dosage: '',
        prescriber: '',
        renew_date: ''
    });
    const [showAddMedicationForm, setShowAddMedicationForm] = useState(false);

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = () => {
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
    };

    const handleInputChange = (e, medicationId) => {
        const { name, value } = e.target;
        setEditedMedications(prevState => ({
            ...prevState,
            [medicationId]: {
                ...prevState[medicationId],
                [name]: value
            }
        }));
    };

    const handleEditMedication = (medicationId) => {
        setEditMode(prevState => ({
            ...prevState,
            [medicationId]: true
        }));
        const medicationToEdit = medications.find(med => med.id === medicationId);
        setEditedMedications(prevState => ({
            ...prevState,
            [medicationId]: {
                drug_name: medicationToEdit.drug_name,
                dosage: medicationToEdit.dosage,
                prescriber: medicationToEdit.prescriber,
                renew_date: medicationToEdit.renew_date
            }
        }));
    };

    const handleSaveEdit = async (medicationId) => {
        try {
            const response = await fetch(`/api/medications/${medicationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editedMedications[medicationId])
            });

            if (!response.ok) {
                throw new Error('Failed to save edited medication');
            }

            const updatedMedications = [...medications];
            const updatedMedicationIndex = updatedMedications.findIndex(med => med.id === medicationId);
            if (updatedMedicationIndex !== -1) {
                updatedMedications[updatedMedicationIndex] = editedMedications[medicationId];
                setMedications(updatedMedications);
            }

            setEditMode(prevState => ({
                ...prevState,
                [medicationId]: false
            }));
        } catch (error) {
            console.error('Error saving edited medication:', error);
        }
    };

    const handleCancelEdit = (medicationId) => {
        setEditMode(prevState => ({
            ...prevState,
            [medicationId]: false
        }));
        // Reset edited medication to empty object
        setEditedMedications(prevState => ({
            ...prevState,
            [medicationId]: {}
        }));
    };

    const handleDeleteMedication = async (medicationId) => {
        try {
            const response = await fetch(`/api/medications/${medicationId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete medication');
            }

            const updatedMedications = medications.filter(med => med.id !== medicationId);
            setMedications(updatedMedications);
        } catch (error) {
            console.error('Error deleting medication:', error);
        }
    };

    const handleSubmitMedication = async () => {
        try {
            const response = await fetch('/api/medications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newMedication)
            });

            if (!response.ok) {
                throw new Error('Failed to add medication');
            }

            const data = await response.json();
            setMedications([...medications, data]);
            setNewMedication({
                drug_name: '',
                dosage: '',
                prescriber: '',
                renew_date: ''
            });
            setShowAddMedicationForm(false);
        } catch (error) {
            console.error('Error adding medication:', error);
        }
    };

    return (
        <div>
            <h1>Medications</h1>
            {medications.length > 0 && (
                <div>
                    <h3>My prescriptions</h3>
                    <div>
                        {medications.map((medication, index) => (
                            <div className='my-medications' key={index}>
                                {editMode[medication.id] ? (
                                    <div>
                                        <input
                                            type='text'
                                            placeholder='Drug name...'
                                            name='drug_name'
                                            value={editedMedications[medication.id]?.drug_name || ''}
                                            onChange={(e) => handleInputChange(e, medication.id)}
                                        />
                                        <br /><br />
                                        <input
                                            type='text'
                                            placeholder='Dosage...'
                                            name='dosage'
                                            value={editedMedications[medication.id]?.dosage || ''}
                                            onChange={(e) => handleInputChange(e, medication.id)}
                                        />
                                        <br /><br />
                                        <input
                                            type='text'
                                            placeholder='Prescriber...'
                                            name='prescriber'
                                            value={editedMedications[medication.id]?.prescriber || ''}
                                            onChange={(e) => handleInputChange(e, medication.id)}
                                        />
                                        <br /><br />
                                        <input
                                            type='text'
                                            placeholder='Renewal Date...'
                                            name='renew_date'
                                            value={editedMedications[medication.id]?.renew_date || ''}
                                            onChange={(e) => handleInputChange(e, medication.id)}
                                        />
                                        <br /><br />
                                        <button onClick={() => handleSaveEdit(medication.id)}>Save</button>
                                        <button onClick={() => handleCancelEdit(medication.id)}>Cancel</button>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ fontWeight: 'bold' }}>{medication.drug_name}</div>
                                        <div>Dosage: {medication.dosage}</div>
                                        <div>Prescriber: {medication.prescriber}</div>
                                        <div>Renewal Date: {medication.renew_date}</div>
                                        <br />
                                        <button onClick={() => handleEditMedication(medication.id)}>Edit</button>
                                        &nbsp;
                                        <button onClick={() => handleDeleteMedication(medication.id)}>Delete</button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                    <br />
                </div>
            )}

            <div>
                <button onClick={() => setShowAddMedicationForm(true)}>Add Prescription</button>
            </div>

            {showAddMedicationForm && (
                <div>
                    <h3>Add Medication</h3>
                    <div>
                        <input
                            type='text'
                            placeholder='Drug name...'
                            name='drug_name'
                            value={newMedication.drug_name}
                            onChange={(e) => setNewMedication({ ...newMedication, drug_name: e.target.value })}
                        />
                        <br /><br />
                        <input
                            type='text'
                            placeholder='Dosage...'
                            name='dosage'
                            value={newMedication.dosage}
                            onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                        />
                        <br /><br />
                        <input
                            type='text'
                            placeholder='Prescriber...'
                            name='prescriber'
                            value={newMedication.prescriber}
                            onChange={(e) => setNewMedication({ ...newMedication, prescriber: e.target.value })}
                        />
                        <br /><br />
                        <input
                            type='text'
                            placeholder='Renewal Date...'
                            name='renew_date'
                            value={newMedication.renew_date}
                            onChange={(e) => setNewMedication({ ...newMedication, renew_date: e.target.value })}
                        />
                        <br /><br />
                        <button onClick={handleSubmitMedication}>Submit</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Medications;