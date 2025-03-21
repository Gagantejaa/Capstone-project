import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { FaHistory } from 'react-icons/fa'; // Import history icon
import './ScrumDetails.css';

const ScrumDetails = ({ scrum }) => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    // Check if user is logged in
    useEffect(() => {
        const checkUser = () => {
            const loggedInUser = JSON.parse(localStorage.getItem('user'));
            if (!loggedInUser) {
                navigate('/login');
            }
        };
        checkUser();
    }, [navigate]);

    // Fetch tasks for the selected scrum
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/tasks?scrumId=${scrum.id}`);
                setTasks(response.data);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };
        fetchTasks();
    }, [scrum.id]);

    // Fetch users assigned to the fetched tasks
    useEffect(() => {
        if (tasks.length > 0) {
            const fetchUsers = async () => {
                try {
                    const response = await axios.get('http://localhost:4000/users');
                    const scrumUsers = response.data.filter(user =>
                        tasks.some(task => String(task.assignedTo) === String(user.id))
                    );
                    setUsers(scrumUsers);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            };
            fetchUsers();
        }
    }, [tasks]);

    // Handle status change for tasks
    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const updatedTask = tasks.find(task => task.id === taskId);
            const updatedHistory = [
                ...updatedTask.history,
                { status: newStatus, date: new Date().toISOString().split('T')[0] }
            ];

            await axios.patch(`http://localhost:4000/tasks/${taskId}`, {
                status: newStatus,
                history: updatedHistory
            });

            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, status: newStatus, history: updatedHistory } : task
                )
            );
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    return (
        <div className="scrum-details-container">
            <h3 className="mb-4">Scrum Details for {scrum.name}</h3>

            <h4 className="mb-3">Tasks</h4>
            <ul className="task-list">
                {tasks.map(task => (
                    <li key={task.id} className="task-item">
                        <div className="task-info">
                            <strong>{task.title}:</strong> {task.description} - 
                            <span className={`status-label ${task.status.toLowerCase().replace(' ', '-')}`}>
                                {task.status}
                            </span>
                        </div>
                        {user?.role === 'admin' && (
                            <select
                                className="form-select w-auto ms-2"
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        )}
                        <div className="task-history">
                            <h5><FaHistory className="me-1" /> History:</h5>
                            <ul>
                                {task.history.map((entry, index) => (
                                    <li key={index}>
                                        <span className={`status-label ${entry.status.toLowerCase().replace(' ', '-')}`}>
                                            {entry.status}
                                        </span>
                                        - {entry.date}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </li>
                ))}
            </ul>

            <h4 className="mb-3 mt-4">Users</h4>
            <ul className="user-list">
                {users.map(user => (
                    <li key={user.id} className="user-item">
                        {user.name} ({user.email})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ScrumDetails;
