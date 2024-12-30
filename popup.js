const tracker_key = "jattmagma";

// Function to get the problem list from chrome.storage
function getProblemList() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([tracker_key], function (results) {
            resolve(results[tracker_key] || {});
        });
    });
}

// Function to convert problem data to CSV format
function convertToCSV(data) {
    const headers = ["Name", "URL", "Notes"];
    const rows = Object.values(data).map(problem => [
        `"${problem.name}"`,
        `"${problem.url}"`,
        `"${problem.notes}"`
    ]);
    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
}

// Function to download CSV file
async function downloadCSV() {
    const problemMap = await getProblemList();
    if (Object.keys(problemMap).length === 0) {
        alert("No problems to download.");
        return;
    }

    const csvContent = convertToCSV(problemMap);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "problems.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to display the list of problems in the popup
async function displayProblems() {
    const problemMap = await getProblemList();
    const problemListContainer = document.getElementById("problem-list");

    // Clear the container before displaying the problems
    problemListContainer.innerHTML = "";

    if (Object.keys(problemMap).length === 0) {
        document.getElementById("download-csv").style.display = "none" ;
        problemListContainer.innerHTML = '<p>No problems saved yet.</p>';
    } else {
        for (let url in problemMap) {
            const problem = problemMap[url];
            const problemItem = document.createElement("div");
            problemItem.classList.add("problem-item");
            problemItem.innerHTML = `
                <span><a href="${url}">${problem.name}</a></span>
                <div>
                    <button class="show-notes-btn" data-url="${url}">Show Notes</button>
                    <button class="delete-btn" data-url="${url}">Delete</button>
                </div>
            `;
            problemListContainer.appendChild(problemItem);
        }
    }

    // Add event listeners to Show Notes and Delete buttons
    const showNotesButtons = document.querySelectorAll(".show-notes-btn");
    const deleteButtons = document.querySelectorAll(".delete-btn");

    showNotesButtons.forEach(button => {
        button.addEventListener("click", showNotes);
    });

    deleteButtons.forEach(button => {
        button.addEventListener("click", deleteProblem);
    });
}

// Function to display notes for a specific problem
async function showNotes(event) {
    const problemURL = event.target.dataset.url;
    const problemMap = await getProblemList();
    const problem = problemMap[problemURL];

    // Hide the problem list and show the notes container
    document.getElementById("problem-list").style.display = "none";
    document.getElementById("download-csv").style.display = "none" ;
    const notesContainer = document.getElementById("problem-notes-container");
    notesContainer.classList.add("active");

    // Set the title and content of the notes
    document.querySelector("#problem-notes-title a").textContent = problem.name;
    document.querySelector("#problem-notes-title a").href = problemURL;
    document.getElementById("problem-notes-content").textContent = problem.notes;
}

// Function to delete a specific problem
async function deleteProblem(event) {
    const problemURL = event.target.dataset.url;
    const problemMap = await getProblemList();

    // Delete the problem from the map
    delete problemMap[problemURL];

    // Save the updated problem list back to chrome.storage
    chrome.storage.sync.set({ [tracker_key]: problemMap }, () => {
        // Re-render the problem list after deletion
        displayProblems();
    });
}

// Event listener for the Back button
document.getElementById("back-button").addEventListener("click", () => {
    document.getElementById("problem-list").style.display = "block";
    document.getElementById("download-csv").style.display = "block" ;
    document.getElementById("problem-notes-container").classList.remove("active");
    document.getElementById("problem-notes-content").textContent = "";
    document.querySelector("#problem-notes-title a").href = "#";
    document.querySelector("#problem-notes-title a").textContent = "";
});

// Event listener for the Download CSV button
document.getElementById("download-csv").addEventListener("click", downloadCSV);

// Call the displayProblems function when the popup loads
displayProblems();
