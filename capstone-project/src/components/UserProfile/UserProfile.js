import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { FaTrashAlt } from 'react-icons/fa'; // Import trash icon
import './UserProfile.css'; // Import updated CSS file

const UserProfile = () => {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('employee');
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/users');
                if (user?.role === 'admin') {
                    setUsers(response.data.filter(u => u?.role !== 'admin'));
                } else {
                    setSelectedUser(user);
                    fetchTasks(user?.id);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        if (user) fetchUsers();
    }, [user]);

    const fetchTasks = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:4000/tasks?assignedTo=${userId}`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleGetHistory = (userId) => {
        const foundUser = users.find(u => u?.id === userId);
        if (foundUser) {
            setSelectedUser(foundUser);
            fetchTasks(userId);
        }
    };

    const handleAddUser = async (event) => {
        event.preventDefault();
        try {
            await axios.post('http://localhost:4000/users', {
                name: newUserName,
                email: newUserEmail,
                password: newUserPassword,
                role: newUserRole,
            });
            const updatedUsers = await axios.get('http://localhost:4000/users');
            setUsers(updatedUsers.data.filter(u => u?.role !== 'admin'));
            setShowForm(false);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserRole('employee');
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`http://localhost:4000/users/${userId}`);
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleDeleteHistory = async (taskId, historyIndex) => {
        try {
            const task = tasks.find(task => task.id === taskId);
            if (!task) return;

            const updatedHistory = [...task.history];
            updatedHistory.splice(historyIndex, 1);
            
            await axios.patch(`http://localhost:4000/tasks/${taskId}`, { history: updatedHistory });

            setTasks(prevTasks =>
                prevTasks.map(t => (t.id === taskId ? { ...t, history: updatedHistory } : t))
            );
        } catch (error) {
            console.error('Error deleting history entry:', error);
        }
    };

    return (
        <div className="user-profile-container">
            <h2 className="mb-4">User Profiles</h2>
            {user?.role === 'admin' && (
                <div>
                    <button className="add-user-button mb-3" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add New User'}
                    </button>
                    {showForm && (
                        <form className="user-form" onSubmit={handleAddUser}>
                            <div className="mb-3">
                                <label className="form-label">Name:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email:</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Password:</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Role:</label>
                                <select
                                    className="form-select"
                                    value={newUserRole}
                                    onChange={(e) => setNewUserRole(e.target.value)}
                                    required
                                >
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button type="submit" className="create-user-button">Create User</button>
                        </form>
                    )}
                    <ul className="user-list">
                        {users.map(userItem => (
                            <li key={userItem?.id} className="user-item">
                                <div>
                                    <strong>Name:</strong> {userItem?.name} <br />
                                    <strong>Email:</strong> {userItem?.email}
                                </div>
                                <div>
                                    <button
                                        className="history-button me-2"
                                        onClick={() => handleGetHistory(userItem?.id)}
                                    >
                                        Get History
                                    </button>
                                    {user?.role === 'admin' && (
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteUser(userItem?.id)}
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {selectedUser && (
                <div className="mt-4">
                    <h3>Tasks Worked By {selectedUser?.name}</h3>
                    <ul className="task-list">
                        {tasks.map(task => (
                            <li key={task.id} className="task-item">
                                <div>
                                    <strong>Title:</strong> {task.title} <br />
                                    <strong>Description:</strong> {task.description} <br />
                                    <strong>Status:</strong> 
                                    <span className={`task-status ${task.status.toLowerCase().replace(" ", "-")}`}>
                                        {task.status}
                                    </span>
                                </div>
                                <div className="task-history">
                                    <h5>History:</h5>
                                    <ul>
                                        {task.history.map((entry, index) => (
                                            <li key={index}>
                                                {entry.status} - {entry.date}
                                                {user?.role === 'admin' && (
                                                    <button
                                                        className="delete-history-button ms-2"
                                                        onClick={() => handleDeleteHistory(task.id, index)}
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserProfile;