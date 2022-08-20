// =============
// == Globals ==
// =============
const canvas = document.getElementById('drawing-area');
const canvasContext = canvas.getContext('2d');
const viewButton = document.getElementById('view-button');
const clearButton = document.getElementById('clear-button');
const saveButton = document.getElementById('save-button');

const state = {
  mousedown: false
};

// ===================
// == Configuration ==
// ===================
const lineWidth = 20;
const halfLineWidth = lineWidth / 2;
const fillStyle = '#333';
const strokeStyle = '#333';
const shadowColor = '#333';
const shadowBlur = lineWidth / 4;

// =====================
// == Event Listeners ==
// =====================
canvas.addEventListener('mousedown', handleWritingStart);
canvas.addEventListener('mousemove', handleWritingInProgress);
canvas.addEventListener('mouseup', handleDrawingEnd);
canvas.addEventListener('mouseout', handleDrawingEnd);

canvas.addEventListener('touchstart', handleWritingStart);
canvas.addEventListener('touchmove', handleWritingInProgress);
canvas.addEventListener('touchend', handleDrawingEnd);

clearButton.addEventListener('click', handleClearButtonClick);
saveButton.addEventListener('click', handleSaveButtonClick);
viewButton.addEventListener('click', handleViewButtonClick);

// ====================
// == Event Handlers ==
// ====================
function handleWritingStart(event) {
  event.preventDefault();

  const mousePos = getMosuePositionOnCanvas(event);

  canvasContext.beginPath();

  canvasContext.moveTo(mousePos.x, mousePos.y);

  canvasContext.lineWidth = lineWidth;
  canvasContext.strokeStyle = strokeStyle;
  canvasContext.shadowColor = null;
  canvasContext.shadowBlur = null;

  canvasContext.fill();

  state.mousedown = true;
}

function handleWritingInProgress(event) {
  event.preventDefault();

  if (state.mousedown) {
    const mousePos = getMosuePositionOnCanvas(event);

    canvasContext.lineTo(mousePos.x, mousePos.y);
    canvasContext.stroke();
  }
}

function handleDrawingEnd(event) {
  event.preventDefault();

  if (state.mousedown) {
    canvasContext.shadowColor = shadowColor;
    canvasContext.shadowBlur = shadowBlur;

    canvasContext.stroke();
  }

  state.mousedown = false;
}

function handleClearButtonClick(event) {
  event.preventDefault();

  clearCanvas();
}

function handleSaveButtonClick(event) {
  event.preventDefault();

  saveCanvas();
}

async function handleViewButtonClick(event) {
  event.preventDefault();

  let drawings = [];

  try {
    const rawResponse = await fetch('http://localhost:8000/data/getData', {
      method: 'GET',
      headers: {},
    });
    const content = await rawResponse.json();

    drawings = content.data;
    console.log(drawings);
  } catch (error) {
    console.log(error);
  }

  // hide the container
  const container = document.getElementById('container');
  container.style.display = 'none';

  const drawingContainer = document.getElementById('drawing-container');
  drawingContainer.innerHTML = '';
  drawings.forEach(drawing => {
    const img = document.createElement('img');
    img.src = drawing.drawing;

    const owner = document.createElement('h3');
    owner.innerHTML = drawing.ownerName;

    drawingContainer.appendChild(owner);
    drawingContainer.appendChild(img);
  }
  );
  drawingContainer.style.display = 'block';

}

// ======================
// == Helper Functions ==
// ======================
function getMosuePositionOnCanvas(event) {
  const clientX = event.clientX || event.touches[0].clientX;
  const clientY = event.clientY || event.touches[0].clientY;
  const { offsetLeft, offsetTop } = event.target;
  const canvasX = clientX - offsetLeft;
  const canvasY = clientY - offsetTop;

  return { x: canvasX, y: canvasY };
}

function clearCanvas() {
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById('name').value = '';
}

async function saveCanvas() {
  const ownerName = document.getElementById('name').value;

  if (!ownerName || ownerName.length === 0) {
    alert('Please enter your name');
    return;
  }

  const imageURI = canvas.toDataURL("image/jpg");

  try {
    const data = new URLSearchParams({
      drawing: imageURI,
      ownerName: ownerName
    })

    const rawResponse = await fetch('http://localhost:8000/data/save', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: data.toString()
    });
    const content = await rawResponse.json();

    console.log(content);
    clearCanvas();

  } catch (error) {
    console.log(error);
  }
}