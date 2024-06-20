import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPenToSquare, faTrashCan, faBars } from '@fortawesome/free-solid-svg-icons';


function Home() {
    const [mood, setMood] = useState(null); 
    const [journalHeader, setJournalHeader] = useState('');
    const [journalText, setJournalText] = useState('');
    const [todos, setTodos] = useState([]);
    const [newTask, setNewTask] = useState('');

    const [taskEditMode, setTaskEditMode] = useState({});
    const [editedTaskContent, setEditedTaskContent] = useState({});
    const [visibleTasks, setVisibleTasks] = useState(false);


    useEffect(() => {
        fetchTodos();
    }, []);

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
                const today = new Date().toISOString().split('T')[0];
                const todaysTasks = data.filter(todo => {
                    const todoDate = new Date(todo.created_at.replace(/-/g, '\/')).toLocaleDateString('en-US');
                    const currentDate = new Date(today.replace(/-/g, '\/')).toLocaleDateString('en-US');
                    return todoDate === currentDate;
                });
                setTodos(todaysTasks);
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
                body: JSON.stringify({ task_text: newTask })
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

    const handleMoodChange = (newMood) => {
        setMood(newMood);
    };

    const handleJournalHeaderChange = (event) => {
        setJournalHeader(event.target.value);
    };

    const handleJournalTextChange = (event) => {
        setJournalText(event.target.value);
    };

    const handleMoodSubmit = () => {
        fetch('/api/mood-ratings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mood }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Mood rating submitted:', data);
                setMood(null);
            })
            .catch((error) => {
                console.error('Error submitting mood rating:', error);
            });
    };

    const handleJournalSubmit = () => {
        fetch('/api/journals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ journal_header: journalHeader, journal_text: journalText,}), 
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Journal entry submitted:', data);
                setJournalHeader('');
                setJournalText('');
            })
            .catch((error) => {
                console.error('Error submitting journal entry:', error);
            });
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
    
    const handleTaskContentChange = (taskId, value) => {
        setEditedTaskContent(prevState => ({
            ...prevState,
            [taskId]: value
        }));
    };
    
    const handleToggleTaskVisibility = () => {
        setVisibleTasks(prevState => !prevState);
    };
    
    
    return (
        <div className='home-container'>
            <div>
                <h1>Welcome!</h1>
            </div>
            <div className='mood-container'>
                <h2>How are you feeling today?</h2>
                <div className='mood-buttons'>
                    <button 
                        style={{backgroundColor:'#e35337'}} 
                        className={`mood-button ${mood === 1 ? 'selected' : ''}`} 
                        onClick={() => handleMoodChange(1)}
                    >😔</button>
                    <button 
                        style={{backgroundColor:'#ef9c0e'}} 
                        className={`mood-button ${mood === 2 ? 'selected' : ''}`} 
                        onClick={() => handleMoodChange(2)}
                    >🙁</button>
                    <button 
                        style={{backgroundColor:'#ece13b'}} 
                        className={`mood-button ${mood === 3 ? 'selected' : ''}`} 
                        onClick={() => handleMoodChange(3)}
                    >😐</button>
                    <button 
                        style={{backgroundColor:'#afe48e'}} 
                        className={`mood-button ${mood === 4 ? 'selected' : ''}`} 
                        onClick={() => handleMoodChange(4)}
                    >🙂</button>
                    <button 
                        style={{backgroundColor:'#26e616'}} 
                        className={`mood-button ${mood === 5 ? 'selected' : ''}`} 
                        onClick={() => handleMoodChange(5)}
                    >😁</button>
                </div>
                <br />
                <button style={{ scale: '125%', marginLeft: '1em' }} onClick={handleMoodSubmit}>Submit</button>
            </div>
            <div className='journal-container'>
                <h2>Today's thoughts...</h2>
                <input
                    type='text'
                    value={journalHeader}
                    onChange={handleJournalHeaderChange}
                    placeholder='Journal Entry Header'
                    className="large-placeholder"
                    style={{height:'1.5em', width:'15em' }}
                />
                <br></br>
                <br></br>
                <textarea
                    className='journal-text-field'
                    value={journalText}
                    onChange={handleJournalTextChange}
                    placeholder='Write your thoughts here...'
                ></textarea>
                <button style={{scale:'125%', marginLeft:'1em', marginTop:'0.75em'}} onClick={handleJournalSubmit}>Submit</button>
            </div>
            <div>
                <h2>Today's Tasks...</h2>
                <div className='task-input'>
                    <input
                        type="text"
                        placeholder="Add a new task"
                        className='task-input-bar'
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        style={{height:'1.5em', width:'15em', marginLeft:'1em' }}
                    />
                    &nbsp;
                    <button style={{scale:'125%', marginLeft:'0.25em'}} onClick={handleTaskSubmit}>Add</button>
                </div>
                {todos.length > 0 ? (
                    <div className='task-container'>
                        <button 
                            className="toggle-button"
                            onClick={handleToggleTaskVisibility}
                        >
                            <FontAwesomeIcon icon={faBars} />
                        </button>
                        <ul style={{ listStyleType: 'none', paddingLeft:'1em', marginTop:'2.5em' }}>
                            {todos.map(todo => (
                                <li key={todo.id} style={{ marginTop:'0.25em', textDecoration: todo.completed ? 'line-through' : 'none' }}>
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
                                        </>
                                    )}
                                    <br></br>
                                    <br></br>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p style={{marginLeft:'3em'}}>No tasks for today</p>
                )}
            </div>
        </div>
    );
};

export default Home