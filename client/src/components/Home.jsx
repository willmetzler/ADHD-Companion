import React, { useState, useEffect } from 'react';

function Home() {
    const [mood, setMood] = useState(null); 
    const [journalHeader, setJournalHeader] = useState('');
    const [journalText, setJournalText] = useState('');
    const [todos, setTodos] = useState([]);
    const [newTask, setNewTask] = useState('');

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
                const todaysTasks = data.filter(todo => todo.created_at.startsWith(today));
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
                <br></br>
                <br></br>
                <button style={{scale:'125%', marginLeft:'1em'}} onClick={handleJournalSubmit}>Submit</button>
            </div>
            <div>
                <h2>Today's Tasks...</h2>
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
                    <ul style={{ listStyleType: 'none', paddingLeft:'1em' }}>
                        {todos.length > 0 ? (
                            todos.map(todo => (
                                <li key={todo.id} style={{ marginTop:'0.25em', textDecoration: todo.completed ? 'line-through' : 'none' }}>
                                    <label className="custom-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={todo.completed}
                                            onChange={() => handleToggleComplete(todo.id)}
                                        />
                                        <span className="checkmark"></span>
                                    </label>
                                    {todo.task_text}
                                    <br></br>
                                    <br></br>
                                </li>
                            ))
                        ) : (
                            <p>No tasks for today</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Home;
