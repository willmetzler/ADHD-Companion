import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight, faPenToSquare, faTrashCan, faBars } from '@fortawesome/free-solid-svg-icons';

function DayDetail() {
    const { date } = useParams();
    const navigate = useNavigate();
    const [journalEntries, setJournalEntries] = useState([]);
    const [moodRating, setMoodRating] = useState(null);
    const [editMode, setEditMode] = useState({});
    const [editedContent, setEditedContent] = useState({});
    const [newJournalHeader, setNewJournalHeader] = useState('');
    const [newJournalText, setNewJournalText] = useState('');
    const [isAddingJournal, setIsAddingJournal] = useState(false);
    const [isEditingMood, setIsEditingMood] = useState(false);
    const [newMoodRating, setNewMoodRating] = useState(moodRating);

    const [todos, setTodos] = useState([]);
    const [newTask, setNewTask] = useState('');

    const [taskEditMode, setTaskEditMode] = useState({});
    const [editedTaskContent, setEditedTaskContent] = useState({});

    const [visibleJournalEntries, setVisibleJournalEntries] = useState({});
    const [visibleTasks, setVisibleTasks] = useState(false); // Updated to handle all tasks

    useEffect(() => {
        fetchTodos();
        const fetchJournalEntries = async () => {
            const response = await fetch('/api/journals');
            if (response.ok) {
                const data = await response.json();
                const filteredEntries = data.filter(entry => {
                    const entryDate = new Date(entry.created_at.replace(/-/g, '\/')).toISOString().split('T')[0];
                    return entryDate === date;
                });
                setJournalEntries(filteredEntries);
            }
        };

        const fetchMoodRating = async () => {
            const response = await fetch('/api/mood-ratings');
            if (response.ok) {
                const data = await response.json();
                const mood = data.filter(entry => {
                    const entryDate = new Date(entry.created_at.replace(/-/g, '\/')).toISOString().split('T')[0];
                    return entryDate === date;
                });
                setMoodRating(mood.length ? mood[mood.length - 1].mood : null);
            }
        };

        fetchJournalEntries();
        fetchMoodRating();
    }, [date]);

    const getMoodEmoji = (rating) => {
        switch (rating) {
            case 1:
                return '😔';
            case 2:
                return '🙁';
            case 3:
                return '😐';
            case 4:
                return '🙂';
            case 5:
                return '😁';
            default:
                return '';
        }
    };

    const getMoodColor = () => {
        const mood = moodRating;
        switch (mood) {
            case 1:
                return '#e35337'; // darkred
            case 2:
                return '#ef9c0e'; // orange
            case 3:
                return '#ece13b'; // yellow
            case 4:
                return '#afe48e'; // pale green
            case 5:
                return '#26e616'; // bright green
            default:
                return 'black'; // Default text color
        }
    };

    const formatDate = (inputDate) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = new Date(inputDate.replace(/-/g, '\/')).toLocaleDateString('en-US', options);
        return formattedDate;
    };

    const isFutureDate = (dateStr) => {
        const today = new Date().setHours(0, 0, 0, 0);
        const selectedDate = new Date(dateStr.replace(/-/g, '\/')).setHours(0, 0, 0, 0);
        return selectedDate > today;
    };

    const isToday = (dateStr) => {
        const today = new Date().setHours(0, 0, 0, 0);
        const selectedDate = new Date(dateStr.replace(/-/g, '\/')).setHours(0, 0, 0, 0);
        return selectedDate === today;
    };

    const handleEdit = (entryId, entry) => {
        setEditMode(prevState => ({
            ...prevState,
            [entryId]: true
        }));
        setEditedContent(prevState => ({
            ...prevState,
            [entryId]: {
                journal_header: entry.journal_header,
                journal_text: entry.journal_text
            }
        }));
    };

    const handleSaveEdit = async (entryId) => {
        try {
            const response = await fetch(`/api/journals/${entryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    journal_header: editedContent[entryId].journal_header,
                    journal_text: editedContent[entryId].journal_text
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save edited entry');
            }

            const updatedEntries = [...journalEntries];
            const updatedEntryIndex = updatedEntries.findIndex(entry => entry.id === entryId);
            if (updatedEntryIndex !== -1) {
                updatedEntries[updatedEntryIndex].journal_header = editedContent[entryId].journal_header;
                updatedEntries[updatedEntryIndex].journal_text = editedContent[entryId].journal_text;
                setJournalEntries(updatedEntries);
            }

            setEditMode(prevState => ({
                ...prevState,
                [entryId]: false
            }));
        } catch (error) {
            console.error('Error saving edited entry:', error);
        }
    };

    const handleCancelEdit = (entryId) => {
        setEditMode(prevState => ({
            ...prevState,
            [entryId]: false
        }));
        setEditedContent(prevState => ({
            ...prevState,
            [entryId]: null
        }));
    };

    const handleHeaderChange = (entryId, value) => {
        setEditedContent(prevState => ({
            ...prevState,
            [entryId]: {
                ...prevState[entryId],
                journal_header: value
            }
        }));
    };

    const handleTextChange = (entryId, value) => {
        setEditedContent(prevState => ({
            ...prevState,
            [entryId]: {
                ...prevState[entryId],
                journal_text: value
            }
        }));
    };

    const handleDelete = async (entryId) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this?");
        if (!isConfirmed) return;

        try {
            const response = await fetch(`/api/journals/${entryId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete entry');
            }

            const updatedEntries = journalEntries.filter(entry => entry.id !== entryId);
            setJournalEntries(updatedEntries);
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };

    const handleNewJournalSubmit = async () => {
        try {
            const response = await fetch('/api/journal-entries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    journal_header: newJournalHeader,
                    journal_text: newJournalText,
                    created_at: date
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit new journal entry');
            }

            const newEntry = await response.json();
            setJournalEntries([...journalEntries, {
                id: newEntry.id,
                journal_header: newJournalHeader,
                journal_text: newJournalText,
                created_at: date
            }]);
            setNewJournalHeader('');
            setNewJournalText('');
            setIsAddingJournal(false);
        } catch (error) {
            console.error('Error submitting new journal entry:', error);
        }
    };

    const handleEditMood = () => {
        setIsEditingMood(true);
    };

    const handleSaveMood = async () => {
        try {
            const response = await fetch('/api/mood-ratings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    mood: newMoodRating,
                    created_at: date // Ensure the date is included in the request
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update mood rating');
            }

            setMoodRating(newMoodRating);
            setIsEditingMood(false);
        } catch (error) {
            console.error('Error updating mood rating:', error);
        }
    };

    const handleCancelMoodEdit = () => {
        setIsEditingMood(false);
        setNewMoodRating(moodRating); // Reset the newMoodRating to the current mood rating
    };

    const handlePrevDay = () => {
        const prevDay = new Date(date);
        prevDay.setDate(prevDay.getDate() - 1);
        navigate(`/day/${prevDay.toISOString().split('T')[0]}`);
    };

    const handleNextDay = () => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        navigate(`/day/${nextDay.toISOString().split('T')[0]}`);
    };

    const handleToday = () => {
        const today = new Date().toISOString().split('T')[0];
        navigate(`/day/${today}`);
    };

    const fetchTodos = () => {
        fetch('/api/todos')
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to fetch todos');
                }
            })
            .then(data => {
                const filteredTodos = data.filter(todo => {
                    const todoDate = new Date(todo.created_at.replace(/-/g, '\/')).toLocaleDateString('en-US');
                    const selectedDate = new Date(date.replace(/-/g, '\/')).toLocaleDateString('en-US');
                    return todoDate === selectedDate;
                });
                setTodos(filteredTodos);
            })
            .catch(error => {
                console.error('Error fetching todos:', error);
            });
    };

    const handleTaskSubmit = async () => {
        if (newTask.trim() === '') return;
        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ task_text: newTask, created_at: date })
            });

            if (!response.ok) {
                throw new Error('Failed to add task');
            }

            const newTodo = await response.json();
            setTodos([...todos, newTodo]);
            setNewTask('');
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleToggleComplete = async (todoId) => {
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;
        try {
            const response = await fetch(`/api/todos/${todoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ completed: !todo.completed })
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            setTodos(todos.map(t => (t.id === todoId ? { ...t, completed: !t.completed } : t)));
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (todoId) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this?");
        if (!isConfirmed) return;

        try {
            const response = await fetch(`/api/todos/${todoId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            setTodos(todos.filter(t => t.id !== todoId));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleEditTask = (taskId, task) => {
        setTaskEditMode(prevState => ({
            ...prevState,
            [taskId]: true
        }));
        setEditedTaskContent(prevState => ({
            ...prevState,
            [taskId]: task.task_text
        }));
    };

    const handleSaveTaskEdit = async (taskId) => {
        try {
            const response = await fetch(`/api/todos/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ task_text: editedTaskContent[taskId] })
            });

            if (!response.ok) {
                throw new Error('Failed to save edited task');
            }

            setTodos(todos.map(task => 
                task.id === taskId ? { ...task, task_text: editedTaskContent[taskId] } : task
            ));

            setTaskEditMode(prevState => ({
                ...prevState,
                [taskId]: false
            }));
        } catch (error) {
            console.error('Error saving edited task:', error);
        }
    };

    const handleCancelTaskEdit = (taskId) => {
        setTaskEditMode(prevState => ({
            ...prevState,
            [taskId]: false
        }));
        setEditedTaskContent(prevState => ({
            ...prevState,
            [taskId]: ''
        }));
    };

    const handleTaskContentChange = (taskId, value) => {
        setEditedTaskContent(prevState => ({
            ...prevState,
            [taskId]: value
        }));
    };

    const handleToggleJournalEntryVisibility = (entryId) => {
        setVisibleJournalEntries(prevState => ({
            ...prevState,
            [entryId]: !prevState[entryId]
        }));
    };

    const handleToggleTaskVisibility = () => {
        setVisibleTasks(prevState => !prevState);
    };   
    

    return (
        <div>
            <button onClick={handlePrevDay}><FontAwesomeIcon icon={faAngleLeft} /></button>
            &nbsp;
            <button 
                onClick={handleToday} 
                disabled={isToday(date.replace(/-/g, '\/'))} 
                style={{ backgroundColor: isToday(date.replace(/-/g, '\/')) ? 'gray' : '#e7e7e7' }}>
                Today
            </button>
            &nbsp;
            <button onClick={handleNextDay}><FontAwesomeIcon icon={faAngleRight} /></button>
            <h1>{formatDate(date)}</h1>
            <h2>
                Mood Rating: <span style={{ color: getMoodColor(), WebkitTextStroke: '1px black', textStroke: '1px black' }}>{moodRating ? `${moodRating}/5 ${getMoodEmoji(moodRating)}` : '(None)'}</span>
                {!isFutureDate(date.replace(/-/g, '\/')) && !isEditingMood && <button style={{ scale: '120%', marginLeft: '1em' }} onClick={handleEditMood}>Edit Mood</button>}
            </h2>
            {isEditingMood && (
                <div>
                    <select style={{ scale: '120%', marginLeft: '1.5em' }} value={newMoodRating || ''} onChange={(e) => setNewMoodRating(Number(e.target.value))}>
                        <option value="" disabled>Select Mood</option>
                        <option value={1}>1 😔</option>
                        <option value={2}>2 🙁</option>
                        <option value={3}>3 😐</option>
                        <option value={4}>4 🙂</option>
                        <option value={5}>5 😁</option>
                    </select>
                    &nbsp;
                    <button style={{ scale: '115%', marginLeft: '1.5em' }} onClick={handleSaveMood}>Save</button>
                    &nbsp;
                    <button style={{ scale: '115%', marginLeft: '1em' }} onClick={handleCancelMoodEdit}>Cancel</button>
                </div>
            )}
            <h2>Journal Entries:</h2>
            <div className='day-journal-container'>
                {journalEntries.length > 0 ? (
                    journalEntries.map(entry => (
                        <div className='day-content' key={entry.id}>
                            <button 
                                className="toggle-button"
                                onClick={() => handleToggleJournalEntryVisibility(entry.id)}
                            >
                                <FontAwesomeIcon icon={faBars} />
                            </button>
                            {editMode[entry.id] ? (
                                <div>
                                    <br></br>
                                    <input type="text" value={editedContent[entry.id]?.journal_header || ''} onChange={e => handleHeaderChange(entry.id, e.target.value)} />
                                    <br></br>
                                    <br></br>
                                    <textarea style={{ height: '10em' }} value={editedContent[entry.id]?.journal_text || ''} onChange={e => handleTextChange(entry.id, e.target.value)} />
                                    <br></br>
                                    <br></br>
                                    <button onClick={() => handleSaveEdit(entry.id)}>Save</button>
                                    <button onClick={() => handleCancelEdit(entry.id)}>Cancel</button>
                                </div>
                            ) : (
                                <>
                                    <h3>{entry.journal_header}</h3>
                                    <p>{entry.journal_text}</p>
                                    <button 
                                        className={`edit-button ${visibleJournalEntries[entry.id] ? 'visible-button' : 'hidden-button'}`} 
                                        style={{ scale: '125%', marginLeft:'0.5em' }} 
                                        onClick={() => handleEdit(entry.id, entry)}
                                    >
                                        <FontAwesomeIcon icon={faPenToSquare} />
                                    </button>
                                    <button 
                                        className={`delete-button ${visibleJournalEntries[entry.id] ? 'visible-button' : 'hidden-button'}`} 
                                        style={{ scale: '125%', marginLeft:'1.5em', marginBottom:'0.25em' }} 
                                        onClick={() => handleDelete(entry.id)}
                                    >
                                        <FontAwesomeIcon icon={faTrashCan} />
                                    </button>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Nothing to see here...</p>
                )}
                {!isAddingJournal && (
                    <button style={{ scale: '120%', marginLeft: '1.5em' }} onClick={() => setIsAddingJournal(true)}>Add New Journal Entry</button>
                )}
                {isAddingJournal && (
                    <div>
                        <input
                            type="text"
                            placeholder="Journal Header"
                            value={newJournalHeader}
                            className="large-placeholder"
                            onChange={(e) => setNewJournalHeader(e.target.value)}
                            style={{ height: '1.5em', width: '15em' }}
                        />
                        <br></br>
                        <br></br>
                        <textarea
                            placeholder="Journal Text"
                            value={newJournalText}
                            className="large-placeholder"
                            onChange={(e) => setNewJournalText(e.target.value)}
                            style={{ height: '12em', width: '18em' }}
                        />
                        <br></br>
                        <br></br>
                        <button style={{ scale: '150%', marginLeft: '1em' }} onClick={handleNewJournalSubmit}>Submit</button>
                        &nbsp; &nbsp; &nbsp;
                        <button style={{ scale: '150%', marginLeft: '1em' }} onClick={() => setIsAddingJournal(false)}>Cancel</button>
                    </div>
                )}
            </div>
            <div className='day-task-container'>
                <h2>To-do:</h2>
                <div className='task-input'>
                    <input
                        type="text"
                        placeholder="Add a new task"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                    />
                    &nbsp;
                    <button onClick={handleTaskSubmit}>Add</button>
                </div>
                <div className='task-container'>
                    <button 
                        className="toggle-button"
                        onClick={handleToggleTaskVisibility}
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    <ul style={{ listStyleType: 'none', marginTop:'2.5em', paddingLeft:'1em' }}>
                        {todos.length > 0 ? (
                            todos.map(todo => (
                                <li key={todo.id} style={{ marginTop: '0.25em', textDecoration: todo.completed ? 'line-through' : 'none' }}>
                                    <label className="custom-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={todo.completed}
                                            onChange={() => handleToggleComplete(todo.id)}
                                        />
                                        <span className="checkmark"></span>
                                    </label>
                                    {taskEditMode[todo.id] ? (
                                        <div>
                                            <input 
                                                type="text" 
                                                value={editedTaskContent[todo.id] || ''} 
                                                onChange={(e) => handleTaskContentChange(todo.id, e.target.value)} 
                                            />
                                            <button style={{ scale: '85%', marginLeft: '0.5em' }} onClick={() => handleSaveTaskEdit(todo.id)}>Save</button>
                                            <button style={{ scale: '85%', marginLeft: '0.5em' }} onClick={() => handleCancelTaskEdit(todo.id)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <>
                                            {todo.task_text}
                                            <button 
                                                className={`edit-button ${visibleTasks ? 'visible-button' : 'hidden-button'}`} 
                                                style={{ scale: '85%', marginLeft: '0.5em' }} 
                                                onClick={() => handleEditTask(todo.id, todo)}
                                            >
                                                <FontAwesomeIcon icon={faPenToSquare} />
                                            </button>
                                            <button 
                                                className={`delete-button ${visibleTasks ? 'visible-button' : 'hidden-button'}`} 
                                                style={{ scale: '85%', marginLeft: '0.5em' }} 
                                                onClick={() => handleDeleteTask(todo.id)}
                                            >
                                                <FontAwesomeIcon icon={faTrashCan} />
                                            </button>
                                            <br></br>
                                            <br></br>
                                        </>
                                    )}
                                </li>
                            ))
                        ) : (
                            <p>Nothing to see here...</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
    
}

export default DayDetail;
