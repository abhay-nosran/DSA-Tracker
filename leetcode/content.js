// Fetch Problem Name and URL

let divArray = [];
let problemName = "";
let problemURL = "" ;
const tracker_key = "jattmagma";

console.log(problemName);
console.log(problemURL);
console.log(divArray);

const observer = new MutationObserver(function(){
    return updateDetails();
})

function startObservation(){
    const targetNode = document.querySelector("#qd-content > div > div") ;
    console.log(targetNode);
    if(targetNode){
        observer.observe(targetNode,{childList:true,subtree:true});
    }else{
        setTimeout(startObservation, 500);
    }
}

function updateDetails(){
    divArray = document.querySelectorAll("#qd-content > div > div");
    problemName = divArray[6].querySelector("div > div.flex.w-full.flex-1.flex-col.gap-4.overflow-y-auto.px-4.py-5 > div.flex.items-start.justify-between.gap-4 > div > div > a").textContent || "Problem Name Not Found";
    problemURL = window.location.href ;
    // if(problemName != "") observer.disconnect();
    console.log(problemName);
    console.log(problemURL);

}

observer.observe(document.body,{childList:true,subtree:true});
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


// startObservation();

 