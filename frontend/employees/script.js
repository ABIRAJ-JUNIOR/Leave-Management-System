document.addEventListener("DOMContentLoaded", async () => {

    const apiUrl = "http://localhost:3000/employees";
    const userApiUrl = "http://localhost:3000/users";

    let employees = [];
    let users = [];
    let editingEmployeeId = null;
    const employeeTableBody = document.getElementById("employeeTableBody");
    const employeeModal = document.getElementById("employeeModal");
    const credentialsModal = document.getElementById("credentialsModal");
    const employeeForm = document.forms['employeeForm'];
    const credentialsForm = document.forms['credentialsForm'];
    const toast = document.getElementById("toast");
    // Fetch Employees
    const fetchEmployees = async () => {
        const response = await fetch(apiUrl);
        employees = await response.json();
        renderEmployees();
    };
    // Fetch Users
    const fetchUsers = async () => {
        const response = await fetch(userApiUrl);
        users = await response.json();
    };
    // Render Employees
    const renderEmployees = () => {
        employeeTableBody.innerHTML = "";
        employees.forEach((employee) => {
            const row = document.createElement("tr");
            row.innerHTML = `
    <td>${employee.employeeId}</td>
    <td>${employee.nic}</td>
    <td>${employee.firstName}</td>
    <td>${employee.lastName}</td>
    <td>${employee.dob}</td>
    <td>${employee.doj}</td>
    <td>
    <button onclick="editEmployee('${employee.employeeId}')">Edit</button>
    <button onclick="deleteEmployee('${employee.employeeId}')">Delete</button>
    <button onclick="editCredentials('${employee.employeeId}')">Edit
    Credentials</button>
    </td>
    `;
            employeeTableBody.appendChild(row);
        });
    };
    // Open Employee Modal for Create or Edit
    document.getElementById("createEmployeeBtn").onclick = () => {
        openEmployeeModal();
    };
    const openEmployeeModal = (employee = null) => {
        employeeModal.style.display = "block";
        const modalTitle = document.getElementById("modalTitle");
        const saveButton = document.getElementById("saveButton");
        if (employee) {
            modalTitle.innerText = "Edit Employee";
            saveButton.innerText = "Update";
            employeeForm.nic.value = employee.nic;
            employeeForm.firstName.value = employee.firstName;
            employeeForm.lastName.value = employee.lastName;
            employeeForm.dob.value = employee.dob;
            employeeForm.doj.value = employee.doj;
            editingEmployeeId = employee.employeeId;
        } else {
            employeeForm.reset();
            modalTitle.innerText = "Add Employee";
            saveButton.innerText = "Save";
            editingEmployeeId = null;
        }
    };
    // Close Modal
    document.querySelectorAll(".close").forEach(btn => {
        btn.onclick = () => {
            employeeModal.style.display = "none";
            credentialsModal.style.display = "none";
        };
    });
    // Function to generate unique EMP ID
    const generateEmpId = () => {
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let empId;
        do {
            empId = 'EMP_' + Array.from({ length: 5 }, () =>
                characters.charAt(Math.floor(Math.random() * characters.length))).join('');
        } while (employees.some(emp => emp.empId === empId));
        return empId;
    };
    // Save Employee
    employeeForm.onsubmit = async (e) => {
        e.preventDefault();
        const empId = editingEmployeeId || generateEmpId();
        const nic = employeeForm.nic.value;
        const firstName = employeeForm.firstName.value;
        const lastName = employeeForm.lastName.value;
        const dob = employeeForm.dob.value;
        const doj = employeeForm.doj.value;

        const employeeData = {
            id: empId,
            employeeId: empId,
            nic: nic,
            firstName: firstName,
            lastName: lastName,
            dob: dob,
            doj: doj
        };

        if (editingEmployeeId) {
            // Update employee
            await fetch(`${apiUrl}/${editingEmployeeId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(employeeData)
            });
        } else {
            // Create new employee
            await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(employeeData)
            });
            // Automatically create user credentials
            const userData = {
                id: empId,
                employeeId: empId,
                username: empId,
                password: "pwd123",
                role: "Employee" // Default role as Employee; can be modified as needed
            };
            await fetch(userApiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });
        }
        employeeModal.style.display = "none";
        await fetchEmployees();
        await fetchUsers(); // To refresh user data if needed
    };
    // Delete Employee
    window.deleteEmployee = async (empId) => {
        if (confirm("Are you sure you want to delete this employee?")) {
            await fetch(`${apiUrl}/${empId}`, {
                method: "DELETE"
            });
            await fetch(`${userApiUrl}/${empId}`, {
                method: "DELETE"
            });
            showToast("Deleted Successfully");
            await fetchEmployees();
        }
    };
    // Edit Employee
    window.editEmployee = (empId) => {
        const employee = employees.find(emp => emp.employeeId === empId);
        openEmployeeModal(employee);
    };
    // Open Credentials Modal
    window.editCredentials = (empId) => {
        const user = users.find(usr => usr.employeeId === empId);
        if (user) {
            credentialsModal.style.display = "block";
            credentialsForm.username.value = user.username;
            credentialsForm.password.value = user.password;
            credentialsForm.userrole.value = user.role;
            credentialsForm.credentialsEmpId.value = user.employeeId;
        }
    };
    // Save Credentials
    credentialsForm.onsubmit = async (e) => {
        e.preventDefault();
        const userData = {
            username: credentialsForm.username.value,
            password: credentialsForm.password.value,
            role: credentialsForm.userrole.value,
            employeeId: credentialsForm.credentialsEmpId.value
        };
        const user = users.find(usr => usr.employeeId === userData.employeeId);
        if (user) {
            await fetch(`${userApiUrl}/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });
        } else {
            await fetch(userApiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });
        }
        credentialsModal.style.display = "none";
        await fetchUsers();
    };
    // Show Toast
    const showToast = (message) => {
        toast.innerText = message;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    };
    // Search Employees
    document.getElementById("searchInput").oninput = (e) => {
        const query = e.target.value.toLowerCase();
        const filteredEmployees = employees.filter(emp => {
            return emp.nic.toLowerCase().includes(query) ||
                emp.firstName.toLowerCase().includes(query) ||
                emp.lastName.toLowerCase().includes(query);
        });
        renderFilteredEmployees(filteredEmployees);
    };
    const renderFilteredEmployees = (filteredEmployees) => {
        employeeTableBody.innerHTML = "";
        filteredEmployees.forEach((employee) => {
            const row = document.createElement("tr");
            row.innerHTML = `
    <td>${employee.employeeId}</td>
    <td>${employee.nic}</td>
    <td>${employee.firstName}</td>
    <td>${employee.lastName}</td>
    <td>${employee.dob}</td>
    <td>${employee.doj}</td>
    <td>
    <button onclick="editEmployee('${employee.employeeId}')">Edit</button>
    <button onclick="deleteEmployee('${employee.employeeId}')">Delete</button>
    <button onclick="editCredentials('${employee.employeeId}')">Edit
    Credentials</button>
    </td>
    `;
            employeeTableBody.appendChild(row);
        });
    };
    // Initialize
    fetchEmployees();
    fetchUsers();
});