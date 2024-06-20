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
        const formattedDate = new Date(medicationToEdit.renew_date).toISOString().split('T')[0]; // Ensure renew_date is in YYYY-MM-DD format
        setEditedMedications(prevState => ({
            ...prevState,
            [medicationId]: {
                drug_name: medicationToEdit.drug_name,
                dosage: medicationToEdit.dosage,
                prescriber: medicationToEdit.prescriber,
                renew_date: formattedDate  // Keep renew_date as a string for editing
            }
        }));
    };

    const handleSaveEdit = async (medicationId) => {
        console.log('Saving medication:', medicationId); // Add logging for debugging
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

            const updatedMedications = medications.map(med =>
                med.id === medicationId ? editedMedications[medicationId] : med
            );
            setMedications(updatedMedications);

            setEditMode(prevState => ({
                ...prevState,
                [medicationId]: false
            }));
            setEditedMedications(prevState => ({
                ...prevState,
                [medicationId]: {}
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
                renew_date: ''  // Reset renew_date to empty string
            });
            setShowAddMedicationForm(false);
        } catch (error) {
            console.error('Error adding medication:', error);
        }
    };

    const formatDate = (inputDate) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = new Date(inputDate.replace(/-/g, '\/')).toLocaleDateString('en-US', options);
        return formattedDate;
    };

    const handleExtendMedication = async (medicationId) => {
        const medicationToExtend = medications.find(med => med.id === medicationId);
        const currentRenewDate = new Date(medicationToExtend.renew_date);
        const newRenewDate = new Date(currentRenewDate.setMonth(currentRenewDate.getMonth() + 1));
        const formattedNewRenewDate = newRenewDate.toISOString().split('T')[0];

        try {
            const response = await fetch(`/api/medications/${medicationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...medicationToExtend, renew_date: formattedNewRenewDate })
            });

            if (!response.ok) {
                throw new Error('Failed to extend medication');
            }

            setMedications(prevMedications =>
                prevMedications.map(med =>
                    med.id === medicationId ? { ...med, renew_date: formattedNewRenewDate } : med
                )
            );
        } catch (error) {
            console.error('Error extending medication:', error);
        }
    };

    return (
        <div>
            <h1>Medication</h1>
            {medications.length > 0 && (
                <div>
                    <h3>My prescriptions:</h3>
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
                                            type='date'
                                            name='renew_date'
                                            value={editedMedications[medication.id]?.renew_date || ''}
                                            onChange={(e) => handleInputChange(e, medication.id)}
                                        />
                                        <br /><br />
                                        <button onClick={() => handleSaveEdit(medication.id)}>Save</button>
                                        &nbsp;
                                        <button onClick={() => handleCancelEdit(medication.id)}>Cancel</button>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ fontWeight: 'bold' }}>{medication.drug_name}</div>
                                        <div>Dosage: {medication.dosage}</div>
                                        <div>Prescriber: {medication.prescriber}</div>
                                        <div>Renewal Date: {formatDate(medication.renew_date)}</div>
                                        <br />
                                        <button style={{ scale: '125%', marginLeft: '0.5em', marginBottom: '0.25em' }} onClick={() => handleEditMedication(medication.id)}>Edit</button>
                                        &nbsp;
                                        <button style={{ scale: '125%', marginLeft: '1em', marginBottom: '0.25em' }} onClick={() => handleDeleteMedication(medication.id)}>Delete</button>
                                        &nbsp;
                                        <button style={{ scale: '125%', marginLeft: '1em', marginBottom: '0.25em' }} onClick={() => handleExtendMedication(medication.id)}>Extend</button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                    <br />
                </div>
            )}

            <div>
                <button style={{ scale: '125%', marginLeft: '2em' }} onClick={() => setShowAddMedicationForm(true)}>Add Prescription</button>
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
                            type='date'
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