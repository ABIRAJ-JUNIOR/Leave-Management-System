document.addEventListener('DOMContentLoaded', async function() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        alert('You must log in first!');
        window.location.href = 'login.html';
        return;
    }

    // Display welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    welcomeMessage.textContent = `Welcome, ${loggedInUser.firstName} ${loggedInUser.lastName}`;

    // Logout button functionality
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', function() {
        localStorage.removeItem('loggedInUser');
        alert('You have been logged out.');
        window.location.href = 'login.html';
    });

    const leaveRequestForm = document.getElementById('leaveRequestForm');
    const leaveRequestsList = document.getElementById('leaveRequests');

    leaveRequestForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const reason = document.getElementById('reason').value;
        const dateFrom = document.getElementById('dateFrom').value;
        const numOfDays = document.getElementById('numOfDays').value;
        const applicationDate = document.getElementById('applicationDate').value;

        // Validate that application date is less than dateFrom
        if (new Date(applicationDate) >= new Date(dateFrom)) {
            alert('Application date must be earlier than the leave start date.');
            return;
        }

        const newLeaveRequest = {
            employeeId: loggedInUser.empId,
            reason,
            dateFrom,
            numOfDays,
            applicationDate, // Use the selected application date
            status: 'Pending' // Initial status
        };

        try {
            const response = await fetch('http://localhost:3000/leaveRequests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newLeaveRequest)
            });

            if (response.ok) {
                alert('Leave request submitted successfully!');
                leaveRequestForm.reset();
                loadLeaveRequests(loggedInUser.empId);
            } else {
                alert('Failed to submit leave request.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the leave request.');
        }
    });

    async function loadLeaveRequests(employeeId) {
        try {
            const response = await fetch(`http://localhost:3000/leaveRequests?employeeId=${employeeId}`);
            const leaveRequests = await response.json();

            leaveRequestsList.innerHTML = '';
            leaveRequests.forEach(request => {
                const li = document.createElement('li');
                li.classList.add('leave-item'); // Add a class for styling
                li.innerHTML = `
                    <div>Reason: ${request.reason}</div>
                    <div>From: ${request.dateFrom}</div>
                    <div>Days: ${request.numOfDays}</div>
                    <div>Applied on: ${request.applicationDate}</div>
                    <div>Status: <span class="status ${request.status.toLowerCase()}">${request.status}</span></div>
                `;
                leaveRequestsList.appendChild(li);
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    loadLeaveRequests(loggedInUser.empId);
});
