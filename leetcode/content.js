
createButton();
function createButton(){
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
}