// Fetch Problem Name and URL
const problemName = document.querySelector("h1").textContent || "Problem Name Not Found";
const problemURL = window.location.href;
const tracker_key = "jattmagma";

function applyTheme() {
    const root = document.documentElement;
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDarkMode) {
        root.classList.add('dark');
        root.classList.remove('light');
    } else {
        root.classList.add('light');
        root.classList.remove('dark');
    }
}

// Listen for changes in the preferred color scheme
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

// Apply theme on initial load
applyTheme();

createButton();

// Add the floating button
function createButton() {
    const button = document.createElement("button");
    button.id = "tracker-button";
    button.textContent = "+";
    document.body.appendChild(button);

    // Create a popup div
    const popup = document.createElement("div");
    popup.id = "tracker-popup";
    popup.innerHTML = `
        <div class="popup-header">Save Problem</div>
        <div class="popup-content">
            <p><strong>Problem Name:</strong> <span id="problem-name"></span></p>
            <p><strong>Problem URL:</strong> <span id="problem-url"></span></p>
            <textarea id="problem-notes" placeholder="Add your notes here..."></textarea>
            <div class="popup-buttons">
                <button id="save-button">Save</button>
                <button id="cancel-button">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
    popup.style.display = "none"; // Hide initially
}

// Check if the problem is already marked
async function checkAlreadyMarked() {
    document.getElementById("problem-name").textContent = problemName;
    document.getElementById("problem-url").textContent = problemURL;

    const problemMap = await getProblemList();

    if (problemURL in problemMap) {
        document.getElementById("problem-notes").value = problemMap[problemURL].notes;
        console.log('Key is present:', problemMap[problemURL]);
    }
}

// Show/Hide popup on button click
let isPopupVisible = false;
const popup = document.getElementById("tracker-popup");
document.getElementById("tracker-button").addEventListener("click", () => {
    if (!isPopupVisible) {
        checkAlreadyMarked();  // Check before showing
    }
    isPopupVisible = !isPopupVisible;
    popup.style.display = isPopupVisible ? "block" : "none";
});

// Save Button: Save data to Chrome storage
document.getElementById("save-button").addEventListener("click", async () => {
    const problemMap = await getProblemList();
    const notes = document.getElementById("problem-notes").value;
    const problemData = {
        name: problemName,
        url: problemURL,
        notes: notes
    };

    problemMap[problemURL] = problemData ;

    chrome.storage.sync.set({ [tracker_key]: problemMap}, () => {
        alert("Problem saved!");
        popup.style.display = "none";
        document.getElementById("problem-notes").value = ""; // Reset notes
        isPopupVisible = false;
    });
});

// Cancel Button: Close popup without saving
document.getElementById("cancel-button").addEventListener("click", () => {
    popup.style.display = "none";
    document.getElementById("problem-notes").value = ""; // Reset notes
    isPopupVisible = false;
});

// Get Problem List
function getProblemList() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([tracker_key], function (results) {
            resolve(results[tracker_key] || {});
        });
    });
}
