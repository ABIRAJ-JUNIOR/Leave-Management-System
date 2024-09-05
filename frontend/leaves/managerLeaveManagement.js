document.addEventListener('DOMContentLoaded', async function () {
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
    logoutButton.addEventListener('click', function () {
        localStorage.removeItem('loggedInUser');
        alert('You have been logged out.');
        window.location.href = 'login.html';
    });

    const statusFilter = document.getElementById('statusFilter');
    const leaveRequestsList = document.getElementById('leaveRequests');
    let leaveRequests = [];

    statusFilter.addEventListener('change', function () {
        renderLeaveRequests();
    });

    async function loadLeaveRequests() {
        try {
            const response = await fetch('http://localhost:3000/leaveRequests');
            leaveRequests = await response.json();
            renderLeaveRequests();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function renderLeaveRequests() {
        const status = statusFilter.value;
        leaveRequestsList.innerHTML = '';

        const filteredRequests = leaveRequests.filter(request => {
            return status === 'all' || request.status.toLowerCase() === status;
        });

        filteredRequests.forEach(request => {
            const li = document.createElement('li');
            li.classList.add('leave-item');
            li.innerHTML = `
                <div>Reason: ${request.reason}</div>
                <div>From: ${request.dateFrom}</div>
                <div>Days: ${request.numOfDays}</div>
                <div>Applied on: ${request.applicationDate}</div>
                <div>Status: <span class="status ${request.status.toLowerCase()}">${request.status}</span></div>
                ${request.status === 'Pending' ? `
                <button class="btn-approve" data-id="${request.id}">Approve</button>
                <button class="btn-reject" data-id="${request.id}">Reject</button>` : ''}
            `;
            leaveRequestsList.appendChild(li);
        });

        document.querySelectorAll('.btn-approve').forEach(button => {
            button.addEventListener('click', handleApprove);
        });

        document.querySelectorAll('.btn-reject').forEach(button => {
            button.addEventListener('click', handleReject);
        });
    }

    async function handleApprove(event) {
        const requestId = event.target.dataset.id;
        const request = leaveRequests.find(req => req.id == requestId);
        if (request) {
            request.status = 'Approved';
            request.processedDate = new Date().toISOString().split('T')[0]; // Adding processed date

            try {
                await fetch(`http://localhost:3000/leaveRequests/${requestId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(request)
                });
                loadLeaveRequests();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    const rejectModal = document.getElementById('rejectModal');
    const rejectForm = document.getElementById('rejectForm');
    let requestToReject = null;

    function handleReject(event) {
        requestToReject = leaveRequests.find(req => req.id == event.target.dataset.id);
        if (requestToReject) {
            rejectModal.style.display = 'block';
        }
    }

    rejectForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const rejectionReason = document.getElementById('rejectionReason').value;

        if (requestToReject) {
            requestToReject.status = 'Rejected';
            requestToReject.processedDate = new Date().toISOString().split('T')[0];
            requestToReject.rejectionReason = rejectionReason;

            try {
                await fetch(`http://localhost:3000/leaveRequests/${requestToReject.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestToReject)
                });
                rejectModal.style.display = 'none';
                loadLeaveRequests();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    });

    // Close modal
    document.querySelector('.close').addEventListener('click', function () {
        rejectModal.style.display = 'none';
    });

    // Load initial leave requests
    loadLeaveRequests();
});
