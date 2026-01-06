function mawaqitCsvFil(csv, cal) {

    c = csv.trim().replace(/\r\n/g, "\r").replace(/\n/g, "\r").split(/\r/);

    for (var s = 1; s < c.length; s++)
        if ('' == c[s].split(/,|;/)[0].trim()) { continue; } else {
            for (var l = c[s].split(/,|;/), d = 1; d < l.length; d++) {
                // var multimonth = ('athancal_0' == a.attr("id") && 8 == l.length) || ('iqamacal_0' == a.attr("id") && 7 == l.length);
                i = parseInt(l[0]) - 1;
                var cell = d - 1;
                var ename = "configuration[" + cal + "][" + i + "][" + parseInt(l[1]) + "][" + cell + "]";
                console.log(ename);
                if (d > 1) {
                    document.getElementsByName(ename)[0].value = l[d].trim();
                    document.getElementsByName(ename)[0].dispatchEvent(new Event("input"));
                }
            }
        }


}

document.getElementsByTagName('body')[0].innerHTML += `<h1>Bulk set calendar</h1>
  <input type="radio" id="calendar" name="bulk-csv-cal" value="calendar">
  <label for="calendar">calendar</label><br>
  <input type="radio" id="iqamaCalendar" name="bulk-csv-cal" value="iqamaCalendar">
  <label for="iqamaCalendar">iqamaCalendar</label><br>
<input type="file" id="bulk-csv-input" />
<div id="message"></div>
<pre id="file-content"></pre>`

const fileInput = document.getElementById("bulk-csv-input");
const fileContentDisplay = document.getElementById("file-content");
const messageDisplay = document.getElementById("message");

fileInput.addEventListener("change", handleFileSelection);

function handleFileSelection(event) {
    const file = event.target.files[0];
    fileContentDisplay.textContent = ""; // Clear previous file content
    messageDisplay.textContent = ""; // Clear previous messages

    // Validate file existence and type
    if (!file) {
        showMessage("No file selected. Please choose a file.", "error");
        return;
    }

    if (!file.type.startsWith("text")) {
        showMessage("Unsupported file type. Please select a text file.", "error");
        return;
    }

    // Read the file
    const reader = new FileReader();
    reader.onload = () => {
        fileContentDisplay.textContent = reader.result;

        mawaqitCsvFil(reader.result, document.querySelector('input[name="bulk-csv-cal"]:checked').value);

    };
    reader.onerror = () => {
        showMessage("Error reading the file. Please try again.", "error");
    };
    reader.readAsText(file);
}

// Displays a message to the user
function showMessage(message, type) {
    messageDisplay.textContent = message;
    messageDisplay.style.color = type === "error" ? "red" : "green";
}
