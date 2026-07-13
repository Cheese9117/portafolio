'use strict';

const TOGGLE_ENDPOINT = 'https://n8n-production-4033c.up.railway.app/webhook/panel-demos-toggle';
const SESSION_KEY = 'panelDemosSecret';

const gateSection = document.getElementById('gate');
const panelSection = document.getElementById('panel');
const passwordInput = document.getElementById('pw');
const enterButton = document.getElementById('pwBtn');
const statusLine = document.getElementById('status');

function showPanel() {
  gateSection.style.display = 'none';
  panelSection.style.display = 'block';
}

function unlockWithSecret(secret) {
  sessionStorage.setItem(SESSION_KEY, secret);
  showPanel();
}

function setStatus(message) {
  statusLine.textContent = message;
}

async function toggleWorkflow(workflowId, action, name) {
  const secret = sessionStorage.getItem(SESSION_KEY);
  setStatus(`Enviando "${action}" a ${name}...`);
  try {
    const response = await fetch(TOGGLE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, workflowId, action })
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      setStatus(`${name}: contraseña incorrecta o error del servidor.`);
      return;
    }
    setStatus(`${name}: ahora ${payload.active ? 'activo' : 'apagado'}.`);
  } catch {
    setStatus(`${name}: no se pudo conectar con n8n.`);
  }
}

function attachCardHandlers() {
  document.querySelectorAll('.card').forEach((card) => {
    const workflowId = card.dataset.id;
    const name = card.dataset.name;
    card.querySelectorAll('button[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        toggleWorkflow(workflowId, button.dataset.action, name);
      });
    });
  });
}

enterButton.addEventListener('click', () => {
  const value = passwordInput.value.trim();
  if (value.length > 0) {
    unlockWithSecret(value);
  }
});

passwordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    enterButton.click();
  }
});

const storedSecret = sessionStorage.getItem(SESSION_KEY);
if (storedSecret) {
  showPanel();
}

attachCardHandlers();
