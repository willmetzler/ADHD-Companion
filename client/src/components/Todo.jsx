import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';

function Todo() {
    const [todos, setTodos] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(null); 
    const [showMonthViewButton, setShowMonthViewButton] = useState(false);

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
                setTodos(data);
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

    const handleDeleteTask = async (todoId) => {
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

    const getMonthName = (monthIndex) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthIndex];
    };

    const formatDateTime = (dateTimeString) => {
        const normalizedDateString = dateTimeString.replace(/-/g, '/');
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        return new Date(normalizedDateString).toLocaleDateString('en-US', options);
    };

    const groupedTodos = todos.reduce((acc, todo) => {
        const localDate = new Date(todo.created_at.replace(/-/g, '/')).toLocaleDateString('en-CA');
        if (!acc[localDate]) {
            acc[localDate] = [];
        }
        acc[localDate].push(todo);
        return acc;
    }, {});

    const filteredTodos = Object.entries(groupedTodos).filter(([date]) => {
        const todoDate = new Date(date.replace(/-/g, '/'));
        const todoYear = todoDate.getFullYear();
        const todoMonth = todoDate.getMonth();
        if (selectedDate) {
            return date === selectedDate;
        }
        return todoYear === selectedYear && todoMonth === currentMonth;
    });

    const sortedTodos = filteredTodos.sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA));

    const handleNextMonth = () => {
        setCurrentMonth(prevMonthIndex => {
            const nextMonth = prevMonthIndex === 11 ? 0 : prevMonthIndex + 1;
            const nextYear = prevMonthIndex === 11 ? selectedYear + 1 : selectedYear;
            setSelectedYear(nextYear);
            return nextMonth;
        });
    };

    const handlePrevMonth = () => {
        setCurrentMonth(prevMonthIndex => {
            const prevMonth = prevMonthIndex === 0 ? 11 : prevMonthIndex - 1;
            const prevYear = prevMonthIndex === 0 ? selectedYear - 1 : selectedYear;
            setSelectedYear(prevYear);
            return prevMonth;
        });
    };

    const handleToggleMonthView = () => {
        setSelectedDate(null);
        setShowMonthViewButton(false);
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentMonth(today.getMonth());
        setSelectedYear(today.getFullYear());
        setSelectedDate(null); 
        setShowMonthViewButton(false); 
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
        setShowMonthViewButton(true); 
    };

    return (
        <div>
            <h1>To-Do List</h1>
            <h3>{selectedDate ? formatDateTime(selectedDate) : `${getMonthName(currentMonth)} ${selectedYear}`}</h3>
            <div id='todobutt'>
                <button className='todo-buttons' onClick={handlePrevMonth}><FontAwesomeIcon icon={faAngleLeft} /></button>
                {showMonthViewButton ? (
                    <button className='todo-buttons' onClick={handleToggleMonthView}>Month View</button>
                ) : (
                    <button className='todo-buttons'onClick={handleToday}>Current Month</button>
                )}
                <button className='todo-buttons' onClick={handleNextMonth}><FontAwesomeIcon icon={faAngleRight} /></button>
            </div>
            <div>
                <label htmlFor="datePicker">Select Date:</label>
                <input type="date" id="datePicker" value={selectedDate || ''} onChange={handleDateChange} />
            </div>
            <br></br>
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
            {sortedTodos.length > 0 ? (
                sortedTodos.map(([date, todos]) => (
                    <div className="task-container" key={date}>
                        <p style={{marginLeft:'1em'}}>{formatDateTime(date)}</p>
                        <ul style={{ listStyleType: 'none', paddingLeft:'1em' }}>
                            {todos.map(todo => (
                                <li key={todo.id} style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                                    <input
                                        type="checkbox"
                                        checked={todo.completed}
                                        onChange={() => handleToggleComplete(todo.id)}
                                        style={{scale:'125%', marginRight:'0.5em'}}
                                    />
                                    {todo.task_text}
                                    <button style={{scale:'80%', marginLeft:'0.5em'}}onClick={() => handleDeleteTask(todo.id)}>X</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>No tasks for this month</p>
            )}
        </div>
    );
}

export default Todo;
