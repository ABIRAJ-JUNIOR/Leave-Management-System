document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Fetch user data with embedded employee data

        // http://localhost:3000/users?_embed=employee&username=EMP_L6Zae&password=pwd123

        const response = await fetch(`http://localhost:3000/users?username=${username}&password=${password}&_embed=employee`);
        //console.log(response);

        const users = await response.json();
        //console.log(users);

        if (users.length > 0) {
            const user = users[0];
            //console.log(user);
            // Find the associated employee data
            const employee = user.employee;

            //console.log(employee);

            if (employee) {
                // Store the logged-in user and employee details
                const loggedInUser = {
                    ...user,
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                };

                console.log(loggedInUser);

                localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

                alert('Login successful!');
                window.location.href = 'leaveRequest.html';
            } else {
                alert('Employee data not found.');
            }
        } else {
            alert('Invalid username or password.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while logging in.');
    }
});
