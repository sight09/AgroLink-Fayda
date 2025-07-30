document.addEventListener('DOMContentLoaded', () => {
    // Get elements
    const showFarmerBtn = document.getElementById('showFarmer');
    const showGovernmentBtn = document.getElementById('showGovernment');
    const farmerSection = document.getElementById('farmerSection');
    const governmentSection = document.getElementById('governmentSection');

    // Farmer Auth Elements
    const farmerAuth = document.getElementById('farmerAuth');
    const farmerLoginDiv = document.getElementById('farmerLogin');
    const farmerRegisterDiv = document.getElementById('farmerRegister');
    const showFarmerRegisterLink = document.getElementById('showFarmerRegister');
    const showFarmerLoginLink = document.getElementById('showFarmerLogin');
    const farmerLoginForm = farmerLoginDiv.querySelector('form');
    const farmerRegisterForm = farmerRegisterDiv.querySelector('form');
    const farmerDashboard = document.getElementById('farmerDashboard');
    const farmerLogoutBtn = document.getElementById('farmerLogout');
    const farmerDashboardNavLinks = farmerDashboard.querySelectorAll('nav a');
    const farmerDashboardContentSections = farmerDashboard.querySelectorAll('.content section');
    const farmerOrderButtons = document.querySelectorAll('.material-item .order-btn'); // Get all order buttons
    const farmerOrderHistoryList = document.getElementById('farmerOrderHistoryList'); // Get the order history list

    // Government Auth Elements
    const governmentAuth = document.getElementById('governmentAuth');
    const governmentLoginDiv = document.getElementById('governmentLogin');
    const governmentRegisterDiv = document.getElementById('governmentRegister');
    const showGovernmentRegisterLink = document.getElementById('showGovernmentRegister');
    const showGovernmentLoginLink = document.getElementById('showGovernmentLogin');
    const governmentLoginForm = governmentLoginDiv.querySelector('form');
    const governmentRegisterForm = governmentRegisterDiv.querySelector('form');
    const governmentDashboard = document.getElementById('governmentDashboard');
    const governmentLogoutBtn = document.getElementById('governmentLogout');
    const governmentDashboardNavLinks = governmentDashboard.querySelectorAll('nav a');
    const governmentDashboardContentSections = governmentDashboard.querySelectorAll('.content section');
    const governmentOrderList = document.getElementById('governmentOrderList'); // To add dynamic orders if needed

    // --- Section Switching Logic ---
    showFarmerBtn.addEventListener('click', () => {
        farmerSection.classList.add('active');
        governmentSection.classList.remove('active');
        // Ensure farmer login/register is shown, not dashboard, when switching
        farmerAuth.style.display = 'block';
        farmerDashboard.style.display = 'none';
        farmerLoginDiv.classList.add('active');
        farmerRegisterDiv.classList.remove('active');
        // Reset dashboard active state if returning from dashboard
        farmerDashboardNavLinks.forEach(navLink => navLink.classList.remove('active'));
        farmerDashboardContentSections.forEach(section => section.classList.remove('active'));
        // Set 'Home' as active for farmer dashboard
        document.querySelector('#farmerDashboard nav a[href="#farmerHome"]').classList.add('active');
        document.getElementById('farmerHome').classList.add('active');
    });

    showGovernmentBtn.addEventListener('click', () => {
        governmentSection.classList.add('active');
        farmerSection.classList.remove('active');
        // Ensure government login/register is shown, not dashboard, when switching
        governmentAuth.style.display = 'block';
        governmentDashboard.style.display = 'none';
        governmentLoginDiv.classList.add('active');
        governmentRegisterDiv.classList.remove('active');
        // Reset dashboard active state if returning from dashboard
        governmentDashboardNavLinks.forEach(navLink => navLink.classList.remove('active'));
        governmentDashboardContentSections.forEach(section => section.classList.remove('active'));
        // Set 'Home' as active for government dashboard
        document.querySelector('#governmentDashboard nav a[href="#governmentHome"]').classList.add('active');
        document.getElementById('governmentHome').classList.add('active');
    });

    // --- Farmer Authentication Logic ---
    showFarmerRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        farmerLoginDiv.classList.remove('active');
        farmerRegisterDiv.classList.add('active');
    });

    showFarmerLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        farmerRegisterDiv.classList.remove('active');
        farmerLoginDiv.classList.add('active');
    });

    // Farmer Login Form Submission (Frontend Simulation)
    farmerLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // In a real application, you would send this data to a backend for authentication.
        // For now, we'll just simulate a successful login.
        alert('Farmer Login simulated! Moving to dashboard.');
        farmerAuth.style.display = 'none';
        farmerDashboard.style.display = 'block';
        farmerDashboard.classList.add('active');
        // Set initial active dashboard content
        document.querySelector('#farmerDashboard nav a[href="#farmerHome"]').click(); // Simulate click on 'Home'
    });

    // Farmer Register Form Submission (Frontend Simulation)
    farmerRegisterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // In a real application, you would send this data to a backend for registration.
        // For now, we'll just simulate a successful registration and then move to login.
        alert('Farmer Registration simulated! Please login.');
        farmerRegisterDiv.classList.remove('active');
        farmerLoginDiv.classList.add('active');
        farmerRegisterForm.reset(); // Clear form fields
    });

    // Farmer Logout
    farmerLogoutBtn.addEventListener('click', () => {
        alert('Farmer Logged Out!');
        farmerDashboard.style.display = 'none';
        farmerDashboard.classList.remove('active');
        farmerAuth.style.display = 'block';
        farmerLoginDiv.classList.add('active');
        farmerRegisterDiv.classList.remove('active');
        farmerLoginForm.reset(); // Clear login form fields
        farmerOrderHistoryList.innerHTML = ''; // Clear order history on logout
    });

    // Farmer Dashboard Navigation
    farmerDashboardNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);

            // Remove active class from all links and sections
            farmerDashboardNavLinks.forEach(navLink => navLink.classList.remove('active'));
            farmerDashboardContentSections.forEach(section => section.classList.remove('active')); // Use classList.remove('active')

            // Add active class to clicked link and show target section
            e.target.classList.add('active');
            document.getElementById(targetId).classList.add('active'); // Use classList.add('active')
        });
    });

    // --- Farmer Order Logic ---
    farmerOrderButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const material = e.target.dataset.material; // Get data-material value
            const price = e.target.dataset.price;     // Get data-price value
            const orderTime = new Date().toLocaleString(); // Current time for history

            // Simulate sending order to backend
            alert(`Ordering: ${material} for $${price}. (This would be sent to your backend, linked to your Fayda ID!)`);

            // Add to simulated farmer order history
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span>${material} - $${price}</span> <span>Ordered on: ${orderTime} - Status: Pending</span>`;
            farmerOrderHistoryList.prepend(listItem); // Add to top of list

            // Optionally, switch to history tab after ordering
            document.querySelector('a[href="#farmerHistory"]').click();
        });
    });


    // --- Government Authentication Logic ---
    showGovernmentRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        governmentLoginDiv.classList.remove('active');
        governmentRegisterDiv.classList.add('active');
    });

    showGovernmentLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        governmentRegisterDiv.classList.remove('active');
        governmentLoginDiv.classList.add('active');
    });

    // Government Login Form Submission (Frontend Simulation)
    governmentLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // In a real application, you would send this data to a backend for authentication.
        // For now, we'll just simulate a successful login.
        alert('Government Login simulated! Moving to dashboard.');
        governmentAuth.style.display = 'none';
        governmentDashboard.style.display = 'block';
        governmentDashboard.classList.add('active');
        // Set initial active dashboard content
        document.querySelector('#governmentDashboard nav a[href="#governmentHome"]').click(); // Simulate click on 'Home'
    });

    // Government Register Form Submission (Frontend Simulation)
    governmentRegisterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // In a real application, you would send this data to a backend for registration.
        // For now, we'll just simulate a successful registration and then move to login.
        alert('Government Registration simulated! Please login.');
        governmentRegisterDiv.classList.remove('active');
        governmentLoginDiv.classList.add('active');
        governmentRegisterForm.reset(); // Clear form fields
    });

    // Government Logout
    governmentLogoutBtn.addEventListener('click', () => {
        alert('Government Logged Out!');
        governmentDashboard.style.display = 'none';
        governmentDashboard.classList.remove('active');
        governmentAuth.style.display = 'block';
        governmentLoginDiv.classList.add('active');
        governmentRegisterDiv.classList.remove('active');
        governmentLoginForm.reset(); // Clear login form fields
    });

    // Government Dashboard Navigation
    governmentDashboardNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);

            // Remove active class from all links and sections
            governmentDashboardNavLinks.forEach(navLink => navLink.classList.remove('active'));
            governmentDashboardContentSections.forEach(section => section.classList.remove('active'));

            // Add active class to clicked link and show target section
            e.target.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Initial state: show farmer section by default and ensure login form is active
    showFarmerBtn.click(); // Simulate click on farmer button to set initial state
});